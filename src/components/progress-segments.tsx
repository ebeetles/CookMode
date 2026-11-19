import { StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/constants/theme';

type Props = {
  total: number;
  /** Number of segments filled Sharpie (completed steps plus the current one). */
  filled: number;
};

export function ProgressSegments({ total, filled }: Props) {
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={[styles.segment, index < filled ? styles.done : styles.remaining]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.xs,
  },
  segment: {
    flex: 1,
    height: space.s,
    borderRadius: radius.tape,
  },
  done: {
    backgroundColor: colors.sharpie,
  },
  remaining: {
    backgroundColor: colors.segmentRemaining,
  },
});
