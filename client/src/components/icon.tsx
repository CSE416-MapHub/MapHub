import clsx from 'clsx';

interface IconProps {
  type?: 'regular' | 'solid' | 'logo',
  name: string,
}

function Icon({type = 'regular', name}: IconProps) {
  return (
    <i className={clsx({
      ['bx']: true,
      [`bx-${name}`]: type === 'regular',
      [`bxs-${name}`]: type === 'solid',
      [`bxl-${name}`]: type === 'logo',
      })}
    />
  );
}

export type { IconProps };
export default Icon;