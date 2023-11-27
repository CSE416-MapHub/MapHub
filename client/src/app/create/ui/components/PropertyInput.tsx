'use client';
import clsx from 'clsx';
import style from './Property.module.scss';
import { MenuItem, Select, Typography } from '@mui/material';
import Button from 'components/button';
import { useState } from 'react';
import PropertyColorInput from './PropertyColorInput';
import PropertyInputGradient from './PropertyInputGradient';
import PropertySVGInput from './PropertySVGInput';
import PropertyDotInput from './PropertyDotInput';
import PropertyDropdownInput from './PropertyDropdownInput';

export type PropertyPanelInputType =
  | 'number'
  | 'text'
  | 'dropdown'
  | 'delete'
  | 'color'
  | 'svg'
  | 'dot'
  | 'gradient';

export interface IInputProps {
  type: PropertyPanelInputType;
  short: boolean;
  disabled: boolean;
  value: string | Array<string | [string, () => void]>;
  // contains either a string for the true selected dropdown option
  // or a modal
  auxiliaryComponent?: JSX.Element | string;
}

function getNameOfOption(o: string | [string, () => void]): string {
  let k = o[1];
  if (typeof o[1] === 'function') return o[0];
  else return o as string;
}

function getFunctionOfOption(o: string | [string, () => void]): () => void {
  if (typeof o[1] === 'function') return o[1];
  else return () => {};
}

export default function (props: IInputProps) {
  const [value, setValue] = useState<string>(props.value.toString());

  let inputField = <input />;
  if (props.type === 'number' || props.type === 'text') {
    // TODO: move this out
    inputField = (
      <input
        type={props.type}
        value={value}
        disabled={props.disabled}
        onChange={e => setValue(e.target.value)}
        step="any"
        className={clsx(
          style['default-input'],
          style['prop-input'],
          props.short ? style['prop-input-short'] : style['prop-input-long'],
        )}
      />
    );
  } else if (props.type === 'dropdown') {
    inputField = (
      <PropertyDropdownInput
        options={props.value as Array<string>}
        selected=""
      />
    );
  } else if (props.type === 'delete') {
    inputField = (
      <Button variant="error" onClick={getFunctionOfOption(props.value[0])}>
        {getNameOfOption(props.value[0])}
      </Button>
    );
  } else if (props.type === 'gradient') {
    inputField = (
      <PropertyInputGradient
        minValue={0}
        maxValue={100}
        minColor="#00FF00"
        maxColor="#FFFF00"
      />
    );
  } else if (props.type === 'color') {
    inputField = (
      <PropertyColorInput color="#00FF00" colorChangeHandler={() => {}} />
    );
  } else if (props.type === 'svg') {
    inputField = <PropertySVGInput />;
  } else if (props.type === 'dot') {
    inputField = <PropertyDotInput items={props.value as Array<string>} />;
  } else {
    throw new Error('Bad input type ' + props.type);
  }

  return (
    <>
      {inputField}
      {typeof props.auxiliaryComponent === 'function' ? (
        props.auxiliaryComponent
      ) : (
        <></>
      )}
    </>
  );
}
