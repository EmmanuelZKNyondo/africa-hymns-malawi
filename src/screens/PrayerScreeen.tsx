// src/screens/PrayerScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Clipboard, 
  Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { NavbarHeader } from '@/components/NavbarHeader';
import { loadPrayerData, PRAYER_LIST, type PrayerContent } from '@/utils/prayersDataLoader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Prayers'>;

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ch', label: 'Chichewa' },
  { code: 'ny', label: 'Nyanja' },
];

export const PrayerScreen: React.FC<Props> = ({ navigation }) => {
  const { settings } = useAppStore();
  const countryCode = settings.country;
  
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>(PRAYER_LIST[0].id);
  const [language, setLanguage] = useState<string>(settings.language || 'en');
  const [prayerData, setPrayerData] = useState<PrayerContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadPrayerData(countryCode, selectedPrayerId);
        if (isMounted) setPrayerData(data);
      } catch (error) {
        console.error('[PrayerScreen] Load failed:', error);
        if (isMounted) setPrayerData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [countryCode, selectedPrayerId]);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
  };

  const handleCopy = useCallback(() => {
    if (!prayerData) return;
    const lines = prayerData.content[language] || [];
    const text = lines.join('\n'); // ✅ Join array with newlines for copying
    
    if (text) {
      Clipboard.setString(text);
      Alert.alert('Copied', 'Prayer copied to clipboard', [{ text: 'OK' }]);
    }
  }, [prayerData, language]);

  const renderPrayerItem = ({ item }: { item: typeof PRAYER_LIST[0] }) => {
    const isSelected = selectedPrayerId === item.id;
    const displayTitle = prayerData && selectedPrayerId === item.id 
      ? prayerData.title[language] || item.id 
      : item.id.replace('-', ' ').toUpperCase();

    return (
      <TouchableOpacity
        style={[styles.prayerCard, isSelected && styles.prayerCardActive]}
        onPress={() => setSelectedPrayerId(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={item.icon as any} 
          size={24} 
          color={isSelected ? '#fff' : '#007A3D'} 
        />
        <Text style={[styles.prayerCardTitle, isSelected && styles.prayerCardTitleActive]}>
          {displayTitle}
        </Text>
        {isSelected && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
      </TouchableOpacity>
    );
  };

  const currentTitle = prayerData?.title?.[language] || 'Prayer';
  const currentLines = prayerData?.content?.[language] || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavbarHeader
        title="Prayers"
        showBack={true}
        onBack={() => navigation.goBack()}
        rightIcon="copy-outline"
        onRightPress={handleCopy}
      />

      <FlatList
        data={PRAYER_LIST}
        renderItem={renderPrayerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.langContainer}>
              <Text style={styles.langLabel}>Language:</Text>
              <View style={styles.langChips}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langChip,
                      language === lang.code && styles.langChipActive
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text style={[
                      styles.langChipText,
                      language === lang.code && styles.langChipTextActive
                    ]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#007A3D" />
                <Text style={styles.loadingText}>Loading content...</Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          !loading && prayerData ? (
            <View style={styles.contentContainer}>
              <Text style={styles.contentTitle}>{currentTitle}</Text>
              
              {/* ✅ Render lines individually */}
              <View style={styles.linesContainer} collapsable={false}>
                {currentLines.map((line, index) => (
                  <Text 
                    key={index} 
                    style={[
                      styles.lineText, 
                      line.trim() === '' && styles.emptyLine
                    ]}
                    selectable
                    onLongPress={handleCopy}
                  >
                    {line}
                  </Text>
                ))}
              </View>
              
              <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={18} color="#007A3D" />
                <Text style={styles.copyButtonText}>Copy Text</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listContent: { padding: 16, paddingBottom: 32 },
  
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  prayerCardActive: {
    backgroundColor: '#007A3D',
    borderColor: '#007A3D',
  },
  prayerCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  prayerCardTitleActive: {
    color: '#fff',
  },
  
  langContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  langLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  langChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f1f1f1',
  },
  langChipActive: {
    backgroundColor: '#007A3D',
  },
  langChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  langChipTextActive: {
    color: '#fff',
  },
  
  loadingBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
  },
  contentContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007A3D',
    marginBottom: 16,
    textAlign: 'center',
  },
  linesContainer: {
    gap: 4, // Space between lines
  },
  lineText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    textAlign: 'left',
  },
  emptyLine: {
    height: 12, // Height for empty lines (stanzas break)
  },
  copyButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007A3D',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#007A3D',
    fontWeight: '600',
  },
});