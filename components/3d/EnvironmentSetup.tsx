"use client";

import { useEffect } from 'react';
import { Environment, Stars } from '@react-three/drei';

export function EnvironmentSetup({ onLoad }: { onLoad: () => void }) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  return (
    <>
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        fade 
      />
      <Environment 
        preset="night"
        background
        blur={0.8}
      />
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        castShadow 
      />
    </>
  );
} 