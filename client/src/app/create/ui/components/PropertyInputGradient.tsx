'use client';

import { useState } from 'react';
import PropertyColorInput from './PropertyColorInput';
import style from './Property.module.scss';
import clsx from 'clsx';

export interface GradientInputProps {
  minValue: number;
  maxValue: number;
  minColor: string;
  maxColor: string;
}

export default function (props: GradientInputProps) {
  const [ranges, setRanges] = useState<GradientInputProps>(props);

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
            setRanges({ ...ranges, minColor: c });
          }}
        />
        <input
          type="number"
          value={ranges.minValue}
          // className={style["prop-input"]}
          onChange={e => {
            // TODO: make this late validation
            setRanges({ ...ranges, minValue: parseFloat(e.target.value) });
          }}
          className={clsx(style['prop-input'], style['prop-input-tiny'])}
        />
      </div>

      <div
        style={{
          minWidth: '60px',
          maxWidth: '100%',
          height: '24px',
          marginTop: '12px',
          background: `linear-gradient(to right, ${ranges.minColor}, ${ranges.maxColor})`,
        }}
      ></div>
      <div>
        <PropertyColorInput
          color={ranges.maxColor}
          colorChangeHandler={c => {
            setRanges({ ...ranges, maxColor: c });
          }}
        />
        <input
          type="number"
          value={ranges.minValue}
          // className={style["prop-input"]}
          onChange={e => {
            // TODO: make this late validation
            setRanges({ ...ranges, minValue: parseFloat(e.target.value) });
          }}
          className={clsx(style['prop-input'], style['prop-input-tiny'])}
        />
      </div>
    </div>
  );
}
