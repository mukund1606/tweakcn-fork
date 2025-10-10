export interface SubscriptionCheck extends SubscriptionStatus {
  error?: string;
}

export interface SubscriptionStatus {
  requestsUsed: number;
  requestsRemaining: number;
}
