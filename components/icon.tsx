import { LucideProps } from 'lucide-react-native';
import React from 'react';

type Props = LucideProps & {
  icon: React.FC<LucideProps>;
};

export function Icon({
  icon: IconComponent,
  size = 24,
  strokeWidth = 1.75,
  color = '#111827',
  ...rest
}: Props) {
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      {...rest}
    />
  );
}