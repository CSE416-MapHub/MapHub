'use client';
import EditorRibbon from './ui/components/EditorRibbon';
import Properties from './ui/components/Property';
import dynamic from 'next/dynamic';

import DeleteModal from './ui/components/modals/deleteInstance';
import mapStyle from './ui/components/Map.module.scss';
import Toolbar from './ui/components/toolbar';
import { EditorProvider } from 'context/EditorProvider';
import GlobalModals from './ui/components/GlobalModals';
// Dynamically import the Map component without server-side rendering
const DynamicMap = dynamic(() => import('./ui/components/Map'), {
  ssr: false,
});

export default function () {
  return (
    <EditorProvider>
      <EditorRibbon />
      <Toolbar />
      <DynamicMap />

      <div className={mapStyle.propertiesPanel}>
        <Properties />
      </div>

      <GlobalModals />
    </EditorProvider>
  );
}
