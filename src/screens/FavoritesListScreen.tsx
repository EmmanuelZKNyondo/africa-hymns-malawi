import React, { useMemo, useCallback, useState, useEffect } from 'react';
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

type Props = NativeStackScreenProps<HomeStackParamList, 'FavoritesList'>;

export const FavoritesListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { countryCode, languageCode, languageName } = route.params;
  const { favourites, toggleFavourite, addRecentHymn, settings } = useAppStore();
  
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadHymnData(countryCode, languageCode);
        if (isMounted) setHymns(data.hymns);
      } catch (error) {
        console.error('[FavoritesList] Failed to load hymns:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [countryCode, languageCode]);

  const favoriteHymns = useMemo(() => {
    const favs = hymns.filter((hymn) => 
      favourites.some(f => f.hymnNumber === hymn.number && f.countryCode === countryCode && f.languageCode === languageCode)
    );
    if (!searchQuery.trim()) return favs;
    return searchHymns(favs, searchQuery);
  }, [hymns, favourites, countryCode, languageCode, searchQuery]);

  const handleHymnPress = useCallback((hymn: Hymn) => {
    addRecentHymn(hymn.number);
    navigation.navigate('HymnDetail', { hymn, countryCode, languageCode });
  }, [addRecentHymn, navigation, countryCode, languageCode]);

  const renderItem = useCallback(({ item }: { item: Hymn }) => (
    <HymnCard
      hymn={item}
      fontSize={settings.fontSize}
      onPress={() => handleHymnPress(item)}
      isFavourite={true}
      onToggleFavourite={() => toggleFavourite(item.number, countryCode, languageCode)}
      highlightQuery={searchQuery}
    />
  ), [settings.fontSize, handleHymnPress, toggleFavourite, countryCode, languageCode, searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavbarHeader
        title={`${languageName} Favourites`}
        subtitle={`${favoriteHymns.length} songs`}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchArea}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={`Search ${languageName} favourites...`}
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
              {searchQuery ? `No results for "${searchQuery}"` : 'No favourites in this language yet'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptySubtext}>Browse hymns and tap the heart to add them here</Text>
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