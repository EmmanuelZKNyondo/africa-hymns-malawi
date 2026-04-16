// src/components/NavbarHeader.tsx
import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  
  showUpdateIndicator?: boolean;
  onUpdatePress?: () => void;
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
  showUpdateIndicator = false,
  onUpdatePress,
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
        {/* Update Indicator */}
        {showUpdateIndicator && onUpdatePress && (
          <TouchableOpacity 
            onPress={onUpdatePress}
            style={styles.updateBadgeContainer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Update Available"
          >
            <Ionicons name="information-circle" size={24} color="#FF3B30" />
            <View style={styles.redDot} />
          </TouchableOpacity>
        )}

        {/* Right Icon (Settings, etc.) */}
        {!showUpdateIndicator && rightIcon && onRightPress && (
          <TouchableOpacity 
            onPress={onRightPress}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={rightIcon} size={24} color="#007A3D" />
            {rightLabel && <Text style={styles.rightLabel}>{rightLabel}</Text>}
          </TouchableOpacity>
        )}
        
        {/* If both update and rightIcon are present, you might want to show both or prioritize. 
            Currently, update indicator replaces rightIcon if both are true. 
            To show both, remove the !showUpdateIndicator condition above. */}
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

  //  Update Badge Styles
  updateBadgeContainer: {
    position: 'relative',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#fff',
    // Simple pulse effect via shadow
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});