// src/utils/theme.ts
import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  chipBg: string;
  chipBgActive: string;
  chipText: string;
  chipTextActive: string;
}

const lightColors: ThemeColors = {
  background: '#f0f2f5',
  surface: '#ffffff',
  surfaceSecondary: '#fafafa',
  text: '#1a1a1a',
  textSecondary: '#444444',
  textTertiary: '#666666',
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  primary: '#007A3D',
  primaryLight: '#e8f5e9',
  accent: '#7c3aed',
  success: '#22c55e',
  error: '#c62828',
  warning: '#b45309',
  info: '#1565c0',
  chipBg: '#fafafa',
  chipBgActive: '#007A3D',
  chipText: '#444444',
  chipTextActive: '#ffffff',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  surfaceSecondary: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',
  border: '#333333',
  borderLight: '#2a2a2a',
  primary: '#4caf50',
  primaryLight: '#1b3a1b',
  accent: '#a78bfa',
  success: '#4caf50',
  error: '#ef5350',
  warning: '#ffa726',
  info: '#42a5f5',
  chipBg: '#2a2a2a',
  chipBgActive: '#4caf50',
  chipText: '#b0b0b0',
  chipTextActive: '#ffffff',
};

export const useTheme = (): ThemeColors => {
  const systemColorScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.settings.theme);

  if (themeMode === 'system') {
    return systemColorScheme === 'dark' ? darkColors : lightColors;
  }

  return themeMode === 'dark' ? darkColors : lightColors;
};

export const getThemeColors = (mode: 'light' | 'dark' | 'system'): ThemeColors => {
  if (mode === 'system') {
    const systemScheme = useColorScheme();
    return systemScheme === 'dark' ? darkColors : lightColors;
  }
  return mode === 'dark' ? darkColors : lightColors;
};