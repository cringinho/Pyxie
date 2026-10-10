import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, ShieldAlert, X, ExternalLink, User, Calendar, Image as ImageIcon } from 'lucide-react';

export default function MuseumScene({ t }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [arts, setArts] = useState([]);
  const [selectedArt, setSelectedArt] = useState(null);
  const [shieldModalOpen, setShieldModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  // Fallback default artworks in case /api/museum/arts has few or 0 items
  const defaultArts = [
    {
      id: 'art-01',
      author: 'Pyxie Core',
      description: 'Astaroth no Portal Arcano • Ilustração oficial do Bosque Violeta.',
      imageUrl: '/assets/pyxie/pyxie_space_banner.jpg',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'art-02',
      author: 'Melody Labs',
      description: 'O Arcano O Mago • Pintura digital inspirada nos 78 arcanos da Pyxie.',
      imageUrl: '/assets/pyxie/og_banner_hd.png',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'art-03',
      author: 'Cringelândia Art',
      description: 'Pyxie Tsundere Rebelde • Mascote da comunidade em alta resolução.',
      imageUrl: '/assets/pyxie/pyxie_mascot.png',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'art-04',
      author: 'Pixel Guild',
      description: 'Pixelart Nostálgica • Render retrô em 32x32 da fada gótica.',
      imageUrl: '/assets/pyxie/pyxie_pixelart.png',
      createdAt: new Date().toISOString(),
    },
  ];

  // Fetch arts from backend
  useEffect(() => {
    fetch('/api/museum/arts?limit=12')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.arts) && data.arts.length > 0) {
          setArts(data.arts);
        } else {
          setArts(defaultArts);
        }
      })
      .catch(() => {
        setArts(defaultArts);
      });
  }, []);

  // IntersectionObserver to lazy-initialize WebGL only when approaching viewport (Core Web Vitals LCP)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Three.js Scene Setup
  useEffect(() => {
    if (!isVisible || !canvasRef.current || arts.length === 0) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('WebGL não suportado:', err);
      setIsWebGLSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07040d, 0.04);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = Math.min(Math.max(width * 0.55, 380), 540);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Starry particles cloud
    const particleCount = 400;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 15;

      const isPink = Math.random() > 0.5;
      colors[i] = isPink ? 0.95 : 0.55;
      colors[i + 1] = isPink ? 0.2 : 0.35;
      colors[i + 2] = isPink ? 0.6 : 0.95;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xe60067, 3, 20);
    pointLight.position.set(0, 3, 5);
    scene.add(pointLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 3, 20);
    violetLight.position.set(0, -3, 3);
    scene.add(violetLight);

    // Globo das Artes Mágicas (Spherical Projection Globe)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const sphereRadius = 3.3;

    // 1. Esfera Celeste Wireframe (Meridianos e Paralelos)
    const globeWireGeo = new THREE.SphereGeometry(sphereRadius, 24, 16);
    const globeWireMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const globeWireMesh = new THREE.Mesh(globeWireGeo, globeWireMat);
    globeGroup.add(globeWireMesh);

    // 2. Núcleo Holográfico Enegrecido / Atmosfera Interna
    const innerAuraGeo = new THREE.SphereGeometry(sphereRadius * 0.98, 32, 24);
    const innerAuraMat = new THREE.MeshBasicMaterial({
      color: 0x140726,
      transparent: true,
      opacity: 0.65,
      side: THREE.BackSide,
    });
    globeGroup.add(new THREE.Mesh(innerAuraGeo, innerAuraMat));

    // 3. Anéis Orbitais Celestes (Equador & Meridiano Primário)
    const torusGeo = new THREE.TorusGeometry(sphereRadius + 0.05, 0.02, 16, 64);
    const equatorMat = new THREE.MeshBasicMaterial({ color: 0xe60067, transparent: true, opacity: 0.55 });
    const equatorRing = new THREE.Mesh(torusGeo, equatorMat);
    equatorRing.rotation.x = Math.PI / 2;
    globeGroup.add(equatorRing);

    const meridianMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.4 });
    const meridianRing = new THREE.Mesh(torusGeo, meridianMat);
    globeGroup.add(meridianRing);

    // 4. Cristal Mágico Central (Ponto Focal C)
    const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff3b81, wireframe: true });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 5. Projeção Esférica Tangente de Cartas de Arte (Superfície do Globo)
    const cardGeometry = new THREE.PlaneGeometry(1.22, 1.78);
    const frameGeometry = new THREE.PlaneGeometry(1.3, 1.86);
    const loader = new THREE.TextureLoader();
    const cardMeshes = [];

    // Definição dos cinturões esféricos de latitude (phi) e longitude (theta)
    const sphereSlots = [
      // Cinturão Superior (phi ~ 66°)
      { phi: 1.15, theta: 0 },
      { phi: 1.15, theta: (2 * Math.PI) / 3 },
      { phi: 1.15, theta: (4 * Math.PI) / 3 },
      // Cinturão Equatorial (phi = 90°)
      { phi: Math.PI / 2, theta: 0.35 },
      { phi: Math.PI / 2, theta: 0.35 + (2 * Math.PI) / 5 },
      { phi: Math.PI / 2, theta: 0.35 + (4 * Math.PI) / 5 },
      { phi: Math.PI / 2, theta: 0.35 + (6 * Math.PI) / 5 },
      { phi: Math.PI / 2, theta: 0.35 + (8 * Math.PI) / 5 },
      // Cinturão Inferior (phi ~ 114°)
      { phi: 1.99, theta: 0.8 },
      { phi: 1.99, theta: 0.8 + (2 * Math.PI) / 3 },
      { phi: 1.99, theta: 0.8 + (4 * Math.PI) / 3 },
    ];

    sphereSlots.forEach((slot, index) => {
      const art = arts[index % arts.length];
      const phi = slot.phi;
      const theta = slot.theta;
      const radialDist = sphereRadius + 0.12;

      // Coordenadas esféricas -> Cartesianas (x, y, z)
      const x = Math.sin(phi) * Math.sin(theta) * radialDist;
      const y = Math.cos(phi) * radialDist;
      const z = Math.sin(phi) * Math.cos(theta) * radialDist;

      const texture = loader.load(art.imageUrl || '/assets/pyxie/og_banner_hd.png');
      texture.minFilter = THREE.LinearFilter;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(cardGeometry, material);
      mesh.position.set(x, y, z);

      // Orientação Tangente à Esfera (Vetor normal partindo do centro C)
      mesh.lookAt(x * 2, y * 2, z * 2);

      // Moldura de vidro/neon por trás da carta
      const frameMat = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? 0xe60067 : 0x8b5cf6,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const frameMesh = new THREE.Mesh(frameGeometry, frameMat);
      frameMesh.position.z = -0.01;
      mesh.add(frameMesh);

      mesh.userData = { art, initialPos: mesh.position.clone() };

      globeGroup.add(mesh);
      cardMeshes.push(mesh);
    });

    // Física e Interação de Órbita 3D (Arraste Dual-Axis)
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let angularVelY = 0.002;
    let angularVelX = 0;
    const friction = 0.95;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onPointerDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      previousMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      angularVelY = 0;
      angularVelX = 0;
    };

    const onPointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      if (isDragging) {
        const deltaX = clientX - previousMouseX;
        const deltaY = clientY - previousMouseY;

        angularVelY = deltaX * 0.004;
        angularVelX = deltaY * 0.0025;

        globeGroup.rotation.y += angularVelY;
        globeGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globeGroup.rotation.x + angularVelX));

        previousMouseX = clientX;
        previousMouseY = clientY;
      }

      // Coordenadas de Raycasting
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes);
      if (intersects.length > 0) {
        const hitArt = intersects[0].object.userData.art;
        if (hitArt) setSelectedArt(hitArt);
      }
    };

    const canvasElem = canvasRef.current;
    canvasElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvasElem.addEventListener('click', onClick);

    // Loop de Animação e Renderização
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Inércia e Rotação Ambiente do Globo
      if (!isDragging) {
        globeGroup.rotation.y += angularVelY;
        globeGroup.rotation.x += angularVelX;
        angularVelY *= friction;
        angularVelX *= friction;

        if (Math.abs(angularVelY) < 0.0006) {
          angularVelY = 0.0016; // Rotação cósmica suave contínua
        }
      }

      // Pulsação suave do núcleo mágico
      coreMesh.rotation.y += 0.015;
      coreMesh.rotation.x += 0.01;

      // Parallax de partículas
      particleSystem.rotation.y = elapsedTime * 0.02;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.05) * 0.05;

      // Hover Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes);

      cardMeshes.forEach((mesh) => {
        const isHovered = intersects.length > 0 && intersects[0].object === mesh;
        const targetScale = isHovered ? 1.15 : 1.0;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvasElem.removeEventListener('pointerdown', onPointerDown);
      canvasElem.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, [isVisible, arts]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShieldModalOpen(true);
  };

  return (
    <section id="museu-deck" className="relative py-16 md:py-24 overflow-hidden border-t border-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>{t('museum.badge')}</span>
        </div>
        <h2 className="font-title font-black text-3xl sm:text-4xl text-white tracking-tight">
          {t('museum.title')}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2">
          {t('museum.subtitle')}
        </p>
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        className="art-shield relative w-full max-w-6xl mx-auto h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      >
        {isWebGLSupported ? (
          <canvas ref={canvasRef} className="w-full h-full block" />
        ) : (
          /* Mobile CSS 3D Tilt Fallback */
          <div className="flex gap-4 overflow-x-auto px-4 py-8 w-full scrollbar-none snap-x">
            {arts.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArt(art)}
                className="shrink-0 w-64 h-88 rounded-2xl glass-panel p-3 border border-pink-500/30 snap-center cursor-pointer shadow-lg transform hover:scale-105 transition-all"
              >
                <img
                  src={art.imageUrl}
                  alt={art.author || 'Arte da Comunidade'}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="mt-3 text-left">
                  <div className="text-pink-400 font-bold text-sm">@{art.author}</div>
                  <div className="text-slate-300 text-xs truncate">{art.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ambient Overlay Vignette */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07040D] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#07040D] to-transparent pointer-events-none" />
      </div>

      {/* CTA Button */}
      <div className="mt-8 text-center">
        <a
          href="/museu"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-neon-violet transition-all transform hover:-translate-y-1 active:translate-y-0 border border-purple-400/30"
        >
          <Sparkles className="w-4 h-4 text-pink-300" />
          <span>{t('museum.exploreAll')}</span>
        </a>
      </div>

      {/* INSPECTION MODAL */}
      {selectedArt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div
            onContextMenu={handleContextMenu}
            className="art-shield relative w-full max-w-2xl rounded-3xl glass-panel border border-pink-500/30 p-6 shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setSelectedArt(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-neon-pink">
                <img
                  src={selectedArt.imageUrl}
                  alt={selectedArt.author || 'Arte da Comunidade'}
                  className="w-full h-80 object-cover pointer-events-none select-none"
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-pink-300 border border-pink-500/30">
                  ✦ {selectedArt.id}
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider">
                    {t('museum.author')}
                  </span>
                  <h3 className="font-title font-extrabold text-2xl text-white">
                    @{selectedArt.author}
                  </h3>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedArt.description || 'Obra compartilhada na galeria oficial da comunidade Pyxie.'}
                </p>

                <div className="pt-2 border-t border-purple-500/15 flex items-center gap-2 text-xs text-purple-300/80">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span>
                    {new Date(selectedArt.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="pt-3">
                  <a
                    href="/museu"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-purple-500/30 hover:border-pink-500/50 transition-all"
                  >
                    <span>Ver no Fórum do Museu</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANTI-COPY RIGHT CLICK WARNING MODAL */}
      {shieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl glass-panel border border-pink-500/40 p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center mx-auto text-pink-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="font-title font-bold text-xl text-white">Proteção de Propriedade Visual</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t('museum.artShield')}
            </p>
            <button
              onClick={() => setShieldModalOpen(false)}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink"
            >
              Compreendi
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

