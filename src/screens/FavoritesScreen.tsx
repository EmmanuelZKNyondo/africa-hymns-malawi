import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { HymnCard } from '@/components/HymnCard';
import { NavbarHeader } from '@/components/NavbarHeader';
import { SearchBar } from '@/components/SearchBar';
import { loadHymnData, loadCountryConfig, type Hymn, searchHymns } from '@/utils/dataLoader';
import { type FavouriteEntry } from '@/utils/storageUtils';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Favorites'>;

interface GroupedHymnData {
  countryCode: string;
  languageCode: string;
  languageName: string;
  hymns: Hymn[];
}

interface FavoritesSection {
  title: string;
  data: Hymn[];
  countryCode: string;
  languageCode: string;
  languageName: string;
}

export const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const { favourites, toggleFavourite, addRecentHymn, settings, getGroupedFavourites } = useAppStore();
  const [groupedData, setGroupedData] = useState<Record<string, GroupedHymnData>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<(Hymn & { countryCode: string; languageCode: string; languageName: string })[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadAllFavourites = async () => {
      setLoading(true);
      try {
        const grouped = getGroupedFavourites();
        const loaded: Record<string, GroupedHymnData> = {};
        
        for (const [key, entries] of Object.entries(grouped)) {
          const [countryCode, languageCode] = key.split('-');
          try {
            const countryConfig = await loadCountryConfig(countryCode);
            const langConfig = countryConfig.hymn_langs.find(l => l.code === languageCode);
            if (langConfig) {
              const hymnData = await loadHymnData(countryCode, languageCode);
              const matchedHymns = hymnData.hymns.filter(h => 
                entries.some(e => e.hymnNumber === h.number)
              );
              loaded[key] = {
                countryCode,
                languageCode,
                languageName: langConfig.name,
                hymns: matchedHymns
              };
            }
          } catch (err) {
            console.warn(`Failed to load ${key}:`, err);
          }
        }
        if (isMounted) setGroupedData(loaded);
      } catch (error) {
        console.error('[Favorites] Load failed:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAllFavourites();
    return () => { isMounted = false; };
  }, [favourites, getGroupedFavourites]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setGlobalSearchResults([]);
      return;
    }
    const results: (Hymn & { countryCode: string; languageCode: string; languageName: string })[] = [];
    Object.values(groupedData).forEach(group => {
      const matches = searchHymns(group.hymns, searchQuery);
      matches.forEach(hymn => {
        results.push({ ...hymn, countryCode: group.countryCode, languageCode: group.languageCode, languageName: group.languageName });
      });
    });
    setGlobalSearchResults(results);
  }, [searchQuery, groupedData]);

  const handleHymnPress = useCallback((hymn: Hymn, countryCode: string, languageCode: string) => {
    addRecentHymn(hymn.number);
    navigation.navigate('HymnDetail', { hymn, countryCode, languageCode });
  }, [addRecentHymn, navigation]);

  const handleGroupPress = useCallback((countryCode: string, languageCode: string, languageName: string) => {
    navigation.navigate('FavoritesList', { countryCode, languageCode, languageName });
  }, [navigation]);

  const renderHymnItem = useCallback(({ item, section }: { item: Hymn; section: { countryCode: string; languageCode: string; languageName: string } }) => (
    <HymnCard
      hymn={item}
      fontSize={settings.fontSize}
      onPress={() => handleHymnPress(item, section.countryCode, section.languageCode)}
      isFavourite={true}
      onToggleFavourite={() => toggleFavourite(item.number, section.countryCode, section.languageCode)}
      highlightQuery={searchQuery}
    />
  ), [settings.fontSize, handleHymnPress, toggleFavourite, searchQuery]);

  const renderGlobalSearchItem = useCallback(({ item }: { item: Hymn & { countryCode: string; languageCode: string; languageName: string } }) => (
    <HymnCard
      hymn={item}
      fontSize={settings.fontSize}
      onPress={() => handleHymnPress(item, item.countryCode, item.languageCode)}
      isFavourite={true}
      onToggleFavourite={() => toggleFavourite(item.number, item.countryCode, item.languageCode)}
      highlightQuery={searchQuery}
      contextLabel={`${item.languageName}`}
    />
  ), [settings.fontSize, handleHymnPress, toggleFavourite, searchQuery]);

  const sections = useMemo((): FavoritesSection[] => {
    return Object.values(groupedData).map(data => ({
      title: data.languageName,
      data: data.hymns,
      countryCode: data.countryCode,
      languageCode: data.languageCode,
      languageName: data.languageName
    }));
  }, [groupedData]);

  const renderSectionHeader = useCallback(({ section }: { section: FavoritesSection }) => (
    <TouchableOpacity 
      style={styles.sectionHeader} 
      onPress={() => handleGroupPress(section.countryCode, section.languageCode, section.languageName)}
    >
      <View style={styles.sectionHeaderContent}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionCount}>{section.data.length} hymns</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  ), [handleGroupPress]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavbarHeader
        title="Favourites"
        subtitle={isSearching ? `${globalSearchResults.length} results` : `${favourites.length} total`}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchArea}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search all favourites..."
          resultCount={isSearching ? globalSearchResults.length : favourites.length}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={32} color="#007A3D" />
          <Text style={styles.loadingText}>Loading favourites...</Text>
        </View>
      ) : isSearching ? (
        <FlatList
          data={globalSearchResults}
          renderItem={renderGlobalSearchItem}
          keyExtractor={(item) => `${item.countryCode}-${item.languageCode}-${item.number}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No results for "{searchQuery}"</Text>
            </View>
          }
        />
      ) : sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No favourites yet</Text>
          <Text style={styles.emptySubtext}>Tap the heart icon on a hymn to add it here</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderHymnItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  searchArea: { marginTop: 4, marginBottom: 4 },
  listContent: { padding: 12 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#666' },
  emptyState: { alignItems: 'center', padding: 40, gap: 8, marginTop: 40 },
  emptyText: { fontSize: 15, fontWeight: '500', color: '#666', textAlign: 'center' },
  emptySubtext: { fontSize: 13, color: '#999', textAlign: 'center' },
  sectionHeader: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  sectionCount: { fontSize: 13, color: '#666' },
});