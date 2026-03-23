import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/colors';

interface DividerProps {
  spacing?: number;
}

export function Divider({ spacing = Spacing.lg }: DividerProps) {
  return <View style={[styles.divider, { marginVertical: spacing }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
