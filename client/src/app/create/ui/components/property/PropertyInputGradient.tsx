'use client';

import { useEffect, useState } from 'react';
import PropertyColorInput from './PropertyColorInput';
import style from './Property.module.scss';
import clsx from 'clsx';

export interface GradientInputProps {
  minIntensity: number;
  maxIntensity: number;
  minColor: string;
  maxColor: string;
  onChange: (val: string) => void;
}

export default function (props: GradientInputProps) {
  const [ranges, setRanges] = useState<GradientInputProps>(props);

  function updateRanges(key: keyof GradientInputProps, val: any) {
    let newRange = {
      ...ranges,
      [key]: val,
    };
    console.log('new range ');
    console.log(newRange);
    console.log(`${key}||${val}`);
    setRanges(newRange);
    props.onChange(`${key}||${val}`);
  }
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '48px 1fr 48px',
      }}
    >
      <div>
        <PropertyColorInput
          color={ranges.minColor}
          colorChangeHandler={c => {
            updateRanges('minColor', c);
          }}
          disabled={false}
        />
        <input
          type="number"
          value={ranges.minIntensity}
          // className={style["prop-input"]}
          onChange={e => {
            // TODO: make this late validation
            updateRanges('minIntensity', parseFloat(e.target.value));
          }}
          className={clsx(
            style['default-input'],
            style['prop-input'],
            style['prop-input-tiny'],
          )}
        />
      </div>

      <div
        style={{
          minWidth: '60px',
          // maxWidth: '100%',
          height: '24px',
          marginTop: '12px',
          background: `linear-gradient(to right, ${ranges.minColor}, ${ranges.maxColor})`,
        }}
      ></div>
      <div>
        <PropertyColorInput
          color={ranges.maxColor}
          colorChangeHandler={c => {
            updateRanges('maxColor', c);
          }}
          disabled={false}
        />
        <input
          type="number"
          value={ranges.maxIntensity}
          // className={style["prop-input"]}
          onChange={e => {
            // TODO: make this late validation
            updateRanges('maxIntensity', parseFloat(e.target.value));
          }}
          className={clsx(
            style['default-input'],
            style['prop-input'],
            style['prop-input-tiny'],
          )}
        />
      </div>
    </div>
  );
}
