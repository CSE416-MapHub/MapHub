import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface IconProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'regular' | 'solid' | 'logo';
  name: string;
}

function Icon({ type = 'regular', name, className }: IconProps) {
  return (
    <i
      className={`${clsx({
        ['bx']: true,
        [`bx-${name}`]: type === 'regular',
        [`bxs-${name}`]: type === 'solid',
        [`bxl-${name}`]: type === 'logo',
      })} ${className ? className : ''}`}
    />
  );
}

export type { IconProps };
export default Icon;
