import { createContext, useContext } from 'react';
import type { TextStyle } from 'react-native';

import { displayFonts } from '@/constants/theme';

const DisplayFontContext = createContext(false);

export const DisplayFontProvider = DisplayFontContext.Provider;

export function useDisplayFontLoaded(): boolean {
  return useContext(DisplayFontContext);
}

/** Barlow Condensed when it loaded, otherwise the system font in bold. */
export function useDisplayFont(weight: keyof typeof displayFonts = 'semibold'): TextStyle {
  const loaded = useDisplayFontLoaded();
  return loaded ? { fontFamily: displayFonts[weight] } : { fontWeight: '700' };
}
