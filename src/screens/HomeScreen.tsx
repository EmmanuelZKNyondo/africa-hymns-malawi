// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { loadCountryConfig, type HymnLangConfig } from '@/utils/dataLoader'; // ✅ Updated import
import { NavbarHeader } from '@/components/NavbarHeader';
import { UpdateModal } from '@/components/UpdateModal';
import { useUpdateCheck } from '@/hooks/useUpdateCheck';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

type Props = {
  navigation: NavigationProp;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const countryCode = useAppStore((state) => state.settings.country);
  const [countryConfig, setCountryConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // ✅ Update Check Hook
  const { 
    hasUpdate, 
    shouldShowToast, 
    latestVersionInfo, 
    handleUpdate, 
    handleDismiss 
  } = useUpdateCheck();

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

  // Auto-show modal if it's a new update notification
  useEffect(() => {
    if (shouldShowToast) {
      setShowUpdateModal(true);
    }
  }, [shouldShowToast]);

  const handleLanguageSelect = (language: HymnLangConfig) => {
    useAppStore.getState().addRecentHymn(0);
    navigation.navigate('HymnList', {
      countryCode,
      languageCode: language.code,
      languageName: language.name,
    });
  };

  const handleMenuPress = () => {
    const parentNav = navigation.getParent();
    if (parentNav) {
      (parentNav as any).openDrawer();
    }
  };

  if (loading || !countryConfig) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007A3D" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Calculate total hymns from all languages or pick the first one's metadata
  const firstLang = countryConfig.hymn_langs[0];
  const totalHymns = firstLang?.metadata?.hymnCount || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavbarHeader
        title={`${countryConfig.name} Hymns`}
        subtitle={`Offline • ${totalHymns}+ hymns`}
        showMenu={true}
        onMenuPress={handleMenuPress}
        rightIcon="settings-outline"
        onRightPress={() => navigation.navigate('Settings')}
        showUpdateIndicator={hasUpdate}
        onUpdatePress={() => setShowUpdateModal(true)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Language</Text>
          <View style={styles.cardGrid}>
            {/* ✅ Map over hymn_langs instead of languages */}
            {countryConfig.hymn_langs.map((lang: HymnLangConfig) => (
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Favorites')}
            >
              <Ionicons name="heart" size={28} color="#eb0e0e" />
              <Text style={styles.actionLabel}>Favorite Hymns</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Prayers')}
            >
              <Ionicons name="book-outline" size={28} color="#352bf3" />
              <Text style={styles.actionLabel}>Prayers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={28} color="#1e2a33" />
              <Text style={styles.actionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ✅ Update Modal */}
      <UpdateModal 
        visible={showUpdateModal} 
        versionInfo={latestVersionInfo}
        onUpdate={handleUpdate}
        onLater={() => {
          setShowUpdateModal(false);
          handleDismiss();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
    borderRadius: 4,
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
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    minHeight: 90,
  },
  actionLabel: { fontSize: 13, color: '#333', fontWeight: '500', textAlign: 'center', marginTop: 8 },
});