'use client';

import { Suspense } from 'react';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { BrainMap } from '@/components/BrainMap';

export default function BrainMapPage() {
  return (
    <div className="relative flex flex-col lg:flex-row h-[100dvh] lg:h-screen overflow-hidden pb-16 lg:pb-0" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={null}>
          <BrainMap />
        </Suspense>
      </div>
    </div>
  );
}
