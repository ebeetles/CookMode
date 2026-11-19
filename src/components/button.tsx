import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontSize, radius, space, touchTarget } from '@/constants/theme';

type Variant = 'primary' | 'outline' | 'text';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** Cook Mode buttons are 64 tall so they work with a knuckle. */
  size?: keyof typeof touchTarget;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', size = 'browse', style }: Props) {
  const minSize = touchTarget[size];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { minHeight: minSize, minWidth: minSize },
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'text' && styles.text,
        pressed && styles.pressed,
        style,
      ]}>
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'text' && styles.textLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    borderRadius: radius.card,
    paddingHorizontal: space.l,
  },
  primary: {
    backgroundColor: colors.basil,
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.sharpie,
  },
  text: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.sharpie,
    textAlign: 'left',
  },
  primaryLabel: {
    color: colors.white,
    fontWeight: '600',
  },
  textLabel: {
    textDecorationLine: 'underline',
  },
});
