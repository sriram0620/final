"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ComputerProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export function Computer({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1] 
}: ComputerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  
  // Screen animation
  useFrame(({ clock }) => {
    if (screenRef.current) {
      // Pulsing screen glow
      const intensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });
  
  return (
    <group 
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
    >
      {/* Monitor base */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      
      {/* Monitor stand */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.1, 0.6, 0.1]} />
        <meshStandardMaterial color="#555555" roughness={0.5} />
      </mesh>
      
      {/* Monitor screen */}
      <group position={[0, 0.6, 0.1]}>
        {/* Screen frame */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.8, 0.05]} />
          <meshStandardMaterial color="#222222" roughness={0.5} />
        </mesh>
        
        {/* Screen display */}
        <mesh 
          ref={screenRef}
          position={[0, 0, 0.03]} 
          castShadow
        >
          <planeGeometry args={[1.1, 0.7]} />
          <meshStandardMaterial 
            color="#1a1a2e" 
            emissive="#2A2A72"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
        
        {/* Screen content - attendance data */}
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[1, 0.6]} />
          <meshBasicMaterial transparent opacity={0.9}>
            <canvasTexture attach="map" args={[createScreenTexture()]} />
          </meshBasicMaterial>
        </mesh>
      </group>
      
      {/* Keyboard */}
      <mesh position={[0, 0.05, 0.6]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#444444" roughness={0.8} />
      </mesh>
      
      {/* Mouse */}
      <mesh position={[0.5, 0.05, 0.6]} castShadow>
        <capsuleGeometry args={[0.04, 0.1, 4, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Create a canvas texture for the computer screen
function createScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, 40);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Attendance Dashboard', 20, 28);
    
    // Current time
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    ctx.font = '16px Arial';
    ctx.fillText(timeString, canvas.width - 100, 28);
    
    // Content sections
    ctx.fillStyle = '#16213e';
    ctx.fillRect(20, 60, 220, 100); // Today's stats
    ctx.fillRect(260, 60, 220, 100); // Weekly summary
    ctx.fillRect(20, 180, 460, 120); // Attendance history
    
    // Section titles
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText("Today's Attendance", 30, 80);
    ctx.fillText("Weekly Summary", 270, 80);
    ctx.fillText("Recent Activity", 30, 200);
    
    // Today's stats content
    ctx.font = '14px Arial';
    ctx.fillStyle = '#e94560';
    ctx.fillText("Check-in: 09:15 AM", 30, 105);
    ctx.fillStyle = '#ffffff';
    ctx.fillText("Status: Active", 30, 125);
    ctx.fillText("Location: Main Office", 30, 145);
    
    // Weekly summary content
    ctx.fillStyle = '#ffffff';
    ctx.fillText("Hours: 32.5 / 40", 270, 105);
    ctx.fillText("Completion: 81%", 270, 125);
    ctx.fillText("On track", 270, 145);
    
    // Progress bar
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(270, 130, 200, 10);
    ctx.fillStyle = '#e94560';
    ctx.fillRect(270, 130, 162, 10); // 81%
    
    // Activity list
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    const activities = [
      "Mon - Checked in at 09:10, out at 17:45",
      "Tue - Checked in at 08:55, out at 18:20",
      "Wed - Checked in at 09:15, active now",
    ];
    
    activities.forEach((activity, index) => {
      ctx.fillText(activity, 30, 225 + index * 20);
    });
  }
  
  return canvas;
}