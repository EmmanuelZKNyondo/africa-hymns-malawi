// src/components/NavbarHeader.tsx
import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';

export type NavbarHeaderProps = {
  title: string;
  subtitle?: string | ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightLabel?: string;
  containerStyle?: any;
  titleStyle?: any;
  subtitleStyle?: any;
};

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon,
  onRightPress,
  rightLabel,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  const fontSize = useAppStore((state) => state.settings.fontSize);
  
  // Default back action: go back in navigation
  const handleDefaultBack = () => {
    // This will be overridden by navigation prop if passed
  };

  const handleBack = onBack || handleDefaultBack;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left: Back Button */}
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#007A3D" />
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Title + Subtitle */}
      <View style={styles.center}>
        <Text 
          style={[
            styles.title, 
            { fontSize: Math.max(16, fontSize - 2) },
            titleStyle
          ]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle && (
          <View style={[styles.subtitleContainer, subtitleStyle]}>
            {typeof subtitle === 'string' ? (
              <Text 
                style={[
                  styles.subtitle, 
                  { fontSize: Math.max(10, fontSize - 4) },
                  subtitleStyle
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) :(
              subtitle
            )}
          </View>
          
        )}
      </View>

      {/* Right: Optional Icon/Action */}
      <View style={styles.right}>
        {rightIcon && onRightPress && (
          <TouchableOpacity 
            onPress={onRightPress}
            style={styles.rightButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={rightLabel || 'Action'}
            accessibilityRole="button"
          >
            <Ionicons name={rightIcon} size={24} color="#007A3D" />
            {rightLabel && <Text style={styles.rightLabel}>{rightLabel}</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // ✅ Shadow/Elevation (now allowed in regular View)
    elevation: 3, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  left: { width: 44, alignItems: 'flex-start' },
  backButton: { padding: 4 },
  
  center: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitleContainer: {
    marginTop: 2,
    alignItems: 'center'
  },
  subtitle: {
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  
  right: { width: 44, alignItems: 'flex-end' },
  rightButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    padding: 4,
  },
  rightLabel: {
    fontSize: 12,
    color: '#007A3D',
    fontWeight: '600',
  },
});