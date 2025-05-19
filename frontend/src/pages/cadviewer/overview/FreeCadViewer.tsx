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
  const [fileInfo, setFileInfo] = useState<{name: string, type: string} | null>(null);
  
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
          setFileInfo({
            name: filePath.split('/').pop() || 'Fil',
            type: filePath.split('.').pop()?.toUpperCase() || 'OKÄND'
          });
          await loadModelFromPath(filePath);
        } else {
          // Inget att ladda
          setError("Ingen fil angiven att ladda.");
        }
      } catch (err) {
        console.error("Laddningsfel:", err);
        setError(`Fel vid laddning av modell: ${err instanceof Error ? err.message : 'Okänt fel'}`);
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
    centerCameraOnObject(group);
  };
  
  // Centrera kameran på ett objekt
  const centerCameraOnObject = (object: THREE.Object3D) => {
    if (!sceneRef.current.camera || !sceneRef.current.controls) return;
    
    // Beräkna bounding box
    const box = new THREE.Box3().setFromObject(object);
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
  };
  
  // Ladda modell från fil (verklig filhantering)
  const loadModelFromPath = async (path: string) => {
    if (!sceneRef.current.scene) return;
    
    // Rensa modeller
    sceneRef.current.models.forEach(model => {
      sceneRef.current.scene?.remove(model);
    });
    sceneRef.current.models = [];
    
    try {
      // För OBJ-filer, använd OBJLoader från Three.js
      if (path.toLowerCase().endsWith('.obj')) {
        // Visa laddningsmeddelande
        setLoading(true);
        
        // Importera OBJLoader dynamiskt
        const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
        const loader = new OBJLoader();
        
        // Ladda filen
        loader.load(
          path,
          (object) => {
            // Lägg till objektet i scenen
            sceneRef.current.scene?.add(object);
            sceneRef.current.models.push(object);
            
            // Centrera kameran på modellen
            centerCameraOnObject(object);
            
            setLoading(false);
          },
          (xhr) => {
            // Uppdatera laddningsstatus om det behövs
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          (error: any) => {
            console.error('Ett fel uppstod vid laddning av OBJ-fil:', error);
            setError(`Kunde inte ladda OBJ-filen: ${error instanceof Error ? error.message : 'Okänt fel'}`);
            setLoading(false);
          }
        );
        return;
      }
      
      // För STL-filer, använd STLLoader
      else if (path.toLowerCase().endsWith('.stl')) {
        setLoading(true);
        
        const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
        const loader = new STLLoader();
        
        loader.load(
          path,
          (geometry) => {
            const material = new THREE.MeshStandardMaterial({ 
              color: 0x3498db,
              metalness: 0.2,
              roughness: 0.5
            });
            const mesh = new THREE.Mesh(geometry, material);
            
            sceneRef.current.scene?.add(mesh);
            sceneRef.current.models.push(mesh);
            
            centerCameraOnObject(mesh);
            
            setLoading(false);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          (error: any) => {
            console.error('Ett fel uppstod vid laddning av STL-fil:', error);
            setError(`Kunde inte ladda STL-filen: ${error instanceof Error ? error.message : 'Okänt fel'}`);
            setLoading(false);
          }
        );
        return;
      }
      
      // För GLTF/GLB-filer
      else if (path.toLowerCase().endsWith('.gltf') || path.toLowerCase().endsWith('.glb')) {
        setLoading(true);
        
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        
        loader.load(
          path,
          (gltf) => {
            sceneRef.current.scene?.add(gltf.scene);
            sceneRef.current.models.push(gltf.scene);
            
            centerCameraOnObject(gltf.scene);
            
            setLoading(false);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          (error: any) => {
            console.error('Ett fel uppstod vid laddning av GLTF/GLB-fil:', error);
            setError(`Kunde inte ladda GLTF/GLB-filen: ${error instanceof Error ? error.message : 'Okänt fel'}`);
            setLoading(false);
          }
        );
        return;
      }
      
      // För FBX-filer
      else if (path.toLowerCase().endsWith('.fbx')) {
        setLoading(true);
        
        const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
        const loader = new FBXLoader();
        
        loader.load(
          path,
          (object) => {
            sceneRef.current.scene?.add(object);
            sceneRef.current.models.push(object);
            
            centerCameraOnObject(object);
            
            setLoading(false);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          (error: any) => {
            console.error('Ett fel uppstod vid laddning av FBX-fil:', error);
            setError(`Kunde inte ladda FBX-filen: ${error instanceof Error ? error.message : 'Okänt fel'}`);
            setLoading(false);
          }
        );
        return;
      }
      
      // Andra filtyper - skapa en visualisering för specifika filtyper
      createFileRepresentation(path);
      
    } catch (err) {
      console.error('Ett fel uppstod:', err);
      setError(`Kunde inte ladda filen: ${err instanceof Error ? err.message : 'Okänt fel'}`);
      setLoading(false);
    }
  };
  
  // Skapa en representation av filen baserat på filtyp
  const createFileRepresentation = (path: string) => {
    const fileName = path.split('/').pop() || path;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Skapa en grupp för vår modell
    const group = new THREE.Group();
    
    // Skapa en bas-modell baserad på filtyp
    if (fileExtension === 'dwg' || fileExtension === 'dxf') {
      // Ritningsmodell
      const drawingBase = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
      );
      drawingBase.position.y = -0.5;
      group.add(drawingBase);
      
      // Skapa några linjer för att representera en ritning
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0066cc });
      
      // Horisontella linjer
      for (let i = 0; i < 5; i++) {
        const points = [];
        points.push(new THREE.Vector3(-2.5, -0.4, -3 + i * 1.5));
        points.push(new THREE.Vector3(2.5, -0.4, -3 + i * 1.5));
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
      }
      
      // Vertikala linjer
      for (let i = 0; i < 4; i++) {
        const points = [];
        points.push(new THREE.Vector3(-1.5 + i, -0.4, -3.5));
        points.push(new THREE.Vector3(-1.5 + i, -0.4, 3.5));
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
      }
    } 
    else if (fileExtension === 'step' || fileExtension === 'stp' || 
            fileExtension === 'iges' || fileExtension === 'igs' || 
            fileExtension === 'fcstd') {
      // CAD-modell
      // Skapa en bas
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1, 8),
        new THREE.MeshStandardMaterial({ color: 0x7f8c8d })
      );
      base.position.y = -1;
      group.add(base);
      
      // Lägg till en cylinder
      const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 1, 32),
        new THREE.MeshStandardMaterial({ color: 0x3498db })
      );
      cylinder.position.y = -0.5;
      group.add(cylinder);
      
      // Lägg till en sfär
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xe74c3c })
      );
      sphere.position.y = 0.5;
      group.add(sphere);
    }
    else {
      // Generic 3D model
      const modelMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0x9b59b6, wireframe: true })
      );
      group.add(modelMesh);
    }
    
    // Lägg till en informationsskylt med filnamn och filtyp
    const makeTextSprite = (message: string, parameters: any = {}) => {
      const fontface = parameters.fontface || 'Arial';
      const fontsize = parameters.fontsize || 18;
      const borderThickness = parameters.borderThickness || 4;
      const backgroundColor = parameters.backgroundColor || { r:255, g:255, b:255, a:1.0 };
      const textColor = parameters.textColor || { r:0, g:0, b:0, a:1.0 };
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;
      
      // Sätt canvas storlek
      canvas.width = 400;
      canvas.height = 160;
      
      // Textinställningar
      context.font = `Bold ${fontsize}px ${fontface}`;
      
      // Bakgrund
      context.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;
      context.strokeStyle = 'black';
      context.lineWidth = borderThickness;
      
      // Skapa bakgrundsrektangel
      const metrics = context.measureText(message);
      const textWidth = metrics.width;
      roundRect(
        context, 
        borderThickness/2, 
        borderThickness/2, 
        canvas.width - borderThickness, 
        canvas.height - borderThickness, 
        8
      );
      
      // Text
      context.fillStyle = `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, ${textColor.a})`;
      context.fillText(message, borderThickness, fontsize + borderThickness);
      
      // Skapa texture från canvas
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      
      // Skapa sprite
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(4, 1.6, 1);
      
      return sprite;
    };
    
    // Hjälpfunktion för att rita rundade rektanglar
    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    
    // Skapa och lägg till informationsskylt
    const fileInfoText = 
      `Filnamn: ${fileName}\n` +
      `Filtyp: ${fileExtension.toUpperCase()}`;
    
    const infoSprite = makeTextSprite(fileInfoText, {
      fontsize: 24,
      borderThickness: 6,
      backgroundColor: { r:50, g:50, b:100, a:0.8 },
      textColor: { r:255, g:255, b:255, a:1.0 }
    });
    
    if (infoSprite) {
      infoSprite.position.set(0, 3, 0);
      group.add(infoSprite);
    }
    
    sceneRef.current.scene?.add(group);
    sceneRef.current.models.push(group);
    
    // Centrera kameran
    centerCameraOnObject(group);
    
    // Färdig med laddning
    setLoading(false);
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
      
      {fileInfo && !loading && !error && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 2,
            borderRadius: 1,
            zIndex: 5,
            color: 'white',
            maxWidth: '50%'
          }}
        >
          <Typography level="body-sm" sx={{ color: 'white', mb: 0.5 }}>
            <strong>Fil:</strong> {fileInfo.name}
          </Typography>
          <Typography level="body-sm" sx={{ color: 'white' }}>
            <strong>Typ:</strong> {fileInfo.type}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FreeCadViewer;