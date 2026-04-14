// src/screens/FavoritesScreen.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { HymnCard } from '@/components/HymnCard';
import { NavbarHeader } from '@/components/NavbarHeader';
import { SearchBar } from '@/components/SearchBar';
import { loadHymnData, type Hymn, searchHymns } from '@/utils/dataLoader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Favorites'>;

export const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const favourites = useAppStore((state) => state.favourites);
  const toggleFavourite = useAppStore((state) => state.toggleFavourite);
  const addRecentHymn = useAppStore((state) => state.addRecentHymn);
  const fontSize = useAppStore((state) => state.settings.fontSize);
  const countryCode = useAppStore((state) => state.settings.country);

  const [allHymns, setAllHymns] = React.useState<Hymn[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const { loadCountryConfig } = await import('@/utils/dataLoader');
        const config = await loadCountryConfig(countryCode);
        if (config.hymn_langs.length > 0) {
          const data = await loadHymnData(countryCode, config.hymn_langs[0].code);
          if (isMounted) setAllHymns(data.hymns);
        }
      } catch (error) {
        console.error('[Favorites] Failed to load hymns:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [countryCode]);

  const favoriteHymns = useMemo(() => {
    const favs = allHymns.filter((hymn) => favourites.includes(hymn.number));
    if (!searchQuery.trim()) return favs;
    return searchHymns(favs, searchQuery);
  }, [allHymns, favourites, searchQuery]);

  const handleHymnPress = useCallback((hymn: Hymn) => {
    addRecentHymn(hymn.number);
    navigation.navigate('HymnDetail', { 
      hymn, 
      countryCode, 
      languageCode: 'en' 
    });
  }, [addRecentHymn, navigation, countryCode]);

  const renderItem = useCallback(({ item }: { item: Hymn }) => (
    <HymnCard
      hymn={item}
      fontSize={fontSize}
      onPress={() => handleHymnPress(item)}
      isFavourite={true}
      onToggleFavourite={() => toggleFavourite(item.number)}
      highlightQuery={searchQuery}
    />
  ), [fontSize, handleHymnPress, toggleFavourite, searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavbarHeader
        title="Favourites"
        subtitle={`${favoriteHymns.length} songs`}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchArea}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search favourites..."
          resultCount={favoriteHymns.length}
        />
      </View>

      <FlatList
        data={favoriteHymns}
        renderItem={renderItem}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No favourites yet'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptySubtext}>Tap the star icon on a hymn to add it here</Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  searchArea: { marginTop: 4, marginBottom: 4 },
  listContent: { padding: 12 },
  emptyState: { alignItems: 'center', padding: 40, gap: 8, marginTop: 40 },
  emptyText: { fontSize: 15, fontWeight: '500', color: '#666', textAlign: 'center' },
  emptySubtext: { fontSize: 13, color: '#999', textAlign: 'center' },
});