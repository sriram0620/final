"use client";

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ClockProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export function Clock({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1] 
}: ClockProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hourHandRef = useRef<THREE.Mesh>(null);
  const minuteHandRef = useRef<THREE.Mesh>(null);
  const secondHandRef = useRef<THREE.Mesh>(null);
  
  // Update clock hands based on current time
  useFrame(() => {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = -((hours + minutes / 60) / 12) * Math.PI * 2;
    }
    
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -(minutes / 60) * Math.PI * 2;
    }
    
    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = -(seconds / 60) * Math.PI * 2;
    }
  });
  
  return (
    <group 
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
    >
      {/* Clock base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Clock face */}
      <mesh position={[0, 0, 0.03]} castShadow>
        <circleGeometry args={[0.38, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>
      
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.sin(angle) * 0.35;
        const y = Math.cos(angle) * 0.35;
        
        return (
          <mesh key={i} position={[x, y, 0.04]} castShadow>
            <boxGeometry args={[0.02, 0.08, 0.01]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        );
      })}
      
      {/* Hour hand */}
      <mesh ref={hourHandRef} position={[0, 0, 0.06]} castShadow>
        <boxGeometry args={[0.03, 0.2, 0.01]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Minute hand */}
      <mesh ref={minuteHandRef} position={[0, 0, 0.07]} castShadow>
        <boxGeometry args={[0.02, 0.3, 0.01]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      {/* Second hand */}
      <mesh ref={secondHandRef} position={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[0.01, 0.32, 0.01]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Center pin */}
      <mesh position={[0, 0, 0.09]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}