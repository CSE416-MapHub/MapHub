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
  onChange: (val: string) => void;
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
        onChange={e => {
          setValue(e.currentTarget.value);
        }}
        onBlur={e => {
          props.onChange(e.currentTarget.value);
        }}
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
        selected={(props.auxiliaryComponent as string) ?? ''}
        onChange={val => props.onChange(val)}
      />
    );
  } else if (props.type === 'delete') {
    inputField = (
      <Button
        disabled={props.disabled}
        variant="error"
        onClick={getFunctionOfOption(props.value[0])}
      >
        {getNameOfOption(props.value[0])}
      </Button>
    );
  } else if (props.type === 'gradient') {
    inputField = (
      <PropertyInputGradient
        minIntensity={parseFloat(props.value[0] as string)}
        maxIntensity={parseFloat(props.value[1] as string)}
        minColor={props.value[2] as string}
        maxColor={props.value[3] as string}
        onChange={val => props.onChange(val)}
      />
    );
  } else if (props.type === 'color') {
    inputField = (
      <PropertyColorInput
        color={props.value as string}
        colorChangeHandler={val => props.onChange(val)}
        disabled={props.disabled}
      />
    );
  } else if (props.type === 'svg') {
    inputField = (
      <PropertySVGInput
        items={props.value as Array<string>}
        onChange={val => props.onChange(val)}
      />
    );
  } else if (props.type === 'dot') {
    inputField = (
      <PropertyDotInput
        items={props.value as Array<string>}
        onChange={val => props.onChange(val)}
      />
    );
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
