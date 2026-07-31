import { Pavilion, Company } from '../types';

export interface SubCategory {
  id: string;
  name: string;
  pavilionId: string;
  color: string;
  glowColor: string;
  iconName: string;
  bannerImage: string;
  description: string;
  tagline: string;
}

export const SUBCATEGORIES_BY_PAVILION: Record<string, SubCategory[]> = {
  shopping: [
    {
      id: 'sub-shop-1',
      name: 'Alta Moda & Sartoria',
      pavilionId: 'shopping',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.8)',
      iconName: 'Sparkles',
      bannerImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      description: 'Abiti sartoriali su misura, collezioni di lusso e passerelle virtuali 3D.',
      tagline: 'Lusso & Haute Couture 3D',
    },
    {
      id: 'sub-shop-2',
      name: 'Scarpe & Calzature',
      pavilionId: 'shopping',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.8)',
      iconName: 'ShoppingBag',
      bannerImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      description: 'Sneakers vintage, scarpe eleganti, stivali e calzature artigianali italiane.',
      tagline: 'Calzature & Design Artigianale',
    },
    {
      id: 'sub-shop-3',
      name: 'Gioielli & Orologi',
      pavilionId: 'shopping',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.8)',
      iconName: 'Watch',
      bannerImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      description: 'Orologi svizzeri da collezione, diamanti, pietre preziose e gioielli in oro 24K.',
      tagline: 'Alta Orologeria & Pietre Preziose',
    },
    {
      id: 'sub-shop-4',
      name: 'Sport & Outdoor',
      pavilionId: 'shopping',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.8)',
      iconName: 'Activity',
      bannerImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      description: 'Abbigliamento tecnico sportivo, attrezzatura outdoor e accessori per fitness.',
      tagline: 'Performance & Attrezzatura Pro',
    },
    {
      id: 'sub-shop-5',
      name: 'Borse & Pelletteria',
      pavilionId: 'shopping',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.8)',
      iconName: 'Package',
      bannerImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      description: 'Borse in pelle pregiata, valigeria e accessori di lusso rifiniti a mano.',
      tagline: 'Pelle Pregiata & Bagaglio VIP',
    },
    {
      id: 'sub-shop-6',
      name: 'Ottica & Occhiali da Sole',
      pavilionId: 'shopping',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.8)',
      iconName: 'Eye',
      bannerImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      description: 'Montature di design, occhiali smart con realtà aumentata e lenti polarizzate.',
      tagline: 'Visione Smart & Design Trend',
    },
  ],

  food: [
    {
      id: 'sub-food-1',
      name: 'Ristoranti Stellati & Gourmet',
      pavilionId: 'food',
      color: '#FF7F50',
      glowColor: 'rgba(255, 127, 80, 0.8)',
      iconName: 'Utensils',
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      description: 'Cucina gourmet, percorsi degustazione e piatti firmati da chef internazionali.',
      tagline: 'Alta Gastronomia Michelin',
    },
    {
      id: 'sub-food-2',
      name: 'Pizzerie & Street Food',
      pavilionId: 'food',
      color: '#FF7F50',
      glowColor: 'rgba(255, 127, 80, 0.8)',
      iconName: 'Flame',
      bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      description: 'Pizza napoletana verace, fritto misto e street food di qualità gourmet.',
      tagline: 'Tradizione Napoletana & Street Taste',
    },
    {
      id: 'sub-food-3',
      name: 'Enoteca & Vini D.O.C.G.',
      pavilionId: 'food',
      color: '#FF7F50',
      glowColor: 'rgba(255, 127, 80, 0.8)',
      iconName: 'GlassWater',
      bannerImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
      description: 'Grandi cantine, Amarone, Brunello di Montalcino, Champagne e degustazioni guidate.',
      tagline: 'Vini Rari & Sommelier 3D',
    },
    {
      id: 'sub-food-4',
      name: 'Sushi & Ethnic Food',
      pavilionId: 'food',
      color: '#FF7F50',
      glowColor: 'rgba(255, 127, 80, 0.8)',
      iconName: 'Fish',
      bannerImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
      description: 'Sushi fusion giapponese, ramen fumante e specialità orientali preparate a vista.',
      tagline: 'Sashimi Fusion & Ramen Bar',
    },
    {
      id: 'sub-food-5',
      name: 'Pasticceria & Gelateria',
      pavilionId: 'food',
      color: '#FF7F50',
      glowColor: 'rgba(255, 127, 80, 0.8)',
      iconName: 'Cake',
      bannerImage: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
      description: 'Dolci artigianali, gelato naturale e cioccolateria di alta scuola.',
      tagline: 'Dolci Creazioni & Gelato Artigianale',
    },
  ],

  beauty: [
    {
      id: 'sub-beauty-1',
      name: 'Centri Estetici & Spa Thermal',
      pavilionId: 'beauty',
      color: '#FF69B4',
      glowColor: 'rgba(255, 105, 180, 0.8)',
      iconName: 'Sparkles',
      bannerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      description: 'Percorsi benessere, saune finlandesi, idromassaggi e trattamenti rigeneranti.',
      tagline: 'Relax Assoluto & SPA 3D',
    },
    {
      id: 'sub-beauty-2',
      name: 'Cosmesi & Dermocosmesi Bio',
      pavilionId: 'beauty',
      color: '#FF69B4',
      glowColor: 'rgba(255, 105, 180, 0.8)',
      iconName: 'Heart',
      bannerImage: 'https://images.unsplash.com/photo-1608248597309-86928e46123e?auto=format&fit=crop&w=800&q=80',
      description: 'Creme antiage all’oro colloidale, sieri rigeneranti e makeup biologico certificato.',
      tagline: 'Dermocosmetica di Lusso',
    },
    {
      id: 'sub-beauty-3',
      name: 'Parrucchieri & Barber Shop',
      pavilionId: 'beauty',
      color: '#FF69B4',
      glowColor: 'rgba(255, 105, 180, 0.8)',
      iconName: 'Scissors',
      bannerImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      description: 'Hairstyling di tendenza, barberia tradizionale e trattamenti cheratina.',
      tagline: 'Hairstyling & Barber VIP',
    },
    {
      id: 'sub-beauty-4',
      name: 'Fitness & Yoga Mind',
      pavilionId: 'beauty',
      color: '#FF69B4',
      glowColor: 'rgba(255, 105, 180, 0.8)',
      iconName: 'Dumbbell',
      bannerImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      description: 'Personal training virtuale, lezioni di pilates, yoga e meditazione.',
      tagline: 'Corpo, Mente & Movimento',
    },
  ],

  tech: [
    {
      id: 'sub-tech-1',
      name: 'Smartphone & Mobile Device',
      pavilionId: 'tech',
      color: '#00FFFF',
      glowColor: 'rgba(0, 255, 255, 0.8)',
      iconName: 'Smartphone',
      bannerImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      description: 'Flagship smartphone con fotocamere AI 200MP, tablet pieghevoli e wearable.',
      tagline: 'Top di Gamma Mobile & AI',
    },
    {
      id: 'sub-tech-2',
      name: 'VR / AR & Ologrammi Meta-TV',
      pavilionId: 'tech',
      color: '#00FFFF',
      glowColor: 'rgba(0, 255, 255, 0.8)',
      iconName: 'Glasses',
      bannerImage: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
      description: 'Visori olografici 8K, guanti aptici e ambienti di immersione virtuale totale.',
      tagline: 'Realtà Aumentata & Visori 8K',
    },
    {
      id: 'sub-tech-3',
      name: 'Gaming PC & Console Arena',
      pavilionId: 'tech',
      color: '#00FFFF',
      glowColor: 'rgba(0, 255, 255, 0.8)',
      iconName: 'Gamepad',
      bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      description: 'Postazioni PC da gioco raffreddate a liquido, schede grafiche RTX e periferiche Pro.',
      tagline: 'E-Sports, RTX & Gaming Rig',
    },
    {
      id: 'sub-tech-4',
      name: 'Domotica & Smart Home AI',
      pavilionId: 'tech',
      color: '#00FFFF',
      glowColor: 'rgba(0, 255, 255, 0.8)',
      iconName: 'Home',
      bannerImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
      description: 'Hub domotici parlanti, assistenti AI domestici e illuminazione d’ambiente interattiva.',
      tagline: 'Casa Intelligente del Futuro',
    },
  ],

  auto: [
    {
      id: 'sub-auto-1',
      name: 'Supercar Elettriche & Sportive',
      pavilionId: 'auto',
      color: '#1E90FF',
      glowColor: 'rgba(30, 144, 255, 0.8)',
      iconName: 'Zap',
      bannerImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      description: 'Hypercar elettriche da oltre 1000 cavalli, accelerazione 0-100 in 2 secondi.',
      tagline: '1000 CV & Brivido Elettrico',
    },
    {
      id: 'sub-auto-2',
      name: 'E-Bike & Monopattini Urban',
      pavilionId: 'auto',
      color: '#1E90FF',
      glowColor: 'rgba(30, 144, 255, 0.8)',
      iconName: 'Bike',
      bannerImage: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
      description: 'E-bike monoscocca in carbonio, monopattini veloci e veicoli leggeri da città.',
      tagline: 'Mobilità Verde Urbana',
    },
    {
      id: 'sub-auto-3',
      name: 'Moto & Scooter Elettrici',
      pavilionId: 'auto',
      color: '#1E90FF',
      glowColor: 'rgba(30, 144, 255, 0.8)',
      iconName: 'Flame',
      bannerImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
      description: 'Superbike a zero emissioni, macchine d’epoca restaurate e scooter smart.',
      tagline: 'Due Ruote & Design Futuristico',
    },
  ],

  casa: [
    {
      id: 'sub-casa-1',
      name: 'Design d’Interni & Salotti',
      pavilionId: 'casa',
      color: '#32CD32',
      glowColor: 'rgba(50, 205, 50, 0.8)',
      iconName: 'Armchair',
      bannerImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      description: 'Divani modulari in pelle, tavoli in cristallo e soluzioni d’arredo contemporaneo.',
      tagline: 'Stile & Comfort Moderno',
    },
    {
      id: 'sub-casa-2',
      name: 'Cucine Moderne & Elettrodomestici',
      pavilionId: 'casa',
      color: '#32CD32',
      glowColor: 'rgba(50, 205, 50, 0.8)',
      iconName: 'CookingPot',
      bannerImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      description: 'Cucine ad isola con piani ad induzione smart, frigoriferi connessi e cappe a scomparsa.',
      tagline: 'Cucine hi-tech & Food prep',
    },
    {
      id: 'sub-casa-3',
      name: 'Illuminazione LED & Giardino',
      pavilionId: 'casa',
      color: '#32CD32',
      glowColor: 'rgba(50, 205, 50, 0.8)',
      iconName: 'Sun',
      bannerImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: 'Lampade a sospensione artistica, faretti smart e arredi per esterni e giardini.',
      tagline: 'Luce Scenografica & Outdoor',
    },
  ],

  media: [
    {
      id: 'sub-media-1',
      name: 'Meta-TV Live Broadcast',
      pavilionId: 'media',
      color: '#9370DB',
      glowColor: 'rgba(147, 112, 219, 0.8)',
      iconName: 'Tv',
      bannerImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      description: 'Studi televisivi 3D con dirette streaming interattive e programmazione live h24.',
      tagline: 'Diretta TV 3D & Broadcast',
    },
    {
      id: 'sub-media-2',
      name: 'Concerti & Stage Musicali',
      pavilionId: 'media',
      color: '#9370DB',
      glowColor: 'rgba(147, 112, 219, 0.8)',
      iconName: 'Music',
      bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      description: 'Arena spettacoli con tappe di tour musicali, DJ set live e palchi olografici.',
      tagline: 'Musica Live & Ologrammi',
    },
    {
      id: 'sub-media-3',
      name: 'Radio & Podcast Studio',
      pavilionId: 'media',
      color: '#9370DB',
      glowColor: 'rgba(147, 112, 219, 0.8)',
      iconName: 'Mic',
      bannerImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
      description: 'Cabine di registrazione podcast, talk show in tempo reale e radio d’autore.',
      tagline: 'Podcast & Voci dal Vivo',
    },
  ],
};

// Fallback subcategory builder for any category not explicitly defined above
export function getSubcategoriesForPavilion(pavilion: Pavilion, companies: Company[]): SubCategory[] {
  if (SUBCATEGORIES_BY_PAVILION[pavilion.id]) {
    return SUBCATEGORIES_BY_PAVILION[pavilion.id];
  }

  // Generate dynamic subcategories based on description or company subCategories
  const companySubs = Array.from(new Set(
    companies
      .filter((c) => c.categoryId === pavilion.id)
      .map((c) => c.subCategory)
  )).filter(Boolean);

  const baseNames = companySubs.length > 0 
    ? companySubs 
    : [
        `Area Espositiva ${pavilion.name} 01`,
        `Servizi & Innovazione ${pavilion.name}`,
        `Prodotti Top ${pavilion.name}`,
        `Showroom Esclusivo ${pavilion.name}`,
      ];

  return baseNames.map((name, idx) => ({
    id: `sub-${pavilion.id}-${idx}`,
    name,
    pavilionId: pavilion.id,
    color: pavilion.color || '#FFD700',
    glowColor: pavilion.glowColor || 'rgba(255, 215, 0, 0.8)',
    iconName: pavilion.iconName || 'Store',
    bannerImage: pavilion.bannerImage,
    description: `Sottocategoria specializzata per ${name}. Scopri i migliori espositori e prodotti.`,
    tagline: pavilion.tagline || `Spazio Esclusivo 3D ${pavilion.name}`,
  }));
}
