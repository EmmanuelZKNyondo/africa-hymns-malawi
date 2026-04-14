// src/screens/PrayersScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { NavbarHeader } from '@/components/NavbarHeader';
import { loadPrayerTitles, type PrayerMeta } from '@/utils/prayersDataLoader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Prayers'>;

const PRAYER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'apostles-creed': 'book-outline',
  'lords-prayer': 'heart-outline',
};

export const PrayersScreen: React.FC<Props> = ({ navigation }) => {
  const countryCode = useAppStore((state) => state.settings.country);
  const [prayers, setPrayers] = useState<PrayerMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // ✅ Load titles from JSON files (defaults to EN for list view)
        const data = await loadPrayerTitles(countryCode);
        if (isMounted) setPrayers(data);
      } catch (error) {
        console.error('[PrayersScreen] Load failed:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [countryCode]);

  const renderPrayerItem = ({ item }: { item: PrayerMeta }) => {
    const icon = PRAYER_ICONS[item.id] || 'document-text-outline';

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
          {/* ✅ Use title from JSON */}
          <Text style={styles.prayerTitle}>{item.title}</Text>
          <Text style={styles.prayerSubtitle}>Tap to read</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavbarHeader title="Prayers" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007A3D" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavbarHeader
        title="Prayers"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={prayers}
        renderItem={renderPrayerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No prayers available.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listContent: { padding: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 14 },
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