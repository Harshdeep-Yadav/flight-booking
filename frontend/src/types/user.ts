export interface PaymentInfo {
  cardType: string;
  last4: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  address?: string;
  payment_info?: PaymentInfo;
  loyalty_points?: number;
} 