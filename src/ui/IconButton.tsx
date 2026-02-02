import type { LucideProps } from "lucide-react-native";
import React from "react";
import { Pressable, ViewStyle } from "react-native";
import { Icon } from "./Icon";
import { theme } from "./theme";

type IconComponent = React.FC<LucideProps>;

type Props = {
  icon: IconComponent;
  onPress: () => void;
  size?: number;
  color?: string;
  strokeWidth?: number;
  hitSlop?: number;
  style?: ViewStyle;
  accessibilityLabel: string;
};

export function IconButton({
  icon,
  onPress,
  size = theme.icon.size,
  color = theme.colors.textPrimary,
  strokeWidth = theme.icon.stroke,
  hitSlop = 10,
  style,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Icon icon={icon} size={size} color={color} strokeWidth={strokeWidth} />
    </Pressable>
  );
}