/**
 * Self Protocol Integration Module
 * Provides proof-of-humanity verification for CeloWork SDK
 */

import { Auth } from "./auth";
import { SelfProtocolIdentity } from "../types";

export enum VerificationLevel {
  Basic = "basic",
  Advanced = "advanced",
  Premium = "premium",
}

export interface VerificationRequest {
  address: string;
  level: VerificationLevel;
  timestamp: number;
}

export interface VerificationResult {
  isVerified: boolean;
  level?: VerificationLevel;
  verifiedAt?: number;
  expiresAt?: number;
  score?: number; // 0-100 humanity score
  attributes?: {
    hasEmail?: boolean;
    hasPhone?: boolean;
    hasGovernmentId?: boolean;
    hasBiometric?: boolean;
    hasLinkedAccounts?: boolean;
  };
  metadata?: Record<string, any>;
}

/**
 * Self Protocol Manager
 * Handles proof-of-humanity verification using Self Protocol
 */
export class SelfProtocolManager {
  private auth: Auth;
  private verifications: Map<string, VerificationResult>;
  private mockMode: boolean;

  constructor(auth: Auth, mockMode: boolean = false) {
    this.auth = auth;
    this.verifications = new Map();
    this.mockMode = mockMode;
  }

  /**
   * Verify if an address belongs to a human
   * @param address - Ethereum address to verify
   * @param level - Verification level required
   * @returns Verification result
   */
  async verifyHuman(
    address: string,
    level: VerificationLevel = VerificationLevel.Basic
  ): Promise<VerificationResult> {
    if (this.mockMode) {
      return this.mockVerifyHuman(address, level);
    }

    // In production, this would call the actual Self Protocol API
    // For now, we'll use a mock implementation
    return this.mockVerifyHuman(address, level);
  }

  /**
   * Mock verification for development and testing
   * Simulates Self Protocol verification flow
   */
  private async mockVerifyHuman(
    address: string,
    level: VerificationLevel
  ): Promise<VerificationResult> {
    // Check if already verified
    const existing = this.verifications.get(address.toLowerCase());
    if (existing && existing.isVerified) {
      // Check if verification is still valid (30 days)
      const now = Date.now();
      if (existing.expiresAt && existing.expiresAt > now) {
        return existing;
      }
    }

    // Simulate verification process
    await this.simulateVerificationDelay();

    // Generate mock verification result
    const result: VerificationResult = {
      isVerified: true,
      level: level,
      verifiedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      score: this.generateHumanityScore(level),
      attributes: this.generateVerificationAttributes(level),
      metadata: {
        method: "mock",
        provider: "self-protocol-mock",
        version: "1.0.0",
      },
    };

    // Store verification
    this.verifications.set(address.toLowerCase(), result);

    return result;
  }

  /**
   * Check if an address is verified
   * @param address - Ethereum address to check
   * @param minLevel - Minimum verification level required
   * @returns True if verified at or above the minimum level
   */
  async isVerified(
    address: string,
    minLevel: VerificationLevel = VerificationLevel.Basic
  ): Promise<boolean> {
    const result = await this.getVerification(address);
    
    if (!result || !result.isVerified) {
      return false;
    }

    // Check if verification is still valid
    if (result.expiresAt && result.expiresAt < Date.now()) {
      return false;
    }

    // Check verification level
    return this.isLevelSufficient(result.level!, minLevel);
  }

  /**
   * Get verification details for an address
   * @param address - Ethereum address
   * @returns Verification result or undefined
   */
  async getVerification(address: string): Promise<VerificationResult | undefined> {
    return this.verifications.get(address.toLowerCase());
  }

  /**
   * Get all verified addresses
   * @returns Array of verified addresses
   */
  async getVerifiedAddresses(): Promise<string[]> {
    const verified: string[] = [];
    const now = Date.now();

    for (const [address, result] of this.verifications.entries()) {
      if (result.isVerified && (!result.expiresAt || result.expiresAt > now)) {
        verified.push(address);
      }
    }

    return verified;
  }

  /**
   * Revoke verification for an address (admin function)
   * @param address - Ethereum address
   */
  async revokeVerification(address: string): Promise<void> {
    this.verifications.delete(address.toLowerCase());
  }

  /**
   * Get verification statistics
   * @returns Statistics about verifications
   */
  async getVerificationStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byLevel: Record<VerificationLevel, number>;
  }> {
    const now = Date.now();
    const stats = {
      total: this.verifications.size,
      active: 0,
      expired: 0,
      byLevel: {
        [VerificationLevel.Basic]: 0,
        [VerificationLevel.Advanced]: 0,
        [VerificationLevel.Premium]: 0,
      },
    };

    for (const result of this.verifications.values()) {
      if (result.isVerified) {
        if (!result.expiresAt || result.expiresAt > now) {
          stats.active++;
          if (result.level) {
            stats.byLevel[result.level]++;
          }
        } else {
          stats.expired++;
        }
      }
    }

    return stats;
  }

  /**
   * Request verification for current user
   * @param level - Verification level to request
   * @returns Verification request details
   */
  async requestVerification(
    level: VerificationLevel = VerificationLevel.Basic
  ): Promise<VerificationRequest> {
    const address = await this.auth.getAddress();

    const request: VerificationRequest = {
      address,
      level,
      timestamp: Date.now(),
    };

    // In production, this would initiate the Self Protocol verification flow
    // For now, we'll automatically verify in mock mode
    if (this.mockMode) {
      await this.verifyHuman(address, level);
    }

    return request;
  }

  /**
   * Check if a verification level is sufficient
   */
  private isLevelSufficient(
    actualLevel: VerificationLevel,
    requiredLevel: VerificationLevel
  ): boolean {
    const levels = {
      [VerificationLevel.Basic]: 1,
      [VerificationLevel.Advanced]: 2,
      [VerificationLevel.Premium]: 3,
    };

    return levels[actualLevel] >= levels[requiredLevel];
  }

  /**
   * Generate a mock humanity score based on verification level
   */
  private generateHumanityScore(level: VerificationLevel): number {
    switch (level) {
      case VerificationLevel.Basic:
        return 70 + Math.floor(Math.random() * 15);
      case VerificationLevel.Advanced:
        return 85 + Math.floor(Math.random() * 10);
      case VerificationLevel.Premium:
        return 95 + Math.floor(Math.random() * 5);
      default:
        return 50;
    }
  }

  /**
   * Generate mock verification attributes based on level
   */
  private generateVerificationAttributes(level: VerificationLevel) {
    const attributes = {
      hasEmail: true,
      hasPhone: false,
      hasGovernmentId: false,
      hasBiometric: false,
      hasLinkedAccounts: false,
    };

    switch (level) {
      case VerificationLevel.Advanced:
        attributes.hasPhone = true;
        attributes.hasLinkedAccounts = true;
        break;
      case VerificationLevel.Premium:
        attributes.hasPhone = true;
        attributes.hasGovernmentId = true;
        attributes.hasBiometric = true;
        attributes.hasLinkedAccounts = true;
        break;
    }

    return attributes;
  }

  /**
   * Simulate verification delay (for realistic mock behavior)
   */
  private async simulateVerificationDelay(): Promise<void> {
    const delay = 500 + Math.random() * 1000; // 0.5-1.5 seconds
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Enable or disable mock mode
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
  }

  /**
   * Check if mock mode is enabled
   */
  isMockMode(): boolean {
    return this.mockMode;
  }
}
