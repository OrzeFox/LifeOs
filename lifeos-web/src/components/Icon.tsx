import type { IconProps } from '../ts/common';

export function Icon({ name, size = 20, filled = false, className = '', style }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined${filled ? ' filled' : ''}${className ? ` ${className}` : ''}`}
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}
