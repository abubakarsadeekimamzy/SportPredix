;; Sports Betting Prediction Market

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u401))
(define-constant err-already-exists (err u409))
(define-constant err-invalid-params (err u400))

;; Data vars
(define-data-var market-nonce uint u0)

;; Data maps
(define-map markets
  { market-id: uint }
  { creator: principal,
    description: (string-utf8 256),
    options: (list 2 (string-utf8 64)),
    total-liquidity: uint,
    outcome: (optional uint),
    expiration: uint })

(define-map bets
  { market-id: uint, better: principal }
  { amount: uint, option: uint })

(define-map oracles principal bool)

;; Define bonding curve function (simplified linear curve)
(define-read-only (bonding-curve (supply uint) (amount uint))
  (+ supply (* amount u100)))

;; Public functions
(define-public (create-market (description (string-utf8 256)) (options (list 2 (string-utf8 64))) (expiration uint))
  (let ((market-id (var-get market-nonce)))
    (asserts! (> expiration block-height) err-invalid-params)
    (try! (stx-transfer? u100 tx-sender (as-contract tx-sender)))
    (map-set markets
      { market-id: market-id }
      { creator: tx-sender,
        description: description,
        options: options,
        total-liquidity: u0,
        outcome: none,
        expiration: expiration })
    (var-set market-nonce (+ market-id u1))
    (ok market-id)))

(define-public (place-bet (market-id uint) (option uint) (amount uint))
  (let ((market (unwrap! (map-get? markets { market-id: market-id }) err-not-found))
        (current-liquidity (get total-liquidity market)))
    (asserts! (< block-height (get expiration market)) err-unauthorized)
    (asserts! (is-none (get outcome market)) err-unauthorized)
    (asserts! (< option (len (get options market))) err-invalid-params)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set bets
      { market-id: market-id, better: tx-sender }
      { amount: amount, option: option })
    (map-set markets
      { market-id: market-id }
      (merge market { total-liquidity: (+ current-liquidity amount) }))
    (ok true)))

(define-public (settle-market (market-id uint) (outcome uint))
  (let ((market (unwrap! (map-get? markets { market-id: market-id }) err-not-found)))
    (asserts! (is-oracle tx-sender) err-unauthorized)
    (asserts! (>= block-height (get expiration market)) err-unauthorized)
    (asserts! (is-none (get outcome market)) err-already-exists)
    (asserts! (< outcome (len (get options market))) err-invalid-params)
    (ok (map-set markets
      { market-id: market-id }
      (merge market { outcome: (some outcome) })))))

(define-public (claim-winnings (market-id uint))
  (let ((market (unwrap! (map-get? markets { market-id: market-id }) err-not-found))
        (bet (unwrap! (map-get? bets { market-id: market-id, better: tx-sender }) err-not-found))
        (outcome (unwrap! (get outcome market) err-unauthorized)))
    (asserts! (is-eq (get option bet) outcome) err-unauthorized)
    (let ((winnings (bonding-curve (get total-liquidity market) (get amount bet))))
      (try! (as-contract (stx-transfer? winnings tx-sender tx-sender)))
      (map-delete bets { market-id: market-id, better: tx-sender })
      (ok winnings))))

(define-public (register-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set oracles oracle true))))

(define-public (remove-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete oracles oracle))))

;; Read-only functions
(define-read-only (get-market (market-id uint))
  (map-get? markets { market-id: market-id }))

(define-read-only (get-bet (market-id uint) (better principal))
  (map-get? bets { market-id: market-id, better: better }))

(define-read-only (is-oracle (account principal))
  (default-to false (map-get? oracles account)))
