import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/utils/theme';
import { useAppStore } from '@/store/useAppStore';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  showThemeToggle?: boolean;
  onThemeToggle?: () => void;
  showUpdateIndicator?: boolean;
  onUpdatePress?: () => void;
  rightComponent?: React.ReactNode;
};

export const NavbarHeader: React.FC<Props> = ({
  title,
  subtitle,
  showBack,
  onBack,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  showThemeToggle,
  onThemeToggle,
  showUpdateIndicator,
  onUpdatePress,
  rightComponent,
}) => {
  const colors = useTheme();
  const themeMode = useAppStore((state) => state.settings.theme);
  const themeIcon = themeMode === 'dark' ? 'sunny-outline' : 'moon-outline';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.leftSection}>
        {leftIcon && onLeftPress && (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={leftIcon} size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {showUpdateIndicator && onUpdatePress && (
          <TouchableOpacity onPress={onUpdatePress} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="cloud-download-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        )}
        
        {showThemeToggle && onThemeToggle && (
          <TouchableOpacity onPress={onThemeToggle} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={themeIcon} size={22} color={colors.text} />
          </TouchableOpacity>
        )}

        {rightComponent}

        {rightIcon && onRightPress && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={rightIcon} size={22} color={colors.text} />
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
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
});