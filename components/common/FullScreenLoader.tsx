'use client';

import { useMemo } from 'react';
import Lottie from 'react-lottie';
import animationData from '@/lotties/abcx-loader.json';

export function FullScreenLoader() {
  const defaultOptions = useMemo(
    () => ({
      loop: true,
      autoplay: true,
      animationData,
      renderer: 'svg',
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    }),
    [],
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-[1px]">
      <Lottie options={defaultOptions} height={160} width={160} isClickToPauseDisabled={true} />
    </div>
  );
}
