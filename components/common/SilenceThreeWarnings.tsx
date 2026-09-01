'use client';

import { useEffect } from 'react';

export const SilenceThreeWarnings: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('THREE.Clock') || args[0].includes('deprecated'))
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };
    }
  }, []);

  return null;
};
