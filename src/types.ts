export interface SponsorPanel {
  id: string;
  title: string;
  advertiserName: string;
  imageUrl: string;
  youtubeEmbedUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'youtube' | 'video';
  tagline: string;
  description?: string;
  websiteUrl?: string;
  externalPurchaseUrl?: string;
  positionX: number;
  side: 'left' | 'right' | 'overhead';
  isOverhead?: boolean;
  status: 'active' | 'available' | 'pending';
  pricePerMonth: string;
  category?: string;
  createdAt?: string;
  boughtByEmail?: string;
}

export interface AdminCollaborator {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sponsor_collaborator' | 'content_manager';
  active: boolean;
  assignedPanels?: string[];
}

export type NavMode = 'corridor' | 'globe' | 'panorama' | 'admin' | 'business' | 'live-events';

export type CategoryId =
  | 'shopping'
  | 'food'
  | 'beauty'
  | 'tech'
  | 'media'
  | 'auto'
  | 'casa'
  | 'servizi'
  | 'viaggi'
  | 'formazione'
  | 'artigianato'
  | 'animali'
  | 'eventi'
  | 'lifestyle'
  | 'finanza'
  | 'benessere'
  | 'sicurezza'
  | 'pulizia'
  | 'logistica'
  | 'scienza';

export interface Pavilion {
  id: CategoryId;
  name: string;
  iconName: string;
  color: string;
  glowColor: string;
  description: string;
  positionX: number; // Position along the 3D corridor axis
  side: 'left' | 'right';
  bannerImage: string;
  tagline: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  tag?: string;
}

export interface Offer {
  id: string;
  title: string;
  discount: string;
  code: string;
  expiresIn: string;
  bonusPowerBonus: string;
}

export interface VirtualTourHotspot {
  id: string;
  yaw: number; // Angle around horizontal axis (-180 to 180 degrees)
  pitch: number; // Angle around vertical axis (-90 to 90 degrees)
  label: string;
  actionType: 'scene-change' | 'bonus-power' | 'website' | 'product' | 'info' | 'phone';
  targetSceneId?: string; // For room navigation (e.g. 'room-entrance' -> 'room-hall')
  targetUrl?: string;
  productId?: string;
  description?: string;
  points?: number;
}

export interface VirtualTourScene {
  id: string;
  name: string; // e.g. "Ingresso Principale", "Corridoio Galleria", "Salone Sartoriale"
  panoramaUrl: string; // 360 photo image URL or local file
  type?: 'room' | 'corridor'; // 'room' for rooms/stanze, 'corridor' for corridors/passaggi
  hotspots: VirtualTourHotspot[];
  mapCoords?: { x: number; y: number }; // Percentage offset on 2D map (0 to 100%)
}

export interface VirtualTourConfig {
  enabled: boolean;
  title: string;
  panoramaUrl?: string;
  description?: string;
  hotspots?: VirtualTourHotspot[];
  scenes?: VirtualTourScene[];
  initialSceneId?: string;
  floorPlanUrl?: string; // 2D floor plan map image URL or SVG graphic
}

export interface Company {
  id: string;
  name: string;
  categoryId: CategoryId;
  subCategory: string;
  logo: string;
  headerImage: string;
  description: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website: string;
  bonusPowerLink: string;
  youtubeVideoId: string; // YouTube video ID or embed URL
  products: Product[];
  offers: Offer[];
  featured: boolean;
  verified: boolean;
  rating: number;
  virtualTour?: VirtualTourConfig;
}

export interface Panorama360 {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    type: 'teleport' | 'open-company' | 'open-globe' | 'open-bonuspower';
    targetId?: string;
    url?: string;
    label?: string;
  };
}

export interface UserStats {
  level: number;
  xp: number;
  coins: number;
  visitedPavilions: string[];
  unlockedBadges: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface LiveEvent {
  id: string;
  title: string;
  performer: string;
  time: string;
  category: string;
  youtubeId: string;
  description: string;
  isLive: boolean;
}
