'use client';

import { useEffect, useState } from 'react';
import PropertyColorInput from './PropertyColorInput';
import style from './Property.module.scss';
import clsx from 'clsx';

export interface GradientInputProps {
  minValue: number;
  maxValue: number;
  minColor: string;
  maxColor: string;
  onChange: (val: string) => void;
}

export default function (props: GradientInputProps) {
  const [ranges, setRanges] = useState<GradientInputProps>(props);

  function updateRanges(v: GradientInputProps) {
    setRanges(v);
    props.onChange(
      `{minValue:${v.minValue},maxValue:${v.maxValue},minColor:${v.minColor},maxColor:${v.maxColor}}`,
    );
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
            updateRanges({ ...ranges, minColor: c });
          }}
          disabled={false}
        />
        <input
          type="number"
          value={ranges.minValue}
          // className={style["prop-input"]}
          onChange={e => {
            // TODO: make this late validation
            updateRanges({ ...ranges, minValue: parseFloat(e.target.value) });
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
            updateRanges({ ...ranges, maxColor: c });
          }}
          disabled={false}
        />
        <input
          type="number"
          value={ranges.maxValue}
          // className={style["prop-input"]}
          onChange={e => {
            // TODO: make this late validation
            updateRanges({ ...ranges, maxValue: parseFloat(e.target.value) });
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
