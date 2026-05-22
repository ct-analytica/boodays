import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ColorScheme,
  PaletteName,
  PURPLE_COLORS,
  OCTOBER_COLORS,
} from '../constants/theme';

interface ThemeContextValue {
  palette: PaletteName;
  colors: ColorScheme;
  togglePalette: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  palette: 'purple',
  colors: PURPLE_COLORS,
  togglePalette: () => {},
});

const PALETTE_KEY = '@boodays_palette';

const paletteMap: Record<PaletteName, ColorScheme> = {
  purple: PURPLE_COLORS,
  october: OCTOBER_COLORS,
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [palette, setPalette] = useState<PaletteName>('purple');

  useEffect(() => {
    AsyncStorage.getItem(PALETTE_KEY).then(stored => {
      if (stored === 'purple' || stored === 'october') setPalette(stored);
    });
  }, []);

  const togglePalette = () => {
    setPalette(prev => {
      const next: PaletteName = prev === 'purple' ? 'october' : 'purple';
      AsyncStorage.setItem(PALETTE_KEY, next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ palette, colors: paletteMap[palette], togglePalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
