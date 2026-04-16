import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Clipboard, 
  Alert, Platform, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { NavbarHeader } from '@/components/NavbarHeader';
import { HymnLanguageToggleMenu } from '@/components/HymnLanguageToggleMenu';
import { HymnActionsMenu } from '@/components/HymnActionsMenu';
import { loadHymnData } from '@/utils/dataLoader';
import { useToast } from '@/contexts/ToastContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';
import type { Hymn, Verse, Chorus, CrossReference, FavouriteEntry } from '@/utils/dataLoader';
import type { FavouriteEntry as FavouriteEntryType } from '@/utils/storageUtils';

type Props = NativeStackScreenProps<HomeStackParamList, 'HymnDetail'>;

export const HymnDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { 
    hymn: initialHymn, 
    countryCode: initialCountry = 'mw', 
    languageCode: initialLanguage = 'en' 
  } = route.params;
  
  const { settings, toggleFavourite, isFavourite: isFavouriteStore, favourites } = useAppStore();
  const { toast } = useToast();
  
  const [currentHymn, setCurrentHymn] = useState<Hymn>(initialHymn);
  const [currentCountry, setCurrentCountry] = useState<string>(initialCountry);
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLanguage);
  const [loadingCrossRef, setLoadingCrossRef] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState<number | string | null>(null);
  const [copiedChorus, setCopiedChorus] = useState(false);

  const fontSize = settings.fontSize;
  const isFav = favourites.some((f: FavouriteEntryType) => 
    f.hymnNumber === currentHymn.number && 
    f.countryCode === currentCountry && 
    f.languageCode === currentLanguage
  );

  const handleToggleFavourite = useCallback(() => {
    const wasFav = favourites.some((f: FavouriteEntryType) => 
      f.hymnNumber === currentHymn.number && 
      f.countryCode === currentCountry && 
      f.languageCode === currentLanguage
    );
    
    toggleFavourite(currentHymn.number, currentCountry, currentLanguage);
    
    if (!wasFav) {
      toast.success(`"${currentHymn.title}" added to favourites`);
    } else {
      toast.info(`"${currentHymn.title}" removed from favourites`, { duration: 2000 });
    }
  }, [favourites, currentHymn, currentCountry, currentLanguage, toggleFavourite, toast]);

  const handleCrossReferenceSelect = useCallback(async (ref: CrossReference) => {
    if (ref.countryCode === currentCountry && 
        ref.languageCode === currentLanguage && 
        ref.hymnNumber === currentHymn.number) {
      return;
    }
    
    setLoadingCrossRef(true);
    try {
      const hymnData = await loadHymnData(ref.countryCode, ref.languageCode);
      const matchedHymn = hymnData.hymns.find((h) => h.number === ref.hymnNumber);
      
      if (matchedHymn) {
        navigation.setParams({
          hymn: matchedHymn,
          countryCode: ref.countryCode,
          languageCode: ref.languageCode,
        });
        setCurrentHymn(matchedHymn);
        setCurrentCountry(ref.countryCode);
        setCurrentLanguage(ref.languageCode);
      } else {
        Alert.alert('Not Found', `Hymn #${ref.hymnNumber} not found in ${ref.countryCode.toUpperCase()} ${ref.languageCode.toUpperCase()}.`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('[HymnDetail] Cross-reference load failed:', error);
      Alert.alert('Error', 'Could not load alternate version', [{ text: 'OK' }]);
    } finally {
      setLoadingCrossRef(false);
    }
  }, [currentCountry, currentLanguage, currentHymn.number, navigation]);

  const handleShare = useCallback(async () => {
    try {
      const versePreview = currentHymn.content.verses[0]?.lines.join('\n') || '';
      const chorusPreview = currentHymn.content.chorus?.lines.join('\n') || '';
      const shareText = `🎵 ${currentHymn.number}. ${currentHymn.title}\n\n${versePreview}${chorusPreview ? `\n\n${chorusPreview}` : ''}`;
      
      await Share.share({ message: shareText, title: `${currentHymn.title} - Africa Hymns` });
    } catch (error) {
      console.error('[HymnDetail] Share failed:', error);
    }
  }, [currentHymn]);

  const handleCopyVerse = useCallback((verseNumber: number | string, lines: string[]) => {
    Clipboard.setString(lines.join('\n'));
    setCopiedVerse(verseNumber);
    toast.success(`Verse ${verseNumber} copied`);
    setTimeout(() => setCopiedVerse(null), 2000);
  }, [toast]);

  const handleCopyChorus = useCallback(() => {
    if (currentHymn.content.chorus) {
      Clipboard.setString(currentHymn.content.chorus.lines.join('\n'));
      setCopiedChorus(true);
      toast.success('Chorus copied');
      setTimeout(() => setCopiedChorus(false), 2000);
    }
  }, [currentHymn, toast]);

  const renderStarRating = useCallback((rating: number, iconSize: number = 16) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) stars.push(<Ionicons key={`full-${i}`} name="star" size={iconSize} color="#FFD54F" />);
    if (hasHalfStar) stars.push(<Ionicons key="half" name="star-half" size={iconSize} color="#FFD54F" />);
    
    const emptyCount = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyCount; i++) stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={iconSize} color="#e0e0e0" />);
    
    return stars;
  }, []);

  const handleSettingsRedirect = () => {
    navigation.getParent()?.navigate('Settings');
  };

  const renderVerse = useCallback((verse: Verse) => (
    <View key={verse.number} style={styles.verseBlock}>
      <View style={styles.verseHeader}>
        <TouchableOpacity 
          onPress={() => handleCopyVerse(verse.number, verse.lines)} 
          style={styles.copyButton} 
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons 
            name={copiedVerse === verse.number ? 'checkmark-circle' : 'copy-outline'} 
            size={19} 
            color={copiedVerse === verse.number ? '#007A3D' : '#999'} 
          />
        </TouchableOpacity>
      </View>
      {verse.lines.map((line, idx) => (
        <Text 
          key={idx} 
          style={[
            styles.verseLine, 
            { fontSize, lineHeight: fontSize * 1.6 },
            idx === 0 && styles.verseFirstLine,
            idx > 0 && styles.verseLineIndent
          ]} 
          selectable
        >
          {idx === 0 ? (
            <>
              <Text style={[{ fontSize, fontWeight: '700' }]}>{verse.number}. </Text>
              <Text style={[{ fontSize }]}>{line}</Text>
            </>
          ) : (
            line
          )}
        </Text>
      ))}
    </View>
  ), [fontSize, copiedVerse, handleCopyVerse]);

  const renderChorus = useCallback((chorus: Chorus) => (
    <View style={styles.chorusSection}>
      <View style={styles.chorusHeader}>
        <Text style={[styles.chorusLabel, { fontSize: fontSize - 2 }]}>""</Text>
        <TouchableOpacity onPress={handleCopyChorus} style={styles.copyButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={copiedChorus ? 'checkmark-circle' : 'copy-outline'} size={18} color={copiedChorus ? '#007A3D' : '#999'} />
        </TouchableOpacity>
      </View>
      {chorus.lines.map((line, idx) => (
        <Text key={idx} style={[styles.chorusLine, { fontSize, lineHeight: fontSize * 1.6 }]} selectable>{line}</Text>
      ))}
    </View>
  ), [fontSize, copiedChorus, handleCopyChorus]);

  const headerTitle = useMemo(() => `${currentHymn.number}. ${currentHymn.title}`, [currentHymn]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavbarHeader title={headerTitle} subtitle={"--"} showBack={true} onBack={() => navigation.goBack()} rightIcon={undefined} onRightPress={undefined} />

      <View style={styles.headerActions}>
        <HymnLanguageToggleMenu currentCountry={currentCountry} currentLanguage={currentLanguage} currentHymnNumber={currentHymn.number} crossReferences={currentHymn.crossReference} onSelect={handleCrossReferenceSelect} />
        <HymnActionsMenu 
          hymn={currentHymn} 
          isFavourite={isFav} 
          onToggleFavourite={handleToggleFavourite} 
          onShare={handleShare} 
          onSettings={handleSettingsRedirect} 
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loadingCrossRef && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007A3D" />
            <Text style={styles.loadingText}>Loading alternate version...</Text>
          </View>
        )}

        <View style={styles.hymnHeader}>
          <TouchableOpacity onPress={handleToggleFavourite} style={styles.hymnFavButtonAbsolute} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel={isFav ? 'Remove from favourites' : 'Add to favourites'}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#eb0e0e' : '#ddd'} />
          </TouchableOpacity>

          <View style={styles.hymnCenteredContent}>
            <Text style={[styles.hymnTitle, { fontSize: fontSize }]} numberOfLines={2}>{currentHymn.title}</Text>
              {currentHymn.previous_version_number && (
                <View>
                  <Text>(Yakale #{currentHymn.previous_version_number})</Text>
                </View>
              )}
            <View style={styles.rating}>
              {renderStarRating(currentHymn.rating, 12)}
              <Text style={[styles.ratingText, { fontSize: fontSize - 6 }]}>{currentHymn.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.versesSection}>
          {currentHymn.content.verses.map((verse: Verse, index: number) => (
            <React.Fragment key={verse.number}>
              {renderVerse(verse)}
              {index === 0 && currentHymn.content.chorus && renderChorus(currentHymn.content.chorus)}
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.footerNote, { fontSize: fontSize - 6 }]}>
          Tap verse/chorus to copy • Long-press to select text • Tap ⋮ for options
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  content: { padding: 12 },
  
  headerActions: {
    position: 'absolute',
    top: 40,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 12,
  },
  loadingText: { fontSize: 14, color: '#666' },
  
  hymnHeader: { 
    padding: 12, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    position: 'relative',
    minHeight: 70,
  },
  hymnTitle: { 
    fontWeight: '700', 
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  hymnFavButtonAbsolute: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
  hymnCenteredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  hymnWriter: { color: '#666', fontStyle: 'italic', textAlign: 'center' },
  
  versesSection: { marginBottom: 12 },
  verseBlock: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 1,
  },
  copyButton: { padding: 4 },
  verseFirstLine: { marginTop: 4 },
  verseLine: { color: '#1a1a1a', textAlign: 'justify', marginBottom: 4, marginLeft: 8 },
  verseLineIndent: { paddingLeft: 16 },
  chorusSection: {
    backgroundColor: '#d0fade',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 4,
    borderRightWidth: 2, 
    borderRightColor: '#66f390',
    borderLeftWidth: 2,
    borderLeftColor: '#66f390'
  },
  chorusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chorusLabel: { fontWeight: '600', color: '#8c87e4' },
  chorusLine: { color: '#1a1a1a', fontStyle: 'italic', textAlign: 'center', marginBottom: 1 },
  
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#999', fontWeight: '500' },
  
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 0,
  },
  tags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: '#e8f5e9', color: '#007A3D', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  
  footerNote: {
    color: '#f0f0f0',
    backgroundColor: '#acacac',
    textAlign: 'center',
    paddingVertical: 13,
    fontStyle: 'italic',
    marginTop: 12,
  },
});