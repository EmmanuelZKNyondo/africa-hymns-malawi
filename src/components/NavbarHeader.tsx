// src/components/NavbarHeader.tsx
import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';

export type NavbarHeaderProps = {
  title: string;
  subtitle?: string | ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
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
  showBack = false,
  onBack,
  showMenu = false,
  onMenuPress,
  rightIcon,
  onRightPress,
  rightLabel,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  const fontSize = useAppStore((state) => state.settings.fontSize);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.left}>
        {showMenu && onMenuPress && (
          <TouchableOpacity 
            onPress={onMenuPress} 
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={26} color="#007A3D" />
          </TouchableOpacity>
        )}
        {showBack && !showMenu && (
          <TouchableOpacity 
            onPress={onBack} 
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#007A3D" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text 
          style={[
            styles.title, 
            { fontSize: Math.max(16, fontSize - 2) },
            titleStyle
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <View style={styles.subtitleContainer}>
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
            ) : subtitle}
          </View>
        )}
      </View>

      <View style={styles.right}>
        {rightIcon && onRightPress && (
          <TouchableOpacity 
            onPress={onRightPress}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  left: { width: 40, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  right: { width: 40, alignItems: 'flex-end' },
  
  iconButton: { padding: 4 },
  
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitleContainer: { marginTop: 2, alignItems: 'center' },
  subtitle: { color: '#666', textAlign: 'center' },
  
  rightLabel: {
    fontSize: 12,
    color: '#007A3D',
    fontWeight: '600',
    marginLeft: 4,
  },
});