import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import { Animated, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

interface ToastState extends ToastConfig {
  visible: boolean;
  id: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, config?: Omit<ToastConfig, 'message' | 'variant'>) => void;
    error: (message: string, config?: Omit<ToastConfig, 'message' | 'variant'>) => void;
    warning: (message: string, config?: Omit<ToastConfig, 'message' | 'variant'>) => void;
    info: (message: string, config?: Omit<ToastConfig, 'message' | 'variant'>) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const VARIANT_CONFIG: Record<ToastVariant, { icon: keyof typeof Ionicons.glyphMap; iconColor: string; accent: string; background: string; textColor: string }> = {
  success: { icon: 'checkmark-circle', iconColor: '#2e7d32', accent: '#4caf50', background: '#e8f5e9', textColor: '#1b5e20' },
  error: { icon: 'close-circle', iconColor: '#c62828', accent: '#ef5350', background: '#ffebee', textColor: '#b71c1c' },
  warning: { icon: 'warning', iconColor: '#ef6c00', accent: '#ff9800', background: '#fff3e0', textColor: '#e65100' },
  info: { icon: 'information-circle', iconColor: '#1565c0', accent: '#2196f3', background: '#e3f2fd', textColor: '#0d47a1' },
};

export const GlobalToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ToastState>({ visible: false, message: '', variant: 'info', duration: 3000, id: 0 });
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setState(prev => ({ ...prev, visible: false })));
  }, [translateY, opacity]);

  useEffect(() => {
    if (state.visible) {
      if (timerRef.current) clearTimeout(timerRef.current);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(hide, state.duration || 3000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.visible, state.duration, hide]);

  const show = useCallback((config: ToastConfig) => {
    setState(prev => ({ ...config, visible: true, id: prev.id + 1, variant: config.variant ?? 'info', duration: config.duration ?? 3000 }));
  }, []);

  const toast = {
    success: (message: string, config?: Omit<ToastConfig, 'message' | 'variant'>) => show({ ...config, message, variant: 'success' }),
    error: (message: string, config?: Omit<ToastConfig, 'message' | 'variant'>) => show({ ...config, message, variant: 'error' }),
    warning: (message: string, config?: Omit<ToastConfig, 'message' | 'variant'>) => show({ ...config, message, variant: 'warning' }),
    info: (message: string, config?: Omit<ToastConfig, 'message' | 'variant'>) => show({ ...config, message, variant: 'info' }),
  };

  const value = { toast };

  // ✅ Safe variant resolution with fallback
  const currentVariant: ToastVariant = state.variant ?? 'info';
  const config = VARIANT_CONFIG[currentVariant];

  return (
    <ToastContext.Provider value={value}>
      {children}
      {state.visible && (
        <Animated.View style={[styles.container, { top: insets.top + 8, backgroundColor: config.background, transform: [{ translateY }], opacity }]}>
          <View style={[styles.accent, { backgroundColor: config.accent }]} />
          <Ionicons name={config.icon} size={20} color={config.iconColor} style={styles.icon} />
          <Text style={[styles.message, { color: config.textColor }]}>{state.message}</Text>
          {state.action && (
            <TouchableOpacity onPress={() => { state.action?.onPress(); hide(); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.actionBtn}>
              <Text style={[styles.actionText, { color: config.iconColor }]}>{state.action.label}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={hide} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.closeBtn}>
            <Ionicons name="close" size={16} color={config.textColor} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within GlobalToastProvider');
  return context;
};

const styles = StyleSheet.create({
  container: { 
    position: 'absolute', 
    left: 12, 
    right: 12, 
    zIndex: 9999, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 4, 
    overflow: 'hidden', 
    minHeight: 48, 
    ...Platform.select({ 
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, 
      android: { elevation: 4 } 
    }) 
  },
  accent: { width: 4, alignSelf: 'stretch' },
  icon: { marginLeft: 12, marginRight: 8 },
  message: { flex: 1, fontSize: 13, lineHeight: 18, paddingVertical: 12, paddingRight: 4, fontWeight: '500' },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 12 },
  actionText: { fontSize: 13, fontWeight: '600' },
  closeBtn: { paddingHorizontal: 12, paddingVertical: 12 },
});