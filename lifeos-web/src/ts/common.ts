export interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}
