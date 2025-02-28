"use client";

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DeskProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export function Desk({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1] 
}: DeskProps) {
  // For demo purposes, we'll create a simple desk model
  const meshRef = useRef<THREE.Group>(null);
  
  // Simple animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });
  
  return (
    <group 
      ref={meshRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
    >
      {/* Desk top */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      
      {/* Desk legs */}
      {[
        [-1.4, -0.5, -0.6],
        [1.4, -0.5, -0.6],
        [-1.4, -0.5, 0.6],
        [1.4, -0.5, 0.6]
      ].map((pos, index) => (
        <mesh key={index} position={pos} receiveShadow castShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#3d2817" roughness={0.5} />
        </mesh>
      ))}
      
      {/* Desk drawer */}
      <mesh position={[0, -0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 0.3, 1.4]} />
        <meshStandardMaterial color="#4a3520" roughness={0.6} />
      </mesh>
      
      {/* Drawer handle */}
      <mesh position={[0, -0.2, 0.7]} receiveShadow castShadow>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}