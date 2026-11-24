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
  background: '#050810',      
  surface: '#0d1321',         
  surfaceSecondary: '#151e32', 
  text: '#f1f5f9',            
  textSecondary: '#94a3b8',   
  textTertiary: '#64748b',    
  border: '#1e293b',           
  borderLight: '#162032',     
  primary: '#4ade80',         
  primaryLight: '#0f2618',    
  accent: '#818cf8',           
  success: '#4ade80',
  error: '#f87171',
  warning: '#fbbf24',
  info: '#60a5fa',
  chipBg: '#151e32',
  chipBgActive: '#1d9c4c',     
  chipText: '#94a3b8',
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