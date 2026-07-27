import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pavilion, Company, SponsorPanel } from '../../types';
import { getSubcategoriesForPavilion, SubCategory } from '../../data/subcategoriesData';
import { MallMiniMap2D } from './MallMiniMap2D';

interface MallCanvas3DProps {
  pavilions: Pavilion[];
  companies: Company[];
  sponsorPanels?: SponsorPanel[];
  selectedPavilion: Pavilion | null;
  onSelectPavilion: (pavilion: Pavilion) => void;
  onSelectCompany: (company: Company) => void;
  onSelectSponsorPanel?: (panel: SponsorPanel) => void;
  onOpenExpoModal?: (pavilion: Pavilion) => void;
  walkSpeed: number;
  isVRMode: boolean;
  isAutoTour: boolean;
  onPositionUpdate?: (currentX: number, activePavilion: Pavilion | null) => void;
  resetAvatarTrigger?: number;
}

export interface AvatarRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  gender: 'male' | 'female';
}

export interface DoorItemData {
  id: string;
  x: number;
  side: 'left' | 'right';
  name: string;
  color: string;
  item: Pavilion | SubCategory;
  pavilion?: Pavilion;
  type: 'pavilion' | 'subcategory';
}

function createTshirtSideTexture(textMain: string, textSub: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 472, 472);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(40, 40, 432, 20);
    ctx.fillRect(40, 452, 432, 20);

    ctx.fillStyle = '#facc15';
    ctx.font = '900 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textMain, 256, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(textSub, 256, 320);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 380, 25, 0, Math.PI * 2);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createAvatarRig(gender: 'male' | 'female'): AvatarRig {
  const group = new THREE.Group();

  const frontTex = createTshirtSideTexture('META-TV', 'STAFF VIP');
  const backTex = createTshirtSideTexture('META-TV', 'MALL GUIDE');

  const tshirtBaseMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 });
  const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.4 });
  const backMat = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.4 });

  const torsoMaterials = [
    tshirtBaseMat,
    tshirtBaseMat,
    tshirtBaseMat,
    tshirtBaseMat,
    frontMat,
    backMat,
  ];

  const skinTone = gender === 'female' ? '#f5d0a9' : '#e0ac69';
  const skinMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.6 });

  const pantsColor = gender === 'female' ? '#1e1b4b' : '#0f172a';
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.5 });

  const hairColor = gender === 'female' ? '#311b0b' : '#1c1917';
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });

  const shoeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
  const shoeSoleMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.6, roughness: 0.2 });

  const torsoWidth = gender === 'female' ? 0.44 : 0.52;
  const torsoHeight = 0.65;
  const torsoDepth = 0.28;

  const torsoGeo = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
  const torso = new THREE.Mesh(torsoGeo, torsoMaterials);
  torso.position.y = 1.15;
  torso.castShadow = true;
  group.add(torso);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.62, 0);

  const headRadius = gender === 'female' ? 0.13 : 0.14;
  const headGeo = new THREE.SphereGeometry(headRadius, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  if (gender === 'female') {
    const hairTopGeo = new THREE.SphereGeometry(0.145, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    hairTop.rotation.x = -0.2;
    headGroup.add(hairTop);

    const ponyGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.3, 12);
    const pony = new THREE.Mesh(ponyGeo, hairMat);
    pony.position.set(0, -0.05, -0.16);
    pony.rotation.x = -0.4;
    headGroup.add(pony);
  } else {
    const hairTopGeo = new THREE.SphereGeometry(0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    headGroup.add(hairTop);
  }

  const eyeGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#111827' });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.05, 0.02, 0.12);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.05, 0.02, 0.12);
  headGroup.add(leftEye);
  headGroup.add(rightEye);

  group.add(headGroup);

  const armRadius = 0.06;
  const armLength = 0.55;

  const leftArm = new THREE.Group();
  leftArm.position.set(-torsoWidth / 2 - armRadius, 1.42, 0);

  const sleeveGeo = new THREE.CylinderGeometry(armRadius + 0.01, armRadius + 0.01, 0.18, 12);
  const sleeveL = new THREE.Mesh(sleeveGeo, tshirtBaseMat);
  sleeveL.position.y = -0.09;
  leftArm.add(sleeveL);

  const armGeoL = new THREE.CylinderGeometry(armRadius, armRadius * 0.8, armLength, 12);
  const armL = new THREE.Mesh(armGeoL, skinMat);
  armL.position.y = -armLength / 2;
  leftArm.add(armL);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(torsoWidth / 2 + armRadius, 1.42, 0);

  const sleeveR = new THREE.Mesh(sleeveGeo, tshirtBaseMat);
  sleeveR.position.y = -0.09;
  rightArm.add(sleeveR);

  const armGeoR = new THREE.CylinderGeometry(armRadius, armRadius * 0.8, armLength, 12);
  const armR = new THREE.Mesh(armGeoR, skinMat);
  armR.position.y = -armLength / 2;
  rightArm.add(armR);
  group.add(rightArm);

  const legRadius = 0.08;
  const legLength = 0.8;

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.13, 0.82, 0);

  const legGeoL = new THREE.CylinderGeometry(legRadius, legRadius * 0.85, legLength, 12);
  const legL = new THREE.Mesh(legGeoL, pantsMat);
  legL.position.y = -legLength / 2;
  leftLeg.add(legL);

  const shoeGeoL = new THREE.BoxGeometry(0.14, 0.12, 0.28);
  const shoeL = new THREE.Mesh(shoeGeoL, shoeMat);
  shoeL.position.set(0, -legLength + 0.05, 0.06);
  leftLeg.add(shoeL);

  const soleGeoL = new THREE.BoxGeometry(0.15, 0.03, 0.29);
  const soleL = new THREE.Mesh(soleGeoL, shoeSoleMat);
  soleL.position.set(0, -legLength + 0.01, 0.06);
  leftLeg.add(soleL);

  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.13, 0.82, 0);

  const legGeoR = new THREE.CylinderGeometry(legRadius, legRadius * 0.85, legLength, 12);
  const legR = new THREE.Mesh(legGeoR, pantsMat);
  legR.position.y = -legLength / 2;
  rightLeg.add(legR);

  const shoeR = new THREE.Mesh(shoeGeoL, shoeMat);
  shoeR.position.set(0, -legLength + 0.05, 0.06);
  rightLeg.add(shoeR);

  const soleR = new THREE.Mesh(soleGeoL, shoeSoleMat);
  soleR.position.set(0, -legLength + 0.01, 0.06);
  rightLeg.add(soleR);

  group.add(rightLeg);

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.userData = { type: 'avatar' };
    }
  });

  return {
    group,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    head: headGroup,
    torso,
    gender,
  };
}

export const MallCanvas3D: React.FC<MallCanvas3DProps> = ({
  pavilions,
  companies,
  sponsorPanels = [],
  selectedPavilion,
  onSelectPavilion,
  onSelectCompany,
  onSelectSponsorPanel,
  onOpenExpoModal,
  walkSpeed,
  isVRMode,
  isAutoTour,
  onPositionUpdate,
  resetAvatarTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsInfo] = useState<string>(
    'Frecce / WASD • Doppio Click Alto/Basso: Cammina Avanti/Indietro • Click: Ferma • Drag/Touch: Ruota'
  );

  // Auto-walk and Touch gesture refs
  const autoWalkDirRef = useRef<'forward' | 'backward' | null>(null);
  const [autoWalkActiveState, setAutoWalkActiveState] = useState<'forward' | 'backward' | null>(null);
  const lastTouchTimeRef = useRef<number>(0);

  // Avatar & Camera View Mode state
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('male');
  const avatarGenderRef = useRef<'male' | 'female'>(avatarGender);
  avatarGenderRef.current = avatarGender;

  const [cameraViewMode, setCameraViewMode] = useState<'3rd_person' | '1st_person'>('3rd_person');
  const cameraViewModeRef = useRef<'3rd_person' | '1st_person'>(cameraViewMode);
  cameraViewModeRef.current = cameraViewMode;

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement || document.body.classList.contains('fullscreen-mode');
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    const observer = new MutationObserver(() => {
      handleFullscreenChange();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const onRecenter = () => {
      handleRecenter();
    };
    window.addEventListener('recenter-visuale', onRecenter);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('recenter-visuale', onRecenter);
      observer.disconnect();
    };
  }, []);

  const walkCycleRef = useRef<number>(0);
  const avatarRigRef = useRef<AvatarRig | null>(null);

  // Player position state
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.7, 0));
  const playerYawRef = useRef<number>(-Math.PI / 2);
  const playerPitchRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const isMouseDownRef = useRef<boolean>(false);
  const mousePrevRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 2D Mini-Map position state
  const [playerMapX, setPlayerMapX] = useState<number>(0);
  const [playerMapZ, setPlayerMapZ] = useState<number>(0);
  const [playerMapYaw, setPlayerMapYaw] = useState<number>(-Math.PI / 2);
  const lastMapUpdateRef = useRef<number>(0);
  const portalCooldownRef = useRef<number>(0);
  const doorDataListRef = useRef<DoorItemData[]>([]);
  const lastFloorKeyRef = useRef<string>('');
  const lastCorridorDirRef = useRef<'forward' | 'backward' | ''>('');

  // Trigger avatar reset to central corridor position (z = 0) when stepping back from manifesto
  useEffect(() => {
    if (resetAvatarTrigger && playerPosRef.current) {
      playerPosRef.current.z = 0;
      playerYawRef.current = -Math.PI / 2;
      playerPitchRef.current = 0;
      portalCooldownRef.current = Date.now() + 2500;
    }
  }, [resetAvatarTrigger]);

  // Refs for callbacks to prevent stale closure issues
  const onSelectPavilionRef = useRef(onSelectPavilion);
  onSelectPavilionRef.current = onSelectPavilion;

  const onSelectCompanyRef = useRef(onSelectCompany);
  onSelectCompanyRef.current = onSelectCompany;

  const onOpenExpoModalRef = useRef(onOpenExpoModal);
  onOpenExpoModalRef.current = onOpenExpoModal;

  const pavilionsRef = useRef(pavilions);
  pavilionsRef.current = pavilions;

  const companiesRef = useRef(companies);
  companiesRef.current = companies;

  const sponsorPanelsRef = useRef(sponsorPanels);
  sponsorPanelsRef.current = sponsorPanels;

  const onSelectSponsorPanelRef = useRef(onSelectSponsorPanel);
  onSelectSponsorPanelRef.current = onSelectSponsorPanel;

  // Calculate previous and next pavilions for portals at ends of corridor
  const pavList = pavilions;
  let prevTarget: Pavilion | null = null;
  let nextTarget: Pavilion | null = null;

  if (!selectedPavilion) {
    // Main Atrio Corridor
    prevTarget = pavList[pavList.length - 1] || null;
    nextTarget = pavList[0] || null;
  } else {
    const currentIdx = pavList.findIndex((p) => p.id === selectedPavilion.id);
    if (currentIdx !== -1) {
      prevTarget = currentIdx > 0 ? pavList[currentIdx - 1] : null;
      nextTarget = currentIdx < pavList.length - 1 ? pavList[currentIdx + 1] : null;
    }
  }

  const prevTargetRef = useRef<Pavilion | null>(prevTarget);
  prevTargetRef.current = prevTarget;

  const nextTargetRef = useRef<Pavilion | null>(nextTarget);
  nextTargetRef.current = nextTarget;

  // Whenever selectedPavilion changes (transitioning between main corridor and category sub-corridor)
  useEffect(() => {
    playerPosRef.current.set(0, 1.7, 0);
    playerYawRef.current = -Math.PI / 2;
    playerPitchRef.current = 0;
  }, [selectedPavilion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const getDimensions = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : (container.clientWidth || window.innerWidth);
      const h = rect.height > 0 ? rect.height : (container.clientHeight || window.innerHeight);
      return { w, h };
    };

    const { w: width, h: height } = getDimensions();

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c16);
    scene.fog = new THREE.FogExp2(0x0a0c16, 0.005);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
    camera.position.copy(playerPosRef.current);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    canvasEl.style.position = 'absolute';
    canvasEl.style.top = '0';
    canvasEl.style.left = '0';

    container.appendChild(canvasEl);

    // Color theme logic based on whether we are in Main Corridor or Category Sub-Corridor
    const isCategoryCorridor = !!selectedPavilion;
    const themeColorHex = selectedPavilion ? selectedPavilion.color : '#ffd700';
    const themeColor = new THREE.Color(themeColorHex);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfff0dd, isCategoryCorridor ? 1.2 : 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(themeColor, 1.8);
    dirLight.position.set(50, 25, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Wall Sconce and Ceiling Lights
    [-10, 50, 110, 170, 230, 290].forEach((lightX) => {
      const pLight = new THREE.PointLight(themeColor, 2.2, 50);
      pLight.position.set(lightX, 7.5, 0);
      scene.add(pLight);

      const leftSconce = new THREE.PointLight(themeColor, 1.8, 25);
      leftSconce.position.set(lightX, 4.0, -9.0);
      scene.add(leftSconce);

      const rightSconce = new THREE.PointLight(themeColor, 1.8, 25);
      rightSconce.position.set(lightX, 4.0, 9.0);
      scene.add(rightSconce);
    });

    // 5. Enclosed Architecture
    const corridorLength = 340; // x = -30 to 310
    const hallWidth = 20; // z = -10 to +10 (human-scaled corridor width)

    // Floor Texture Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f111a';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = themeColorHex;
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, 512, 512);
      ctx.strokeStyle = isCategoryCorridor ? themeColorHex : 'rgba(0, 255, 255, 0.4)';
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(256, 0); ctx.lineTo(256, 512);
      ctx.moveTo(0, 256); ctx.lineTo(512, 256);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
    const floorTex = new THREE.CanvasTexture(canvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(corridorLength / 10, 4);

    const floorGeo = new THREE.PlaneGeometry(corridorLength, hallWidth, 128, 32);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.15,
      metalness: 0.85,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(135, 0, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Carpet Path down center
    const carpetGeo = new THREE.PlaneGeometry(corridorLength, 8);
    carpetGeo.rotateX(-Math.PI / 2);
    const carpetMat = new THREE.MeshStandardMaterial({
      color: isCategoryCorridor ? themeColorHex : 0x1a0b2e,
      roughness: 0.4,
      metalness: 0.3,
      emissive: isCategoryCorridor ? themeColorHex : 0x0a0412,
    });
    const carpetMesh = new THREE.Mesh(carpetGeo, carpetMat);
    carpetMesh.position.set(135, 0.02, 0);
    scene.add(carpetMesh);

    // Glowing Carpet Border Strips
    [-4, 4].forEach((zEdge) => {
      const stripGeo = new THREE.BoxGeometry(corridorLength, 0.05, 0.3);
      const stripMat = new THREE.MeshBasicMaterial({ color: themeColor });
      const stripMesh = new THREE.Mesh(stripGeo, stripMat);
      stripMesh.position.set(135, 0.03, zEdge);
      scene.add(stripMesh);
    });

    // Wall Texture Canvas (Distinct Wall Colors per Category!)
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 256;
    const wCtx = wallCanvas.getContext('2d');
    if (wCtx) {
      wCtx.fillStyle = isCategoryCorridor ? '#0a0d18' : '#141624';
      wCtx.fillRect(0, 0, 512, 256);

      // Horizontal Wall Accent Lines in Category Color
      wCtx.strokeStyle = themeColorHex;
      wCtx.lineWidth = 10;
      wCtx.strokeRect(0, 0, 512, 256);

      wCtx.beginPath();
      wCtx.moveTo(0, 75); wCtx.lineTo(512, 75);
      wCtx.moveTo(0, 180); wCtx.lineTo(512, 180);
      wCtx.stroke();

      // Vertical panel dividers
      wCtx.strokeStyle = isCategoryCorridor ? themeColorHex : 'rgba(0, 255, 255, 0.3)';
      wCtx.globalAlpha = 0.6;
      wCtx.lineWidth = 4;
      wCtx.beginPath();
      wCtx.moveTo(128, 0); wCtx.lineTo(128, 256);
      wCtx.moveTo(256, 0); wCtx.lineTo(256, 256);
      wCtx.moveTo(384, 0); wCtx.lineTo(384, 256);
      wCtx.stroke();
      wCtx.globalAlpha = 1.0;
    }
    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(corridorLength / 12, 1);

    const wallGeo = new THREE.PlaneGeometry(corridorLength, 9);
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Left Wall
    const wallLeft = new THREE.Mesh(wallGeo, wallMat);
    wallLeft.position.set(135, 4.5, -10);
    scene.add(wallLeft);

    // Right Wall
    const wallRight = new THREE.Mesh(wallGeo, wallMat);
    wallRight.position.set(135, 4.5, 10);
    wallRight.rotation.y = Math.PI;
    scene.add(wallRight);

    // ---------------------------------------------------------
    // Render Wall Sponsor Panels (Manifesti Pubblicitari 3D)
    // ---------------------------------------------------------
    if (sponsorPanelsRef.current && sponsorPanelsRef.current.length > 0) {
      sponsorPanelsRef.current.forEach((sp) => {
        const panelGroup = new THREE.Group();
        const zPos = sp.side === 'left' ? -9.8 : 9.8;
        const rotY = sp.side === 'left' ? 0 : Math.PI;
        panelGroup.position.set(sp.positionX, 4.5, zPos);
        panelGroup.rotation.y = rotY;

        // Doubled dimension size for giant wall posters (8.4m width x 5.0m height)
        const width = 8.4;
        const height = 5.0;
        const depth = 0.12;

        const isActive = sp.status === 'active';
        const frameColorHex = isActive ? 0xffd700 : 0x00ffff;

        // Metallic Frame
        const frameMat = new THREE.MeshStandardMaterial({
          color: frameColorHex,
          metalness: 0.9,
          roughness: 0.2,
          emissive: frameColorHex,
          emissiveIntensity: 0.3,
        });

        const frameMesh = new THREE.Mesh(
          new THREE.BoxGeometry(width + 0.3, height + 0.3, depth),
          frameMat
        );
        panelGroup.add(frameMesh);

        // Poster Texture Canvas (High Resolution 2048x1024)
        const posterCanvas = document.createElement('canvas');
        posterCanvas.width = 2048;
        posterCanvas.height = 1024;
        const pCtx = posterCanvas.getContext('2d');

        if (pCtx) {
          pCtx.fillStyle = '#050714';
          pCtx.fillRect(0, 0, 2048, 1024);

          // Border
          pCtx.strokeStyle = isActive ? '#ffd700' : '#00ffff';
          pCtx.lineWidth = 20;
          pCtx.strokeRect(20, 20, 2008, 984);

          if (isActive) {
            pCtx.fillStyle = 'rgba(255, 215, 0, 0.25)';
            pCtx.fillRect(40, 40, 1968, 110);

            pCtx.fillStyle = '#ffd700';
            pCtx.font = 'bold 52px sans-serif';
            pCtx.fillText('★ SPONSOR UFFICIALE GALLERIA 3D META-TV ★', 60, 115);

            pCtx.fillStyle = '#ffffff';
            pCtx.font = 'bold 80px sans-serif';
            pCtx.fillText(sp.advertiserName.toUpperCase(), 60, 270);

            pCtx.fillStyle = '#00ffff';
            pCtx.font = 'bold 64px sans-serif';
            pCtx.fillText(sp.title, 60, 390);

            pCtx.fillStyle = '#e2e8f0';
            pCtx.font = '50px sans-serif';
            pCtx.fillText(sp.tagline, 60, 500);

            // Purchase / Website Link Button on Canvas
            pCtx.fillStyle = '#10b981';
            pCtx.fillRect(60, 680, 820, 120);
            pCtx.fillStyle = '#000000';
            pCtx.font = 'bold 46px sans-serif';
            pCtx.fillText('🔍 CLICCA PER SCOPRIRE & SITO', 90, 755);

            if (sp.externalPurchaseUrl || sp.websiteUrl) {
              pCtx.fillStyle = '#3b82f6';
              pCtx.fillRect(920, 680, 860, 120);
              pCtx.fillStyle = '#ffffff';
              pCtx.font = 'bold 44px sans-serif';
              pCtx.fillText('🌐 LINK ESTERNO / SHOP', 950, 755);
            }
          } else {
            pCtx.fillStyle = 'rgba(0, 255, 255, 0.25)';
            pCtx.fillRect(40, 40, 1968, 120);

            pCtx.fillStyle = '#00ffff';
            pCtx.font = 'bold 60px sans-serif';
            pCtx.fillText('📢 SPAZIO MANIFESTO GIGANTE DISPONIBILE', 60, 120);

            pCtx.fillStyle = '#ffffff';
            pCtx.font = 'bold 84px sans-serif';
            pCtx.fillText('ACQUISTA QUESTO MANIFESTO 3D', 60, 300);

            pCtx.fillStyle = '#facc15';
            pCtx.font = 'bold 60px sans-serif';
            pCtx.fillText(`PREZZO: ${sp.pricePerMonth} - ATTIVAZIONE ISTANTANEA`, 60, 440);

            pCtx.fillStyle = '#e2e8f0';
            pCtx.font = '48px sans-serif';
            pCtx.fillText('Promuovi il tuo Brand a migliaia di visitatori nella Galleria 3D!', 60, 560);

            // Button 1: Internal Click
            pCtx.fillStyle = '#eab308';
            pCtx.fillRect(60, 680, 880, 130);
            pCtx.fillStyle = '#000000';
            pCtx.font = 'bold 48px sans-serif';
            pCtx.fillText('👉 CLICCA PER ACQUISTARE', 90, 760);

            // Button 2: External Buy Link
            pCtx.fillStyle = '#10b981';
            pCtx.fillRect(980, 680, 920, 130);
            pCtx.fillStyle = '#000000';
            pCtx.font = 'bold 48px sans-serif';
            pCtx.fillText('💳 LINK ACQUISTO ESTERNO', 1010, 760);
          }
        }

        const posterTex = new THREE.CanvasTexture(posterCanvas);
        const posterGeo = new THREE.PlaneGeometry(width, height);
        const posterMat = new THREE.MeshBasicMaterial({ map: posterTex });
        const posterMesh = new THREE.Mesh(posterGeo, posterMat);
        posterMesh.position.set(0, 0, sp.side === 'left' ? 0.08 : -0.08);
        if (sp.side === 'right') posterMesh.rotation.y = Math.PI;

        posterMesh.userData = { type: 'sponsor_panel', panel: sp };
        panelGroup.add(posterMesh);

        // Load custom image if available
        if (sp.imageUrl) {
          const imgLoader = new THREE.TextureLoader();
          imgLoader.load(
            sp.imageUrl,
            (loadedTex) => {
              const mixCanvas = document.createElement('canvas');
              mixCanvas.width = 2048;
              mixCanvas.height = 1024;
              const mCtx = mixCanvas.getContext('2d');
              if (mCtx) {
                mCtx.drawImage(loadedTex.image, 0, 0, 2048, 1024);
                const grad = mCtx.createLinearGradient(0, 0, 0, 1024);
                grad.addColorStop(0, 'rgba(0,0,0,0.3)');
                grad.addColorStop(1, 'rgba(0,0,0,0.85)');
                mCtx.fillStyle = grad;
                mCtx.fillRect(0, 0, 2048, 1024);

                mCtx.strokeStyle = isActive ? '#ffd700' : '#00ffff';
                mCtx.lineWidth = 24;
                mCtx.strokeRect(20, 20, 2008, 984);

                mCtx.fillStyle = isActive ? '#ffd700' : '#00ffff';
                mCtx.font = 'bold 52px sans-serif';
                mCtx.fillText(
                  isActive ? `★ SPONSOR: ${sp.advertiserName.toUpperCase()} ★` : '📢 SPAZIO PUBBLICITARIO DISPONIBILE',
                  60,
                  100
                );

                mCtx.fillStyle = '#ffffff';
                mCtx.font = 'bold 84px sans-serif';
                mCtx.fillText(sp.title, 60, 240);

                mCtx.fillStyle = '#38bdf8';
                mCtx.font = 'bold 56px sans-serif';
                mCtx.fillText(sp.tagline, 60, 360);

                mCtx.fillStyle = isActive ? '#10b981' : '#facc15';
                mCtx.fillRect(60, 800, 880, 120);
                mCtx.fillStyle = '#000000';
                mCtx.font = 'bold 46px sans-serif';
                mCtx.fillText(isActive ? '🔍 VISITA SPONSOR 3D' : '⚡ ACQUISTA MANIFESTO', 90, 875);

                mCtx.fillStyle = '#3b82f6';
                mCtx.fillRect(980, 800, 920, 120);
                mCtx.fillStyle = '#ffffff';
                mCtx.font = 'bold 46px sans-serif';
                mCtx.fillText('🛒 ACQUISTA ONLINE ESTERNO', 1010, 875);

                posterMesh.material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(mixCanvas) });
              }
            },
            undefined,
            () => {}
          );
        }

        // Top Neon Lamp
        const lightBarMat = new THREE.MeshBasicMaterial({ color: frameColorHex });
        const lightBar = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.25, 0.4), lightBarMat);
        lightBar.position.set(0, height / 2 + 0.35, 0.25);
        panelGroup.add(lightBar);

        scene.add(panelGroup);
      });
    }

    // End Walls
    const endWallGeo = new THREE.PlaneGeometry(hallWidth, 9);
    const entranceWall = new THREE.Mesh(endWallGeo, wallMat);
    entranceWall.position.set(-25, 4.5, 0);
    entranceWall.rotation.y = Math.PI / 2;
    scene.add(entranceWall);

    const exitWall = new THREE.Mesh(endWallGeo, wallMat);
    exitWall.position.set(300, 4.5, 0);
    exitWall.rotation.y = -Math.PI / 2;
    scene.add(exitWall);

    // End Portal Panels (Interactive & Auto-Transition Portals)
    const createEndPortalPanel = (
      xPos: number,
      yRot: number,
      directionLabel: string,
      targetPav: Pavilion | null,
      isNext: boolean
    ) => {
      const portalGroup = new THREE.Group();
      portalGroup.position.set(xPos, 3.2, 0);
      portalGroup.rotation.y = yRot;

      const targetName = targetPav ? targetPav.name.toUpperCase() : 'ATRIO GENERALE GALLERIA 3D';
      const targetTagline = targetPav ? targetPav.tagline : 'Torna alla Galleria Principale Meta-TV';
      const targetColorHex = targetPav ? targetPav.color : '#ffd700';
      const targetColor = new THREE.Color(targetColorHex);

      const frameMat = new THREE.MeshStandardMaterial({
        color: targetColor,
        metalness: 0.9,
        roughness: 0.1,
        emissive: targetColor,
        emissiveIntensity: 0.4,
      });

      const archWidth = 11.5;
      const archHeight = 6.4;

      const topBar = new THREE.Mesh(new THREE.BoxGeometry(archWidth, 0.7, 0.7), frameMat);
      topBar.position.set(0, archHeight / 2 - 0.35, 0);
      portalGroup.add(topBar);

      const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.7, archHeight, 0.7), frameMat);
      leftBar.position.set(-archWidth / 2 + 0.35, 0, 0);
      portalGroup.add(leftBar);

      const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.7, archHeight, 0.7), frameMat);
      rightBar.position.set(archWidth / 2 - 0.35, 0, 0);
      portalGroup.add(rightBar);

      // Canvas Screen
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 1024;
      pCanvas.height = 512;
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) {
        pCtx.fillStyle = '#050714';
        pCtx.fillRect(0, 0, 1024, 512);

        pCtx.strokeStyle = targetColorHex;
        pCtx.lineWidth = 14;
        pCtx.strokeRect(10, 10, 1004, 492);

        pCtx.fillStyle = targetColorHex;
        pCtx.fillRect(25, 25, 974, 80);

        pCtx.fillStyle = '#000000';
        pCtx.font = '900 42px sans-serif';
        pCtx.textAlign = 'center';
        pCtx.fillText(directionLabel, 512, 80);

        pCtx.fillStyle = targetColorHex;
        pCtx.font = 'bold 52px sans-serif';
        pCtx.fillText(targetName, 512, 215);

        pCtx.fillStyle = '#ffffff';
        pCtx.font = '28px sans-serif';
        pCtx.fillText(targetTagline, 512, 280);

        pCtx.strokeStyle = targetColorHex;
        pCtx.lineWidth = 4;
        pCtx.beginPath();
        pCtx.moveTo(150, 330);
        pCtx.lineTo(874, 330);
        pCtx.stroke();

        pCtx.fillStyle = '#00ffff';
        pCtx.font = 'bold 36px sans-serif';
        pCtx.fillText(
          isNext
            ? '➔ CLICCA IL PANNELLO O AVANZA PER IL PROSSIMO CORRIDOIO'
            : '⬅ CLICCA IL PANNELLO O TORNA PER IL CORRIDOIO PRECEDENTE',
          512,
          410
        );

        pCtx.fillStyle = '#facc15';
        pCtx.font = '24px sans-serif';
        pCtx.fillText('⚡ PASSA OLTRE IL PORTALE PER IL CAMBIO AUTOMATICO ⚡', 512, 460);
      }

      const pTex = new THREE.CanvasTexture(pCanvas);
      const screenGeo = new THREE.PlaneGeometry(archWidth - 1.4, archHeight - 1.4);
      const screenMat = new THREE.MeshBasicMaterial({ map: pTex, side: THREE.FrontSide });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0, 0.1);
      portalGroup.add(screenMesh);

      const gateGeo = new THREE.PlaneGeometry(archWidth - 1.4, archHeight - 1.4);
      const gateMat = new THREE.MeshBasicMaterial({
        color: targetColor,
        transparent: true,
        opacity: 0.35,
        side: THREE.FrontSide,
      });
      const gateMesh = new THREE.Mesh(gateGeo, gateMat);
      gateMesh.position.set(0, 0, 0.05);
      portalGroup.add(gateMesh);

      const pedGeo = new THREE.CylinderGeometry(0.5, 0.8, 1.0, 16);
      const pedMat = new THREE.MeshStandardMaterial({ color: targetColor, metalness: 0.9, roughness: 0.1 });
      const pedMesh = new THREE.Mesh(pedGeo, pedMat);
      pedMesh.position.set(0, -archHeight / 2 + 0.5, 1.2);
      portalGroup.add(pedMesh);

      const gemGeo = new THREE.OctahedronGeometry(0.5);
      const gemMat = new THREE.MeshBasicMaterial({ color: targetColor, wireframe: true });
      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.position.set(0, -archHeight / 2 + 1.5, 1.2);
      gemMesh.name = 'gem';
      portalGroup.add(gemMesh);

      portalGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.userData = {
            type: 'corridor_portal',
            targetPavilion: targetPav,
            isNext,
          };
        }
      });

      return portalGroup;
    };

    // Entrance Portal Panel (Start of Corridor X = -23.5)
    const entrancePortal = createEndPortalPanel(
      -23.5,
      Math.PI / 2,
      '◄ CORRIDOIO PRECEDENTE',
      prevTarget,
      false
    );
    scene.add(entrancePortal);

    // Exit Portal Panel (End of Corridor X = 298.5)
    const exitPortal = createEndPortalPanel(
      298.5,
      -Math.PI / 2,
      'PROSSIMO CORRIDOIO ►',
      nextTarget,
      true
    );
    scene.add(exitPortal);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(corridorLength, hallWidth, 128, 32);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c16,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.set(135, 9.0, 0);
    scene.add(ceilingMesh);

    // Create & add Avatar Rig
    const avatarRig = createAvatarRig(avatarGenderRef.current);
    avatarRigRef.current = avatarRig;
    scene.add(avatarRig.group);

    // Ceiling Neon Beams in Category Color
    [-6, 0, 6].forEach((zPos) => {
      const beamGeo = new THREE.BoxGeometry(corridorLength, 0.15, 0.3);
      const beamMat = new THREE.MeshBasicMaterial({ color: themeColor });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.set(135, 8.9, zPos);
      scene.add(beamMesh);
    });

    // Overhead Arch Pillars
    for (let x = -20; x <= 290; x += 15) {
      const archGroup = new THREE.Group();
      archGroup.position.set(x, 0, 0);

      const colGeo = new THREE.BoxGeometry(0.7, 9.0, 0.7);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x1a1c2a, metalness: 0.9, roughness: 0.1 });
      
      const colL = new THREE.Mesh(colGeo, colMat);
      colL.position.set(0, 4.5, -9.65);
      archGroup.add(colL);

      const colR = new THREE.Mesh(colGeo, colMat);
      colR.position.set(0, 4.5, 9.65);
      archGroup.add(colR);

      const beamGeo = new THREE.BoxGeometry(0.7, 0.7, hallWidth - 0.7);
      const beamMesh = new THREE.Mesh(beamGeo, colMat);
      beamMesh.position.set(0, 8.65, 0);
      archGroup.add(beamMesh);

      // Neon Trim on Pillars in Category Color
      const neonGeo = new THREE.BoxGeometry(0.12, 9.0, 0.12);
      const neonMat = new THREE.MeshBasicMaterial({ color: themeColor });
      const neonL = new THREE.Mesh(neonGeo, neonMat);
      neonL.position.set(0, 4.5, -9.3);
      archGroup.add(neonL);

      const neonR = new THREE.Mesh(neonGeo, neonMat);
      neonR.position.set(0, 4.5, 9.3);
      archGroup.add(neonR);

      scene.add(archGroup);
    }

    // Floating Overhead Billboard Banner in Corridor
    const billboardGroup = new THREE.Group();
    const makeBillboardTexture = (title: string, sub: string) => {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 512;
      bCanvas.height = 256;
      const bCtx = bCanvas.getContext('2d');
      if (bCtx) {
        bCtx.fillStyle = '#0a0d18';
        bCtx.fillRect(0, 0, 512, 256);

        bCtx.strokeStyle = themeColorHex;
        bCtx.lineWidth = 12;
        bCtx.strokeRect(6, 6, 500, 244);

        bCtx.fillStyle = themeColorHex;
        bCtx.font = 'bold 36px sans-serif';
        bCtx.textAlign = 'center';
        bCtx.fillText(title, 256, 100);

        bCtx.fillStyle = '#ffffff';
        bCtx.font = 'bold 22px sans-serif';
        bCtx.fillText(sub, 256, 155);

        bCtx.fillStyle = '#00ffff';
        bCtx.font = '16px sans-serif';
        bCtx.fillText('⚡ META-TV 3D IMMERSIVE SHOPPING ⚡', 256, 205);
      }
      return new THREE.CanvasTexture(bCanvas);
    };

    const createBillboard = (xPos: number, title: string, sub: string, angleOffset = 0) => {
      const group = new THREE.Group();
      group.position.set(xPos, 4.6, 0);

      const bTex = makeBillboardTexture(title, sub);
      const frameMat = new THREE.MeshStandardMaterial({ color: themeColor, metalness: 0.8, roughness: 0.2 });
      const frameGeo = new THREE.BoxGeometry(4.8, 2.6, 0.12);
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      group.add(frameMesh);

      const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 12);
      const poleMesh = new THREE.Mesh(poleGeo, frameMat);
      poleMesh.position.set(0, 2.2, 0);
      group.add(poleMesh);

      const bGeo = new THREE.PlaneGeometry(4.6, 2.4);
      const frontMesh = new THREE.Mesh(bGeo, new THREE.MeshBasicMaterial({ map: bTex, side: THREE.FrontSide }));
      frontMesh.position.set(0, 0, 0.07);
      group.add(frontMesh);

      const backMesh = new THREE.Mesh(bGeo, new THREE.MeshBasicMaterial({ map: bTex, side: THREE.FrontSide }));
      backMesh.position.set(0, 0, -0.07);
      backMesh.rotation.y = Math.PI;
      group.add(backMesh);

      group.rotation.y = -Math.PI / 2 + angleOffset;
      return group;
    };

    if (isCategoryCorridor && selectedPavilion) {
      billboardGroup.add(createBillboard(20, selectedPavilion.name.toUpperCase(), selectedPavilion.tagline, 0.1));
      billboardGroup.add(createBillboard(100, `ESPOSITORI & BRAND 3D`, selectedPavilion.description.slice(0, 40) + '...', -0.1));
      billboardGroup.add(createBillboard(180, `CASHBACK & OFFERTE`, 'Sconti Esclusivi Partner Meta-TV', 0.1));
    } else {
      billboardGroup.add(createBillboard(15, 'META-TV SHOPPING', 'Sconti Esclusivi & Cashback', 0.2));
      billboardGroup.add(createBillboard(105, 'FOOD & WINE FESTIVAL', 'Prodotti Tipici & Ristoranti Stellati', -0.2));
      billboardGroup.add(createBillboard(195, 'TECH & GAMING VR', 'Visori Olografici & Domotica', 0.2));
    }
    scene.add(billboardGroup);

    // 6. Build Doors along the Corridor (Main Categories OR Subcategories!)
    const doorMeshMap = new Map<string, THREE.Group>();
    doorDataListRef.current = [];

    if (isCategoryCorridor && selectedPavilion) {
      // Build Subcategory Doors for the active Category!
      const subcategories = getSubcategoriesForPavilion(selectedPavilion, companiesRef.current);

      subcategories.forEach((sub, idx) => {
        const side = idx % 2 === 0 ? 'left' : 'right';
        const positionX = idx * 30;

        doorDataListRef.current.push({
          id: sub.id,
          x: positionX,
          side,
          name: sub.name,
          color: selectedPavilion.color,
          item: sub,
          pavilion: selectedPavilion,
          type: 'subcategory',
        });

        const pGroup = new THREE.Group();
        const zPos = side === 'left' ? -9.2 : 9.2;
        pGroup.position.set(positionX, 0, zPos);

        const subColor = new THREE.Color(selectedPavilion.color);
        const archMat = new THREE.MeshStandardMaterial({
          color: subColor,
          metalness: 0.8,
          roughness: 0.2,
        });

        // Pillar Columns
        const pillarGeo = new THREE.CylinderGeometry(0.45, 0.55, 4.8, 16);
        const pillarL = new THREE.Mesh(pillarGeo, archMat);
        pillarL.position.set(-2.2, 2.4, 0);
        pGroup.add(pillarL);

        const pillarR = new THREE.Mesh(pillarGeo, archMat);
        pillarR.position.set(2.2, 2.4, 0);
        pGroup.add(pillarR);

        // Glowing Portal Backing
        const portalGeo = new THREE.PlaneGeometry(4.2, 4.5);
        const portalMat = new THREE.MeshBasicMaterial({
          color: subColor,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
        });
        const portalMesh = new THREE.Mesh(portalGeo, portalMat);
        portalMesh.position.set(0, 2.25, side === 'left' ? -0.1 : 0.1);
        pGroup.add(portalMesh);

        // 3D Glass Doors
        const doorWidth = 2.0;
        const doorHeight = 4.2;
        const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.12);
        const doorMat = new THREE.MeshPhysicalMaterial({
          color: 0x111122,
          metalness: 0.2,
          roughness: 0.1,
          transmission: 0.6,
          transparent: true,
          opacity: 0.75,
          clearcoat: 1.0,
        });

        const doorLeft = new THREE.Mesh(doorGeo, doorMat);
        doorLeft.position.set(-1.05, 2.1, side === 'left' ? -0.05 : 0.05);
        pGroup.add(doorLeft);

        const doorRight = new THREE.Mesh(doorGeo, doorMat);
        doorRight.position.set(1.05, 2.1, side === 'left' ? -0.05 : 0.05);
        pGroup.add(doorRight);

        // Handles
        const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1);
        const handleMat = new THREE.MeshBasicMaterial({ color: subColor });
        const handleL = new THREE.Mesh(handleGeo, handleMat);
        handleL.position.set(-0.15, 2.1, side === 'left' ? 0.04 : -0.04);
        doorLeft.add(handleL);

        const handleR = new THREE.Mesh(handleGeo, handleMat);
        handleR.position.set(0.15, 2.1, side === 'left' ? 0.04 : -0.04);
        doorRight.add(handleR);

        // Entrance Banner Canvas ("CLICCA LA PORTA") mounted on doors
        const doorBannerCanvas = document.createElement('canvas');
        doorBannerCanvas.width = 512;
        doorBannerCanvas.height = 128;
        const dbCtx = doorBannerCanvas.getContext('2d');
        if (dbCtx) {
          dbCtx.fillStyle = '#050508';
          dbCtx.fillRect(0, 0, 512, 128);
          dbCtx.strokeStyle = selectedPavilion.color;
          dbCtx.lineWidth = 8;
          dbCtx.strokeRect(6, 6, 500, 116);

          dbCtx.fillStyle = selectedPavilion.color;
          dbCtx.font = 'bold 34px sans-serif';
          dbCtx.textAlign = 'center';
          dbCtx.fillText('🚪 CLICCA LA PORTA', 256, 55);

          dbCtx.fillStyle = '#ffffff';
          dbCtx.font = 'bold 22px sans-serif';
          dbCtx.fillText('PER VEDERE NEGOZI & SHOWROOM', 256, 98);
        }
        const doorBannerTex = new THREE.CanvasTexture(doorBannerCanvas);
        const doorBannerMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(3.6, 0.9),
          new THREE.MeshBasicMaterial({ map: doorBannerTex, side: THREE.DoubleSide })
        );
        doorBannerMesh.position.set(0, 2.8, side === 'left' ? 0.2 : -0.2);
        if (side === 'right') doorBannerMesh.rotation.y = Math.PI;
        pGroup.add(doorBannerMesh);

        // Floating Title Signboard - Mounted clearly on top of columns
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const sCtx = signCanvas.getContext('2d');
        if (sCtx) {
          sCtx.fillStyle = '#0a0a14';
          sCtx.fillRect(0, 0, 512, 128);
          sCtx.strokeStyle = selectedPavilion.color;
          sCtx.lineWidth = 6;
          sCtx.strokeRect(4, 4, 504, 120);

          sCtx.fillStyle = selectedPavilion.color;
          sCtx.font = 'bold 30px sans-serif';
          sCtx.textAlign = 'center';
          sCtx.fillText(sub.name, 256, 55);

          sCtx.fillStyle = '#ffffff';
          sCtx.font = 'bold 18px sans-serif';
          sCtx.fillText(sub.tagline, 256, 95);
        }
        const signTex = new THREE.CanvasTexture(signCanvas);
        const signGeo = new THREE.PlaneGeometry(4.8, 1.2);
        const signMesh = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
        signMesh.position.set(0, 5.0, side === 'left' ? 0.3 : -0.3);
        if (side === 'right') signMesh.rotation.y = Math.PI;
        pGroup.add(signMesh);

        // (Rombi/gemme e piedistalli rimossi)

        // Tag mesh userData for Raycaster
        pGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.userData = { subCategory: sub, pavilion: selectedPavilion, type: 'subcategory' };
          }
        });

        scene.add(pGroup);
        doorMeshMap.set(sub.id, pGroup);
      });
    } else {
      // Build Main Pavilion Category Doors in Main Corridor
      pavilions.forEach((p) => {
        doorDataListRef.current.push({
          id: p.id,
          x: p.positionX,
          side: p.side,
          name: p.name,
          color: p.color,
          item: p,
          type: 'pavilion',
        });

        const pGroup = new THREE.Group();
        const zPos = p.side === 'left' ? -9.2 : 9.2;
        pGroup.position.set(p.positionX, 0, zPos);

        const archMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(p.color),
          metalness: 0.8,
          roughness: 0.2,
        });

        const pillarGeo = new THREE.CylinderGeometry(0.45, 0.55, 4.8, 16);
        const pillarL = new THREE.Mesh(pillarGeo, archMat);
        pillarL.position.set(-2.2, 2.4, 0);
        pGroup.add(pillarL);

        const pillarR = new THREE.Mesh(pillarGeo, archMat);
        pillarR.position.set(2.2, 2.4, 0);
        pGroup.add(pillarR);

        const portalGeo = new THREE.PlaneGeometry(4.2, 4.5);
        const portalMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(p.color),
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
        });
        const portalMesh = new THREE.Mesh(portalGeo, portalMat);
        portalMesh.position.set(0, 2.25, p.side === 'left' ? -0.1 : 0.1);
        pGroup.add(portalMesh);

        // 3D Glass Doors
        const doorWidth = 2.0;
        const doorHeight = 4.2;
        const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.12);
        const doorMat = new THREE.MeshPhysicalMaterial({
          color: 0x111122,
          metalness: 0.2,
          roughness: 0.1,
          transmission: 0.6,
          transparent: true,
          opacity: 0.75,
          clearcoat: 1.0,
        });

        const doorLeft = new THREE.Mesh(doorGeo, doorMat);
        doorLeft.position.set(-1.05, 2.1, p.side === 'left' ? -0.05 : 0.05);
        pGroup.add(doorLeft);

        const doorRight = new THREE.Mesh(doorGeo, doorMat);
        doorRight.position.set(1.05, 2.1, p.side === 'left' ? -0.05 : 0.05);
        pGroup.add(doorRight);

        // Handles
        const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1);
        const handleMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const handleL = new THREE.Mesh(handleGeo, handleMat);
        handleL.position.set(-0.15, 2.1, p.side === 'left' ? 0.04 : -0.04);
        doorLeft.add(handleL);

        const handleR = new THREE.Mesh(handleGeo, handleMat);
        handleR.position.set(0.15, 2.1, p.side === 'left' ? 0.04 : -0.04);
        doorRight.add(handleR);

        // Banner Canvas
        const doorBannerCanvas = document.createElement('canvas');
        doorBannerCanvas.width = 512;
        doorBannerCanvas.height = 128;
        const dbCtx = doorBannerCanvas.getContext('2d');
        if (dbCtx) {
          dbCtx.fillStyle = '#050508';
          dbCtx.fillRect(0, 0, 512, 128);
          dbCtx.strokeStyle = '#ffd700';
          dbCtx.lineWidth = 8;
          dbCtx.strokeRect(6, 6, 500, 116);

          dbCtx.fillStyle = '#ffd700';
          dbCtx.font = 'bold 36px sans-serif';
          dbCtx.textAlign = 'center';
          dbCtx.fillText('🚪 CLICCA LA PORTA', 256, 55);

          dbCtx.fillStyle = '#ffffff';
          dbCtx.font = 'bold 22px sans-serif';
          dbCtx.fillText('ENTRA NEL CORRIDOIO 3D', 256, 98);
        }
        const doorBannerTex = new THREE.CanvasTexture(doorBannerCanvas);
        const doorBannerMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(3.6, 0.9),
          new THREE.MeshBasicMaterial({ map: doorBannerTex, side: THREE.DoubleSide })
        );
        doorBannerMesh.position.set(0, 2.8, p.side === 'left' ? 0.2 : -0.2);
        if (p.side === 'right') doorBannerMesh.rotation.y = Math.PI;
        pGroup.add(doorBannerMesh);

        // Title Signboard
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const sCtx = signCanvas.getContext('2d');
        if (sCtx) {
          sCtx.fillStyle = '#0a0a14';
          sCtx.fillRect(0, 0, 512, 128);
          sCtx.strokeStyle = p.color;
          sCtx.lineWidth = 6;
          sCtx.strokeRect(4, 4, 504, 120);

          sCtx.fillStyle = p.color;
          sCtx.font = 'bold 32px sans-serif';
          sCtx.textAlign = 'center';
          sCtx.fillText(p.name, 256, 55);

          sCtx.fillStyle = '#ffffff';
          sCtx.font = 'bold 18px sans-serif';
          sCtx.fillText(p.tagline, 256, 95);
        }

        const signTex = new THREE.CanvasTexture(signCanvas);
        const signGeo = new THREE.PlaneGeometry(4.8, 1.2);
        const signMesh = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
        signMesh.position.set(0, 5.0, p.side === 'left' ? 0.3 : -0.3);
        if (p.side === 'right') signMesh.rotation.y = Math.PI;
        pGroup.add(signMesh);

        // (Rombi/gemme e piedistalli rimossi)

        pGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.userData = { pavilionId: p.id, type: 'pavilion' };
          }
        });

        scene.add(pGroup);
        doorMeshMap.set(p.id, pGroup);
      });
    }

    // Floor Navigation Indicators (Arrows & Labels at door height)
    const createFloorLabelTexture = (text: string, side: 'left' | 'right', colorHex: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 512, 128);

        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 10;
        ctx.strokeRect(8, 8, 496, 112);

        ctx.fillStyle = colorHex;
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const displayText = side === 'left' ? `◄ ${text}` : `${text} ►`;
        ctx.fillText(displayText, 256, 64);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const createFloorArrowTexture = (colorHex: string, side: 'left' | 'right') => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, 256, 512);

        ctx.fillStyle = colorHex;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 14;

        ctx.beginPath();
        if (side === 'left') {
          ctx.moveTo(128, 30);
          ctx.lineTo(220, 240);
          ctx.lineTo(165, 240);
          ctx.lineTo(165, 470);
          ctx.lineTo(91, 470);
          ctx.lineTo(91, 240);
          ctx.lineTo(36, 240);
        } else {
          ctx.moveTo(128, 482);
          ctx.lineTo(220, 272);
          ctx.lineTo(165, 272);
          ctx.lineTo(165, 42);
          ctx.lineTo(91, 42);
          ctx.lineTo(91, 272);
          ctx.lineTo(36, 272);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const createCorridorArrowTexture = (direction: 'forward' | 'backward') => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 212;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 512, 212);

        const isForward = direction === 'forward';
        // Green (#00FF66) when heading forward towards next corridor, Red (#FF2244) when heading backward to previous corridor
        const arrowColor = isForward ? '#00FF66' : '#FF2244';

        // Draw 3 prominent large chevrons
        const numChevrons = 3;
        const spacing = 110;
        const startX = isForward ? 140 : 372;
        const dirMultiplier = isForward ? 1 : -1;

        for (let i = 0; i < numChevrons; i++) {
          const cx = startX + i * spacing * dirMultiplier;
          const cy = 106;
          const size = 55;

          // Outer dark shadow outline for high contrast against gold floor
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.65 * dirMultiplier, cy - size);
          ctx.lineTo(cx + size * 0.65 * dirMultiplier, cy);
          ctx.lineTo(cx - size * 0.65 * dirMultiplier, cy + size);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.lineWidth = 32;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Main colored chevron
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.65 * dirMultiplier, cy - size);
          ctx.lineTo(cx + size * 0.65 * dirMultiplier, cy);
          ctx.lineTo(cx - size * 0.65 * dirMultiplier, cy + size);
          ctx.strokeStyle = arrowColor;
          ctx.lineWidth = 20;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Bright inner white highlight
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.65 * dirMultiplier, cy - size);
          ctx.lineTo(cx + size * 0.65 * dirMultiplier, cy);
          ctx.lineTo(cx - size * 0.65 * dirMultiplier, cy + size);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const floorIndicatorsGroup = new THREE.Group();
    floorIndicatorsGroup.name = 'floorIndicatorsGroup';
    floorIndicatorsGroup.visible = false;

    const leftLabelMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
    const leftLabelGeo = new THREE.PlaneGeometry(4.8, 1.2);
    leftLabelGeo.rotateX(-Math.PI / 2);
    const leftLabelMesh = new THREE.Mesh(leftLabelGeo, leftLabelMat);
    leftLabelMesh.position.set(0, 0.05, -2.8);
    leftLabelMesh.userData = { type: 'floor_arrow_left' };
    floorIndicatorsGroup.add(leftLabelMesh);

    const leftArrowMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
    const leftArrowGeo = new THREE.PlaneGeometry(1.6, 2.6);
    leftArrowGeo.rotateX(-Math.PI / 2);
    const leftArrowMesh = new THREE.Mesh(leftArrowGeo, leftArrowMat);
    leftArrowMesh.position.set(0, 0.06, -1.0);
    leftArrowMesh.userData = { type: 'floor_arrow_left' };
    floorIndicatorsGroup.add(leftArrowMesh);

    const corridorArrowMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
    const corridorArrowGeo = new THREE.PlaneGeometry(5.0, 2.1);
    corridorArrowGeo.rotateX(-Math.PI / 2);
    const corridorArrowMesh = new THREE.Mesh(corridorArrowGeo, corridorArrowMat);
    corridorArrowMesh.position.set(0, 0.08, 0);
    scene.add(corridorArrowMesh);

    const rightLabelMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
    const rightLabelGeo = new THREE.PlaneGeometry(4.8, 1.2);
    rightLabelGeo.rotateX(-Math.PI / 2);
    const rightLabelMesh = new THREE.Mesh(rightLabelGeo, rightLabelMat);
    rightLabelMesh.position.set(0, 0.05, 2.8);
    rightLabelMesh.userData = { type: 'floor_arrow_right' };
    floorIndicatorsGroup.add(rightLabelMesh);

    const rightArrowMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
    const rightArrowGeo = new THREE.PlaneGeometry(1.6, 2.6);
    rightArrowGeo.rotateX(-Math.PI / 2);
    const rightArrowMesh = new THREE.Mesh(rightArrowGeo, rightArrowMat);
    rightArrowMesh.position.set(0, 0.06, 1.0);
    rightArrowMesh.userData = { type: 'floor_arrow_right' };
    floorIndicatorsGroup.add(rightArrowMesh);

    scene.add(floorIndicatorsGroup);

    // 7. Input Event Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (autoWalkDirRef.current) {
        autoWalkDirRef.current = null;
        setAutoWalkActiveState(null);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();
    const mouseDownStartRef = { current: { x: 0, y: 0 } };

    const onMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      mousePrevRef.current = { x: e.clientX, y: e.clientY };
      mouseDownStartRef.current = { x: e.clientX, y: e.clientY };

      if (autoWalkDirRef.current) {
        autoWalkDirRef.current = null;
        setAutoWalkActiveState(null);
      }
    };

    const onDblClick = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY < rect.height / 2) {
        autoWalkDirRef.current = 'forward';
        setAutoWalkActiveState('forward');
      } else {
        autoWalkDirRef.current = 'backward';
        setAutoWalkActiveState('backward');
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      let hovering = false;
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current) {
          if (
            current.userData &&
            (current.userData.pavilionId ||
              current.userData.subCategory ||
              current.userData.type === 'corridor_portal' ||
              current.userData.type === 'avatar' ||
              current.userData.type === 'floor_arrow_left' ||
              current.userData.type === 'floor_arrow_right')
          ) {
            hovering = true;
            break;
          }
          current = current.parent;
        }
      }
      renderer.domElement.style.cursor = hovering ? 'pointer' : 'grab';

      if (!isMouseDownRef.current) return;
      const deltaX = e.clientX - mousePrevRef.current.x;
      const deltaY = e.clientY - mousePrevRef.current.y;

      playerYawRef.current -= deltaX * 0.003;
      playerPitchRef.current = Math.max(-0.35, Math.min(0.30, playerPitchRef.current - deltaY * 0.003));

      mousePrevRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleDoorAction = (door: DoorItemData) => {
      if (door.type === 'pavilion') {
        onSelectPavilionRef.current(door.item as Pavilion);
      } else if (door.type === 'subcategory') {
        const sub = door.item as SubCategory;
        const pav = door.pavilion as Pavilion;
        const match = companiesRef.current.find(
          (c) =>
            c.categoryId === pav.id &&
            (c.subCategory?.toLowerCase().includes(sub.name.toLowerCase()) ||
              sub.name.toLowerCase().includes(c.subCategory?.toLowerCase() || ''))
        ) || companiesRef.current.find((c) => c.categoryId === pav.id);

        if (match) {
          onSelectCompanyRef.current(match);
        } else if (onOpenExpoModalRef.current) {
          onOpenExpoModalRef.current(pav);
        }
      }
    };

    const trigger90DegreeTurn = () => {
      const currentYaw = playerYawRef.current;
      let normYaw = currentYaw % (Math.PI * 2);
      if (normYaw < 0) normYaw += Math.PI * 2;

      if (normYaw < Math.PI / 4 || normYaw >= (7 * Math.PI) / 4) {
        // Currently facing Left Door (0) -> Turn 90° to Forward (-PI/2)
        playerYawRef.current = -Math.PI / 2;
      } else if (normYaw >= (5 * Math.PI) / 4 && normYaw < (7 * Math.PI) / 4) {
        // Currently facing Forward (-PI/2) -> Turn 90° to Right Door (PI)
        playerYawRef.current = Math.PI;
      } else if (normYaw >= (3 * Math.PI) / 4 && normYaw < (5 * Math.PI) / 4) {
        // Currently facing Right Door (PI) -> Turn 90° to Backward (PI/2)
        playerYawRef.current = Math.PI / 2;
      } else {
        // Currently facing Backward (PI/2) -> Turn 90° to Left Door (0)
        playerYawRef.current = 0;
      }
    };

    const onClick = (e: MouseEvent) => {
      if (autoWalkDirRef.current) {
        autoWalkDirRef.current = null;
        setAutoWalkActiveState(null);
      }

      const moveDist = Math.hypot(
        e.clientX - mouseDownStartRef.current.x,
        e.clientY - mouseDownStartRef.current.y
      );
      if (moveDist > 25) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let itemHandled = false;
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current) {
          if (current.userData) {
            const type = current.userData.type;

            // 1. Click on Avatar -> Turn 90 degrees each click in sequence
            if (type === 'avatar') {
              trigger90DegreeTurn();
              itemHandled = true;
              break;
            }

            // 2. Click Left Floor Arrow -> Turn facing left door (0) ONLY
            if (type === 'floor_arrow_left') {
              playerYawRef.current = 0;
              itemHandled = true;
              break;
            }

            // 3. Click Right Floor Arrow -> Turn facing right door (Math.PI) ONLY
            if (type === 'floor_arrow_right') {
              playerYawRef.current = Math.PI;
              itemHandled = true;
              break;
            }

            // 5. Click Sponsor Panel / Manifesto
            if (type === 'sponsor_panel' && current.userData.panel) {
              if (onSelectSponsorPanelRef.current) {
                onSelectSponsorPanelRef.current(current.userData.panel);
              }
              itemHandled = true;
              break;
            }
            if (type === 'corridor_portal') {
              const targetPav = current.userData.targetPavilion;
              onSelectPavilionRef.current(targetPav);
              itemHandled = true;
              break;
            } else if (type === 'pavilion' && current.userData.pavilionId) {
              const pav = pavilionsRef.current.find((p) => p.id === current?.userData.pavilionId);
              if (pav) {
                onSelectPavilionRef.current(pav);
                itemHandled = true;
                break;
              }
            } else if (type === 'subcategory') {
              const sub: SubCategory = current.userData.subCategory;
              const pav: Pavilion = current.userData.pavilion;

              const match = companiesRef.current.find(
                (c) =>
                  c.categoryId === pav.id &&
                  (c.subCategory?.toLowerCase().includes(sub.name.toLowerCase()) ||
                    sub.name.toLowerCase().includes(c.subCategory?.toLowerCase() || ''))
              ) || companiesRef.current.find((c) => c.categoryId === pav.id);

              if (match) {
                onSelectCompanyRef.current(match);
              } else if (onOpenExpoModalRef.current) {
                onOpenExpoModalRef.current(pav);
              }
              itemHandled = true;
              break;
            }
          }
          current = current.parent;
        }
      }

      // If in First Person View and no door/item was clicked, clicking screen triggers 90° rotation sequence!
      if (!itemHandled && cameraViewModeRef.current === '1st_person') {
        trigger90DegreeTurn();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isMouseDownRef.current = true;
        mousePrevRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        mouseDownStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isMouseDownRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - mousePrevRef.current.x;
      const deltaY = touch.clientY - mousePrevRef.current.y;

      playerYawRef.current -= deltaX * 0.0035;
      playerPitchRef.current = Math.max(-0.35, Math.min(0.30, playerPitchRef.current - deltaY * 0.0035));

      mousePrevRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      isMouseDownRef.current = false;
      const now = Date.now();

      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const moveDist = Math.hypot(
          touch.clientX - mouseDownStartRef.current.x,
          touch.clientY - mouseDownStartRef.current.y
        );

        // Check double tap gesture on mobile (<300ms between taps)
        if (now - lastTouchTimeRef.current < 300 && moveDist < 25) {
          playerYawRef.current += Math.PI; // 180° turn on double-tap
          if (autoWalkDirRef.current) {
            autoWalkDirRef.current = null;
            setAutoWalkActiveState(null);
          }
          lastTouchTimeRef.current = 0;
          return;
        }
        lastTouchTimeRef.current = now;

        if (moveDist < 30) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseVector.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          mouseVector.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouseVector, camera);
          const intersects = raycaster.intersectObjects(scene.children, true);

          if (intersects.length > 0) {
            let current: THREE.Object3D | null = intersects[0].object;
            while (current) {
              if (current.userData) {
                if (current.userData.type === 'pavilion' && current.userData.pavilionId) {
                  const pav = pavilionsRef.current.find((p) => p.id === current?.userData.pavilionId);
                  if (pav) {
                    onSelectPavilionRef.current(pav);
                    break;
                  }
                } else if (current.userData.type === 'subcategory') {
                  const sub: SubCategory = current.userData.subCategory;
                  const pav: Pavilion = current.userData.pavilion;

                  const match = companiesRef.current.find(
                    (c) =>
                      c.categoryId === pav.id &&
                      (c.subCategory?.toLowerCase().includes(sub.name.toLowerCase()) ||
                        sub.name.toLowerCase().includes(c.subCategory?.toLowerCase() || ''))
                  ) || companiesRef.current.find((c) => c.categoryId === pav.id);

                  if (match) {
                    onSelectCompanyRef.current(match);
                  } else if (onOpenExpoModalRef.current) {
                    onOpenExpoModalRef.current(pav);
                  }
                  break;
                }
              }
              current = current.parent;
            }
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('dblclick', onDblClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let w = rect.width;
      let h = rect.height;
      if (w <= 0 || h <= 0) {
        w = container.clientWidth || window.innerWidth;
        h = container.clientHeight || window.innerHeight;
      }
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        if (renderer.domElement) {
          renderer.domElement.style.width = '100%';
          renderer.domElement.style.height = '100%';
          renderer.domElement.style.position = 'absolute';
          renderer.domElement.style.top = '0';
          renderer.domElement.style.left = '0';
        }
      }
    };

    const handleResizeThrottled = () => {
      handleResize();
      setTimeout(handleResize, 50);
      setTimeout(handleResize, 150);
      setTimeout(handleResize, 300);
      setTimeout(handleResize, 600);
    };

    handleResizeThrottled();
    const resizeObserver = new ResizeObserver(() => handleResizeThrottled());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResizeThrottled);
    document.addEventListener('fullscreenchange', handleResizeThrottled);
    document.addEventListener('webkitfullscreenchange', handleResizeThrottled);
    document.addEventListener('mozfullscreenchange', handleResizeThrottled);
    document.addEventListener('MSFullscreenChange', handleResizeThrottled);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Billboards fixed in position
      billboardGroup.children.forEach((bb) => {
        bb.position.y = 8;
      });

      // Physics / Movement
      const keys = keysRef.current;
      const speed = 8 * walkSpeed * delta;
      let isMoving = false;

      if (isAutoTour) {
        playerPosRef.current.x += speed * 0.6;
        if (playerPosRef.current.x > 280) playerPosRef.current.x = -10;
        playerPosRef.current.z = Math.sin(time * 0.5) * 3;
        playerYawRef.current = -Math.PI / 2 + Math.sin(time * 0.3) * 0.2;
        isMoving = true;
      } else {
        const yaw = playerYawRef.current;
        const fx = -Math.sin(yaw);
        const fz = -Math.cos(yaw);
        const rx = Math.cos(yaw);
        const rz = -Math.sin(yaw);

        let moveForward = 0;
        let moveStrafe = 0;

        if (keys['w'] || keys['arrowup']) {
          moveForward += 1;
          autoWalkDirRef.current = null;
        }
        if (keys['s'] || keys['arrowdown']) {
          moveForward -= 1;
          autoWalkDirRef.current = null;
        }
        if (keys['a'] || keys['arrowleft']) moveStrafe -= 1;
        if (keys['d'] || keys['arrowright']) moveStrafe += 1;

        if (moveForward === 0 && autoWalkDirRef.current) {
          moveForward = autoWalkDirRef.current === 'forward' ? 1 : -1;
        }

        if (keys['q']) playerYawRef.current += delta * 1.8;
        if (keys['e']) playerYawRef.current -= delta * 1.8;

        if (moveForward !== 0 || moveStrafe !== 0) {
          isMoving = true;
          let dx = fx * moveForward + rx * moveStrafe;
          let dz = fz * moveForward + rz * moveStrafe;
          const len = Math.hypot(dx, dz);
          if (len > 0) {
            dx = (dx / len) * speed;
            dz = (dz / len) * speed;
            playerPosRef.current.x += dx;
            playerPosRef.current.z += dz;
          }
          playerPosRef.current.y = 1.7 + Math.sin(time * 10) * 0.05;
        } else {
          playerPosRef.current.y = 1.7;
        }

        // Center avatar/camera on corridor floor (Z = 0) whenever moving along corridor axis without strafing
        let normYawMove = playerYawRef.current % (Math.PI * 2);
        if (normYawMove < 0) normYawMove += Math.PI * 2;
        const isFacingCorridorAxis =
          (normYawMove >= Math.PI / 4 && normYawMove <= (3 * Math.PI) / 4) ||
          (normYawMove >= (5 * Math.PI) / 4 && normYawMove <= (7 * Math.PI) / 4);

        if (isFacingCorridorAxis && moveStrafe === 0) {
          playerPosRef.current.z *= 0.7;
          if (Math.abs(playerPosRef.current.z) < 0.01) {
            playerPosRef.current.z = 0;
          }
        }

        playerPosRef.current.x = Math.max(-23, Math.min(295, playerPosRef.current.x));
        playerPosRef.current.z = Math.max(-4.5, Math.min(4.5, playerPosRef.current.z));

        // Floor Navigation Indicators & Proximity Check
        const currentX = playerPosRef.current.x;
        const currentZ = playerPosRef.current.z;
        const nearbyDoors = doorDataListRef.current.filter((d) => Math.abs(d.x - currentX) <= 8.0);

        // Corridor Direction Arrow (Always visible on floor directly under/near avatar)
        let normYaw = playerYawRef.current % (Math.PI * 2);
        if (normYaw < 0) normYaw += Math.PI * 2;
        const isFacingBackward = normYaw >= (3 * Math.PI) / 4 && normYaw < (5 * Math.PI) / 4;
        const currentCorridorDir: 'forward' | 'backward' = isFacingBackward ? 'backward' : 'forward';

        if (lastCorridorDirRef.current !== currentCorridorDir) {
          lastCorridorDirRef.current = currentCorridorDir;
          if (corridorArrowMat.map) corridorArrowMat.map.dispose();
          corridorArrowMat.map = createCorridorArrowTexture(currentCorridorDir);
          corridorArrowMat.needsUpdate = true;
        }

        corridorArrowMesh.position.set(currentX, 0.08, 0);
        corridorArrowMesh.visible = true;

        if (nearbyDoors.length > 0) {
          const closestX = nearbyDoors[0].x;
          const leftDoor = nearbyDoors.find((d) => d.side === 'left');
          const rightDoor = nearbyDoors.find((d) => d.side === 'right');

          const floorKey = `${closestX}_L:${leftDoor?.name || 'none'}_R:${rightDoor?.name || 'none'}`;

          if (lastFloorKeyRef.current !== floorKey) {
            lastFloorKeyRef.current = floorKey;

            if (leftDoor) {
              if (leftLabelMat.map) leftLabelMat.map.dispose();
              leftLabelMat.map = createFloorLabelTexture(leftDoor.name.toUpperCase(), 'left', leftDoor.color || '#38bdf8');
              leftLabelMat.needsUpdate = true;

              if (leftArrowMat.map) leftArrowMat.map.dispose();
              leftArrowMat.map = createFloorArrowTexture(leftDoor.color || '#38bdf8', 'left');
              leftArrowMat.needsUpdate = true;

              leftLabelMesh.visible = true;
              leftArrowMesh.visible = true;
            } else {
              leftLabelMesh.visible = false;
              leftArrowMesh.visible = false;
            }

            if (rightDoor) {
              if (rightLabelMat.map) rightLabelMat.map.dispose();
              rightLabelMat.map = createFloorLabelTexture(rightDoor.name.toUpperCase(), 'right', rightDoor.color || '#facc15');
              rightLabelMat.needsUpdate = true;

              if (rightArrowMat.map) rightArrowMat.map.dispose();
              rightArrowMat.map = createFloorArrowTexture(rightDoor.color || '#facc15', 'right');
              rightArrowMat.needsUpdate = true;

              rightLabelMesh.visible = true;
              rightArrowMesh.visible = true;
            } else {
              rightLabelMesh.visible = false;
              rightArrowMesh.visible = false;
            }
          }

          leftArrowMesh.scale.set(1, 1, 1);
          rightArrowMesh.scale.set(1, 1, 1);

          floorIndicatorsGroup.position.set(closestX, 0.04, 0);
          floorIndicatorsGroup.visible = true;
        } else {
          floorIndicatorsGroup.visible = false;
          lastFloorKeyRef.current = '';
        }

        // Automatic Portal / Manifesto Proximity Trigger Check
        const nowTime = Date.now();
        if (nowTime > portalCooldownRef.current) {
          if (currentX >= 286) {
            portalCooldownRef.current = nowTime + 2500;
            onSelectPavilionRef.current(nextTargetRef.current);
          } else if (currentX <= -21) {
            portalCooldownRef.current = nowTime + 2500;
            onSelectPavilionRef.current(prevTargetRef.current);
          } else if (Math.abs(currentZ) >= 2.2) {
            const isPressingUp = keys['w'] || keys['arrowup'];

            // Check if avatar is approaching a manifesto (Sponsor Panel) on the wall
            const nearbySponsorPanel = sponsorPanelsRef.current?.find(
              (sp) => Math.abs(sp.positionX - currentX) <= 5.0 && (currentZ < 0 ? sp.side === 'left' : sp.side === 'right')
            );

            if (nearbySponsorPanel && isPressingUp && onSelectSponsorPanelRef.current) {
              portalCooldownRef.current = nowTime + 3000;
              // Face the manifesto and open full screen view
              playerYawRef.current = nearbySponsorPanel.side === 'left' ? 0 : Math.PI;
              onSelectSponsorPanelRef.current(nearbySponsorPanel);
            } else {
              const sideDoor = doorDataListRef.current.find(
                (d) => Math.abs(d.x - currentX) <= 6.0 && (currentZ < 0 ? d.side === 'left' : d.side === 'right')
              );
              if (sideDoor && isPressingUp) {
                portalCooldownRef.current = nowTime + 2500;
                playerYawRef.current = sideDoor.side === 'left' ? 0 : Math.PI;
                handleDoorAction(sideDoor);
              } else if (!isPressingUp) {
                // Keep avatar inside corridor when moving with left/right keys unless pressing UP
                playerPosRef.current.z = Math.max(-2.2, Math.min(2.2, currentZ));
              }
            }
          }
        }
      }

      // Animate Avatar limbs and position
      if (avatarRigRef.current) {
        const av = avatarRigRef.current;
        av.group.position.set(
          playerPosRef.current.x,
          playerPosRef.current.y - 1.7,
          playerPosRef.current.z
        );

        const fx = -Math.sin(playerYawRef.current);
        const fz = -Math.cos(playerYawRef.current);
        av.group.rotation.y = Math.atan2(fx, fz);

        if (isMoving) {
          walkCycleRef.current += delta * 12;
          const swing = Math.sin(walkCycleRef.current);
          av.leftLeg.rotation.x = swing * 0.55;
          av.rightLeg.rotation.x = -swing * 0.55;
          av.leftArm.rotation.x = -swing * 0.45;
          av.rightArm.rotation.x = swing * 0.45;
        } else {
          av.leftLeg.rotation.x *= 0.85;
          av.rightLeg.rotation.x *= 0.85;
          av.leftArm.rotation.x *= 0.85;
          av.rightArm.rotation.x *= 0.85;
        }

        if (cameraViewModeRef.current === '3rd_person') {
          av.group.visible = true;
        } else {
          av.group.visible = false;
        }
      }

      // Position Camera
      if (cameraViewModeRef.current === '3rd_person') {
        const camDist = 4.0;
        const fx = -Math.sin(playerYawRef.current);
        const fz = -Math.cos(playerYawRef.current);

        camera.position.x = playerPosRef.current.x - fx * camDist;
        camera.position.y = playerPosRef.current.y + 0.7;
        camera.position.z = playerPosRef.current.z - fz * camDist;

        const lookX = playerPosRef.current.x + fx * 3;
        const lookY = playerPosRef.current.y + 0.2 + playerPitchRef.current * 1.5;
        const lookZ = playerPosRef.current.z + fz * 3;
        camera.lookAt(lookX, lookY, lookZ);
      } else {
        camera.position.copy(playerPosRef.current);
        const euler = new THREE.Euler(playerPitchRef.current, playerYawRef.current, 0, 'YXZ');
        camera.quaternion.setFromEuler(euler);
      }

      if (onPositionUpdate) {
        const currentX = playerPosRef.current.x;
        const activePav = pavilions.reduce((prev: Pavilion | null, curr: Pavilion) => {
          if (!prev) return curr;
          return Math.abs(curr.positionX - currentX) < Math.abs(prev.positionX - currentX) ? curr : prev;
        }, null);
        onPositionUpdate(currentX, activePav);
      }

      // Throttle 2D Mini-Map state update every ~50ms
      if (time - lastMapUpdateRef.current > 0.05) {
        lastMapUpdateRef.current = time;
        setPlayerMapX(playerPosRef.current.x);
        setPlayerMapZ(playerPosRef.current.z);
        setPlayerMapYaw(playerYawRef.current);
      }

      const renderSize = new THREE.Vector2();
      renderer.getSize(renderSize);
      const curW = renderSize.x;
      const curH = renderSize.y;

      if (isVRMode) {
        const halfW = curW / 2;
        renderer.setScissorTest(true);

        renderer.setScissor(0, 0, halfW, curH);
        renderer.setViewport(0, 0, halfW, curH);
        camera.position.x -= 0.05;
        renderer.render(scene, camera);

        renderer.setScissor(halfW, 0, halfW, curH);
        renderer.setViewport(halfW, 0, halfW, curH);
        camera.position.x += 0.1;
        renderer.render(scene, camera);

        camera.position.x -= 0.05;
        renderer.setScissorTest(false);
      } else {
        renderer.setViewport(0, 0, curW, curH);
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResizeThrottled);
      document.removeEventListener('fullscreenchange', handleResizeThrottled);
      document.removeEventListener('webkitfullscreenchange', handleResizeThrottled);
      document.removeEventListener('mozfullscreenchange', handleResizeThrottled);
      document.removeEventListener('MSFullscreenChange', handleResizeThrottled);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [pavilions, selectedPavilion, walkSpeed, isVRMode, isAutoTour, avatarGender]);

  const handleRecenter = () => {
    playerPosRef.current.z = 0;
    playerYawRef.current = -Math.PI / 2;
    playerPitchRef.current = 0;
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-[#0a0c16]">
      {/* 3D Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Avatar & Camera Mode Selector Panel (Hidden in Fullscreen Mode for max immersion) */}
      {!isFullscreen && (
        <div className="absolute top-14 sm:top-20 left-2 sm:left-4 z-40 flex flex-col gap-2">
          <div className="bg-slate-950/85 backdrop-blur-md p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-500/40 shadow-2xl flex flex-col gap-1.5 sm:gap-2 text-xs w-36 sm:w-52">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-1 sm:pb-1.5">
              <span className="text-[9px] sm:text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                👤 Avatar 3D
              </span>
              <span className="text-[8px] sm:text-[9px] bg-amber-500/20 text-amber-300 px-1 sm:px-1.5 py-0.5 rounded font-mono font-bold">
                Meta-TV
              </span>
            </div>

            {/* Gender Selection */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-white/10">
              <button
                onClick={() => setAvatarGender('male')}
                className={`flex-1 py-0.5 sm:py-1 px-1 sm:px-2 rounded-md sm:rounded-lg font-bold flex items-center justify-center gap-0.5 sm:gap-1 transition-all text-[10px] sm:text-xs ${
                  avatarGender === 'male'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>👨</span> Uomo
              </button>
              <button
                onClick={() => setAvatarGender('female')}
                className={`flex-1 py-0.5 sm:py-1 px-1 sm:px-2 rounded-md sm:rounded-lg font-bold flex items-center justify-center gap-0.5 sm:gap-1 transition-all text-[10px] sm:text-xs ${
                  avatarGender === 'female'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>👩</span> Donna
              </button>
            </div>

            {/* Camera View Mode */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-white/10">
              <button
                onClick={() => setCameraViewMode('3rd_person')}
                className={`flex-1 py-0.5 sm:py-1 px-1 sm:px-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-semibold flex items-center justify-center gap-0.5 sm:gap-1 transition-all ${
                  cameraViewMode === '3rd_person'
                    ? 'bg-amber-400/25 text-amber-300 border border-amber-400/50 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🎥 3ª Pers.
              </button>
              <button
                onClick={() => setCameraViewMode('1st_person')}
                className={`flex-1 py-0.5 sm:py-1 px-1 sm:px-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-semibold flex items-center justify-center gap-0.5 sm:gap-1 transition-all ${
                  cameraViewMode === '1st_person'
                    ? 'bg-amber-400/25 text-amber-300 border border-amber-400/50 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                👁️ 1ª Pers.
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recenter Button (Shown in normal mode; in fullscreen it is part of the top HUD bar) */}
      {!isFullscreen && (
        <button
          onClick={handleRecenter}
          className="absolute top-20 right-80 z-30 px-3.5 py-1.5 bg-black/85 hover:bg-black text-amber-300 hover:text-amber-200 border border-amber-500/50 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg hidden lg:flex items-center gap-1.5 transition-all active:scale-95"
          title="Centra la visuale al centro del corridoio"
        >
          <span>🎯</span>
          <span>Recentra Visuale</span>
        </button>
      )}

      {/* 2D Mini-Map Planimetria Overlay for Mall Corridor */}
      <div className={`fixed z-40 transition-all ${isFullscreen ? 'top-3 right-3 sm:right-6' : 'top-14 sm:top-20 right-2 sm:right-4'}`}>
        <MallMiniMap2D
          pavilions={pavilions}
          companies={companies}
          selectedPavilion={selectedPavilion}
          playerX={playerMapX}
          playerZ={playerMapZ}
          playerYaw={playerMapYaw}
          onTeleportToX={(targetX) => {
            playerPosRef.current.x = targetX;
            playerPosRef.current.z = 0;
          }}
          onSelectPavilion={(pav) => onSelectPavilion(pav)}
          onOpenExpoModal={onOpenExpoModal}
        />
      </div>

      {/* Auto-Walk Active Banner */}
      {autoWalkActiveState && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500/95 text-slate-950 font-extrabold px-4 py-2 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.8)] border-2 border-white flex items-center gap-3 animate-bounce">
          <span className="text-xs sm:text-sm">
            🚶 Camminata Automatica {autoWalkActiveState === 'forward' ? 'in Avanti ▲' : 'in Indietro ▼'}
          </span>
          <button
            onClick={() => {
              autoWalkDirRef.current = null;
              setAutoWalkActiveState(null);
            }}
            className="bg-black hover:bg-zinc-800 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-transform active:scale-95 shadow-md"
          >
            Ferma [Click]
          </button>
        </div>
      )}

      {/* On-screen controls for mobile (Compact & Translucent for high visibility) */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-col items-center pointer-events-auto sm:hidden select-none">
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-2 rounded-2xl border border-amber-500/40 backdrop-blur-md shadow-2xl">
          <button
            onTouchStart={(e) => { e.preventDefault(); playerYawRef.current += 0.25; }}
            className="w-9 h-9 bg-amber-500/20 active:bg-amber-500/60 text-amber-300 font-bold rounded-lg border border-amber-500/40 flex items-center justify-center text-sm active:scale-95 transition-transform"
            aria-label="Ruota Sguardo a Sinistra"
            title="Ruota Sguardo a Sinistra"
          >
            ↺
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); keysRef.current['w'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); keysRef.current['w'] = false; }}
            onTouchCancel={() => { keysRef.current['w'] = false; }}
            onMouseDown={() => (keysRef.current['w'] = true)}
            onMouseUp={() => (keysRef.current['w'] = false)}
            className="w-9 h-9 bg-amber-500/30 active:bg-amber-500/70 text-amber-300 font-black rounded-lg border border-amber-500/50 flex items-center justify-center text-sm active:scale-95 transition-transform"
            aria-label="Avanti"
          >
            ▲
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); playerYawRef.current -= 0.25; }}
            className="w-9 h-9 bg-amber-500/20 active:bg-amber-500/60 text-amber-300 font-bold rounded-lg border border-amber-500/40 flex items-center justify-center text-sm active:scale-95 transition-transform"
            aria-label="Ruota Sguardo a Destra"
            title="Ruota Sguardo a Destra"
          >
            ↻
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); keysRef.current['arrowleft'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); keysRef.current['arrowleft'] = false; }}
            onTouchCancel={() => { keysRef.current['arrowleft'] = false; }}
            onMouseDown={() => (keysRef.current['arrowleft'] = true)}
            onMouseUp={() => (keysRef.current['arrowleft'] = false)}
            className="w-9 h-9 bg-amber-500/20 active:bg-amber-500/60 text-amber-300 font-bold rounded-lg border border-amber-500/40 flex items-center justify-center text-sm active:scale-95 transition-transform"
            aria-label="Spostati a Sinistra"
          >
            ◄
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); keysRef.current['s'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); keysRef.current['s'] = false; }}
            onTouchCancel={() => { keysRef.current['s'] = false; }}
            onMouseDown={() => (keysRef.current['s'] = true)}
            onMouseUp={() => (keysRef.current['s'] = false)}
            className="w-9 h-9 bg-amber-500/30 active:bg-amber-500/70 text-amber-300 font-black rounded-lg border border-amber-500/50 flex items-center justify-center text-sm active:scale-95 transition-transform"
            aria-label="Indietro"
          >
            ▼
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); keysRef.current['arrowright'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); keysRef.current['arrowright'] = false; }}
            onTouchCancel={() => { keysRef.current['arrowright'] = false; }}
            onMouseDown={() => (keysRef.current['arrowright'] = true)}
            onMouseUp={() => (keysRef.current['arrowright'] = false)}
            className="w-9 h-9 bg-amber-500/20 active:bg-amber-500/60 text-amber-300 font-bold rounded-lg border border-amber-500/40 flex items-center justify-center text-sm active:scale-95 transition-transform"
            aria-label="Spostati a Destra"
          >
            ►
          </button>
        </div>
      </div>

      {/* Floating Instructions Banner */}
      <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/30 text-amber-200 text-xs shadow-xl">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
        <span>{controlsInfo}</span>
      </div>
    </div>
  );
};
