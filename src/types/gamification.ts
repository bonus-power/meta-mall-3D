export interface DailyReward {
  day: number;
  points: number;
  claimed: boolean;
  available: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  progress: number;
  maxProgress: number;
  claimed: boolean;
}

export interface VIPTier {
  level: number;
  name: string;
  pointsRequired: number;
  badge: string;
  perks: string[];
}

export const VIP_TIERS: VIPTier[] = [
  {
    level: 1,
    name: 'Explorer Bronze',
    pointsRequired: 0,
    badge: '🥉',
    perks: ['Accesso a tutti i padiglioni 3D', 'Accumulo punti base', 'Link Bonus-Power standard'],
  },
  {
    level: 2,
    name: 'VIP Silver',
    pointsRequired: 500,
    badge: '🥈',
    perks: ['+10% Punti per interazione', 'Badge Silver nel profilo', 'Sconti riservati nelle vetrine 3D'],
  },
  {
    level: 3,
    name: 'VIP Gold',
    pointsRequired: 1500,
    badge: '🥇',
    perks: ['+25% Punti per interazione', 'Teletrasporto VIP istantaneo', 'Accesso prioritario eventi Live'],
  },
  {
    level: 4,
    name: 'Platinum Diamond',
    pointsRequired: 5000,
    badge: '💎',
    perks: ['+50% Punti per interazione', 'Buoni sconto esclusivi', 'Supporto e consulente dedicato'],
  },
];
