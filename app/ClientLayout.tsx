"use client";

import { useEffect, useLayoutEffect } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Use useLayoutEffect to remove the class before hydration
  useLayoutEffect(() => {
    if (document.body.classList.contains('vsc-initialized')) {
      document.body.classList.remove('vsc-initialized');
    }
  }, []);

  return children;
} 