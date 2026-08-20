// High resolution SVG data URL for Buoni Regalo & Carte Regalo banner
export const GIFT_CARDS_BANNER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="%231e293b"/>
      <stop offset="40%" stop-color="%230f172a"/>
      <stop offset="100%" stop-color="%23020617"/>
    </radialGradient>
    <linearGradient id="cardAmazon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23222222"/>
      <stop offset="100%" stop-color="%230a0a0a"/>
    </linearGradient>
    <linearGradient id="cardRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ef4444"/>
      <stop offset="100%" stop-color="%23991b1b"/>
    </linearGradient>
    <linearGradient id="cardDecathlon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230284c7"/>
      <stop offset="100%" stop-color="%230369a1"/>
    </linearGradient>
    <linearGradient id="cardPam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%2316a34a"/>
      <stop offset="100%" stop-color="%2315803d"/>
    </linearGradient>
    <linearGradient id="cardConad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23eab308"/>
      <stop offset="100%" stop-color="%23ca8a04"/>
    </linearGradient>
    <linearGradient id="cardEni" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23dc2626"/>
      <stop offset="70%" stop-color="%23b91c1c"/>
      <stop offset="100%" stop-color="%23ffffff"/>
    </linearGradient>
    <linearGradient id="cardCarburanti" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23059669"/>
      <stop offset="100%" stop-color="%23047857"/>
    </linearGradient>
    <linearGradient id="cardEsselunga" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%231d4ed8"/>
      <stop offset="100%" stop-color="%231e40af"/>
    </linearGradient>
    <linearGradient id="cardZalando" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ffffff"/>
      <stop offset="100%" stop-color="%23f1f5f9"/>
    </linearGradient>
    <linearGradient id="cardUnieuro" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23312e81"/>
      <stop offset="100%" stop-color="%231e1b4b"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="%23000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1600" height="900" fill="url(%23bgGrad)"/>

  <!-- Light rays & stars background -->
  <g opacity="0.25">
    <polygon points="800,450 -200,-200 1800,-200" fill="%2338bdf8"/>
    <polygon points="800,450 -200,1100 1800,1100" fill="%23fbbf24"/>
    <circle cx="200" cy="150" r="3" fill="%23ffffff"/>
    <circle cx="1400" cy="180" r="4" fill="%2338bdf8"/>
    <circle cx="300" cy="750" r="3" fill="%23fbbf24"/>
    <circle cx="1300" cy="720" r="5" fill="%23ffffff"/>
    <circle cx="800" cy="100" r="6" fill="%2338bdf8"/>
  </g>

  <!-- Title Header -->
  <g text-anchor="middle" font-family="Arial, Helvetica, sans-serif">
    <text x="800" y="80" font-size="42" font-weight="900" fill="%23fde047" letter-spacing="4" filter="url(%23glow)">
      BUONI REGALO &amp; CARTE REGALO
    </text>
    <text x="800" y="115" font-size="20" font-weight="700" fill="%2338bdf8" letter-spacing="2">
      SPENDIBILI NEI MIGLIORI MARCHI &amp; SUPERMERCATI D&apos;ITALIA
    </text>
  </g>

  <!-- CARDS GRID -->

  <!-- 1. AMAZON (Top Left) -->
  <g transform="translate(120, 160) rotate(-6)" filter="url(%23cardShadow)">
    <rect width="380" height="230" rx="18" fill="url(%23cardAmazon)" stroke="%23f59e0b" stroke-width="2"/>
    <text x="35" y="65" font-family="Arial" font-size="28" font-weight="bold" fill="%23ffffff">amazon.it</text>
    <text x="35" y="95" font-family="Arial" font-size="16" fill="%23f59e0b" font-weight="600">buono regalo</text>
    <path d="M 260 90 Q 310 130 340 80" fill="none" stroke="%23f59e0b" stroke-width="8" stroke-linecap="round"/>
    <path d="M 330 95 L 345 75 L 325 70" fill="%23f59e0b"/>
    <text x="280" y="170" font-family="Arial" font-size="64" font-weight="900" fill="%23ffffff">a</text>
  </g>

  <!-- 2. CARTA REGALO (Top Center) -->
  <g transform="translate(600, 150) rotate(2)" filter="url(%23cardShadow)">
    <rect width="380" height="230" rx="18" fill="url(%23cardRed)" stroke="%23fef08a" stroke-width="2"/>
    <text x="190" y="70" text-anchor="middle" font-family="Arial" font-size="22" font-weight="800" fill="%23fef08a" letter-spacing="3">CARTA</text>
    <text x="190" y="115" text-anchor="middle" font-family="Arial" font-size="38" font-weight="900" fill="%23ffffff" letter-spacing="2">REGALO</text>
    <text x="190" y="145" text-anchor="middle" font-family="Arial" font-size="16" fill="%23fca5a5">— PER TE —</text>
    <circle cx="190" cy="180" r="18" fill="%23fef08a"/>
    <path d="M 182 180 L 190 172 L 198 180 L 190 188 Z" fill="%23b91c1c"/>
  </g>

  <!-- 3. DECATHLON (Top Right) -->
  <g transform="translate(1080, 160) rotate(5)" filter="url(%23cardShadow)">
    <rect width="380" height="230" rx="18" fill="url(%23cardDecathlon)" stroke="%2338bdf8" stroke-width="2"/>
    <rect x="140" y="45" width="200" height="60" fill="%23ffffff" rx="6"/>
    <text x="240" y="87" text-anchor="middle" font-family="Arial" font-size="24" font-weight="900" fill="%230284c7">DECATHLON</text>
    <text x="240" y="150" text-anchor="middle" font-family="Arial" font-size="22" font-weight="800" fill="%23ffffff" letter-spacing="3">GIFT CARD</text>
    <!-- Shopping cart icon -->
    <path d="M 50 100 L 70 100 L 90 140 L 130 140 L 140 110 L 80 110" fill="none" stroke="%23ffffff" stroke-width="5" stroke-linecap="round"/>
    <circle cx="95" cy="155" r="7" fill="%23ffffff"/>
    <circle cx="125" cy="155" r="7" fill="%23ffffff"/>
  </g>

  <!-- 4. PAM (Middle Left) -->
  <g transform="translate(100, 420) rotate(-4)" filter="url(%23cardShadow)">
    <rect width="360" height="220" rx="18" fill="url(%23cardPam)" stroke="%2386efac" stroke-width="2"/>
    <ellipse cx="120" cy="90" rx="55" ry="35" fill="%23ffffff"/>
    <text x="120" y="100" text-anchor="middle" font-family="Arial" font-size="32" font-weight="900" fill="%2316a34a">Pam</text>
    <text x="120" y="155" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="%23dcfce7">LA VITA SPESA AL MEGLIO</text>
    <text x="120" y="185" text-anchor="middle" font-family="Arial" font-size="20" font-weight="900" fill="%23ffffff" letter-spacing="2">GIFT CARD</text>
  </g>

  <!-- 5. CONAD (Middle Center) -->
  <g transform="translate(500, 410) rotate(1)" filter="url(%23cardShadow)">
    <rect width="360" height="220" rx="18" fill="url(%23cardConad)" stroke="%23fef08a" stroke-width="2"/>
    <!-- Daisy icon -->
    <circle cx="80" cy="85" r="14" fill="%23ffffff"/>
    <circle cx="80" cy="85" r="6" fill="%23dc2626"/>
    <text x="110" y="95" font-family="Arial" font-size="36" font-weight="900" fill="%23dc2626" letter-spacing="1">CONAD</text>
    <text x="180" y="145" text-anchor="middle" font-family="Arial" font-size="24" font-weight="800" fill="%2378350f" font-style="italic">Carta Regalo</text>
  </g>

  <!-- 6. ENI (Middle Right) -->
  <g transform="translate(890, 420) rotate(-2)" filter="url(%23cardShadow)">
    <rect width="360" height="220" rx="18" fill="url(%23cardEni)" stroke="%23fef08a" stroke-width="2"/>
    <rect x="30" y="35" width="80" height="80" rx="12" fill="%23fef08a"/>
    <text x="70" y="85" text-anchor="middle" font-family="Arial" font-size="32" font-weight="900" fill="%23000000">eni</text>
    <text x="180" y="160" font-family="Arial" font-size="20" font-weight="900" fill="%23ffffff">buono carburante</text>
  </g>

  <!-- 7. CARBURANTI (Far Right) -->
  <g transform="translate(1260, 410) rotate(6)" filter="url(%23cardShadow)">
    <rect width="310" height="210" rx="18" fill="url(%23cardCarburanti)" stroke="%23a7f3d0" stroke-width="2"/>
    <text x="30" y="55" font-family="Arial" font-size="22" font-weight="800" fill="%23ffffff">Carburanti</text>
    <circle cx="155" cy="115" r="32" fill="%23ffffff" opacity="0.2"/>
    <!-- Fuel pump icon -->
    <path d="M 145 95 L 165 95 L 165 130 L 145 130 Z M 165 105 L 175 115 L 175 135" fill="none" stroke="%23ffffff" stroke-width="4"/>
    <text x="155" y="180" text-anchor="middle" font-family="Arial" font-size="16" font-weight="800" fill="%23ffffff">BUONO CARBURANTE</text>
  </g>

  <!-- 8. ESSELUNGA (Bottom Left) -->
  <g transform="translate(220, 640) rotate(4)" filter="url(%23cardShadow)">
    <rect width="370" height="220" rx="18" fill="url(%23cardEsselunga)" stroke="%2393c5fd" stroke-width="2"/>
    <text x="185" y="75" text-anchor="middle" font-family="Arial" font-size="30" font-weight="900" fill="%23ffffff" letter-spacing="2">ESSELUNGA</text>
    <text x="185" y="130" text-anchor="middle" font-family="Arial" font-size="52" font-weight="900" fill="%23ef4444">S</text>
    <text x="185" y="180" text-anchor="middle" font-family="Arial" font-size="18" font-weight="800" fill="%23ffffff" letter-spacing="2">GIFT CARD</text>
  </g>

  <!-- 9. ZALANDO (Bottom Center) -->
  <g transform="translate(630, 640) rotate(-3)" filter="url(%23cardShadow)">
    <rect width="370" height="220" rx="18" fill="url(%23cardZalando)" stroke="%23fdba74" stroke-width="2"/>
    <!-- Zalando triangle logo -->
    <polygon points="65,95 95,55 105,95" fill="%23f97316"/>
    <text x="120" y="85" font-family="Arial" font-size="34" font-weight="900" fill="%230f172a">zalando</text>
    <text x="185" y="145" text-anchor="middle" font-family="Arial" font-size="18" font-weight="800" fill="%23475569" letter-spacing="3">GIFT CARD</text>
  </g>

  <!-- 10. UNIEURO (Bottom Right) -->
  <g transform="translate(1040, 640) rotate(3)" filter="url(%23cardShadow)">
    <rect width="370" height="220" rx="18" fill="url(%23cardUnieuro)" stroke="%23fb923c" stroke-width="2"/>
    <text x="185" y="80" text-anchor="middle" font-family="Arial" font-size="34" font-weight="900" fill="%23f97316">unieuro</text>
    <text x="185" y="140" text-anchor="middle" font-family="Arial" font-size="22" font-weight="800" fill="%23ffffff">Carta Regalo</text>
  </g>

  <!-- Footer Banner Badge -->
  <g transform="translate(800, 875)" text-anchor="middle">
    <rect x="-350" y="-22" width="700" height="38" rx="19" fill="%23eab308"/>
    <text x="0" y="4" font-family="Arial" font-size="16" font-weight="900" fill="%23000000" letter-spacing="2">
      🎁 ACQUISTA O CONVERTI I TUOI PUNTI IN CARTE REGALO 3D!
    </text>
  </g>
</svg>`;
