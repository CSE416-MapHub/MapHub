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

      {/* <div className={mapStyle.container}> */}
      {/* <div className={mapStyle.mapContainer}></div> */}
      <div className={mapStyle.propertiesPanel}>
        {' '}
        <Properties
          panels={[
            {
              name: 'Labels',
              items: [
                {
                  name: 'ISO_NAME',
                  input: {
                    type: 'text',
                    short: false,
                    disabled: false,
                    value: 'CHAD',
                  },
                },
              ],
            },
            {
              name: 'Colors',
              items: [
                {
                  name: 'Feature Color',
                  input: {
                    type: 'color',
                    short: true,
                    disabled: false,
                    value: '#FFFFFF',
                  },
                },
                {
                  name: 'Other Color',
                  input: {
                    type: 'color',
                    short: true,
                    disabled: false,
                    value: '#FFFFFF',
                  },
                },
                {
                  name: 'Some Input',
                  input: {
                    type: 'number',
                    short: true,
                    disabled: false,
                    value: '#FFFFFF',
                  },
                },
                {
                  name: 'Some Button',
                  input: {
                    type: 'color',
                    short: true,
                    disabled: false,
                    value: '#FFFFFF',
                  },
                },
              ],
            },
            {
              name: 'Gradient',
              items: [
                {
                  name: 'Feature gradients',
                  input: {
                    type: 'gradient',
                    short: false,
                    disabled: false,
                    value: '#FFFFFF',
                  },
                },
              ],
            },
            {
              name: 'Select icon',
              items: [
                {
                  name: 'Symbol',
                  input: {
                    type: 'svg',
                    short: true,
                    disabled: false,
                    value: '',
                  },
                },
                {
                  name: 'Dot type',
                  input: {
                    type: 'dot',
                    short: true,
                    disabled: false,
                    value: ['male', 'female'],
                  },
                },
              ],
            },
            {
              name: 'Nice Category',
              items: [
                {
                  name: 'Categories',
                  input: {
                    type: 'dropdown',
                    short: false,
                    disabled: false,
                    value: ['pro USSR', 'anti USSR'],
                  },
                },
                {
                  name: 'Delete Category',
                  input: {
                    type: 'delete',
                    short: false,
                    disabled: false,
                    value: [
                      [
                        'Delete Category',
                        () => {
                          console.log('DELETEING CATEGORY');
                          setOpenDeleteModal(true);
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ]}
        />
      </div>
      {/* </div> */}

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
