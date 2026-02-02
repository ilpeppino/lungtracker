import type { LucideProps } from "lucide-react-native";
import React from "react";
import { theme } from "./theme";

type IconComponent = React.FC<LucideProps>;

type AppIconProps = Omit<LucideProps, "size" | "color" | "strokeWidth"> & {
  icon: IconComponent;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({
  icon: IconComponent,
  size = theme.icon.size,
  color = theme.colors.textPrimary,
  strokeWidth = theme.icon.stroke,
  ...rest
}: AppIconProps) {
  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}