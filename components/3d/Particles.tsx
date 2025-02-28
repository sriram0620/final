"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}

export function Particles({ 
  count = 800, 
  color = '#ffffff', 
  size = 0.02,
  speed = 0.05
}: ParticlesProps) {
  const mesh = useRef<THREE.Points>(null);
  
  // Generate random positions for particles
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Random position in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 20 * Math.cbrt(Math.random()); // Cube root for more uniform distribution
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    return positions;
  }, [count]);
  
  // Generate random colors for particles
  const particleColors = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const colorOptions = [
      [0.0, 0.3, 1.0], // Blue
      [0.0, 0.7, 1.0], // Cyan
      [0.5, 0.0, 1.0], // Purple
      [1.0, 0.0, 0.5], // Pink
      [0.0, 0.5, 1.0]  // Light blue
    ];
    
    for (let i = 0; i < count; i++) {
      const colorIndex = Math.floor(Math.random() * colorOptions.length);
      const color = colorOptions[colorIndex];
      
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }
    
    return colors;
  }, [count]);
  
  // Animation for particles
  useFrame(({ clock }) => {
    if (mesh.current) {
      // Rotate the entire particle system slowly
      mesh.current.rotation.y = clock.getElapsedTime() * 0.03;
      
      // Update individual particles
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      const time = clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Add subtle movement to each particle
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y + z * z);
        
        // Move particles based on their distance from center
        const angle = time * speed * (1 - distance / 25);
        
        // Apply subtle sine wave movement
        positions[i3] = x + Math.sin(angle) * 0.02;
        positions[i3 + 1] = y + Math.cos(angle) * 0.02;
        positions[i3 + 2] = z + Math.sin(angle + 0.5) * 0.02;
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleColors.length / 3}
          array={particleColors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        fog={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}