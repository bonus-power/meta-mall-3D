import React, { useState } from 'react';
import { Pavilion, Company, CategoryId } from '../../types';
import {
  X,
  Store,
  Zap,
  Tag,
  Star,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  PlusCircle,
  Building2,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface PavilionExpoModalProps {
  pavilion: Pavilion | null;
  pavilions: Pavilion[];
  companies: Company[];
  onClose: () => void;
  onSelectCompany: (company: Company) => void;
  onSelectPavilion: (pavilion: Pavilion) => void;
  onOpenBusinessDashboard?: () => void;
}

// Map categories to realistic trade fair subcategories
const SUBCATEGORIES_MAP: Record<CategoryId, string[]> = {
  shopping: [
    'Tutte',
    'Abbigliamento Uomo & Donna',
    'Calzature & Scarpe',
    'Gioielli & Orologi',
    'Accessori & Borse',
    'Sport & Outdoor',
    'Vintage & Lusso',
  ],
  food: [
    'Tutte',
    'Ristorazione Stellata & Gourmet',
    'Pizzerie & Osterie',
    'Pasticcerie & Gelaterie',
    'Enoteca & Vini D.O.C.',
    'Prodotti Tipici & Bio',
  ],
  beauty: [
    'Tutte',
    'Spa Olistica & Massaggi',
    'Dermocosmesi & Bio',
    'Parrucchieri & Barber',
    'Fitness, Yoga & Gym',
    'Integratori & Benessere',
  ],
  tech: [
    'Tutte',
    'Elettronica & Domotica AI',
    'Smartphone & Tablet',
    'Visori VR, AR & Ologrammi',
    'PC Gaming & Hardware',
    'Riparazioni & Service',
  ],
  media: [
    'Tutte',
    'Produzioni Broadcast & Live TV',
    'Streaming & Cinema',
    'Musica, DJ & Concerti',
    'Radio, Podcast & Stampa',
  ],
  auto: [
    'Tutte',
    'Supercar Elettriche & Hypercar',
    'Concessionari Auto',
    'Moto & Scooter',
    'E-Bike & Monopattini',
    'Officine & Detailing',
  ],
  casa: [
    'Tutte',
    'Mobili & Design D’Interni',
    'Cucine Moderne & Bagni',
    'Illuminazione & Domotica',
    'Giardino, Bricolage & BBQ',
  ],
  servizi: [
    'Tutte',
    'Consulenze Legali & Fiscali',
    'Architettura & Ingegneria',
    'Medici & Centri Specialistici',
    'Veterinari & Consulenti',
  ],
  viaggi: [
    'Tutte',
    'Resort di Lusso & Hotel',
    'Agenzie Viaggio & Tour 3D',
    'Crociere & Yacht Charter',
    'B&B & Esperienze Locali',
  ],
  formazione: [
    'Tutte',
    'Università, Master & Academy',
    'Corsi Online & E-Learning',
    'Scuole di Lingue',
    'Accademie Musica & Arte',
  ],
  artigianato: [
    'Tutte',
    'Sartoria & Moda Artigianale',
    'Falegnameria & Arredo Su Misura',
    'Laboratori Ceramica & Vetro',
    'Stampa 3D & Maker Space',
  ],
  animali: [
    'Tutte',
    'Negozi & Mangimi Premium',
    'Cliniche Veterinarie',
    'Toelettatura & Spa Pet',
    'Accessori & Addestramento',
  ],
  eventi: [
    'Tutte',
    'Wedding Planner & Banqueting',
    'Location & Dimore Storiche',
    'DJ, Band & Live Performance',
    'Service Audio & Luci 3D',
  ],
  lifestyle: [
    'Tutte',
    'Giochi da Tavolo & Comics',
    'Modellismo & Collezionismo',
    'Libri, Fumetti & Manga',
    'Attrezzatura Outdoor',
  ],
  finanza: [
    'Tutte',
    'Fintech, Banche & Credito',
    'Assicurazioni & Tutela',
    'Crypto Hub & Blockchain',
    'Coworking & Incubatori',
  ],
  benessere: [
    'Tutte',
    'Mindfulness & Meditazione',
    'Coaching Olistico',
    'Naturopatia & Fitoterapia',
    'Terapie Naturali',
  ],
  sicurezza: [
    'Tutte',
    'Sistemi Allarme & Domotica',
    'Videosorveglianza TVCC',
    'Cybersecurity & Protezione',
    'Casaforti & Porte Blindate',
  ],
  pulizia: [
    'Tutte',
    'Imprese di Pulizia Industriale',
    'Idraulica & Elettricisti',
    'Sanificazione & Clima',
    'Manutenzione Giardini',
  ],
  logistica: [
    'Tutte',
    'Corrieri Espresso & Delivery',
    'Magazzini & Storage',
    'Traslochi Nazionali & Estero',
    'Logistica E-Commerce',
  ],
  scienza: [
    'Tutte',
    'Robotica & Droni',
    'Intelligenza Artificiale',
    'Laboratori Ricerca & Biotech',
    'Energie Rinnovabili',
  ],
};

export const PavilionExpoModal: React.FC<PavilionExpoModalProps> = ({
  pavilion,
  pavilions,
  companies,
  onClose,
  onSelectCompany,
  onSelectPavilion,
  onOpenBusinessDashboard,
}) => {
  if (!pavilion) return null;

  const [selectedSubCat, setSelectedSubCat] = useState<string>('Tutte');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Find index for pavilion navigation
  const currentIndex = pavilions.findIndex((p) => p.id === pavilion.id);
  const prevPavilion = pavilions[(currentIndex - 1 + pavilions.length) % pavilions.length];
  const nextPavilion = pavilions[(currentIndex + 1) % pavilions.length];

  // Get subcategories list for current pavilion
  const subCategories = SUBCATEGORIES_MAP[pavilion.id] || ['Tutte', 'Generale'];

  // Filter existing companies for this pavilion
  const pavilionCompanies = companies.filter((c) => c.categoryId === pavilion.id);

  // If there are few companies, construct mock exhibitor stands to fill out the trade fair hall
  const displayStands: Company[] = [...pavilionCompanies];

  if (displayStands.length < 3) {
    // Generate supplementary exhibitor stands for demonstration in this pavilion
    const mockCategories = subCategories.filter((s) => s !== 'Tutte');
    const mockStand1: Company = {
      id: `stand-demo-1-${pavilion.id}`,
      name: `${pavilion.name} - Stand Premium Alpha`,
      categoryId: pavilion.id,
      subCategory: mockCategories[0] || 'Prodotti & Servizi',
      logo: pavilion.bannerImage,
      headerImage: pavilion.bannerImage,
      description: `Stand esposizione ufficiale per ${pavilion.name}. Scopri i nuovi prodotti in promozione con cashback e sconti esclusivi Bonus-Power.`,
      address: 'Padiglione Fiera Stand 1',
      city: 'Expo City',
      country: 'Italia',
      lat: 45.4642,
      lng: 9.19,
      phone: '+39 02 8000900',
      email: `info@stand-${pavilion.id}.com`,
      website: 'https://bonuspower.net',
      bonusPowerLink: `https://bonuspower.net/partner/${pavilion.id}?promo=EXPO3D`,
      youtubeVideoId: 'dQw4w9WgXcQ',
      featured: true,
      verified: true,
      rating: 4.8,
      products: [
        {
          id: 'p-demo-1',
          name: 'Prodotto Top Fiera 2026',
          price: '€ 199,00',
          description: 'Articolo in evidenza nel Padiglione con garanzia e bonus incluso.',
          image: pavilion.bannerImage,
          tag: 'Novità Fiera',
        },
      ],
      offers: [
        {
          id: 'off-demo-1',
          title: 'Offerta Fiera: 20% di Sconto + Bonus-Power 100 Punti',
          discount: '-20%',
          code: 'EXPO2026',
          expiresIn: '5 giorni',
          bonusPowerBonus: '100 Punti',
        },
      ],
    };

    const mockStand2: Company = {
      id: `stand-demo-2-${pavilion.id}`,
      name: `${pavilion.name} - Atelier Beta Expo`,
      categoryId: pavilion.id,
      subCategory: mockCategories[1] || mockCategories[0] || 'Servizi Specializzati',
      logo: pavilion.bannerImage,
      headerImage: pavilion.bannerImage,
      description: `Atelier ed esposizioni di eccellenza. Prenota un appuntamento virtuale o consulta il catalogo prodotti attivo.`,
      address: 'Padiglione Fiera Stand 2',
      city: 'Expo City',
      country: 'Italia',
      lat: 45.4642,
      lng: 9.19,
      phone: '+39 02 8000901',
      email: `contatti@atelier-${pavilion.id}.com`,
      website: 'https://bonuspower.net',
      bonusPowerLink: `https://bonuspower.net/atelier/${pavilion.id}`,
      youtubeVideoId: 'L_LUpnjgPso',
      featured: false,
      verified: true,
      rating: 4.9,
      products: [
        {
          id: 'p-demo-2',
          name: 'Pacchetto Servizi VIP Expo',
          price: '€ 290,00',
          description: 'Soluzione completa con assistenza personalizzata.',
          image: pavilion.bannerImage,
          tag: 'Edizione Fiera',
        },
      ],
      offers: [
        {
          id: 'off-demo-2',
          title: 'Coupon Omaggio per Ingressi dal Portale 3D',
          discount: 'FREE GIFT',
          code: 'METAFIR2026',
          expiresIn: '3 giorni',
          bonusPowerBonus: '150 Punti',
        },
      ],
    };

    displayStands.push(mockStand1, mockStand2);
  }

  // Filter stands by selected subcategory & search
  const filteredStands = displayStands.filter((stand) => {
    const matchesSub =
      selectedSubCat === 'Tutte' ||
      stand.subCategory.toLowerCase().includes(selectedSubCat.toLowerCase()) ||
      selectedSubCat.toLowerCase().includes(stand.subCategory.toLowerCase());

    const matchesSearch =
      searchTerm === '' ||
      stand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stand.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stand.subCategory.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSub && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#050505] border border-yellow-500/40 rounded-3xl max-w-6xl w-full my-6 overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.2)] text-slate-100 relative animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Top Pavilion Header Banner */}
        <div className="relative h-48 sm:h-64 w-full shrink-0 overflow-hidden border-b border-white/10">
          <img
            src={pavilion.bannerImage}
            alt={pavilion.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-black/40" />

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all z-20 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Left Pavilion Badge & Prev/Next Switcher */}
          <div className="absolute top-4 left-4 right-16 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 text-black shadow-md"
                style={{ backgroundColor: pavilion.color }}
              >
                Padiglione Fiera 3D
              </span>
              <span className="text-xs text-white/70 hidden sm:inline-block">
                • {pavilions.length} Padiglioni Attivi
              </span>
            </div>

            {/* Quick Switch Pavilion Buttons */}
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-full border border-white/15">
              <button
                onClick={() => {
                  setSelectedSubCat('Tutte');
                  onSelectPavilion(prevPavilion);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider text-white/80 hover:text-white hover:bg-white/10 transition-all"
                title={`Vai a ${prevPavilion.name}`}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden md:inline">{prevPavilion.name}</span>
              </button>
              <div className="w-px h-3 bg-white/20" />
              <button
                onClick={() => {
                  setSelectedSubCat('Tutte');
                  onSelectPavilion(nextPavilion);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider text-white/80 hover:text-white hover:bg-white/10 transition-all"
                title={`Vai a ${nextPavilion.name}`}
              >
                <span className="hidden md:inline">{nextPavilion.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-yellow-400" />
              </button>
            </div>
          </div>

          {/* Main Title & Description in Banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/30 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                style={{ backgroundColor: pavilion.color + '22', color: pavilion.color }}
              >
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-white uppercase">
                  PADIGLIONE <span className="font-bold text-yellow-500">{pavilion.name}</span>
                </h1>
                <p className="text-xs text-yellow-400 font-semibold tracking-wider uppercase">
                  {pavilion.tagline}
                </p>
              </div>
            </div>
            <p className="text-xs text-white/70 max-w-3xl line-clamp-2 mt-1">
              {pavilion.description}
            </p>
          </div>
        </div>

        {/* Subcategories Filter Bar & Search */}
        <div className="p-4 bg-[#080808] border-b border-white/10 shrink-0 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca espositori o prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-white/15 pl-9 pr-3 py-2 rounded-xl text-xs text-yellow-200 placeholder-white/30 focus:outline-none focus:border-yellow-500/60"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Counter info */}
            <div className="text-xs text-white/50 flex items-center gap-2 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-yellow-500" />
              <span>
                {filteredStands.length} Stand Espositori nel Padiglione
              </span>
            </div>
          </div>

          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-yellow-500/30">
            {subCategories.map((subCat) => {
              const isSelected = selectedSubCat === subCat;
              return (
                <button
                  key={subCat}
                  onClick={() => setSelectedSubCat(subCat)}
                  className={`px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-yellow-500 text-black border-yellow-300 font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'bg-black/60 border-white/10 hover:border-yellow-500/50 text-white/80 hover:text-white'
                  }`}
                >
                  {subCat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trade Fair Stands Grid (Stand Fieristici Espositori) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {filteredStands.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-black/40 rounded-3xl border border-white/10 p-8">
              <Building2 className="w-12 h-12 text-yellow-500/50 mx-auto" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Nessun Stand Trovato per "{selectedSubCat}"
              </h3>
              <p className="text-xs text-white/50 max-w-md mx-auto">
                Non ci sono ancora aziende registrate per questa sottocategoria in questo momento.
                Puoi aggiungere la tua attività come prima azienda espositrice!
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenBusinessDashboard) onOpenBusinessDashboard();
                }}
                className="mt-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Diventa Espositore Partner</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStands.map((stand) => (
                <div
                  key={stand.id}
                  className="bg-[#080808] border border-white/15 hover:border-yellow-500/60 rounded-3xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] flex flex-col justify-between group relative"
                >
                  {/* Stand Header Image */}
                  <div className="relative h-36 w-full overflow-hidden bg-black">
                    <img
                      src={stand.headerImage}
                      alt={stand.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/30" />

                    {/* Logo */}
                    <img
                      src={stand.logo}
                      alt={stand.name}
                      className="absolute bottom-3 left-4 w-12 h-12 rounded-xl object-cover border border-yellow-500/80 bg-black shadow-md"
                    />

                    {/* Rating badge */}
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 text-[11px] text-yellow-400 font-bold">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      <span>{stand.rating.toFixed(1)}</span>
                    </div>

                    {/* Subcategory Pill */}
                    <div className="absolute bottom-3 right-3 bg-yellow-500/90 text-black px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {stand.subCategory}
                    </div>
                  </div>

                  {/* Stand Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors uppercase tracking-wider line-clamp-1">
                          {stand.name}
                        </h3>
                        {stand.verified && (
                          <CheckCircle2
                            className="w-4 h-4 text-yellow-500 shrink-0"
                            title="Azienda Espositrice Verificata"
                          />
                        )}
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2 mb-2">
                        {stand.description}
                      </p>

                      {/* Display active offer if present */}
                      {stand.offers && stand.offers.length > 0 && (
                        <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between text-xs my-2">
                          <div className="flex items-center gap-1.5 text-yellow-300 font-medium">
                            <Tag className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="line-clamp-1 text-[11px]">{stand.offers[0].title}</span>
                          </div>
                          <span className="font-mono font-bold text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded text-[10px]">
                            {stand.offers[0].discount}
                          </span>
                        </div>
                      )}

                      {/* Featured products preview */}
                      {stand.products && stand.products.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-[11px] text-white/50">
                            {stand.products.length} Prodotti in Esposizione
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stand Interactive Buttons */}
                    <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectCompany(stand);
                        }}
                        className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center gap-1 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Entra nello Stand</span>
                      </button>

                      {stand.bonusPowerLink ? (
                        <a
                          href={stand.bonusPowerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-black hover:bg-zinc-900 text-yellow-400 border border-yellow-500/40 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-500" />
                          <span>Bonus-Power</span>
                          <ArrowUpRight className="w-3 h-3 text-white/40" />
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectCompany(stand);
                          }}
                          className="w-full py-2 bg-black hover:bg-zinc-900 text-white/80 border border-white/15 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Dettagli Stand</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Free Booth Card (Stand Libero Espositore) */}
              <div className="bg-[#080808] border border-dashed border-yellow-500/40 rounded-3xl p-6 flex flex-col justify-between items-center text-center space-y-4 hover:border-yellow-500 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/30">
                    Stand Libero Fiera
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-wider mt-2">
                    Esponi nel Padiglione {pavilion.name}
                  </h4>
                  <p className="text-xs text-white/50 mt-1 max-w-xs">
                    Promuovi la tua azienda con uno stand 3D personalizzato, catalogo prodotti e Link Bonus-Power!
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenBusinessDashboard) onOpenBusinessDashboard();
                  }}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
                >
                  Crea il tuo Stand 3D
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 bg-[#080808] border-t border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-white/50">
            <span>Sei dentro al Padiglione:</span>
            <span className="text-yellow-400 font-bold uppercase">{pavilion.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-black/60 hover:bg-white/10 text-white/80 hover:text-white border border-white/20 rounded-xl uppercase tracking-wider font-bold transition-all"
            >
              Torna al Corridoio 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
