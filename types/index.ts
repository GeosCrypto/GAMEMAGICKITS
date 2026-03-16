export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  total_credits: number;
  win_rate: number;
  predictions_count: number;
  wins_count: number;
  users?: { username: string; email: string };
}

export type MarketStatus = 'OPEN' | 'CLOSED' | 'SETTLED';
export type MarketType = 'YES_NO' | 'MULTI';
export type MarketCategory = 'GAMES' | 'ESPORTS' | 'TECH' | 'POP_CULTURE';

export interface Market {
  id: string;
  title: string;
  description: string | null;
  category: MarketCategory;
  type: MarketType;
  status: MarketStatus;
  closes_at: string;
  resolved_outcome: string | null;
  created_by: string | null;
  created_at: string;
  options?: MarketOption[];
}

export interface MarketOption {
  id: string;
  market_id: string;
  label: string;
  order_index: number;
}

export type PredictionResult = 'PENDING' | 'WON' | 'LOST';

export interface Prediction {
  id: string;
  user_id: string;
  market_id: string;
  option_id: string;
  credits_staked: number;
  result: PredictionResult;
  created_at: string;
  markets?: Market;
  market_options?: MarketOption;
}

export type CreditTransactionType =
  | 'STARTING_GRANT'
  | 'STAKE'
  | 'WIN_REWARD'
  | 'BONUS'
  | 'ADJUSTMENT';

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: CreditTransactionType;
  created_at: string;
  note: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badges?: Badge;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string | null;
  username: string;
  level: number;
  xp: number;
  total_credits: number;
  win_rate: number;
  predictions_count: number;
  wins_count: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface MarketWithStats extends Market {
  options: MarketOption[];
  total_staked: number;
  participants: number;
  option_stats: { option_id: string; label: string; count: number; total_staked: number }[];
}
