import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { loadHymnData, type Hymn, searchHymns, type FavouriteEntry } from '@/utils/dataLoader';
import { HymnCard } from '@/components/HymnCard';
import { SearchBar } from '@/components/SearchBar';
import { NavbarHeader } from '@/components/NavbarHeader';
import { HymnListActionsMenu } from '@/components/HymnListActionsMenu';
import { useTheme } from '@/utils/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'HymnList'>;

export const HymnListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { countryCode, languageCode, languageName } = route.params;
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { settings, toggleFavourite, updateSettings, addRecentHymn } = useAppStore();
  const favourites = useAppStore((state) => state.favourites);
  const colors = useTheme();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadHymnData(countryCode, languageCode);
        if (isMounted) setHymns(data.hymns);
      } catch (error) {
        console.error('[HymnList] Failed to load hymns:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [countryCode, languageCode]);

  const filteredHymns = useMemo(() => {
    if (!searchQuery.trim()) return hymns;
    return searchHymns(hymns, searchQuery);
  }, [hymns, searchQuery]);

  const handleHymnPress = useCallback((hymn: Hymn) => {
    addRecentHymn(hymn.number);
    navigation.navigate('HymnDetail', { hymn, countryCode, languageCode });
  }, [addRecentHymn, navigation, countryCode, languageCode]);

  const handleGoToSettings = useCallback(() => {
    navigation.getParent()?.navigate('Settings');
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadHymnData(countryCode, languageCode);
      setHymns(data.hymns);
    } catch (error) {
      console.error('[HymnList] Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, [countryCode, languageCode]);

  const handleThemeToggle = useCallback(() => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  }, [settings.theme, updateSettings]);

  const renderItem = useCallback(({ item }: { item: Hymn }) => {
    const isFav = favourites.some((f: FavouriteEntry) => 
      f.hymnNumber === item.number && 
      f.countryCode === countryCode && 
      f.languageCode === languageCode
    );
    
    return (
      <HymnCard
        hymn={item}
        fontSize={settings.fontSize}
        onPress={() => handleHymnPress(item)}
        isFavourite={isFav}
        onToggleFavourite={() => toggleFavourite(item.number, countryCode, languageCode)}
        highlightQuery={searchQuery}
      />
    );
  }, [settings.fontSize, handleHymnPress, toggleFavourite, countryCode, languageCode, searchQuery, favourites]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading {languageName} hymns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <NavbarHeader
        title={`${languageName} Hymns`}
        subtitle={`${filteredHymns.length} of ${hymns.length}`}
        showBack={true}
        onBack={() => navigation.goBack()}
        showThemeToggle={true}
        onThemeToggle={handleThemeToggle}
        rightComponent={
          <HymnListActionsMenu
            onRefresh={handleRefresh}
            onSettings={handleGoToSettings}
          />
        }
      />

      <View style={styles.searchBarArea}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={`Search ${languageName} hymns...`}
          resultCount={filteredHymns.length}
        />
      </View>

      <FlatList
        data={filteredHymns}
        renderItem={renderItem}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={3}
        removeClippedSubviews={true}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No hymns available'}
            </Text>
            {searchQuery && (
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Try a different keyword or hymn number</Text>
            )}
          </View>
        }
        onRefresh={handleRefresh}
        refreshing={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarArea: { marginTop: 4, paddingHorizontal: 12 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  listContent: { padding: 12 },
  emptyState: { alignItems: 'center', padding: 40, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  emptySubtext: { fontSize: 13, textAlign: 'center' },
});