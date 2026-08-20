export interface MetaTvUserAccount {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  password?: string;
  role?: string;
  discountPoints: number;
  walletBalance: number;
  totalEarned?: number;
  qualifiedSilver?: boolean;
  isCompany?: boolean;
  comune?: string;
  provincia?: string;
  cap?: string;
  registeredAt?: string;
}

export const META_TV_INITIAL_USERS: MetaTvUserAccount[] = [
  {
    id: "user-baddy72-wd4w40400",
    username: "baddy72",
    fullName: "Baddy72",
    email: "luca.iovane@libero.it",
    password: "12345678",
    role: "user",
    discountPoints: 100,
    walletBalance: 20,
    totalEarned: 20,
    qualifiedSilver: true,
    isCompany: false,
    comune: "roma",
    provincia: "RM",
    cap: "00157",
    registeredAt: "2026-08-17T16:44:36.406Z"
  },
  {
    id: "user-emirago-g9f371dpg",
    username: "emirago",
    fullName: "Emiliano Rago",
    email: "ragoemiliano1@gmail.com",
    password: "12345678",
    role: "user",
    discountPoints: 100,
    walletBalance: 0,
    totalEarned: 0,
    qualifiedSilver: true,
    isCompany: false,
    comune: "roma",
    provincia: "RM",
    cap: "00134",
    registeredAt: "2026-08-17T16:51:22.756Z"
  },
  {
    id: "user-clapicci-x296o50u6",
    username: "clapicci",
    fullName: "Clapicci Network",
    email: "pc.networkteam8@gmail.com",
    password: "12345678",
    role: "user",
    discountPoints: 100,
    walletBalance: 0,
    totalEarned: 0,
    qualifiedSilver: true,
    isCompany: false,
    comune: "San Salvo",
    provincia: "CH",
    cap: "66050",
    registeredAt: "2026-08-17T16:56:11.626Z"
  },
  {
    id: "user-cavgradassi-f7agal2wv",
    username: "cavgradassi",
    fullName: "R. Gradassi",
    email: "r.gradassi@virgilio.it",
    password: "12345678",
    role: "user",
    discountPoints: 100,
    walletBalance: 0,
    totalEarned: 0,
    qualifiedSilver: true,
    isCompany: false,
    comune: "Castel Ritaldi",
    provincia: "PG",
    cap: "06044",
    registeredAt: "2026-08-17T17:01:56.530Z"
  },
  {
    id: "codice-zero-id",
    username: "codice_zero",
    fullName: "Codice Zero (Commerciale)",
    email: "commerciale@cashpower.com",
    password: "12345678",
    role: "commerciale",
    discountPoints: 100,
    walletBalance: 30,
    totalEarned: 30,
    qualifiedSilver: true,
    isCompany: false,
    registeredAt: "2026-07-18T16:39:10.222Z"
  },
  {
    id: "admin-id",
    username: "admin",
    fullName: "Amministratore Meta-TV & Bonus Power",
    email: "admin@cashpower.com",
    password: "12345678",
    role: "admin",
    discountPoints: 100,
    walletBalance: 15,
    totalEarned: 15,
    qualifiedSilver: true,
    isCompany: false,
    registeredAt: "2026-07-18T16:39:10.222Z"
  }
];

export const META_TV_CONFIG = {
  portalName: "Meta-TV",
  wpLoginUrl: "https://www.meta-tv.eu/main-login/",
  wpSiteUrl: "https://meta-tv.eu",
  bonusPowerAppUrl: "https://bonus-power-app.onrender.com",
  myCredLabel: "Punti Sincronizzati Meta-TV",
  exchangeNote: "I punti accumulati su Meta-TV e nel Centro 3D sono pronti per essere spesi come Punti Sconto su Bonus Power."
};
