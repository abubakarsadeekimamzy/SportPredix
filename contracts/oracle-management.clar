;; Oracle Management Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-oracle (err u401))

;; Data maps
(define-map oracles principal bool)

;; Public functions
(define-public (register-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set oracles oracle true))))

(define-public (remove-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete oracles oracle))))

;; Read-only functions
(define-read-only (is-oracle (account principal))
  (default-to false (map-get? oracles account)))

;; Oracle trait
(define-trait oracle-trait
  (
    (verify-result (uint uint) (response bool uint))
  )
)

;; Oracle implementation
(define-public (verify-result (market-id uint) (outcome uint))
  (begin
    (asserts! (is-oracle tx-sender) err-not-oracle)
    ;; In a real-world scenario, this function would include logic to verify the result
    ;; based on data from multiple trusted sources. For this example, we'll just return true.
    (ok true)
  )
)
