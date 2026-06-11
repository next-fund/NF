// Global constants for the NexFund investment platform.

export const BRAND = {
  name: 'NexFund',
  slogan: 'Smart Investments, Automated Returns',
  logo: 'https://d64gsuwffb70l.cloudfront.net/6a27f3bd931c3d9f46766727_1781003334260_41200d01.jpg',
  hero: 'https://d64gsuwffb70l.cloudfront.net/6a27f3bd931c3d9f46766727_1781003353310_56a35c27.jpg',
};

// Hard-coded admin credentials (as requested).
export const ADMIN_EMAIL = 'ahmad.niazi14@gmail.com';
export const ADMIN_PASSWORD = 'FaMoU.ai123';

// BSC (BEP-20) USDT deposit address.
export const DEPOSIT_ADDRESS = '0x95c535EA4F83eE5ECa94fC689048d0BE56C4c60d';

// Withdrawal fee (1%).
export const WITHDRAW_FEE_RATE = 0.01;

// Investment packages. dailyReturn is credited automatically every 24h.
export interface InvestmentPackage {
  id: string;
  name: string;
  investment: number; // USDT cost
  dailyReturn: number; // USDT credited every 24h
  color: string; // tailwind gradient classes
  highlight?: boolean;
}

export const PACKAGES: InvestmentPackage[] = [
  { id: 'starter', name: 'Starter', investment: 90, dailyReturn: 3, color: 'from-emerald-500 to-teal-500' },
  { id: 'growth', name: 'Growth', investment: 300, dailyReturn: 10, color: 'from-indigo-500 to-blue-500', highlight: true },
  { id: 'pro', name: 'Pro', investment: 600, dailyReturn: 20, color: 'from-violet-500 to-purple-600' },
  { id: 'elite', name: 'Elite', investment: 1200, dailyReturn: 40, color: 'from-amber-500 to-orange-600' },
];

export const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
