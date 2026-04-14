// src/screens/PrayerDetailScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Clipboard,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { NavbarHeader } from '@/components/NavbarHeader';
import { loadPrayerData, type PrayerData } from '@/utils/prayersDataLoader';
import { loadCountryConfig } from '@/utils/dataLoader';
import { useToast } from '@/components/ToastAlert';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'PrayerDetail'>;

export const PrayerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { prayerId } = route.params;
  const { settings } = useAppStore();
  const countryCode = settings.country;
  
  // ✅ Initialize Toast Hook
  const { toast, ToastProvider } = useToast();

  const [language, setLanguage] = useState<string>(settings.language || 'en');
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
  const [loading, setLoading] = useState(true);

  // Load available languages for this specific prayer from Country Config
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const config = await loadCountryConfig(countryCode);
        
        // Access prayer_langs instead of languages
        const prayerConfig = config.prayer_langs?.[prayerId];
        
        if (prayerConfig && prayerConfig.languages) {
          const langs = prayerConfig.languages.map(l => l.code);
          if (isMounted) setAvailableLanguages(langs.length > 0 ? langs : ['en']);
        } else {
          // Fallback to hymn languages if prayer config is missing languages
          const hymnLangs = config.hymn_langs?.map(l => l.code) || ['en'];
          if (isMounted) setAvailableLanguages(hymnLangs);
        }
      } catch (error) {
        console.error('[PrayerDetail] Config load failed:', error);
      }
    };
    loadConfig();
    return () => { isMounted = false; };
  }, [countryCode, prayerId]);

  // Load Prayer Content
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadPrayerData(prayerId, countryCode, language);
        if (isMounted) setPrayerData(data);
      } catch (error) {
        console.error('[PrayerDetail] Load failed:', error);
        if (isMounted) setPrayerData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [prayerId, countryCode, language]);

  // ✅ Updated Copy Function using Toast
  const handleCopy = useCallback(() => {
    if (!prayerData) return;
    const text = prayerData.content.join('\n');
    
    if (text) {
      Clipboard.setString(text);
      toast.success('Prayer copied to clipboard');
    }
  }, [prayerData, toast]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavbarHeader title="Prayer" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007A3D" />
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Use title from the loaded JSON data
  const currentTitle = prayerData?.title || 'Prayer';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ✅ Render Toast Provider */}
      <ToastProvider />

      <NavbarHeader
        title={currentTitle}
        showBack={true}
        onBack={() => navigation.goBack()}
        rightIcon="copy-outline"
        onRightPress={handleCopy}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.langContainer}>
          <Text style={styles.langLabel}>Language:</Text>
          <View style={styles.langChips}>
            {availableLanguages.map((langCode) => (
              <TouchableOpacity
                key={langCode}
                style={[
                  styles.langChip,
                  language === langCode && styles.langChipActive
                ]}
                onPress={() => setLanguage(langCode)}
              >
                <Text style={[
                  styles.langChipText,
                  language === langCode && styles.langChipTextActive
                ]}>
                  {langCode.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.linesContainer}>
            {prayerData?.content.map((line, index) => (
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
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
  
  contentContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  linesContainer: { gap: 4 },
  lineText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    textAlign: 'left',
  },
  emptyLine: { height: 12 },
  copyButton: {
    marginTop: 24,
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