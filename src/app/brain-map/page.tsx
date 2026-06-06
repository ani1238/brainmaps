'use client';

import { Suspense } from 'react';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { BrainMap } from '@/components/BrainMap';

export default function BrainMapPage() {
  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <div className="relative flex-1 overflow-hidden h-full">
        <Suspense fallback={null}>
          <BrainMap />
        </Suspense>
      </div>
    </div>
  );
}
