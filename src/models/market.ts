import { Currency, Token } from 'types/currency';
import { Land } from 'types/land';
import { News, Comment } from 'types/market';
import { Network } from 'types/network';
import { Tournament } from 'types/tournament';

export interface PriceChartPoint {
  value: number;
  timestamp: number;
  date: string;
}

export interface PriceChart {
  timeframe: string;
  changePercent: number;
  prices: PriceChartPoint[];
}

export interface Outcome {
  id: number | string;
  marketId: number | string;
  price: number;
  priceChange24h: number;
  title: string;
  change: {
    type: string;
    chartData: any[];
  };
  priceCharts?: PriceChart[];
  shares: number;
  imageUrl: string;
}

export interface Question {
  id: string;
  bond: number;
  bestAnswer: string;
  isFinalized: boolean;
  arbitrator: string;
  isPendingArbitration: boolean;
  isClaimed: boolean;
  finalizeTs: number;
  isPendingArbitrationRequest: boolean;
  disputeId: number | null;
}

export type Votes = {
  up: number;
  down: number;
};

export interface Market {
  id: string;
  slug: string;
  category: string;
  subcategory: string;
  resolutionSource?: string | null;
  imageUrl: string | null;
  bannerUrl: string;
  title: string;
  description: string;
  volume: number;
  volumeEur: number;
  shares: number;
  liquidity: number;
  liquidityEur: number;
  liquidityPrice: number;
  createdAt: string;
  expiresAt: string;
  state: string;
  verified: boolean;
  voided: boolean;
  questionId: string;
  resolvedOutcomeId: number;
  outcomes: Outcome[];
  tradingViewSymbol: any;
  fee: number;
  treasuryFee: number;
  treasury: string;
  question: Question;
  networkId: string;
  network: Network;
  news: News[];
  currency: Currency;
  votes: Votes;
  token: Token;
  users: number;
  comments: Comment[];
  tournaments: Tournament[];
  relatedMarkets?: Market[];
  land?: Land | null;
}
