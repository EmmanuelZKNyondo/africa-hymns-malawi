// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { loadCountryConfig, type LanguageConfig } from '@/utils/dataLoader';
import { NavbarHeader } from '@/components/NavbarHeader';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

type Props = {
  navigation: NavigationProp;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const countryCode = useAppStore((state) => state.settings.country);
  const [countryConfig, setCountryConfig] = useState<CountryConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Load country config when country changes
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const config = await loadCountryConfig(countryCode);
      setCountryConfig(config);
    } catch (error) {
      console.error('[HomeScreen] Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Handle language card press
  const handleLanguageSelect = (language: LanguageConfig) => {
    useAppStore.getState().addRecentHymn(0);
    
    navigation.navigate('HymnList', {
      countryCode,
      languageCode: language.code,
      languageName: language.name,
    });
  };

  // Handle settings navigation
  const handleSettingsPress = () => {
    // Navigate to Settings in the drawer navigator
    navigation.getParent()?.navigate('Settings');
  };

  // Loading state
  if (loading || !countryConfig) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007A3D" />
          <Text style={styles.loadingText}>Loading {countryCode.toUpperCase()} hymns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ✅ Reusable NavbarHeader */}
      <NavbarHeader
        title={`${countryConfig.name} Hymns`}
        subtitle={`Offline • ${countryConfig.metadata.hymnCount}+ hymns • v${countryConfig.metadata.version}`}
        showBack={false} 
        rightIcon="settings-outline"
        onRightPress={handleSettingsPress}
        rightLabel=""
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Language Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Language</Text>
          <View style={styles.cardGrid}>
            {countryConfig.languages.map((lang) => (
              <TouchableOpacity 
                key={lang.code} 
                style={styles.languageCard} 
                activeOpacity={0.7}
                onPress={() => handleLanguageSelect(lang)}
              >
                <Ionicons name={lang.icon as any} size={32} color="#007A3D" />
                <Text style={styles.cardLabel}>{lang.name}</Text>
                <Text style={styles.cardCount}>{lang.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <Ionicons name="star" size={32} color="#FFB800" />
              <Text style={styles.actionLabel}>Favorites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <Ionicons name="search" size={32} color="#007A3D" />
              <Text style={styles.actionLabel}>Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <Ionicons name="heart-outline" size={32} color="#6C63FF" />
              <Text style={styles.actionLabel}>Prayers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={32} color="#555" />
              <Text style={styles.actionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  // ✅ Content padding adjusted since NavbarHeader handles top spacing
  content: { padding: 16, paddingTop: 8 },
  
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#666' },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 12, paddingHorizontal: 4 },
  
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  languageCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    minHeight: 110,
  },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginTop: 10, textAlign: 'center' },
  cardCount: { fontSize: 11, color: '#666', marginTop: 2, textAlign: 'center' },
  
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    minHeight: 110,
  },
  actionLabel: { fontSize: 13, color: '#333', fontWeight: '500', textAlign: 'center', marginTop: 10 },
});

// Import types at bottom to avoid circular deps
import type { CountryConfig } from '@/utils/dataLoader';