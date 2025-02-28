"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorldMapProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export function WorldMap({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1] 
}: WorldMapProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Subtle rotation animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });
  
  return (
    <group 
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
    >
      {/* Map base */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
      
      {/* World map outline */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <planeGeometry args={[2.9, 1.9]} />
        <meshStandardMaterial 
          color="#16213e" 
          roughness={0.5}
          emissive="#009FFD"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Continents - simplified shapes */}
      {/* North America */}
      <mesh position={[-0.8, 0.07, 0.2]} receiveShadow castShadow>
        <shapeGeometry args={[createContinentShape('northAmerica')]} />
        <meshStandardMaterial 
          color="#009FFD" 
          roughness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* South America */}
      <mesh position={[-0.5, 0.07, 0.6]} receiveShadow castShadow>
        <shapeGeometry args={[createContinentShape('southAmerica')]} />
        <meshStandardMaterial 
          color="#009FFD" 
          roughness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Europe */}
      <mesh position={[0.2, 0.07, 0]} receiveShadow castShadow>
        <shapeGeometry args={[createContinentShape('europe')]} />
        <meshStandardMaterial 
          color="#009FFD" 
          roughness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Africa */}
      <mesh position={[0.2, 0.07, 0.4]} receiveShadow castShadow>
        <shapeGeometry args={[createContinentShape('africa')]} />
        <meshStandardMaterial 
          color="#009FFD" 
          roughness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Asia */}
      <mesh position={[0.7, 0.07, 0]} receiveShadow castShadow>
        <shapeGeometry args={[createContinentShape('asia')]} />
        <meshStandardMaterial 
          color="#009FFD" 
          roughness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Australia */}
      <mesh position={[1, 0.07, 0.5]} receiveShadow castShadow>
        <shapeGeometry args={[createContinentShape('australia')]} />
        <meshStandardMaterial 
          color="#009FFD" 
          roughness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Grid lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`horizontal-${i}`} position={[0, 0.07, -0.9 + i * 0.36]} receiveShadow>
          <boxGeometry args={[2.9, 0.005, 0.005]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
      ))}
      
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`vertical-${i}`} position={[-1.45 + i * 0.36, 0.07, 0]} receiveShadow>
          <boxGeometry args={[0.005, 0.005, 1.9]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// Helper function to create continent shapes
function createContinentShape(continent: string): THREE.Shape {
  const shape = new THREE.Shape();
  
  switch (continent) {
    case 'northAmerica':
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.1, 0.1, 0.2, 0.2, 0.3, 0.1);
      shape.bezierCurveTo(0.4, 0, 0.5, -0.1, 0.4, -0.2);
      shape.bezierCurveTo(0.3, -0.3, 0.1, -0.3, 0, -0.2);
      shape.bezierCurveTo(-0.1, -0.1, -0.1, -0.05, 0, 0);
      break;
      
    case 'southAmerica':
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.1, 0.05, 0.15, 0.1, 0.1, 0.2);
      shape.bezierCurveTo(0.05, 0.3, -0.05, 0.35, -0.1, 0.3);
      shape.bezierCurveTo(-0.15, 0.2, -0.1, 0.1, -0.05, 0.05);
      shape.bezierCurveTo(0, 0, 0, 0, 0, 0);
      break;
      
    case 'europe':
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.1, 0.05, 0.2, 0.1, 0.25, 0.05);
      shape.bezierCurveTo(0.3, 0, 0.25, -0.1, 0.2, -0.15);
      shape.bezierCurveTo(0.1, -0.2, 0, -0.15, -0.05, -0.1);
      shape.bezierCurveTo(-0.1, -0.05, -0.05, 0, 0, 0);
      break;
      
    case 'africa':
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.1, 0.05, 0.2, 0.1, 0.25, 0.2);
      shape.bezierCurveTo(0.2, 0.3, 0.1, 0.35, 0, 0.3);
      shape.bezierCurveTo(-0.1, 0.25, -0.15, 0.15, -0.1, 0.1);
      shape.bezierCurveTo(-0.05, 0.05, 0, 0, 0, 0);
      break;
      
    case 'asia':
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.2, 0.1, 0.4, 0.15, 0.5, 0.1);
      shape.bezierCurveTo(0.6, 0.05, 0.55, -0.1, 0.45, -0.2);
      shape.bezierCurveTo(0.3, -0.25, 0.1, -0.2, 0, -0.1);
      shape.bezierCurveTo(-0.1, 0, -0.05, 0.05, 0, 0);
      break;
      
    case 'australia':
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.05, 0.05, 0.1, 0.1, 0.15, 0.05);
      shape.bezierCurveTo(0.2, 0, 0.15, -0.05, 0.1, -0.1);
      shape.bezierCurveTo(0.05, -0.15, -0.05, -0.1, -0.1, -0.05);
      shape.bezierCurveTo(-0.15, 0, -0.05, 0.05, 0, 0);
      break;
      
    default:
      // Default circle
      shape.moveTo(0.1, 0);
      shape.absarc(0, 0, 0.1, 0, Math.PI * 2, false);
  }
  
  return shape;
}