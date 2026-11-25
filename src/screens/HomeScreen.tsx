import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { loadCountryConfig, type HymnLangConfig } from '@/utils/dataLoader';
import { NavbarHeader } from '@/components/NavbarHeader';
import { UpdateModal } from '@/components/UpdateModal';
import { useUpdateCheck } from '@/hooks/useUpdateCheck';
import { useTheme } from '@/utils/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

type Props = {
  navigation: NavigationProp;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const countryCode = useAppStore((state) => state.settings.country);
  const { settings, updateSettings } = useAppStore();
  const colors = useTheme();
  const [countryConfig, setCountryConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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

  const handleThemeToggle = useCallback(() => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  }, [settings.theme, updateSettings]);

  const handleMenuPress = () => {
    const parentNav = navigation.getParent();
    if (parentNav) {
      (parentNav as any).openDrawer();
    }
  };

  if (loading || !countryConfig) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstLang = countryConfig.hymn_langs[0];
  const totalHymns = firstLang?.metadata?.hymnCount || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <NavbarHeader
        title={`${countryConfig.name} Hymns`}
        subtitle={`Offline • ${totalHymns}+ hymns`}
        leftIcon="menu"
        onLeftPress={handleMenuPress}
        showThemeToggle={true}
        onThemeToggle={handleThemeToggle}
        showUpdateIndicator={hasUpdate}
        onUpdatePress={() => setShowUpdateModal(true)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Language</Text>
          <View style={styles.cardGrid}>
            {countryConfig.hymn_langs.map((lang: HymnLangConfig) => (
              <TouchableOpacity 
                key={lang.code} 
                style={[styles.languageCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                activeOpacity={0.7}
                onPress={() => handleLanguageSelect(lang)}
              >
                <Ionicons name={lang.icon as any} size={32} color={colors.primary} />
                <Text style={[styles.cardLabel, { color: colors.text }]}>{lang.name}</Text>
                <Text style={[styles.cardCount, { color: colors.textSecondary }]}>{lang.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Favorites')}
            >
              <Ionicons name="heart" size={28} color={colors.error} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>Favorite Hymns</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Prayers')}
            >
              <Ionicons name="book-outline" size={28} color={colors.info} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>Prayers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={28} color={colors.textSecondary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 8 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, paddingHorizontal: 4 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  languageCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    minHeight: 110,
  },
  cardLabel: { fontSize: 14, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  cardCount: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    minHeight: 90,
  },
  actionLabel: { fontSize: 13, fontWeight: '500', textAlign: 'center', marginTop: 8 },
});