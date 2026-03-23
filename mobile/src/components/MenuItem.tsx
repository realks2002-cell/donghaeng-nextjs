import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/colors';

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  leftIcon?: string;
  rightContent?: React.ReactNode;
}

export function MenuItem({ title, subtitle, onPress, showArrow = true, leftIcon, rightContent }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.left}>
        {leftIcon && <Text style={styles.icon}>{leftIcon}</Text>}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.right}>
        {rightContent}
        {showArrow && <Text style={styles.arrow}>{'>'}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 52,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
});
