"use client";

import { useEffect } from 'react';

export function WebGLHandler() {
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost. Attempting to restore...');
      
      // Attempt to restore after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };

    const canvas = document.querySelector('canvas');
    canvas?.addEventListener('webglcontextlost', handleContextLost);

    return () => {
      canvas?.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, []);

  return null;
} 