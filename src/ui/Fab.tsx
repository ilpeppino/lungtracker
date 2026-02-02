import type { LucideProps } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "./Icon";
import { theme } from "./theme";

type IconComponent = React.FC<LucideProps>;

type Props = {
  icon: IconComponent;
  onPress: () => void;
  accessibilityLabel: string;
};

export function Fab({ icon, onPress, accessibilityLabel }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.wrap, { bottom: theme.fab.bottom + insets.bottom }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={styles.button}
      >
        <Icon
          icon={icon}
          size={theme.fab.iconSize}
          strokeWidth={theme.fab.iconStroke}
          color={theme.colors.fabIcon}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: theme.fab.right,
  },
  button: {
    width: theme.fab.size,
    height: theme.fab.size,
    borderRadius: theme.radius.fab,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.fabBackground,

    shadowOpacity: theme.fab.shadowOpacity,
    shadowRadius: theme.fab.shadowRadius,
    shadowOffset: theme.fab.shadowOffset,
    elevation: theme.fab.elevation,
  },
});