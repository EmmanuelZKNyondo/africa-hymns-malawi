// src/components/ToastAlert.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  variant?: ToastVariant;
  duration?: number;        // ms, default 3000
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastAlertProps extends ToastConfig {
  visible: boolean;
  onDismiss: () => void;
}

// ─── Variant config with backgrounds & text colors ────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { 
    icon: keyof typeof Ionicons.glyphMap; 
    iconColor: string; 
    accent: string;
    background: string;  
    textColor: string;  
  }
> = {
  success: { 
    icon: 'checkmark-circle', 
    iconColor: '#2e7d32', 
    accent: '#4caf50',
    background: '#e8f5e9',
    textColor: '#1b5e20',  
  },
  error: { 
    icon: 'close-circle', 
    iconColor: '#c62828', 
    accent: '#ef5350',
    background: '#ffebee',
    textColor: '#b71c1c', 
  },
  warning: { 
    icon: 'warning', 
    iconColor: '#ef6c00', 
    accent: '#ff9800',
    background: '#fff3e0', 
    textColor: '#e65100', 
  },
  info: { 
    icon: 'information-circle', 
    iconColor: '#1565c0', 
    accent: '#2196f3',
    background: '#e3f2fd', 
    textColor: '#0d47a1', 
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ToastAlert: React.FC<ToastAlertProps> = ({
  visible,
  message,
  variant = 'info',
  duration = 3000,
  action,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = VARIANT_CONFIG[variant];

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, [translateY, opacity, onDismiss]);

  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(hide, duration);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration, hide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          backgroundColor: config.background, 
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {/* Accent strip */}
      <View style={[styles.accent, { backgroundColor: config.accent }]} />

      {/* Icon */}
      <Ionicons
        name={config.icon}
        size={20}
        color={config.iconColor}
        style={styles.icon}
      />

      {/* Message with variant text color */}
      <Text style={[styles.message, { color: config.textColor }]}>  {/* ✅ Dynamic text color */}
        {message}
      </Text>

      {/* Optional action */}
      {action && (
        <TouchableOpacity
          onPress={() => {
            action.onPress();
            hide();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionBtn}
        >
          <Text style={[styles.actionText, { color: config.iconColor }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}

      {/* Dismiss */}
      <TouchableOpacity
        onPress={hide}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.closeBtn}
      >
        <Ionicons name="close" size={16} color={config.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface ToastState extends ToastConfig {
  visible: boolean;
  key: number;
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>({
    visible: false,
    message: '',
    variant: 'info',
    key: 0,
  });

  const show = useCallback((config: ToastConfig) => {
    setState((prev) => ({
      ...config,
      visible: true,
      key: prev.key + 1,
    }));
  }, []);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const toast = {
    success: (message: string, extra?: Omit<ToastConfig, 'message' | 'variant'>) =>
      show({ ...extra, message, variant: 'success' }),
    error: (message: string, extra?: Omit<ToastConfig, 'message' | 'variant'>) =>
      show({ ...extra, message, variant: 'error' }),
    warning: (message: string, extra?: Omit<ToastConfig, 'message' | 'variant'>) =>
      show({ ...extra, message, variant: 'warning' }),
    info: (message: string, extra?: Omit<ToastConfig, 'message' | 'variant'>) =>
      show({ ...extra, message, variant: 'info' }),
  };

  const ToastProvider = useCallback(
    () => (
      <ToastAlert
        key={state.key}
        visible={state.visible}
        message={state.message}
        variant={state.variant}
        duration={state.duration}
        action={state.action}
        onDismiss={hide}
      />
    ),
    [state, hide]
  );

  return { toast, ToastProvider };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  accent: {
    width: 4,  // ✅ Slightly wider accent strip
    alignSelf: 'stretch',
  },
  icon: {
    marginLeft: 12,
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 12,
    paddingRight: 4,
    fontWeight: '500', 
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});