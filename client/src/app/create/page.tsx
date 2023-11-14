'use client'; // TODO: remove thid

import EditorRibbon from './ui/components/EditorRibbon';
import Properties from './ui/components/Property';

export default function () {
  return (
    <>
      <EditorRibbon />
      lorem upsim
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
                name: 'efe Color',
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
                name: 'Feature gradientws',
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
            name: 'select icon',
            items: [
              {
                name: 'symbol',
                input: {
                  type: 'svg',
                  short: true,
                  disabled: false,
                  value: '',
                },
              },
            ],
          },
          {
            name: 'select dot',
            items: [
              {
                name: 'dot type',
                input: {
                  type: 'dot',
                  short: true,
                  disabled: false,
                  value: ['male', 'female'],
                },
              },
            ],
          },
        ]}
      />
    </>
  );
}
