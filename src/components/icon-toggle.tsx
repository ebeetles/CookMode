import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, touchTarget } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IconName;
  on: boolean;
  /** Accessibility label without the state, e.g. "Read aloud". */
  label: string;
  onPress: () => void;
};

/** Cook Mode toggle: Tape icon on a Sharpie square when on, plain Sharpie icon when off. */
export function IconToggle({ icon, on, label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={`${label}, ${on ? 'on' : 'off'}`}
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={[styles.toggle, on && styles.on]}>
      <Ionicons name={icon} size={32} color={on ? colors.tape : colors.sharpie} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: touchTarget.cook,
    height: touchTarget.cook,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: {
    backgroundColor: colors.sharpie,
  },
});
