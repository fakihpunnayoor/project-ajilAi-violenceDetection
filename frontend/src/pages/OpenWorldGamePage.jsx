import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Gamepad2, 
  Shield, 
  Car, 
  User, 
  Compass, 
  Award, 
  Smartphone, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  RotateCcw, 
  X, 
  Volume2, 
  VolumeX,
  Play, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Map as MapIcon,
  Navigation,
  Fuel,
  Building,
  TreePine,
  Cross,
  Radio,
  Camera as CameraIcon,
  Check
} from 'lucide-react';
import audioSynthesizer from '../audio/AudioSynthesizer';

// Character Selection Profiles
const CHARACTERS = [
  {
    id: 'runner',
    name: 'Runner',
    trait: 'Balanced Athletic',
    color: '#ef4444', // Red Hoodie
    pantsColor: '#1e293b',
    skinColor: '#fed7aa',
    hairColor: '#0f172a',
    speed: 1.0,
    desc: 'Balanced athletic endurance and rapid sprint acceleration.'
  },
  {
    id: 'explorer',
    name: 'Explorer',
    trait: 'Fast & Agile',
    color: '#0284c7', // Blue Jacket
    pantsColor: '#334155',
    skinColor: '#fcd34d',
    hairColor: '#1e293b',
    speed: 1.2,
    desc: 'Maximum traversal agility across sidewalks and rooftops.'
  },
  {
    id: 'driver',
    name: 'Driver',
    trait: 'Vehicle Specialist',
    color: '#16a34a', // Green Jacket
    pantsColor: '#0f172a',
    skinColor: '#fed7aa',
    hairColor: '#451a03',
    speed: 1.05,
    desc: 'Tuned vehicular handling, responsive braking, and higher top speeds.'
  },
  {
    id: 'observer',
    name: 'Observer',
    trait: 'Tactical Recon',
    color: '#7c3aed', // Purple Hoodie
    pantsColor: '#1e1b4b',
    skinColor: '#fbcfe8',
    hairColor: '#0f172a',
    speed: 1.0,
    desc: 'Extended radar threat range and automatic incident alert markers.'
  }
];

// 8 Diverse Violence Scenarios Distributed Across City Districts
const INCIDENT_DEFINITIONS = [
  {
    id: 'inc_market',
    title: 'Market Street Shoplifting Dispute',
    type: 'Commercial store conflict',
    district: 'Downtown Shopping District',
    pos: [35, 0, -25],
    actors: [
      { color: 0xd97706, name: 'Store Owner' },
      { color: 0x1e293b, name: 'Shoplifter' }
    ],
    desc: 'An aggressive dispute broke out on the commercial sidewalk between a merchant and a fleeing suspect.'
  },
  {
    id: 'inc_car_crash',
    title: 'Fender-Bender Roadside Altercation',
    type: 'Vehicle-related conflict',
    district: 'Central Avenue Crossroad',
    pos: [15, 0, 40],
    actors: [
      { color: 0xdc2626, name: 'Sedan Driver' },
      { color: 0x2563eb, name: 'Coupe Driver' }
    ],
    desc: 'Two drivers involved in a low-speed scrape are aggressively shoving and pointing by their parked cars.'
  },
  {
    id: 'inc_park_bike',
    title: 'Park Trail Cyclist Confrontation',
    type: 'Bike-related dispute',
    district: 'Central Park Greenways',
    pos: [-30, 0, 60],
    actors: [
      { color: 0x059669, name: 'Cyclist' },
      { color: 0x9333ea, name: 'Pedestrian' }
    ],
    desc: 'A cyclist nearly struck a pedestrian on the park trail, leading to an escalated physical argument.'
  },
  {
    id: 'inc_transit',
    title: 'Bus Terminal Platform Brawl',
    type: 'Public transit altercation',
    district: 'Civic Transit Hub',
    pos: [-45, 0, -35],
    actors: [
      { color: 0x475569, name: 'Commuter A' },
      { color: 0x0284c7, name: 'Commuter B' }
    ],
    desc: 'Two individuals are trading strikes and grappling near the covered bus passenger benches.'
  },
  {
    id: 'inc_warehouse',
    title: 'Industrial Loading Dock Dispute',
    type: 'Industrial zone altercation',
    district: 'North Industrial Sector',
    pos: [-95, 0, -85],
    actors: [
      { color: 0xea580c, name: 'Cargo Handler' },
      { color: 0x334155, name: 'Warehouse Guard' }
    ],
    desc: 'A physical altercation erupted by the cargo shipping containers over an unauthorized access attempt.'
  },
  {
    id: 'inc_gas_station',
    title: 'Gas Station Pump Island Argument',
    type: 'Service station dispute',
    district: 'Highway Fuel Oasis',
    pos: [80, 0, -45],
    actors: [
      { color: 0xca8a04, name: 'Motorist A' },
      { color: 0x64748b, name: 'Motorist B' }
    ],
    desc: 'Two motorists are fiercely shoving over pump queue positions in the gas station forecourt.'
  },
  {
    id: 'inc_suburb',
    title: 'Suburban Alley Disturbance',
    type: 'Residential street conflict',
    district: 'Pine Crest Residential Area',
    pos: [90, 0, 75],
    actors: [
      { color: 0x0891b2, name: 'Neighbor A' },
      { color: 0x4f46e5, name: 'Neighbor B' }
    ],
    desc: 'Heated shouting and physical grappling between two residents on the suburban sidewalk.'
  },
  {
    id: 'inc_hospital',
    title: 'Hospital Triage Barrier Disturbance',
    type: 'Medical facility conflict',
    district: 'Metropolitan Medical Center',
    pos: [-15, 0, -110],
    actors: [
      { color: 0xef4444, name: 'Agitated Visitor' },
      { color: 0x1e3a8a, name: 'Security Officer' }
    ],
    desc: 'An aggressive visitor attempting to bypass the emergency entrance triage barrier is scuffling with guards.'
  }
];

export default function OpenWorldGamePage({ onBackToWebsite }) {
  // Game Flow State: 'select' -> 'loading' -> 'playing'
  const [gameState, setGameState] = useState('select');
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  // Gameplay State
  const [activeDistrict, setActiveDistrict] = useState('Central Downtown');
  const [isDriving, setIsDriving] = useState(false);
  const [activeVehicleType, setActiveVehicleType] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [compassHeading, setCompassHeading] = useState('N');

  // Proximity Triggers
  const [nearbyVehicle, setNearbyVehicle] = useState(null);
  const [nearbyNpc, setNearbyNpc] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);
  const [reportedIncidents, setReportedIncidents] = useState(new Set());

  // Interactive UI Overlays
  const [activeDialog, setActiveDialog] = useState(null);
  const [showPhoneMenu, setShowPhoneMenu] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardData, setRewardData] = useState({ title: '', points: 50, note: '' });
  const [lastReportedToast, setLastReportedToast] = useState(null);

  // Mission Checklist
  const [missions, setMissions] = useState({
    incidentsWitnessed: 0,
    targetIncidents: 5,
    peopleTalked: 0,
    targetPeople: 3,
    vehiclesDriven: new Set(),
    districtsExplored: new Set(['Central Downtown'])
  });

  // Three.js Scene References
  const canvasContainerRef = useRef(null);
  const miniMapCanvasRef = useRef(null);
  const fullMapCanvasRef = useRef(null);

  // Internal Three.js Mutable State
  const worldRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    playerGroup: null,
    playerLimbs: {},
    playerPos: new THREE.Vector3(0, 0, 10),
    playerVelocity: new THREE.Vector3(),
    playerAngle: 0,
    isGrounded: true,
    vehicles: [],
    currentVehicle: null,
    trafficVehicles: [],
    npcs: [],
    incidentGroups: [],
    keys: {},
    animTime: 0,
    clock: new THREE.Clock()
  });

  // Start Game Transition
  const handleConfirmCharacter = () => {
    setGameState('loading');
    setTimeout(() => {
      setGameState('playing');
    }, 1000);
  };

  // Keyboard Input Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      worldRef.current.keys[e.code] = true;

      // 'E' Key: Universal Interaction (Drive, Talk, Report)
      if (e.code === 'KeyE') {
        if (worldRef.current.activeNearbyIncident && !reportedIncidents.has(worldRef.current.activeNearbyIncident.id)) {
          handleReportIncident(worldRef.current.activeNearbyIncident);
        } else if (worldRef.current.nearbyVehicle && !worldRef.current.currentVehicle) {
          enterVehicle(worldRef.current.nearbyVehicle);
        } else if (worldRef.current.nearbyNpc) {
          openNpcDialog(worldRef.current.nearbyNpc);
        }
      }

      // 'F' Key: Exit Vehicle
      if (e.code === 'KeyF' && worldRef.current.currentVehicle) {
        exitVehicle();
      }

      // 'M' Key: Toggle City Map
      if (e.code === 'KeyM') {
        setShowFullMap(prev => !prev);
      }

      // 'P' Key: Toggle Smartphone Menu
      if (e.code === 'KeyP') {
        setShowPhoneMenu(prev => !prev);
      }

      // 'Space' Key: Jump on foot
      if (e.code === 'Space' && !worldRef.current.currentVehicle && worldRef.current.isGrounded) {
        worldRef.current.playerVelocity.y = 8.5;
        worldRef.current.isGrounded = false;
      }

      // 'H' Key: Vehicle Horn
      if (e.code === 'KeyH' && worldRef.current.currentVehicle) {
        audioSynthesizer.playChime(350);
      }
    };

    const handleKeyUp = (e) => {
      worldRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [reportedIncidents]);

  // Enter Vehicle
  const enterVehicle = (veh) => {
    const w = worldRef.current;
    w.currentVehicle = veh;
    w.playerGroup.visible = false;
    setIsDriving(true);
    setActiveVehicleType(veh.userData.name);

    setMissions(prev => {
      const nextVehs = new Set(prev.vehiclesDriven);
      nextVehs.add(veh.userData.name);
      return { ...prev, vehiclesDriven: nextVehs };
    });

    audioSynthesizer.playEngineRev();
  };

  // Exit Vehicle
  const exitVehicle = () => {
    const w = worldRef.current;
    if (!w.currentVehicle) return;
    const vPos = w.currentVehicle.position;
    w.playerPos.set(vPos.x + 2.8, 0, vPos.z);
    w.playerGroup.position.copy(w.playerPos);
    w.playerGroup.visible = true;
    w.currentVehicle = null;
    setIsDriving(false);
    setActiveVehicleType(null);
    setCurrentSpeed(0);
  };

  // Report Violence Incident
  const handleReportIncident = (inc) => {
    if (reportedIncidents.has(inc.id)) return;

    setReportedIncidents(prev => {
      const next = new Set(prev);
      next.add(inc.id);
      return next;
    });

    // Award +50 Points and +100 XP
    setScore(s => s + 50);
    setXp(x => {
      const nextXp = x + 100;
      if (nextXp >= 250) setLevel(l => l + 1);
      return nextXp % 250;
    });

    setMissions(prev => ({
      ...prev,
      incidentsWitnessed: Math.min(prev.targetIncidents, prev.incidentsWitnessed + 1)
    }));

    // Update 3D scene visual (mark resolved)
    if (inc.group) {
      inc.group.userData.resolved = true;
      if (inc.alertSprite) {
        inc.alertSprite.material.color.setHex(0x10b981); // Green checkmark
      }
    }

    setRewardData({
      title: 'INCIDENT REPORTED SUCCESSFULLY!',
      points: 50,
      note: `Witnessed and cataloged: ${inc.title} in ${inc.district}. Field units dispatched.`
    });
    setLastReportedToast(inc.title);
    setTimeout(() => setLastReportedToast(null), 4000);
    setShowRewardModal(true);
    audioSynthesizer.playChime(784); // Bright positive chime
  };

  // Open NPC Dialog
  const openNpcDialog = (npc) => {
    setActiveDialog({
      speaker: npc.userData.name || 'City Resident',
      role: npc.userData.role || 'Citizen',
      dialogue: npc.userData.greeting || "Hello officer! Staying alert today? Keep an eye around the shopping district and transit stop.",
      options: [
        { text: "What's happening in this district?", reply: "Traffic is heavy today, and tempers have been flaring near the crossroad!" },
        { text: "Any suspicious or violent activity?", reply: "I noticed a heated shouting match by the stores two blocks away. Check your radar map!" },
        { text: "Where is the nearest police station?", reply: "Directly north on Civic Boulevard. Follow the purple marker on your map." },
        { text: "Thanks, stay safe.", reply: null }
      ]
    });

    setMissions(prev => ({
      ...prev,
      peopleTalked: Math.min(prev.targetPeople, prev.peopleTalked + 1)
    }));
    audioSynthesizer.playChime(520);
  };

  // =================================================================
  // THREE.JS 3D OPEN WORLD GENERATION
  // =================================================================
  useEffect(() => {
    if (gameState !== 'playing' || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Bright Daytime Sky Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8); // Bright blue daytime sky
    scene.fog = new THREE.Fog(0x38bdf8, 120, 320);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 5, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Bright Realistic Daytime Lighting
    const ambientLight = new THREE.AmbientLight(0xe0f2fe, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 0.5);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
    sunLight.position.set(100, 150, 80);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    const d = 160;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // 3. Terrain Base (Lush Grass & Urban Base)
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }); // Rich green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Concrete Urban Base Platform under city blocks
    const urbanPlatform = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 360),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
    );
    urbanPlatform.rotation.x = -Math.PI / 2;
    urbanPlatform.position.y = 0.01;
    urbanPlatform.receiveShadow = true;
    scene.add(urbanPlatform);

    // ===============================================================
    // 4. EXTENSIVE ROAD NETWORK (Avenues, Streets, Markings, Sidewalks)
    // ===============================================================
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });

    const roadCoords = [-120, -60, 0, 60, 120];
    const roadWidth = 14;

    // Build East-West and North-South Avenues
    roadCoords.forEach(pos => {
      // East-West Road
      const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(360, roadWidth), roadMat);
      roadEW.rotation.x = -Math.PI / 2;
      roadEW.position.set(0, 0.05, pos);
      roadEW.receiveShadow = true;
      scene.add(roadEW);

      // North-South Road
      const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, 360), roadMat);
      roadNS.rotation.x = -Math.PI / 2;
      roadNS.position.set(pos, 0.05, 0);
      roadNS.receiveShadow = true;
      scene.add(roadNS);

      // Yellow Center Lines
      const yLineEW = new THREE.Mesh(new THREE.PlaneGeometry(360, 0.35), yellowMat);
      yLineEW.rotation.x = -Math.PI / 2;
      yLineEW.position.set(0, 0.07, pos);
      scene.add(yLineEW);

      const yLineNS = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 360), yellowMat);
      yLineNS.rotation.x = -Math.PI / 2;
      yLineNS.position.set(pos, 0.07, 0);
      scene.add(yLineNS);

      // Sidewalk Curbs
      [-roadWidth / 2 - 2, roadWidth / 2 + 2].forEach(offset => {
        const swEW = new THREE.Mesh(new THREE.BoxGeometry(360, 0.35, 3.5), sidewalkMat);
        swEW.position.set(0, 0.18, pos + offset);
        swEW.receiveShadow = true;
        scene.add(swEW);

        const swNS = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.35, 360), sidewalkMat);
        swNS.position.set(pos + offset, 0.18, 0);
        swNS.receiveShadow = true;
        scene.add(swNS);
      });

      // Pedestrian Zebra Crosswalks at intersections
      roadCoords.forEach(otherPos => {
        const cwGeo = new THREE.PlaneGeometry(1.2, 5);
        for (let i = -5; i <= 5; i += 2.2) {
          const cw1 = new THREE.Mesh(cwGeo, lineMat);
          cw1.rotation.x = -Math.PI / 2;
          cw1.position.set(pos + i, 0.08, otherPos + 9);
          scene.add(cw1);

          const cw2 = new THREE.Mesh(cwGeo, lineMat);
          cw2.rotation.x = -Math.PI / 2;
          cw2.rotation.z = Math.PI / 2;
          cw2.position.set(pos + 9, 0.08, otherPos + i);
          scene.add(cw2);
        }
      });
    });

    // ===============================================================
    // 5. DISTINCT CITY DISTRICTS & STYLIZED BUILDINGS
    // ===============================================================
    const buildingColors = [
      0x0284c7, 0x0369a1, 0x0f172a, 0x334155, 0x475569, 
      0x059669, 0xd97706, 0x2563eb, 0x7c3aed, 0xbe185d
    ];

    // Downtown Skyscrapers (North-East Block: X: 20 to 100, Z: -100 to -20)
    for (let bx = 25; bx <= 95; bx += 24) {
      for (let bz = -95; bz <= -25; bz += 24) {
        const h = 25 + Math.random() * 45;
        const col = buildingColors[Math.floor(Math.random() * buildingColors.length)];
        const b = new THREE.Mesh(
          new THREE.BoxGeometry(18, h, 18),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.3, metalness: 0.4 })
        );
        b.position.set(bx, h / 2, bz);
        b.castShadow = true;
        b.receiveShadow = true;
        scene.add(b);

        // Rooftop AC / Antenna
        const ant = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 8),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
        );
        ant.position.set(bx, h + 4, bz);
        scene.add(ant);
      }
    }

    // Shopping District Storefronts (West Block: X: -95 to -25, Z: -45 to 45)
    for (let bx = -95; bx <= -25; bx += 24) {
      for (let bz = -45; bz <= 45; bz += 24) {
        const h = 12 + Math.random() * 8;
        const b = new THREE.Mesh(
          new THREE.BoxGeometry(18, h, 18),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 })
        );
        b.position.set(bx, h / 2, bz);
        b.castShadow = true;
        b.receiveShadow = true;
        scene.add(b);

        // Colorful Storefront Awning
        const awningMat = new THREE.MeshStandardMaterial({ 
          color: (bx + bz) % 2 === 0 ? 0xdc2626 : 0x0284c7 
        });
        const awning = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 3), awningMat);
        awning.position.set(bx, 4, bz + 9.5);
        scene.add(awning);
      }
    }

    // Central Park & Pond (South-Central: X: -45 to 45, Z: 25 to 95)
    const parkGrass = new THREE.Mesh(
      new THREE.BoxGeometry(90, 0.3, 70),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 })
    );
    parkGrass.position.set(0, 0.15, 60);
    scene.add(parkGrass);

    // Park Pond
    const pond = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.1, metalness: 0.8 })
    );
    pond.position.set(0, 0.25, 60);
    scene.add(pond);

    // Low-Poly Trees in Park
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    for (let i = 0; i < 28; i++) {
      const tx = (Math.random() - 0.5) * 80;
      const tz = 30 + Math.random() * 60;
      if (Math.hypot(tx, tz - 60) < 16) continue; // Don't place inside pond

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 3), trunkMat);
      trunk.position.set(tx, 1.5, tz);
      trunk.castShadow = true;
      scene.add(trunk);

      const leaves = new THREE.Mesh(new THREE.ConeGeometry(2.5, 5, 8), foliageMat);
      leaves.position.set(tx, 5, tz);
      leaves.castShadow = true;
      scene.add(leaves);
    }

    // Industrial Warehouses & Shipping Containers (North-West: X: -140 to -70, Z: -140 to -70)
    for (let i = -130; i <= -70; i += 30) {
      const wh = new THREE.Mesh(
        new THREE.BoxGeometry(24, 10, 20),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 })
      );
      wh.position.set(i, 5, -110);
      wh.castShadow = true;
      scene.add(wh);

      // Stacked colorful shipping containers
      [0xef4444, 0x0284c7, 0x16a34a, 0xf59e0b].forEach((cCol, idx) => {
        const cont = new THREE.Mesh(
          new THREE.BoxGeometry(10, 3, 4),
          new THREE.MeshStandardMaterial({ color: cCol, metalness: 0.4 })
        );
        cont.position.set(i + (idx % 2) * 5, 1.5 + Math.floor(idx / 2) * 3, -80);
        cont.castShadow = true;
        scene.add(cont);
      });
    }

    // Police Station & Hospital (North-Central: X: -40 to 40, Z: -140 to -80)
    // Police Station
    const policeHQ = new THREE.Mesh(
      new THREE.BoxGeometry(28, 16, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3, metalness: 0.4 })
    );
    policeHQ.position.set(30, 8, -120);
    policeHQ.castShadow = true;
    scene.add(policeHQ);

    // Police Helipad Roof
    const helipad = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 0.4, 16),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    helipad.position.set(30, 16.2, -120);
    scene.add(helipad);

    // Hospital Center (White facade + Red Medical Cross)
    const hospital = new THREE.Mesh(
      new THREE.BoxGeometry(32, 20, 24),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    hospital.position.set(-30, 10, -120);
    hospital.castShadow = true;
    scene.add(hospital);

    const crossV = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 0.4), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
    crossV.position.set(-30, 14, -107.8);
    scene.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.4), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
    crossH.position.set(-30, 14, -107.8);
    scene.add(crossH);

    // ===============================================================
    // 6. MULTIPLE DRIVEABLE VEHICLES (Cars, Taxi, Police, Ambulance, Bike)
    // ===============================================================
    const vehicleList = [];

    const createVehicleMesh = ({ name, color, isPolice, isTaxi, isAmbulance, isBike, x, z, angle }) => {
      const vGroup = new THREE.Group();

      if (isBike) {
        // Stylized Bicycle / Motorcycle
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

        const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2), frameMat);
        frame.rotation.z = Math.PI / 3;
        frame.position.y = 0.8;
        vGroup.add(frame);

        const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.15, 16), wheelMat);
        w1.rotation.z = Math.PI / 2;
        w1.position.set(-1.1, 0.45, 0);
        vGroup.add(w1);
        const w2 = w1.clone();
        w2.position.set(1.1, 0.45, 0);
        vGroup.add(w2);
      } else {
        // Automobile Body
        const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.2, 2.3), bodyMat);
        body.position.y = 0.85;
        body.castShadow = true;
        vGroup.add(body);

        // Cabin Glass
        const cabin = new THREE.Mesh(
          new THREE.BoxGeometry(2.6, 1.0, 1.9),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 })
        );
        cabin.position.set(-0.3, 1.8, 0);
        vGroup.add(cabin);

        // Wheels
        const wMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
        const wGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.45, 16);
        [[-1.4, 0.48, 1.15], [1.4, 0.48, 1.15], [-1.4, 0.48, -1.15], [1.4, 0.48, -1.15]].forEach(([wx, wy, wz]) => {
          const w = new THREE.Mesh(wGeo, wMat);
          w.rotation.z = Math.PI / 2;
          w.position.set(wx, wy, wz);
          vGroup.add(w);
        });

        // Headlights
        const hl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        hl.position.set(2.2, 0.9, 0.7);
        vGroup.add(hl);
        const hr = hl.clone();
        hr.position.set(2.2, 0.9, -0.7);
        vGroup.add(hr);

        // Special Lights: Police / Taxi / Ambulance
        if (isPolice) {
          const lb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.5), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
          lb.position.set(-0.3, 2.4, 0);
          vGroup.add(lb);
        } else if (isTaxi) {
          const ts = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.4), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          ts.position.set(-0.3, 2.4, 0);
          vGroup.add(ts);
        } else if (isAmbulance) {
          const ambLight = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          ambLight.position.set(-0.3, 2.45, 0);
          vGroup.add(ambLight);
        }
      }

      vGroup.position.set(x, 0, z);
      vGroup.rotation.y = angle;
      vGroup.userData = {
        name,
        speed: 0,
        angle,
        maxSpeed: isPolice ? 28 : (isBike ? 16 : 22),
        isBike
      };

      scene.add(vGroup);
      vehicleList.push(vGroup);
      return vGroup;
    };

    // Spawn Driveable Vehicles across city
    createVehicleMesh({ name: 'Red Sports Coupe', color: 0xdc2626, x: 15, z: 8, angle: 0 });
    createVehicleMesh({ name: 'Yellow Urban Taxi', color: 0xfacc15, isTaxi: true, x: -35, z: 8, angle: 0 });
    createVehicleMesh({ name: 'Police Cruiser', color: 0x0f172a, isPolice: true, x: 30, z: -105, angle: Math.PI });
    createVehicleMesh({ name: 'Emergency Ambulance', color: 0xf8fafc, isAmbulance: true, x: -30, z: -105, angle: Math.PI });
    createVehicleMesh({ name: 'Urban Bicycle', color: 0x10b981, isBike: true, x: -10, z: 25, angle: 0 });
    createVehicleMesh({ name: 'Blue City Sedan', color: 0x0284c7, x: 80, z: 65, angle: -Math.PI / 2 });

    // ===============================================================
    // 7. DYNAMIC AI TRAFFIC CARS (Moving in continuous road loops)
    // ===============================================================
    const trafficCars = [];
    const trafficColors = [0x38bdf8, 0xe2e8f0, 0x64748b, 0xf59e0b, 0x10b981];

    for (let i = 0; i < 8; i++) {
      const tMesh = new THREE.Group();
      const col = trafficColors[i % trafficColors.length];
      const tBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 2.2), new THREE.MeshStandardMaterial({ color: col }));
      tBody.position.y = 0.8;
      tMesh.add(tBody);
      const tCabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      tCabin.position.set(-0.2, 1.7, 0);
      tMesh.add(tCabin);

      const trackRoad = roadCoords[i % roadCoords.length];
      const isEW = i % 2 === 0;
      tMesh.position.set(isEW ? (i * 40 - 140) : trackRoad + 3.5, 0, isEW ? trackRoad + 3.5 : (i * 40 - 140));
      tMesh.rotation.y = isEW ? 0 : -Math.PI / 2;

      tMesh.userData = {
        isEW,
        speed: 10 + Math.random() * 6,
        trackCoord: trackRoad + 3.5
      };

      scene.add(tMesh);
      trafficCars.push(tMesh);
    }

    // ===============================================================
    // 8. WALKING NPCS & CITIZENS
    // ===============================================================
    const npcList = [];
    const npcRoles = ['Citizen', 'Student', 'Officer', 'Shopper', 'Worker', 'Cyclist'];
    const npcGreetings = [
      "Good morning officer! Nice day in the district.",
      "Stay safe out there! Notice anything unusual?",
      "Need any directions? City Mart is down on 2nd Ave.",
      "Hello! Great to see surveillance patrol on our street.",
      "I love walking through Central Park when it's sunny."
    ];

    for (let i = 0; i < 20; i++) {
      const npc = new THREE.Group();
      const nCol = buildingColors[i % buildingColors.length];
      const nTorso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.45), new THREE.MeshStandardMaterial({ color: nCol }));
      nTorso.position.y = 0.85;
      npc.add(nTorso);

      const nHead = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), new THREE.MeshStandardMaterial({ color: 0xfed7aa }));
      nHead.position.y = 1.85;
      npc.add(nHead);

      const spawnRoad = roadCoords[i % roadCoords.length];
      const isOffsetZ = i % 2 === 0;
      npc.position.set(
        isOffsetZ ? (Math.random() - 0.5) * 220 : spawnRoad + 8.5,
        0,
        isOffsetZ ? spawnRoad + 8.5 : (Math.random() - 0.5) * 220
      );

      npc.userData = {
        name: `Citizen #${100 + i}`,
        role: npcRoles[i % npcRoles.length],
        greeting: npcGreetings[i % npcGreetings.length],
        walkDir: Math.random() > 0.5 ? 1 : -1,
        axis: isOffsetZ ? 'x' : 'z'
      };

      scene.add(npc);
      npcList.push(npc);
    }

    // ===============================================================
    // 9. 8 VIOLENCE INCIDENT SITES (3D Combat Animation & Billboards)
    // ===============================================================
    const incidentGroups = [];

    INCIDENT_DEFINITIONS.forEach(def => {
      const incGroup = new THREE.Group();

      // Combatant 1
      const a1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.8, 0.5),
        new THREE.MeshStandardMaterial({ color: def.actors[0].color })
      );
      a1.position.set(-0.8, 0.9, 0);
      incGroup.add(a1);

      // Combatant 2
      const a2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.8, 0.5),
        new THREE.MeshStandardMaterial({ color: def.actors[1].color })
      );
      a2.position.set(0.8, 0.9, 0);
      incGroup.add(a2);

      // Pulsing 3D Billboard Sprite ("!")
      const alertCvs = document.createElement('canvas');
      alertCvs.width = 128;
      alertCvs.height = 128;
      const actx = alertCvs.getContext('2d');
      actx.fillStyle = '#ef4444';
      actx.beginPath();
      actx.roundRect(14, 14, 100, 100, 24);
      actx.fill();
      actx.fillStyle = '#ffffff';
      actx.font = 'bold 72px monospace';
      actx.textAlign = 'center';
      actx.textBaseline = 'middle';
      actx.fillText('!', 64, 64);

      const alertTex = new THREE.CanvasTexture(alertCvs);
      const alertMat = new THREE.SpriteMaterial({ map: alertTex, transparent: true });
      const alertSprite = new THREE.Sprite(alertMat);
      alertSprite.scale.set(2.2, 2.2, 1);
      alertSprite.position.set(0, 3.8, 0);
      incGroup.add(alertSprite);

      incGroup.position.set(def.pos[0], def.pos[1], def.pos[2]);
      incGroup.userData = {
        ...def,
        a1,
        a2,
        alertSprite,
        resolved: false
      };

      scene.add(incGroup);
      incidentGroups.push(incGroup);
    });

    // ===============================================================
    // 10. 3D PLAYER AVATAR (Stylized Character matching selection)
    // ===============================================================
    const playerGroup = new THREE.Group();
    const hoodieMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(selectedChar.color) });
    const skinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(selectedChar.skinColor) });
    const pantsMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(selectedChar.pantsColor) });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.05, 0.5), hoodieMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    playerGroup.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    head.position.y = 2.15;
    playerGroup.add(head);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.22, 0.62),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(selectedChar.hairColor) })
    );
    cap.position.set(0, 2.4, 0.05);
    playerGroup.add(cap);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.85, 0.25), hoodieMat);
    leftArm.position.set(-0.58, 1.35, 0);
    playerGroup.add(leftArm);
    const rightArm = leftArm.clone();
    rightArm.position.set(0.58, 1.35, 0);
    playerGroup.add(rightArm);

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.3), pantsMat);
    leftLeg.position.set(-0.22, 0.48, 0);
    playerGroup.add(leftLeg);
    const rightLeg = leftLeg.clone();
    rightLeg.position.set(0.22, 0.48, 0);
    playerGroup.add(rightLeg);

    playerGroup.position.set(0, 0, 10);
    scene.add(playerGroup);

    // Save references in mutable state
    worldRef.current = {
      ...worldRef.current,
      scene,
      camera,
      renderer,
      playerGroup,
      playerLimbs: { leftArm, rightArm, leftLeg, rightLeg },
      playerPos: playerGroup.position,
      playerAngle: 0,
      vehicles: vehicleList,
      trafficVehicles: trafficCars,
      npcs: npcList,
      incidentGroups,
      isGrounded: true
    };

    // ===============================================================
    // 11. MAIN GAME ENGINE ANIMATION & PHYSICS LOOP
    // ===============================================================
    let animFrameId;
    const wState = worldRef.current;

    const animateLoop = () => {
      animFrameId = requestAnimationFrame(animateLoop);
      const delta = Math.min(0.1, wState.clock.getDelta());
      wState.animTime += delta;

      // Animate Incidents (Punching combatants & alert bobbing)
      incidentGroups.forEach(ig => {
        if (!ig.userData.resolved) {
          ig.userData.a1.rotation.y = Math.sin(wState.animTime * 7) * 0.4;
          ig.userData.a2.rotation.y = -Math.sin(wState.animTime * 7) * 0.4;
          ig.userData.a1.position.x = -0.8 + Math.sin(wState.animTime * 9) * 0.25;
          ig.userData.a2.position.x = 0.8 - Math.sin(wState.animTime * 9) * 0.25;
          ig.userData.alertSprite.position.y = 3.8 + Math.sin(wState.animTime * 4) * 0.3;
        } else {
          // Resolved: stand peacefully
          ig.userData.a1.rotation.y = 0;
          ig.userData.a2.rotation.y = 0;
          ig.userData.a1.position.x = -1.2;
          ig.userData.a2.position.x = 1.2;
          ig.userData.alertSprite.position.y = 3.5;
        }
      });

      // Animate AI Traffic Cars
      wState.trafficVehicles.forEach(tc => {
        const dMove = tc.userData.speed * delta;
        if (tc.userData.isEW) {
          tc.position.x += dMove;
          if (tc.position.x > 180) tc.position.x = -180;
        } else {
          tc.position.z += dMove;
          if (tc.position.z > 180) tc.position.z = -180;
        }
      });

      // Animate Pedestrians Walking
      wState.npcs.forEach(npc => {
        const nSpeed = 2.5 * delta * npc.userData.walkDir;
        if (npc.userData.axis === 'x') {
          npc.position.x += nSpeed;
          if (Math.abs(npc.position.x) > 110) npc.userData.walkDir *= -1;
          npc.rotation.y = npc.userData.walkDir > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
          npc.position.z += nSpeed;
          if (Math.abs(npc.position.z) > 110) npc.userData.walkDir *= -1;
          npc.rotation.y = npc.userData.walkDir > 0 ? 0 : Math.PI;
        }
      });

      // Player Movement: Driving vs On-Foot
      if (wState.currentVehicle) {
        // DRIVING PHYSICS
        const v = wState.currentVehicle;
        const vData = v.userData;
        const accel = 20.0 * delta;
        const turnSpeed = 2.4 * delta;
        const friction = 0.96;

        if (wState.keys['KeyW'] || wState.keys['ArrowUp']) {
          vData.speed = Math.min(vData.maxSpeed, vData.speed + accel);
        } else if (wState.keys['KeyS'] || wState.keys['ArrowDown']) {
          vData.speed = Math.max(-10, vData.speed - accel);
        } else {
          vData.speed *= friction;
        }

        // Handbrake
        if (wState.keys['Space']) {
          vData.speed *= 0.88;
        }

        if (Math.abs(vData.speed) > 0.1) {
          if (wState.keys['KeyA'] || wState.keys['ArrowLeft']) vData.angle += turnSpeed;
          if (wState.keys['KeyD'] || wState.keys['ArrowRight']) vData.angle -= turnSpeed;
        }

        v.rotation.y = vData.angle;
        v.translateOnAxis(new THREE.Vector3(1, 0, 0), vData.speed * delta);

        const kmh = Math.round(Math.abs(vData.speed) * 3.8);
        setCurrentSpeed(kmh);

        // Third-person vehicle chase camera
        const camTarget = v.position.clone().add(new THREE.Vector3(
          -Math.cos(vData.angle) * 10,
          5.8,
          Math.sin(vData.angle) * 10
        ));
        camera.position.lerp(camTarget, 0.14);
        camera.lookAt(v.position.clone().add(new THREE.Vector3(0, 1.4, 0)));
      } else {
        // ON-FOOT MOVEMENT
        const moveSpeed = (wState.keys['ShiftLeft'] ? 9.5 : 5.5) * selectedChar.speed * delta;
        const rotSpeed = 3.4 * delta;
        let isMoving = false;

        if (wState.keys['KeyA'] || wState.keys['ArrowLeft']) wState.playerAngle += rotSpeed;
        if (wState.keys['KeyD'] || wState.keys['ArrowRight']) wState.playerAngle -= rotSpeed;
        playerGroup.rotation.y = wState.playerAngle;

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), wState.playerAngle);
        if (wState.keys['KeyW'] || wState.keys['ArrowUp']) {
          playerGroup.position.addScaledVector(forward, moveSpeed);
          isMoving = true;
        }
        if (wState.keys['KeyS'] || wState.keys['ArrowDown']) {
          playerGroup.position.addScaledVector(forward, -moveSpeed * 0.6);
          isMoving = true;
        }

        // Gravity & Jump Physics
        if (!wState.isGrounded) {
          wState.playerVelocity.y -= 22 * delta;
          playerGroup.position.y += wState.playerVelocity.y * delta;
          if (playerGroup.position.y <= 0) {
            playerGroup.position.y = 0;
            wState.playerVelocity.y = 0;
            wState.isGrounded = true;
          }
        }

        // Animated limb swings
        if (isMoving) {
          const swing = Math.sin(wState.animTime * (wState.keys['ShiftLeft'] ? 16 : 10));
          wState.playerLimbs.leftLeg.rotation.x = swing * 0.6;
          wState.playerLimbs.rightLeg.rotation.x = -swing * 0.6;
          wState.playerLimbs.leftArm.rotation.x = -swing * 0.5;
          wState.playerLimbs.rightArm.rotation.x = swing * 0.5;
        } else {
          wState.playerLimbs.leftLeg.rotation.x = 0;
          wState.playerLimbs.rightLeg.rotation.x = 0;
          wState.playerLimbs.leftArm.rotation.x = 0;
          wState.playerLimbs.rightArm.rotation.x = 0;
        }

        // Smooth camera behind player
        const camTarget = playerGroup.position.clone().add(new THREE.Vector3(
          Math.sin(wState.playerAngle) * 6.5,
          4.0,
          Math.cos(wState.playerAngle) * 6.5
        ));
        camera.position.lerp(camTarget, 0.12);
        camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.7, 0)));
      }

      // Proximity Checks (Vehicles, NPCs, Incidents)
      const currentPos = wState.currentVehicle ? wState.currentVehicle.position : playerGroup.position;

      // 1. Check nearby vehicle
      let closeVeh = null;
      if (!wState.currentVehicle) {
        wState.vehicles.forEach(veh => {
          if (currentPos.distanceTo(veh.position) < 4.2) closeVeh = veh;
        });
      }
      wState.nearbyVehicle = closeVeh;
      setNearbyVehicle(closeVeh);

      // 2. Check nearby NPC
      let closeNpc = null;
      wState.npcs.forEach(npc => {
        if (currentPos.distanceTo(npc.position) < 3.8) closeNpc = npc;
      });
      wState.nearbyNpc = closeNpc;
      setNearbyNpc(closeNpc);

      // 3. Check nearby violence incident
      let closeInc = null;
      incidentGroups.forEach(ig => {
        if (currentPos.distanceTo(ig.position) < 12.0) {
          closeInc = ig.userData;
        }
      });
      wState.activeNearbyIncident = closeInc;
      setActiveIncident(closeInc);

      // Compass calculation
      const rot = ((-playerGroup.rotation.y * 180) / Math.PI + 360) % 360;
      if (rot >= 337.5 || rot < 22.5) setCompassHeading('N');
      else if (rot >= 22.5 && rot < 67.5) setCompassHeading('NE');
      else if (rot >= 67.5 && rot < 112.5) setCompassHeading('E');
      else if (rot >= 112.5 && rot < 157.5) setCompassHeading('SE');
      else if (rot >= 157.5 && rot < 202.5) setCompassHeading('S');
      else if (rot >= 202.5 && rot < 247.5) setCompassHeading('SW');
      else if (rot >= 247.5 && rot < 292.5) setCompassHeading('W');
      else setCompassHeading('NW');

      // District detection based on coordinates
      let dName = 'Central Downtown';
      if (currentPos.z > 20 && currentPos.z < 100 && Math.abs(currentPos.x) < 50) dName = 'Central Park & Pond';
      else if (currentPos.x < -60 && currentPos.z < -60) dName = 'Industrial Loading Sector';
      else if (currentPos.z < -80 && Math.abs(currentPos.x) < 60) dName = 'Civic Safety & Hospital Hub';
      else if (currentPos.x > 50 && currentPos.z > 20) dName = 'Pine Crest Residential Suburb';
      else if (currentPos.x < -40 && currentPos.z > -50 && currentPos.z < 50) dName = 'West Market Shopping District';
      setActiveDistrict(dName);

      // Render 2D Mini-Map Radar
      renderRadar(currentPos, playerGroup.rotation.y);

      renderer.render(scene, camera);
    };

    animateLoop();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [gameState, selectedChar]);

  // Render 2D Radar Canvas
  const renderRadar = (pPos, pAngle) => {
    const cvs = miniMapCanvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const size = cvs.width;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    // Background Radar Circle
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Radar Concentric Grid
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, center * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Radar Scale
    const scale = 1.3;
    const toRX = (wx) => center + (wx - pPos.x) * scale;
    const toRY = (wz) => center + (wz - pPos.z) * scale;

    // 1. Draw Safe Zones on Radar (Green #10b981) - Police HQ & Hospital
    const safeZones = [
      { name: 'Police HQ', pos: [-10, -80] },
      { name: 'Hospital', pos: [-15, -110] }
    ];
    safeZones.forEach(sz => {
      const sx = toRX(sz.pos[0]);
      const sy = toRY(sz.pos[1]);
      if (Math.hypot(sx - center, sy - center) < center - 6) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 2. Draw Special Locations on Radar (Purple #a855f7) - Central Park Pond & Gas Station
    const specialLocs = [
      { name: 'Central Park', pos: [-20, 50] },
      { name: 'Gas Station', pos: [80, -45] }
    ];
    specialLocs.forEach(sl => {
      const px = toRX(sl.pos[0]);
      const py = toRY(sl.pos[1]);
      if (Math.hypot(px - center, py - center) < center - 6) {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 3. Draw Active Mission Points on Radar (Yellow #f59e0b) - Central Crossing
    const mx = toRX(0);
    const my = toRY(0);
    if (Math.hypot(mx - center, my - center) < center - 6) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Draw Vehicles on Radar (Blue #38bdf8)
    worldRef.current.vehicles.forEach(veh => {
      const vx = toRX(veh.position.x);
      const vy = toRY(veh.position.z);
      if (Math.hypot(vx - center, vy - center) < center - 6) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(vx, vy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Draw Incidents on Radar (Red #ef4444 for active, Green #10b981 for resolved)
    INCIDENT_DEFINITIONS.forEach(inc => {
      const ix = toRX(inc.pos[0]);
      const iy = toRY(inc.pos[2]);
      if (Math.hypot(ix - center, iy - center) < center - 6) {
        const isResolved = reportedIncidents.has(inc.id);
        ctx.fillStyle = isResolved ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(ix, iy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(isResolved ? '✓' : '!', ix - 2.5, iy + 3);
      }
    });

    // 6. Draw Player Heading Arrow in Center (Cyan #00f0ff)
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-pAngle);
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5.5, 6);
    ctx.lineTo(-5.5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // =================================================================
  // VIEW 1: CHARACTER SELECTION SCREEN
  // =================================================================
  if (gameState === 'select') {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 py-4 font-mono select-none">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                <span>VIGIL: INFINITE OPEN-WORLD CITY</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  3D SIMULATOR v2.0
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Large connected metropolis &bull; Drive cars &bull; Talk to citizens &bull; Detect violence
              </p>
            </div>
          </div>

          <button
            onClick={onBackToWebsite}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            &larr; BACK TO WEBSITE
          </button>
        </div>

        {/* Character Selection Cards */}
        <div className="rounded-3xl bg-[#020614]/90 border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-[0_0_40px_rgba(0,240,255,0.1)]">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-widest">STEP 1</span>
            <h2 className="text-2xl font-black text-white">SELECT YOUR OPERATIVE</h2>
            <p className="text-xs text-slate-400 font-sans">
              Choose an archetype to deploy into the open-world surveillance sector.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {CHARACTERS.map((char) => {
              const isSelected = selectedChar.id === char.id;
              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-3 relative group ${
                    isSelected
                      ? 'bg-[#081533] border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.35)] scale-105'
                      : 'bg-[#030918] border-slate-800 hover:border-cyan-500/40 text-slate-400'
                  }`}
                >
                  {/* Stylized Avatar Silhouette */}
                  <div
                    style={{ backgroundColor: char.color }}
                    className="w-20 h-24 rounded-2xl flex flex-col items-center justify-between p-2 shadow-lg group-hover:scale-105 transition-transform"
                  >
                    <div
                      style={{ backgroundColor: char.hairColor }}
                      className="w-8 h-8 rounded-full border-2 border-white/20 mt-1"
                    />
                    <div className="w-10 h-6 rounded bg-black/30" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{char.name}</h3>
                    <span className="text-[10px] text-cyan-300 font-bold block mt-0.5">
                      {char.trait}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-2 font-sans leading-normal">
                      {char.desc}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00f0ff] flex items-center justify-center text-slate-950 font-bold text-xs">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleConfirmCharacter}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-105 cursor-pointer"
            >
              <span>ENTER THE EXPANDED CITY WORLD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* City Districts Overview */}
        <div className="rounded-2xl bg-[#030714] border border-slate-800 p-6 space-y-3 text-xs text-slate-400">
          <div className="text-white font-bold text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>METROPOLITAN SECTORS TO EXPLORE:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <strong className="text-white block">Downtown Skyscrapers</strong>
              High-rises, corporate plazas, neon advertising.
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <strong className="text-white block">Central Park & Pond</strong>
              Trees, footpaths, bridges, and relaxing greens.
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <strong className="text-white block">Shopping District</strong>
              Avenues, market stores, cafes, street awnings.
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <strong className="text-white block">Industrial Zone</strong>
              Warehouses, freight shipping containers, docks.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =================================================================
  // VIEW 2: LOADING SCREEN
  // =================================================================
  if (gameState === 'loading') {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center text-center font-mono space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-[#00f0ff] animate-pulse shadow-[0_0_30px_rgba(0,240,255,0.3)]">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">GENERATING EXPANDED OPEN-WORLD CITY...</h2>
        <p className="text-xs text-slate-400">
          Deploying roads, vehicles, citizens, and active violence incidents.
        </p>
        <div className="w-64 h-2 rounded-full bg-slate-900 border border-cyan-500/30 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 w-full animate-[pulse_1s_infinite]" />
        </div>
      </div>
    );
  }

  // =================================================================
  // VIEW 3: ACTIVE 3D OPEN-WORLD GAMEPLAY
  // =================================================================
  return (
    <div className="relative w-full h-[88vh] rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl font-mono select-none bg-black">
      {/* Three.js 3D Viewport */}
      <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full" />

      {/* ============================================================= */}
      {/* HUD OVERLAYS (STRICT GAMING LAYOUT)                           */}
      {/* Top Left: MISSION                                             */}
      {/* Top Right: SCORE, LEVEL, XP                                   */}
      {/* Bottom Left: MINIMAP                                          */}
      {/* Bottom Right: CONTROLS                                        */}
      {/* Center: EVENT ALERT                                           */}
      {/* ============================================================= */}

      {/* 1. TOP-LEFT: MISSION PANEL */}
      <div className="absolute top-4 left-4 z-20 max-w-xs bg-black/85 border border-amber-500/40 rounded-2xl p-3.5 text-xs space-y-2.5 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.15)] pointer-events-auto">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold font-display text-xs">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>MISSION OBJECTIVES</span>
          </div>
          <span className="text-[10px] font-tech text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            8 SITES
          </span>
        </div>

        {/* Primary Mission */}
        <div className="space-y-1 font-tech">
          <div className="flex justify-between text-slate-200 text-[11px]">
            <span>Witness violence incidents:</span>
            <span className="text-amber-300 font-bold">{missions.incidentsWitnessed} / {missions.targetIncidents}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${(missions.incidentsWitnessed / missions.targetIncidents) * 100}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
            />
          </div>
        </div>

        {/* Secondary Objectives */}
        <div className="pt-1.5 border-t border-white/5 space-y-1 font-tech text-[10px] text-slate-400">
          <div className="flex justify-between">
            <span>Interview citizens:</span>
            <span className={missions.peopleTalked >= missions.targetPeople ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {missions.peopleTalked}/{missions.targetPeople}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Drive distinct vehicles:</span>
            <span className={missions.vehiclesDriven.size >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {missions.vehiclesDriven.size}/2
            </span>
          </div>
          <div className="flex justify-between">
            <span>Explore city sectors:</span>
            <span className="text-cyan-300 font-bold">{missions.districtsExplored.size}/6</span>
          </div>
        </div>
      </div>

      {/* 2. TOP-RIGHT: SCORE, LEVEL, XP */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5 pointer-events-auto">
        {/* Score Pill (Amber/Yellow) */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-950/90 border border-amber-500/60 text-amber-300 font-tech font-black text-xs shadow-xl backdrop-blur-md">
          <span>⭐ SCORE: {score}</span>
        </div>

        {/* Level Badge (Purple) */}
        <div className="px-3 py-2 rounded-2xl bg-purple-950/90 border border-purple-500/60 text-purple-300 font-tech font-bold text-xs shadow-xl backdrop-blur-md">
          LEVEL {level}
        </div>

        {/* XP Progress (Purple/Emerald) */}
        <div className="flex flex-col items-end bg-black/85 border border-slate-700 px-3 py-1.5 rounded-2xl text-[10px] font-tech backdrop-blur-md">
          <span className="text-slate-300 font-bold">XP: {xp} / 250</span>
          <div className="w-20 h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden border border-slate-800">
            <div
              style={{ width: `${(xp / 250) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Exit to Website */}
        <button
          onClick={onBackToWebsite}
          className="px-3 py-2 rounded-2xl bg-black/80 hover:bg-black border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-tech font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>EXIT</span>
        </button>
      </div>

      {/* Top Center: Compass & Current District Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-black/85 border border-cyan-500/40 text-xs font-tech text-slate-300 backdrop-blur-md shadow-xl pointer-events-none">
        <Compass className="w-4 h-4 text-cyan-400" />
        <span className="font-bold text-white">HEADING: {compassHeading}</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-300 font-bold">{activeDistrict.toUpperCase()}</span>
      </div>

      {/* 3. CENTER: EVENT ALERT (Red Alert when Detected, Green Success when Reported) */}
      {/* Red Alert: Incident in proximity */}
      {activeIncident && !reportedIncidents.has(activeIncident.id) && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce">
          <div className="px-6 py-3.5 rounded-2xl bg-red-950/95 border-2 border-red-500 text-red-100 font-tech font-bold text-xs tracking-wider shadow-[0_0_40px_rgba(239,68,68,0.8)] flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="font-black text-white">🔴 VIOLENCE INCIDENT DETECTED</span>
            </div>
            <div className="text-[11px] text-red-200">
              {activeIncident.title} ({activeIncident.district})
            </div>
          </div>

          <button
            onClick={() => handleReportIncident(activeIncident)}
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-tech font-black text-xs tracking-wider shadow-[0_0_25px_rgba(255,255,255,0.4)] transition cursor-pointer flex items-center gap-2 hover:scale-105"
          >
            <span>[PRESS E] WITNESS / REPORT INCIDENT</span>
            <span className="text-emerald-700 font-black">+50 POINTS</span>
          </button>
        </div>
      )}

      {/* Green Success Toast: Just reported an incident */}
      {lastReportedToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-fadeIn">
          <div className="px-6 py-3 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 text-emerald-100 font-tech font-bold text-xs tracking-wider shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>🟢 GREEN SUCCESS: INCIDENT REPORTED (+50 POINTS)</span>
          </div>
        </div>
      )}

      {/* Vehicle Entry Prompt */}
      {nearbyVehicle && !isDriving && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => enterVehicle(nearbyVehicle)}
            className="px-6 py-3 rounded-2xl bg-cyan-950/95 hover:bg-cyan-900 border-2 border-[#00f0ff] text-white font-tech font-bold text-xs tracking-wider shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-2.5 cursor-pointer hover:scale-105 transition"
          >
            <Car className="w-4 h-4 text-[#00f0ff]" />
            <span>[PRESS E] DRIVE {nearbyVehicle.userData.name.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* NPC Dialogue Prompt */}
      {nearbyNpc && !activeDialog && !isDriving && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => openNpcDialog(nearbyNpc)}
            className="px-6 py-3 rounded-2xl bg-[#081533]/95 hover:bg-[#0c204d] border-2 border-sky-400 text-white font-tech font-bold text-xs tracking-wider shadow-xl flex items-center gap-2.5 cursor-pointer hover:scale-105 transition"
          >
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <span>[PRESS E] TALK TO {nearbyNpc.userData.name.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* Speedometer & Driving HUD */}
      {isDriving && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 bg-black/90 border-2 border-cyan-500/60 px-8 py-3.5 rounded-2xl backdrop-blur-md shadow-2xl font-tech">
          <div className="text-center">
            <div className="text-3xl font-black text-[#00f0ff]">{currentSpeed}</div>
            <div className="text-[10px] text-slate-400 font-bold">KM/H &bull; {activeVehicleType}</div>
          </div>
          <div className="text-[10px] text-slate-400 space-y-0.5 border-l border-slate-700 pl-4 text-left">
            <div>W / Up: Accelerate</div>
            <div>S / Down: Brake &amp; Reverse</div>
            <div>Space: Handbrake</div>
            <div>H: Horn</div>
          </div>
          <button
            onClick={exitVehicle}
            className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500 text-red-200 font-bold text-xs transition cursor-pointer"
          >
            [PRESS F] EXIT VEHICLE
          </button>
        </div>
      )}

      {/* 4. BOTTOM-LEFT: MINIMAP WITH SEMANTIC COLOR SYSTEM */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start gap-2">
        <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl border-2 border-cyan-500/50 bg-black/80 backdrop-blur-md">
          <canvas ref={miniMapCanvasRef} width={144} height={144} className="w-full h-full" />
        </div>
        {/* Semantic Color Legend */}
        <div className="p-2 rounded-xl bg-black/90 border border-cyan-900/40 text-[9px] font-tech text-slate-300 space-y-1 backdrop-blur-md max-w-[155px] text-left">
          <div className="flex items-center justify-between">
            <span className="text-cyan-300 font-bold">▲ Cyan: Player</span>
            <span className="text-red-400 font-bold">● Red: Violence</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sky-400">● Blue: Vehicle</span>
            <span className="text-emerald-400">● Green: Safe</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-400">● Yellow: Mission</span>
            <span className="text-purple-400">● Purple: Landmark</span>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM-RIGHT: CONTROLS & ACTIONS CARD */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* Controls Quick Reference Card */}
        <div className="p-3.5 rounded-2xl bg-black/85 border border-cyan-900/40 text-left font-tech text-[10px] space-y-1.5 shadow-2xl backdrop-blur-md max-w-xs">
          <div className="text-cyan-400 font-bold border-b border-cyan-900/30 pb-1 flex items-center justify-between">
            <span>CONTROLS</span>
            <span className="text-[9px] text-slate-500">QUICK REFERENCE</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
            <div><strong className="text-white">[WASD]</strong> Move / Drive</div>
            <div><strong className="text-white">[Shift]</strong> Sprint</div>
            <div><strong className="text-white">[Space]</strong> Jump / Brake</div>
            <div><strong className="text-white">[E]</strong> Interact / Report</div>
            <div><strong className="text-white">[F]</strong> Exit Car</div>
            <div><strong className="text-white">[M]</strong> Full City Map</div>
          </div>
        </div>

        {/* Action Buttons: City Map & Phone */}
        <div className="flex items-center gap-2 font-tech">
          <button
            onClick={() => setShowFullMap(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs shadow-xl transition cursor-pointer"
          >
            <MapIcon className="w-4 h-4 text-cyan-400" />
            <span>CITY MAP [M]</span>
          </button>

          <button
            onClick={() => setShowPhoneMenu(!showPhoneMenu)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081533]/90 hover:bg-[#0c204d] border border-cyan-500/50 text-cyan-300 font-bold text-xs shadow-xl transition cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>PHONE [P]</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SMARTPHONE MENU MODAL                                         */}
      {/* ============================================================= */}
      {showPhoneMenu && (
        <div className="absolute bottom-20 right-4 w-64 bg-[#070e22]/95 border-2 border-cyan-500/50 rounded-3xl p-4 shadow-2xl z-30 text-xs space-y-3 backdrop-blur-md animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-white font-bold text-xs flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>SECURITY SMARTPHONE</span>
            </span>
            <button onClick={() => setShowPhoneMenu(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div onClick={() => setShowFullMap(true)} className="p-2 rounded-xl bg-[#0b1530] hover:bg-cyan-950 border border-slate-800 hover:border-cyan-400 cursor-pointer">
              <MapIcon className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span>City Map</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0b1530] border border-slate-800 text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span>Missions</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0b1530] border border-slate-800 text-slate-300">
              <Car className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span>Vehicles</span>
            </div>
            <div onClick={() => audioSynthesizer.playShutter()} className="p-2 rounded-xl bg-[#0b1530] hover:bg-slate-800 border border-slate-800 cursor-pointer">
              <CameraIcon className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <span>Snap Photo</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0b1530] border border-slate-800 text-slate-300">
              <User className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <span>Operative</span>
            </div>
            <div onClick={onBackToWebsite} className="p-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 cursor-pointer">
              <X className="w-4 h-4 mx-auto mb-1" />
              <span>Exit Game</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* FULL CITY MAP MODAL (Opened with [M] or Phone)                */}
      {/* ============================================================= */}
      {showFullMap && (
        <div className="absolute inset-4 bg-black/90 border-2 border-cyan-500/60 rounded-3xl z-40 p-6 flex flex-col justify-between backdrop-blur-lg shadow-2xl animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-black text-sm tracking-wide">
                METROPOLITAN SECURITY SURVEILLANCE MAP
              </span>
            </div>
            <button onClick={() => setShowFullMap(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* District Grid Layout Map */}
          <div className="grid grid-cols-3 grid-rows-3 gap-3 flex-1 my-4 text-center">
            <div className="rounded-2xl bg-[#071126] border border-slate-800 p-3 flex flex-col justify-center items-center">
              <span className="text-amber-400 font-bold text-xs">INDUSTRIAL SECTOR</span>
              <span className="text-[10px] text-slate-400">Warehouses & Freight Docks</span>
              <span className="text-[10px] text-red-400 mt-1">🔴 Incident #05 (Loading Dock)</span>
            </div>

            <div className="rounded-2xl bg-[#0c1f3d] border border-cyan-500/40 p-3 flex flex-col justify-center items-center">
              <span className="text-cyan-300 font-bold text-xs">CIVIC SAFETY & HOSPITAL HUB</span>
              <span className="text-[10px] text-slate-400">Police HQ & Metro Medical</span>
              <span className="text-[10px] text-red-400 mt-1">🔴 Incident #08 (Triage Gate)</span>
            </div>

            <div className="rounded-2xl bg-[#071126] border border-slate-800 p-3 flex flex-col justify-center items-center">
              <span className="text-purple-400 font-bold text-xs">HIGHWAY FUEL OASIS</span>
              <span className="text-[10px] text-slate-400">Gas Station & Highway 9</span>
              <span className="text-[10px] text-red-400 mt-1">🔴 Incident #06 (Fuel Pump)</span>
            </div>

            <div className="rounded-2xl bg-[#071126] border border-slate-800 p-3 flex flex-col justify-center items-center">
              <span className="text-emerald-400 font-bold text-xs">COMMERCIAL DISTRICT</span>
              <span className="text-[10px] text-slate-400">Market Avenues & Retail</span>
              <span className="text-[10px] text-red-400 mt-1">🔴 Incident #01 (Market Store)</span>
            </div>

            <div className="rounded-2xl bg-cyan-950/40 border-2 border-cyan-400 p-3 flex flex-col justify-center items-center shadow-[0_0_25px_rgba(0,240,255,0.2)]">
              <span className="text-[#00f0ff] font-black text-sm">DOWNTOWN CENTER</span>
              <span className="text-[10px] text-slate-300">Skyscrapers & 4-Way Crossroad</span>
              <span className="text-[10px] text-amber-300 font-bold mt-1">⭐ YOU ARE IN THIS SECTOR</span>
            </div>

            <div className="rounded-2xl bg-[#071126] border border-slate-800 p-3 flex flex-col justify-center items-center">
              <span className="text-rose-400 font-bold text-xs">TRANSIT PLAZA</span>
              <span className="text-[10px] text-slate-400">Civic Bus Depot</span>
              <span className="text-[10px] text-red-400 mt-1">🔴 Incident #04 (Bus Shelter)</span>
            </div>

            <div className="rounded-2xl bg-[#071126] border border-slate-800 p-3 flex flex-col justify-center items-center">
              <span className="text-sky-400 font-bold text-xs">SOUTH COMMERCE</span>
              <span className="text-[10px] text-slate-400">Stores & Parking Lots</span>
              <span className="text-[10px] text-red-400 mt-1">🔴 Incident #02 (Car Scrape)</span>
            </div>

            <div className="rounded-2xl bg-[#062016] border border-emerald-500/40 p-3 flex flex-col justify-center items-center">
              <span className="text-emerald-300 font-bold text-xs">CENTRAL PARK & POND</span>
              <span className="text-[10px] text-slate-400">Greenway Trail & Footbridge</span>
              <span className="text-[10px] text-red-400 mt-1">🔴 Incident #03 (Trail Dispute)</span>
            </div>

            <div className="rounded-2xl bg-[#071126] border border-slate-800 p-3 flex flex-col justify-center items-center">
              <span className="text-amber-300 font-bold text-xs">PINE CREST RESIDENTIAL</span>
              <span className="text-[10px] text-slate-400">Suburban Homes & Alleys</span>
              <span className="text-[10px] text-red-400 mt-1">🔴 Incident #07 (Alley Quarrel)</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-4">
              <span>🔴 Active Violence Threat</span>
              <span>🟢 Resolved Threat</span>
              <span>🔵 Parked Vehicle</span>
            </div>
            <button
              onClick={() => setShowFullMap(false)}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              CLOSE MAP
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* NPC DIALOGUE OVERLAY                                          */}
      {/* ============================================================= */}
      {activeDialog && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl bg-[#070e22]/95 border-2 border-cyan-500/50 rounded-3xl p-5 shadow-2xl z-30 text-xs space-y-3 backdrop-blur-md animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 font-bold text-xs">
                {activeDialog.speaker} &bull; {activeDialog.role}
              </span>
            </div>
            <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-100 leading-relaxed font-sans text-sm">
            "{activeDialog.dialogue}"
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {activeDialog.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (opt.reply) {
                    setActiveDialog(prev => ({ ...prev, dialogue: opt.reply }));
                  } else {
                    setActiveDialog(null);
                  }
                }}
                className="p-2.5 rounded-xl bg-[#0b1530] hover:bg-[#10224d] border border-slate-800 text-left text-cyan-200 hover:text-white transition cursor-pointer text-xs flex items-center justify-between"
              >
                <span>&bull; {opt.text}</span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* REWARD / INCIDENT REPORTED CELEBRATION MODAL                  */}
      {/* ============================================================= */}
      {showRewardModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-[#030918] border-2 border-amber-400/90 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_60px_rgba(245,158,11,0.35)] animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-300 text-3xl shadow-xl">
              ⭐
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-amber-300">+{rewardData.points} POINTS</h3>
              <p className="text-xs text-white font-bold tracking-wide uppercase">
                {rewardData.title}
              </p>
              <p className="text-[11px] text-slate-400 font-sans mt-2 leading-relaxed">
                {rewardData.note}
              </p>
            </div>

            <button
              onClick={() => setShowRewardModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs tracking-wider uppercase transition shadow-xl cursor-pointer"
            >
              CONTINUE PATROL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
