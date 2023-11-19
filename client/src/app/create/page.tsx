'use client'; // TODO: remove thid

import EditorRibbon from './ui/components/EditorRibbon';
import Properties from './ui/components/Property';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import DeleteModal from './ui/components/modals/deleteInstance';
import mapStyle from './ui/components/Map.module.scss';
import Toolbar from './ui/components/toolbar';
import { EditorProvider } from 'context/EditorProvider';
// Dynamically import the Map component without server-side rendering
const DynamicMap = dynamic(() => import('./ui/components/Map'), {
  ssr: false,
});

export default function () {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  //TODO: IMplemetn objetc
  function deleteInstance() {
    setOpenDeleteModal(false);
  }
  return (
    <EditorProvider>
      <EditorRibbon />
      <Toolbar />
      <DynamicMap />

      <div className={mapStyle.propertiesPanel}>
        <Properties />
      </div>

      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={deleteInstance}
        deleteType="Category"
        instanceToBeDeleted="Category X"
      />
    </EditorProvider>
  );
}
