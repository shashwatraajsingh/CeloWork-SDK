/**
 * Reputation tracking module (placeholder for future implementation)
 * In production, this would integrate with on-chain reputation or a backend API
 */

import { Reputation, Review, Badge } from "../types";
import { Auth } from "./auth";

export class ReputationManager {
  private auth: Auth;
  private reputations: Map<string, Reputation>;
  private reviews: Map<string, Review>;

  constructor(auth: Auth) {
    this.auth = auth;
    this.reputations = new Map();
    this.reviews = new Map();
  }

  /**
   * Get reputation for an address
   */
  async getReputation(address?: string): Promise<Reputation> {
    const addr = address || (await this.auth.getAddress());
    
    let reputation = this.reputations.get(addr);
    if (!reputation) {
      // Initialize default reputation
      reputation = {
        address: addr,
        totalJobs: 0,
        completedJobs: 0,
        rating: 0,
        totalEarned: "0",
        totalSpent: "0",
        reviews: [],
        badges: [],
      };
      this.reputations.set(addr, reputation);
    }

    return reputation;
  }

  /**
   * Add a review
   */
  async addReview(
    jobId: string,
    reviewee: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const reviewer = await this.auth.getAddress();
    const reviewId = this.generateReviewId();

    const review: Review = {
      id: reviewId,
      jobId,
      reviewer,
      reviewee,
      rating,
      comment,
      createdAt: Date.now(),
    };

    this.reviews.set(reviewId, review);

    // Update reputation
    const reputation = await this.getReputation(reviewee);
    reputation.reviews.push(review);
    
    // Recalculate average rating
    const totalRating = reputation.reviews.reduce((sum, r) => sum + r.rating, 0);
    reputation.rating = totalRating / reputation.reviews.length;

    this.reputations.set(reviewee, reputation);

    return review;
  }

  /**
   * Get reviews for an address
   */
  async getReviews(address?: string): Promise<Review[]> {
    const addr = address || (await this.auth.getAddress());
    const reputation = await this.getReputation(addr);
    return reputation.reviews;
  }

  /**
   * Update job completion stats
   */
  async updateJobStats(address: string, completed: boolean): Promise<void> {
    const reputation = await this.getReputation(address);
    reputation.totalJobs++;
    if (completed) {
      reputation.completedJobs++;
    }
    this.reputations.set(address, reputation);
  }

  /**
   * Update earnings/spending
   */
  async updateFinancials(
    address: string,
    amount: string,
    type: "earned" | "spent"
  ): Promise<void> {
    const reputation = await this.getReputation(address);
    
    if (type === "earned") {
      const current = parseFloat(reputation.totalEarned || "0");
      reputation.totalEarned = (current + parseFloat(amount)).toString();
    } else {
      const current = parseFloat(reputation.totalSpent || "0");
      reputation.totalSpent = (current + parseFloat(amount)).toString();
    }

    this.reputations.set(address, reputation);
  }

  /**
   * Award a badge
   */
  async awardBadge(address: string, badge: Omit<Badge, "earnedAt">): Promise<Badge> {
    const reputation = await this.getReputation(address);
    
    const newBadge: Badge = {
      ...badge,
      earnedAt: Date.now(),
    };

    if (!reputation.badges) {
      reputation.badges = [];
    }
    reputation.badges.push(newBadge);

    this.reputations.set(address, reputation);
    return newBadge;
  }

  /**
   * Get top rated users
   */
  async getTopRated(limit: number = 10): Promise<Reputation[]> {
    const allReputations = Array.from(this.reputations.values());
    return allReputations
      .filter((rep) => rep.reviews.length > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Calculate completion rate
   */
  getCompletionRate(reputation: Reputation): number {
    if (reputation.totalJobs === 0) return 0;
    return (reputation.completedJobs / reputation.totalJobs) * 100;
  }

  /**
   * Generate a unique review ID
   */
  private generateReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
