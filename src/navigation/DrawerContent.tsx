// src/navigation/DrawerContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Constants from 'expo-constants';

const COUNTRIES = [
  { code: 'mw', name: 'Malawi' },
  // { code: 'zm', name: 'Zambia' },
];

// ✅ Extract config once
const appName = Constants.expoConfig?.name || 'Africa Hymns';
const appVersion = Constants.expoConfig?.version || '1.0.0';
const author = 'EZPN';

export const DrawerContent: React.FC<any> = (props) => {
  const { navigation } = props;
  const { settings, updateSettings, getActiveCountryName } = useAppStore();
  
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
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>{appName}</Text>
        <TouchableOpacity style={styles.countryBadge} onPress={toggleCountry}>
          <Ionicons name="globe-outline" size={14} color="#fff" />
          <Text style={styles.countryText}>{countryName}</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem 
          icon="library-outline" 
          label="Hymns" 
          onPress={() => handleNavigate('Home')} 
          isActive={true} 
        />
        <MenuItem 
          icon="book-outline" 
          label="Prayers" 
          onPress={() => handleNavigate('Prayers')} 
        />
        <MenuItem 
          icon="star-outline" 
          label="Favourites" 
          onPress={() => handleNavigate('Favorites')} 
        />
        <MenuItem 
          icon="settings-outline" 
          label="Settings" 
          onPress={() => handleNavigate('Settings')} 
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>v{appVersion}</Text>
        <Text style={styles.copyright}>© {new Date().getFullYear()} {author}</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const MenuItem = ({ icon, label, onPress, isActive }: any) => (
  <TouchableOpacity 
    style={[styles.menuItem, isActive && styles.menuItemActive]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons 
      name={icon as any} 
      size={22} 
      color={isActive ? '#007A3D' : '#555'} 
    />
    <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 20,
    backgroundColor: '#007A3D',
    paddingBottom: 24,
  },
  appName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
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
  countryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  
  menu: { paddingVertical: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemActive: { backgroundColor: '#f0fdf4' },
  menuLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  menuLabelActive: { color: '#007A3D', fontWeight: '600' },
  
  footer: { marginTop: 'auto', padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  version: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 4 },
  copyright: { fontSize: 11, color: '#bbb', textAlign: 'center' },
});