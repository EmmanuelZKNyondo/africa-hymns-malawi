// src/navigation/DrawerContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Constants from 'expo-constants';
import { useTheme } from '@/utils/theme';

const COUNTRIES = [
  { code: 'mw', name: 'Malawi' },
  // { code: 'zm', name: 'Zambia' },
];

const appName = Constants.expoConfig?.name || 'Africa Hymns';
const appVersion = Constants.expoConfig?.version || '1.0.0';
const author = 'EZPN';

export const DrawerContent: React.FC<any> = (props) => {
  const { navigation } = props;
  const { settings, updateSettings, getActiveCountryName } = useAppStore();
  const colors = useTheme();
  
  const countryName = getActiveCountryName();

  const handleNavigate = (screen: string) => {
    navigation.closeDrawer();
    if (screen === 'Home') {
      navigation.navigate('Home' as any);
    } else if (screen === 'Settings') {
      navigation.navigate('Settings' as any);
    } else {
      navigation.navigate('Home' as any, { screen: screen });
    }
  };

  const toggleCountry = async () => {
    const nextCode = settings.country === 'mw' ? 'zm' : 'mw';
    if (COUNTRIES.find(c => c.code === nextCode)) {
       await updateSettings({ country: nextCode as any });
    }
  };

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={[styles.container, { backgroundColor: colors.surface }]}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.appName}>{appName}</Text>
        <TouchableOpacity style={styles.countryBadge} onPress={toggleCountry}>
          <Ionicons name="globe-outline" size={14} color="#ffffff" />
          <Text style={styles.countryText}>{countryName}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        <MenuItem 
          icon="library-outline" 
          label="Hymns" 
          onPress={() => handleNavigate('Home')} 
          isActive={true} 
          colors={colors}
        />
        <MenuItem 
          icon="heart-outline" 
          label="Favourite Hymns" 
          onPress={() => handleNavigate('Favorites')} 
          colors={colors}
        />
        <MenuItem 
          icon="book-outline" 
          label="Prayers" 
          onPress={() => handleNavigate('Prayers')} 
          colors={colors}
        />
        <MenuItem 
          icon="settings-outline" 
          label="Settings" 
          onPress={() => handleNavigate('Settings')} 
          colors={colors}
        />
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.version, { color: colors.textTertiary }]}>v{appVersion}</Text>
        <Text style={[styles.copyright, { color: colors.textTertiary }]}>© {new Date().getFullYear()} {author}</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const MenuItem = ({ icon, label, onPress, isActive, colors }: any) => (
  <TouchableOpacity 
    style={[
      styles.menuItem, 
      isActive && { backgroundColor: colors.primaryLight }
    ]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons 
      name={icon as any} 
      size={22} 
      color={isActive ? colors.primary : colors.textSecondary} 
    />
    <Text style={[
      styles.menuLabel, 
      { color: isActive ? colors.primary : colors.text },
      isActive && styles.menuLabelActive
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingBottom: 24,
  },
  appName: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  countryText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  
  menu: { paddingVertical: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuLabel: { fontSize: 16, fontWeight: '500' },
  menuLabelActive: { fontWeight: '600' },
  
  footer: { marginTop: 'auto', padding: 20, borderTopWidth: 1 },
  version: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
  copyright: { fontSize: 11, textAlign: 'center' },
});