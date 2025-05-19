import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/joy';
import * as THREE from 'three';

interface FreeCadViewerProps {
  filePath?: string;
  demoMode?: boolean;
}

const FreeCadViewer: React.FC<FreeCadViewerProps> = ({ filePath, demoMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Referens för att hålla reda på scenen
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: any;
    models: THREE.Object3D[];
    animationFrame?: number;
  }>({
    models: []
  });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Rensa upp tidigare resurser
    const cleanup = () => {
      if (sceneRef.current.animationFrame) {
        cancelAnimationFrame(sceneRef.current.animationFrame);
      }
      
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
        
        if (containerRef.current && containerRef.current.contains(sceneRef.current.renderer.domElement)) {
          containerRef.current.removeChild(sceneRef.current.renderer.domElement);
        }
      }
      
      if (sceneRef.current.scene) {
        // Rensa modeller
        sceneRef.current.models.forEach(model => {
          sceneRef.current.scene?.remove(model);
        });
      }
    };
    
    // Hantera fönsterändringar
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current.camera || !sceneRef.current.renderer) return;
      
      const container = containerRef.current;
      
      sceneRef.current.camera.aspect = container.clientWidth / container.clientHeight;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    // Initialisera 3D-scenen
    const initScene = () => {
      cleanup();
      
      const container = containerRef.current;
      if (!container) return;
      
      // Skapa renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0xf5f5f5);
      container.appendChild(renderer.domElement);
      
      // Skapa scen
      const scene = new THREE.Scene();
      
      // Ljussättning
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(directionalLight);
      
      // Kamera
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(15, 10, 15);
      camera.lookAt(0, 0, 0);
      
      // Skapa orbitcontrols
      import('three/examples/jsm/controls/OrbitControls').then(({ OrbitControls }) => {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.screenSpacePanning = true;
        sceneRef.current.controls = controls;
      });
      
      // Referensrutnät
      const gridHelper = new THREE.GridHelper(20, 20);
      scene.add(gridHelper);
      
      // Axelvisare
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
      
      // Spara referens
      sceneRef.current = {
        scene,
        camera,
        renderer,
        models: sceneRef.current.models,
        animationFrame: sceneRef.current.animationFrame
      };
      
      // Animationsloop
      const animate = () => {
        sceneRef.current.animationFrame = requestAnimationFrame(animate);
        
        if (sceneRef.current.controls) {
          sceneRef.current.controls.update();
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Lägg till fönsterändringshanterare
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        cleanup();
      };
    };
    
    // Ladda modell eller skapa demo
    const loadModelOrDemo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (demoMode) {
          // Ladda demo-modell
          await loadDemoModel();
        } else if (filePath) {
          // Ladda från fil
          await loadModelFromPath(filePath);
        } else {
          // Inget att ladda
          setError("Ingen fil angiven att ladda.");
        }
      } catch (err) {
        setError(`Fel vid laddning av modell: ${err}`);
      } finally {
        setLoading(false);
      }
    };
    
    // Initialisera och ladda
    initScene();
    loadModelOrDemo();
    
    // Cleanup på unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [filePath, demoMode]);
  
  // Ladda en demo-modell
  const loadDemoModel = async () => {
    if (!sceneRef.current.scene) return;
    
    // Rensa tidigare modeller
    sceneRef.current.models.forEach(model => {
      sceneRef.current.scene?.remove(model);
    });
    sceneRef.current.models = [];
    
    // Skapa en enkel FreeCAD-liknande demo-modell
    const group = new THREE.Group();
    
    // Grundplatta
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(10, 1, 10),
      new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    base.position.y = -0.5;
    group.add(base);
    
    // Cylindrar/pelare
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x4d7eb7 });
    
    const positions = [
      [-4, 3, -4],
      [4, 3, -4],
      [4, 3, 4],
      [-4, 3, 4]
    ];
    
    positions.forEach(pos => {
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cylinder.position.set(pos[0], pos[1], pos[2]);
      group.add(cylinder);
    });
    
    // Övre platta
    const topPlate = new THREE.Mesh(
      new THREE.BoxGeometry(10, 1, 10),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    );
    topPlate.position.y = 6.5;
    group.add(topPlate);
    
    // Skapa ett hål i övre plattan (simulera med en cylinder)
    const holeCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 1.1, 32),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })
    );
    holeCylinder.position.set(0, 6.5, 0);
    group.add(holeCylinder);
    
    // Skapa några extra detaljer
    const detailBox = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.5, 4),
      new THREE.MeshStandardMaterial({ color: 0xe74c3c })
    );
    detailBox.position.set(-2, 7, 0);
    group.add(detailBox);
    
    sceneRef.current.scene.add(group);
    sceneRef.current.models.push(group);
    
    // Centrera kameran på modellen
    if (sceneRef.current.camera && sceneRef.current.controls) {
      // Beräkna modellens bounding box
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Uppdatera kameraposition för att passa modellen
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = sceneRef.current.camera.fov * (Math.PI / 180);
      const distance = maxDim / (2 * Math.tan(fov / 2));
      
      const direction = new THREE.Vector3(1, 0.8, 1).normalize();
      sceneRef.current.camera.position.copy(center).add(direction.multiplyScalar(distance * 1.5));
      sceneRef.current.camera.lookAt(center);
      
      // Uppdatera controls
      sceneRef.current.controls.target.copy(center);
    }
  };
  
  // Ladda modell från fil (simulerad)
  const loadModelFromPath = async (path: string) => {
    if (!sceneRef.current.scene) return;
    
    // Rensa modeller
    sceneRef.current.models.forEach(model => {
      sceneRef.current.scene?.remove(model);
    });
    sceneRef.current.models = [];
    
    // Här skulle vi anropa FreeCAD-integrationen för att konvertera & ladda
    // I detta exempel använder vi en liknande demo-modell som ovan, men har 
    // stöd för framtida integration med faktiskt FreeCAD-parsing

    // Simulating a delay for file loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Skapa en demo-modell baserad på "filnamnet"
    const group = new THREE.Group();
    
    if (path.toLowerCase().includes('part')) {
      // En del-liknande modell
      const partGeometry = new THREE.CylinderGeometry(2, 2, 4, 32);
      const partMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
      const part = new THREE.Mesh(partGeometry, partMaterial);
      
      // Skapa hål genom att kombinera flera geometrier
      const holeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
      const holeMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.rotation.x = Math.PI / 2;
      
      group.add(part);
      group.add(hole);
    } else if (path.toLowerCase().includes('assembly')) {
      // En mer komplex assembly
      const baseGeometry = new THREE.BoxGeometry(8, 1, 8);
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = -0.5;
      group.add(base);
      
      // Flera komponenter
      const colors = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf1c40f];
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const component = new THREE.Mesh(
          new THREE.BoxGeometry(1, 2, 1),
          new THREE.MeshStandardMaterial({ color: colors[i] })
        );
        component.position.set(
          Math.cos(angle) * 3,
          1,
          Math.sin(angle) * 3
        );
        group.add(component);
      }
      
      // Centrum-komponent
      const centerPiece = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x9b59b6 })
      );
      centerPiece.position.y = 1;
      group.add(centerPiece);
    } else {
      // Standard CAD-modell
      await loadDemoModel();
      return;
    }
    
    sceneRef.current.scene.add(group);
    sceneRef.current.models.push(group);
    
    // Centrera kameran på modellen
    if (sceneRef.current.camera && sceneRef.current.controls) {
      // Beräkna modellens bounding box
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Uppdatera kameraposition för att passa modellen
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = sceneRef.current.camera.fov * (Math.PI / 180);
      const distance = maxDim / (2 * Math.tan(fov / 2));
      
      const direction = new THREE.Vector3(1, 0.8, 1).normalize();
      sceneRef.current.camera.position.copy(center).add(direction.multiplyScalar(distance * 1.5));
      sceneRef.current.camera.lookAt(center);
      
      // Uppdatera controls
      sceneRef.current.controls.target.copy(center);
    }
  };

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        '& canvas': { outline: 'none' }
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10,
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Laddar CAD-modell...</Typography>
        </Box>
      )}
      
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10,
          }}
        >
          <Typography color="danger" level="body-lg">
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FreeCadViewer;