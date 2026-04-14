// src/screens/PrayersScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { NavbarHeader } from '@/components/NavbarHeader';
import { loadCountryConfig, type CountryConfig } from '@/utils/dataLoader'; // Keep this for country config
import { getAvailablePrayers } from '@/utils/prayersDataLoader'; // ✅ New import
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Prayers'>;

const PRAYER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'apostles-creed': 'book-outline',
  'lords-prayer': 'heart-outline',
};

export const PrayersScreen: React.FC<Props> = ({ navigation }) => {
  const countryCode = useAppStore((state) => state.settings.country);
  const [countryConfig, setCountryConfig] = useState<CountryConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const config = await loadCountryConfig(countryCode);
        if (isMounted) setCountryConfig(config);
      } catch (error) {
        console.error('[PrayersScreen] Load failed:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [countryCode]);

  const renderPrayerItem = ({ item }: { item: { id: string; titleKey: string } }) => {
    const icon = PRAYER_ICONS[item.id] || 'document-text-outline';
    const displayTitle = item.id.replace('-', ' ').toUpperCase();

    return (
      <TouchableOpacity
        style={styles.prayerCard}
        onPress={() => navigation.navigate('PrayerDetail', { prayerId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#007A3D" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.prayerTitle}>{displayTitle}</Text>
          <Text style={styles.prayerSubtitle}>Tap to read</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  if (loading || !countryConfig) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavbarHeader title="Prayers" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007A3D" />
        </View>
      </SafeAreaView>
    );
  }

  // Use the prayer IDs defined in the country config
  const prayersList = Object.values(countryConfig.prayers).map((id) => ({
    id,
    titleKey: id,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavbarHeader
        title="Prayers"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={prayersList}
        renderItem={renderPrayerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listContent: { padding: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  prayerTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  prayerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
});