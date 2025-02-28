"use client";

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Float,
  Text,
  Html,
  useProgress,
  Preload,
  Stars
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { Desk } from './models/Desk';
import { Computer } from './models/Computer';
import { Clock } from './models/Clock';
import { WorldMap } from './models/WorldMap';
import { Particles } from './Particles';
import { EnvironmentSetup } from './EnvironmentSetup';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Camera positions for different views
const cameraPositions = {
  overview: { position: [0, 5, 10], target: [0, 0, 0] },
  attendance: { position: [3, 3, 5], target: [0, 1, 0] },
  map: { position: [0, 8, 5], target: [0, 0, -5] },
};

// Scene setup with lighting
const Scene = ({ 
  currentView, 
  onSceneLoaded 
}: { 
  currentView: 'overview' | 'attendance' | 'map',
  onSceneLoaded: () => void
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const targetPosition = useRef(new Vector3(...cameraPositions.overview.position));
  const targetLookAt = useRef(new Vector3(...cameraPositions.overview.target));
  const sceneLoadedRef = useRef(false);
  const [modelsLoaded, setModelsLoaded] = useState({
    desk: false,
    computer: false,
    clock: false,
    worldMap: false
  });
  const [envMapError, setEnvMapError] = useState(false);
  const [environmentLoaded, setEnvironmentLoaded] = useState(false);
  
  // Handle camera transitions when view changes
  useEffect(() => {
    if (!controlsRef.current) return;
    
    setIsTransitioning(true);
    
    const newPosition = new Vector3(...cameraPositions[currentView].position);
    const newTarget = new Vector3(...cameraPositions[currentView].target);
    
    targetPosition.current = newPosition;
    targetLookAt.current = newTarget;
    
    // After transition completes
    const timeout = setTimeout(() => {
      setIsTransitioning(false);
      controlsRef.current.target.copy(newTarget);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [currentView]);
  
  // Smooth camera animation
  useFrame(() => {
    if (isTransitioning && camera && controlsRef.current) {
      // Smoothly move camera position
      camera.position.lerp(targetPosition.current, 0.05);
      
      // Smoothly move camera target
      const currentTarget = controlsRef.current.target;
      currentTarget.lerp(targetLookAt.current, 0.05);
    }
  });

  // Notify parent when all models are loaded
  const { active, progress } = useProgress();
  const handleModelLoad = (modelName: string) => {
    setModelsLoaded(prev => ({
      ...prev,
      [modelName]: true
    }));
  };

  useEffect(() => {
    if (!active && progress === 100 && !sceneLoadedRef.current) {
      sceneLoadedRef.current = true;
      onSceneLoaded();
    }
  }, [active, progress, onSceneLoaded]);

  // Add error handling for model loading
  const handleModelError = (modelName: string, error: Error) => {
    console.error(`Error loading ${modelName}:`, error);
    // Mark the model as loaded even if it failed, to prevent infinite loading
    handleModelLoad(modelName);
  };

  useEffect(() => {
    // Check if environment is loaded
    const timeout = setTimeout(() => {
      setEnvironmentLoaded(true);
      if (!sceneLoadedRef.current) {
        sceneLoadedRef.current = true;
        onSceneLoaded();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [onSceneLoaded]);

  return (
    <>
      {/* Basic lighting setup that's always present */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />
      
      {/* Environment with fallback */}
      <Suspense fallback={null}>
        <EnvironmentSetup 
          onLoad={() => {
            setEnvironmentLoaded(true);
            if (!sceneLoadedRef.current) {
              sceneLoadedRef.current = true;
              onSceneLoaded();
            }
          }} 
        />
      </Suspense>

      {/* Models with loading state tracking */}
      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <Desk 
            position={[0, 0, 0]} 
            onLoad={() => handleModelLoad('desk')}
            onError={(error) => handleModelError('desk', error)}
          />
          {!modelsLoaded.desk && <FallbackModel position={[0, 0, 0]} scale={[2, 0.5, 1]} />}
          
          <Computer 
            position={[0, 0.8, 0]} 
            onLoad={() => handleModelLoad('computer')}
            onError={(error) => handleModelError('computer', error)}
          />
          {!modelsLoaded.computer && <FallbackModel position={[0, 0.8, 0]} scale={[1, 1, 1]} />}
          
          <Clock 
            position={[2, 1.5, 0]} 
            onLoad={() => handleModelLoad('clock')}
            onError={(error) => handleModelError('clock', error)}
          />
          
          <WorldMap 
            position={[0, 2, -3]} 
            onLoad={() => handleModelLoad('worldMap')}
            onError={(error) => handleModelError('worldMap', error)}
          />
        </group>
      </Suspense>

      {/* Background particles */}
      <Particles count={800} />

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
        maxDistance={20}
        minDistance={5}
      />
    </>
  );
};

// Digital Clock Component
const DigitalClock = ({ position }: { position: [number, number, number] }) => {
  const [time, setTime] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text
          color="#00A3FF"
          fontSize={0.5}
          font="/fonts/inter-bold.woff"
          position={[0, 0, 0]}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#001030"
        >
          {time}
        </Text>
      </Float>
    </group>
  );
};

// Location Marker Component
const LocationMarker = ({ 
  position, 
  label, 
  color = "#00A3FF", 
  active = false 
}: { 
  position: [number, number, number], 
  label: string, 
  color?: string,
  active?: boolean
}) => {
  const [hovered, setHovered] = useState(false);
  const markerRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (markerRef.current) {
      if (active) {
        // Pulsing animation for active markers
        const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
        markerRef.current.scale.set(scale, scale, scale);
      }
      
      // Always face the camera
      markerRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <group 
      position={position}
      ref={markerRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Marker Pin */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      
      {/* Marker Base */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.1, 0.1, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Hover Label */}
      {(hovered || active) && (
        <Html
          position={[0, 0.3, 0]}
          center
          style={{
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Html>
      )}
      
      {/* Active Indicator */}
      {active && (
        <mesh position={[0, -0.3, 0]}>
          <ringGeometry args={[0.15, 0.2, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* Light beam for active markers */}
      {active && (
        <pointLight 
          position={[0, 0, 0]} 
          distance={2} 
          intensity={1} 
          color={color} 
        />
      )}
    </group>
  );
};

// Fallback Model Component
const FallbackModel = ({ position, scale = [1, 1, 1] }) => (
  <mesh position={position} scale={scale}>
    <boxGeometry />
    <meshStandardMaterial color="#666666" />
  </mesh>
);

// Main ThreeDDashboard Component
export default function ThreeDDashboard({ 
  currentView = 'overview',
  onSceneLoaded
}: { 
  currentView: 'overview' | 'attendance' | 'map',
  onSceneLoaded: () => void
}) {
  return (
    <ErrorBoundary>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ background: 'rgb(8, 3, 21)' }}
        onCreated={() => {
          // Delay the scene loaded callback
          requestAnimationFrame(() => {
            onSceneLoaded();
          });
        }}
      >
        <Scene currentView={currentView} onSceneLoaded={onSceneLoaded} />
        <Preload all />
        
        {/* Post-processing effects */}
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      </Canvas>
    </ErrorBoundary>
  );
}