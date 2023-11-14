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
                  type: 'svg',
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
                        alert(1);
                      },
                    ],
                  ],
                },
              },
            ],
          },
        ]}
      />
    </>
  );
}
