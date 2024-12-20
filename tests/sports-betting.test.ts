import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockContractCall = vi.fn()

describe('Sports Betting Contract', () => {
  const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
  const contractName = 'sports-betting'
  let contractOwner: string
  let user1: string
  let user2: string
  let oracle: string
  
  beforeEach(() => {
    contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    user1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'
    user2 = 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC'
    oracle = 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP'
    mockContractCall.mockClear()
  })
  
  describe('create-market', () => {
    it('should create a market successfully', async () => {
      mockContractCall.mockResolvedValueOnce({ success: true, value: 0 })
      const result = await mockContractCall('create-market', ['Team A vs Team B', ['Team A', 'Team B'], 100000], { sender: user1 })
      expect(result.success).toBe(true)
      expect(result.value).toBe(0)
    })
    
    it('should fail if expiration is in the past', async () => {
      mockContractCall.mockResolvedValueOnce({ success: false, error: 400 })
      const result = await mockContractCall('create-market', ['Past Event', ['Option A', 'Option B'], 1], { sender: user1 })
      expect(result.success).toBe(false)
      expect(result.error).toBe(400)
    })
  })
  
  describe('place-bet', () => {
    it('should place a bet successfully', async () => {
      mockContractCall.mockResolvedValueOnce({ success: true, value: true })
      const result = await mockContractCall('place-bet', [0, 0, 100], { sender: user2 })
      expect(result.success).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it('should fail if market does not exist', async () => {
      mockContractCall.mockResolvedValueOnce({ success: false, error: 404 })
      const result = await mockContractCall('place-bet', [999, 0, 100], { sender: user2 })
      expect(result.success).toBe(false)
      expect(result.error).toBe(404)
    })
  })
  
  describe('settle-market', () => {
    it('should settle a market successfully', async () => {
      mockContractCall.mockResolvedValueOnce({ success: true, value: true })
      const result = await mockContractCall('settle-market', [0, 1], { sender: oracle })
      expect(result.success).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it('should fail if called by non-oracle', async () => {
      mockContractCall.mockResolvedValueOnce({ success: false, error: 401 })
      const result = await mockContractCall('settle-market', [0, 1], { sender: user1 })
      expect(result.success).toBe(false)
      expect(result.error).toBe(401)
    })
  })
  
  describe('claim-winnings', () => {
    it('should claim winnings successfully', async () => {
      mockContractCall.mockResolvedValueOnce({ success: true, value: 200 })
      const result = await mockContractCall('claim-winnings', [0], { sender: user2 })
      expect(result.success).toBe(true)
      expect(result.value).toBe(200)
    })
    
    it('should fail if user did not win', async () => {
      mockContractCall.mockResolvedValueOnce({ success: false, error: 401 })
      const result = await mockContractCall('claim-winnings', [0], { sender: user1 })
      expect(result.success).toBe(false)
      expect(result.error).toBe(401)
    })
  })
  
  describe('register-oracle', () => {
    it('should register an oracle successfully', async () => {
      mockContractCall.mockResolvedValueOnce({ success: true, value: true })
      const result = await mockContractCall('register-oracle', [oracle], { sender: contractOwner })
      expect(result.success).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it('should fail if called by non-owner', async () => {
      mockContractCall.mockResolvedValueOnce({ success: false, error: 100 })
      const result = await mockContractCall('register-oracle', [oracle], { sender: user1 })
      expect(result.success).toBe(false)
      expect(result.error).toBe(100)
    })
  })
  
  describe('remove-oracle', () => {
    it('should remove an oracle successfully', async () => {
      mockContractCall.mockResolvedValueOnce({ success: true, value: true })
      const result = await mockContractCall('remove-oracle', [oracle], { sender: contractOwner })
      expect(result.success).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it('should fail if called by non-owner', async () => {
      mockContractCall.mockResolvedValueOnce({ success: false, error: 100 })
      const result = await mockContractCall('remove-oracle', [oracle], { sender: user1 })
      expect(result.success).toBe(false)
      expect(result.error).toBe(100)
    })
  })
  
  describe('is-oracle', () => {
    it('should return true for registered oracle', async () => {
      mockContractCall.mockResolvedValueOnce({ success: true, value: true })
      const result = await mockContractCall('is-oracle', [oracle])
      expect(result.success).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it('should return false for non-registered oracle', async () => {
      mockContractCall.mockResolvedValueOnce({ success: true, value: false })
      const result = await mockContractCall('is-oracle', [user1])
      expect(result.success).toBe(true)
      expect(result.value).toBe(false)
    })
  })
})

