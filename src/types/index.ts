export type MarketType = "YES_NO" | "MULTI";
export type MarketStatus = "OPEN" | "CLOSED" | "SETTLED";
export type PredictionResult = "PENDING" | "WON" | "LOST";
export type CreditTransactionType =
  | "STARTING_GRANT"
  | "STAKE"
  | "WIN_REWARD"
  | "BONUS"
  | "ADJUSTMENT";

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  type: MarketType;
  status: MarketStatus;
  closes_at: string;
  resolved_outcome: string | null;
  created_at: string;
}

export interface MarketOption {
  id: string;
  market_id: string;
  label: string;
  order_index: number;
}

export interface Prediction {
  id: string;
  user_id: string;
  market_id: string;
  option_id: string;
  credits_staked: number;
  result: PredictionResult;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: CreditTransactionType;
  created_at: string;
  note: string | null;
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  total_credits: number;
  win_rate: number;
}
