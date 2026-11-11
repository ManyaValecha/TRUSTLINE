import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Shield, Radio, Activity, Eye, EyeOff, RotateCcw } from 'lucide-react';

// Scratch objects allocated once at module scope to avoid GC during animation loop
const _vec3 = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _dummy = new THREE.Object3D();

export type ShieldMode = 'standby' | 'scanning' | 'intercept';

export const ThreeCyberShield: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState<ShieldMode>('scanning');
  const [explodedFactor, setExplodedFactor] = useState(0.25);
  const [rotationSpeed, setRotationSpeed] = useState(1);

  // Mutable refs to pass into the requestAnimationFrame loop without triggering canvas re-renders
  const modeRef = useRef<ShieldMode>(activeMode);
  const explodedRef = useRef(explodedFactor);
  const speedRef = useRef(rotationSpeed);

  useEffect(() => {
    modeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    explodedRef.current = explodedFactor;
  }, [explodedFactor]);

  useEffect(() => {
    speedRef.current = rotationSpeed;
  }, [rotationSpeed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL from GPU renderer string
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090b16, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 1.2, 5.2);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio PBR Environment (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Studio Lighting Rig (Key Light + Cool Hemisphere Fill)
    const ambientHemisphere = new THREE.HemisphereLight(0xa78bfa, 0x090b16, 0.9);
    scene.add(ambientHemisphere);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      const d = 3;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    const cyanRimLight = new THREE.PointLight(0x22d3ee, 3.5, 8);
    cyanRimLight.position.set(-3, -1, -2);
    scene.add(cyanRimLight);

    // 4. Procedural Textures (Brushed Anisotropy Normal / Roughness)
    const createProceduralGridTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#141732';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#2d336b';
        ctx.lineWidth = 2;
        for (let i = 0; i < 256; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 256);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(256, i);
          ctx.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };
    const gridTexture = createProceduralGridTexture();

    // Soft Radial Contact Shadow Ground Plane
    const createContactShadowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
        grad.addColorStop(0.5, 'rgba(5, 7, 18, 0.35)');
        grad.addColorStop(1, 'rgba(9, 11, 22, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
      }
      const shadowTex = new THREE.CanvasTexture(canvas);
      shadowTex.colorSpace = THREE.SRGBColorSpace;
      return shadowTex;
    };
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.25;
    scene.add(shadowMesh);

    // 5. Composite 3–12 Part Procedural Model: TRUSTLINE Cyber Shield (THREE.Group)
    const masterShieldGroup = new THREE.Group();
    masterShieldGroup.position.y = 0.15; // grounded bottom-center pivot
    scene.add(masterShieldGroup);

    // Part 1: Front Beveled Shield Plate
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.4);
    shieldShape.bezierCurveTo(0.6, 1.4, 1.2, 1.1, 1.3, 0.4);
    shieldShape.bezierCurveTo(1.3, -0.6, 0.7, -1.3, 0, -1.6);
    shieldShape.bezierCurveTo(-0.7, -1.3, -1.3, -0.6, -1.3, 0.4);
    shieldShape.bezierCurveTo(-1.2, 1.1, -0.6, 1.4, 0, 1.4);

    const extrudeSettings = {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };
    const shieldPlateGeo = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    shieldPlateGeo.center();

    const shieldPlateMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e3d,
      roughness: 0.28,
      metalness: 0.85,
      map: gridTexture,
    });
    const frontPlateMesh = new THREE.Mesh(shieldPlateGeo, shieldPlateMat);
    frontPlateMesh.castShadow = !isSoftwareGl;
    frontPlateMesh.receiveShadow = !isSoftwareGl;
    masterShieldGroup.add(frontPlateMesh);

    // Part 2: Outer Faceted Titanium Bezel Frame
    const frameGeo = new THREE.TorusGeometry(1.45, 0.05, 12, 48);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.15,
      metalness: 0.95,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    masterShieldGroup.add(frameMesh);

    // Part 3: Inner Gyroscopic Frequency Rings (Counter-Rotating)
    const ringGeo1 = new THREE.TorusGeometry(1.05, 0.035, 16, 48);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      roughness: 0.2,
      metalness: 0.9,
    });
    const gimbalRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    masterShieldGroup.add(gimbalRing1);

    const ringGeo2 = new THREE.TorusGeometry(0.82, 0.03, 16, 48);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      roughness: 0.35,
      metalness: 0.75,
    });
    const gimbalRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    masterShieldGroup.add(gimbalRing2);

    // Part 4: Acoustic Core Prism Emitter
    const coreGeo = new THREE.OctahedronGeometry(0.42, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterShieldGroup.add(coreMesh);

    // Part 5: Instanced Defense Nodes (12 Satellites Orbiting in Ring)
    const nodeCount = 12;
    const nodeGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    instancedNodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    masterShieldGroup.add(instancedNodes);

    // 6. Interactive Raycasting & Mouse Rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = nx;
      mouseY = ny;
    };
    container.addEventListener('pointermove', handlePointerMove);

    // 7. Lossless 60fps Loop with Exponential Damping
    let frameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const speed = speedRef.current;
      const mode = modeRef.current;
      const exploded = explodedRef.current;

      // Color shifts based on defense mode
      if (mode === 'intercept') {
        coreMat.emissive.setHex(0xef4444);
        frameMat.color.setHex(0xef4444);
      } else if (mode === 'scanning') {
        coreMat.emissive.setHex(0x22d3ee);
        frameMat.color.setHex(0x8b5cf6);
      } else {
        coreMat.emissive.setHex(0x22c55e);
        frameMat.color.setHex(0x22c55e);
      }

      // Smooth camera / group rotation damping (1 - Math.exp(-k * dt))
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;
      masterShieldGroup.rotation.y = THREE.MathUtils.damp(
        masterShieldGroup.rotation.y,
        targetRotY + time * 0.3 * speed,
        4.0,
        delta
      );
      masterShieldGroup.rotation.x = THREE.MathUtils.damp(
        masterShieldGroup.rotation.x,
        targetRotX,
        4.0,
        delta
      );

      // Gyroscopic gimbal ring counter-rotations
      gimbalRing1.rotation.x += delta * 1.2 * speed;
      gimbalRing1.rotation.y += delta * 0.8 * speed;
      gimbalRing2.rotation.y -= delta * 1.5 * speed;
      gimbalRing2.rotation.z += delta * 0.9 * speed;

      // Exploded-view layer separation along Z
      frontPlateMesh.position.z = THREE.MathUtils.damp(
        frontPlateMesh.position.z,
        exploded * 0.6,
        6.0,
        delta
      );
      frameMesh.position.z = THREE.MathUtils.damp(
        frameMesh.position.z,
        -exploded * 0.3,
        6.0,
        delta
      );
      coreMesh.position.z = THREE.MathUtils.damp(
        coreMesh.position.z,
        exploded * 0.1,
        6.0,
        delta
      );

      // Core pulse
      const pulse = 1 + Math.sin(time * 3 * speed) * 0.08;
      coreMesh.scale.set(pulse, pulse, pulse);

      // Update instanced satellite nodes
      const radius = 1.6 + exploded * 0.4;
      for (let i = 0; i < nodeCount; i++) {
        const theta = (i / nodeCount) * Math.PI * 2 + time * 0.6 * speed;
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * (radius * 0.6);
        const z = Math.sin(time * 2 + i) * 0.25;

        _dummy.position.set(x, y, z);
        _dummy.updateMatrix();
        instancedNodes.setMatrixAt(i, _dummy.matrix);
      }
      instancedNodes.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(frameId);

      // Cleanup WebGL resources
      renderer.dispose();
      shieldPlateGeo.dispose();
      shieldPlateMat.dispose();
      frameGeo.dispose();
      frameMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      gridTexture.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] rounded-3xl bg-[#090B16] border border-violet-900/30 overflow-hidden shadow-2xl">
      {/* 3D Canvas Mount Ref */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Spec Badge (Clean, Static Status Indicator - Zero Pulsating Dots) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e132a]/90 border border-violet-900/40 text-[11px] text-slate-300 shadow-md">
        <Shield className="w-3.5 h-3.5 text-violet-400" />
        <span className="font-bold text-white uppercase tracking-wider">3D Neural Shield Core</span>
        <span className="text-slate-500">&bull;</span>
        <span className="font-mono text-cyan-400">{activeMode.toUpperCase()}</span>
      </div>

      {/* Viewport Control Dock (Compact horizontal bar pinned bottom-center <= 15% footprint) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[620px] transition-all duration-300 ${
          isCollapsed ? 'translate-y-[85%]' : 'translate-y-0'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Collapse/Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mb-1.5 px-3 py-1 rounded-t-lg bg-[#11152a] hover:bg-[#181d3d] border border-b-0 border-violet-900/40 text-[11px] font-semibold text-slate-300 transition cursor-pointer flex items-center gap-1.5"
          >
            {isCollapsed ? <Eye className="w-3 h-3 text-violet-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
            <span>{isCollapsed ? 'Show 3D Controls' : 'Hide Controls'}</span>
          </button>

          {/* Solid/RGBA Control Surface (No backdrop-filter over WebGL) */}
          <div className="w-full p-3 rounded-2xl bg-[#0c1024] border border-violet-900/50 shadow-2xl space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Defense Mode Pills */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveMode('standby')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeMode === 'standby'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-[#151936] text-slate-400 hover:text-white'
                  }`}
                >
                  Standby
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('scanning')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeMode === 'scanning'
                      ? 'bg-violet-950 text-violet-300 border border-violet-500/50'
                      : 'bg-[#151936] text-slate-400 hover:text-white'
                  }`}
                >
                  Scanning
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('intercept')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeMode === 'intercept'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/60'
                      : 'bg-[#151936] text-slate-400 hover:text-white'
                  }`}
                >
                  Intercept
                </button>
              </div>

              {/* Exploded Slider */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Layers</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={explodedFactor}
                  onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                  className="w-20 accent-violet-500 cursor-pointer"
                />
              </div>

              {/* Rotation Reset */}
              <button
                type="button"
                onClick={() => {
                  setRotationSpeed(rotationSpeed === 0 ? 1 : 0);
                }}
                className="p-1.5 rounded-lg bg-[#151936] text-slate-300 hover:text-white text-xs cursor-pointer"
                title="Toggle rotation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
