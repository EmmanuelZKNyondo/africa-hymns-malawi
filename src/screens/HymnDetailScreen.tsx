// src/screens/HymnDetailScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';
import type { Hymn, Verse, Chorus, CrossReference } from '@/utils/dataLoader';

type Props = NativeStackScreenProps<HomeStackParamList, 'HymnDetail'>;

export const HymnDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { 
    hymn: initialHymn, 
    countryCode: initialCountry = 'mw', 
    languageCode: initialLanguage = 'en' 
  } = route.params;
  
  const { settings, toggleFavourite, isFavourite } = useAppStore();
  
  const [currentHymn, setCurrentHymn] = useState<Hymn>(initialHymn);
  const [currentCountry, setCurrentCountry] = useState<string>(initialCountry);
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLanguage);
  const [loadingCrossRef, setLoadingCrossRef] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState<number | string | null>(null);
  const [copiedChorus, setCopiedChorus] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const fontSize = settings.fontSize;
  const isFav = isFavourite(currentHymn.number);

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

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  }, []);

  const handleCopyVerse = useCallback((verseNumber: number | string, lines: string[]) => {
    Clipboard.setString(lines.join('\n'));
    setCopiedVerse(verseNumber);
    showToast(`Verse ${verseNumber} copied to clipboard`);
    setTimeout(() => setCopiedVerse(null), 7500);
  }, [showToast]);

  const handleCopyChorus = useCallback(() => {
    if (currentHymn.content.chorus) {
      Clipboard.setString(currentHymn.content.chorus.lines.join('\n'));
      setCopiedChorus(true);
      showToast('Chorus copied to clipboard');
      setTimeout(() => setCopiedChorus(false), 7500);
    }
  }, [currentHymn, showToast]);

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
            idx > 0 && styles.verseLineIndent  // ✅ Indent lines after first
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
        <Text style={[styles.chorusLabel, { fontSize: fontSize - 2 }]}>Chorus</Text>
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
        <HymnActionsMenu hymn={currentHymn} isFavourite={isFav} onToggleFavourite={() => toggleFavourite(currentHymn.number)} onShare={handleShare} onSettings={handleSettingsRedirect} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loadingCrossRef && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007A3D" />
            <Text style={styles.loadingText}>Loading alternate version...</Text>
          </View>
        )}

        <View style={styles.hymnHeader}>
          <TouchableOpacity onPress={() => toggleFavourite(currentHymn.number)} style={styles.hymnFavButtonAbsolute} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel={isFav ? 'Remove from favourites' : 'Add to favourites'}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#eb0e0e' : '#ddd'} />
          </TouchableOpacity>

          <View style={styles.hymnCenteredContent}>
            <Text style={[styles.hymnTitle, { fontSize: fontSize }]} numberOfLines={2}>{currentHymn.title}</Text>
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

      {toast.visible && (
        <View style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}
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
  verseLineIndent: {
    paddingLeft: 16
  },
  chorusSection: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 4,
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

  toastContainer: {
    position: 'absolute',
    top: 50, 
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 20,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toastText: { color: '#22c55e', fontSize: 13, fontWeight: '500' },
});