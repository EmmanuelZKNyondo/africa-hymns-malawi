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
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/utils/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'PrayerDetail'>;

export const PrayerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { prayerId } = route.params;
  const { settings } = useAppStore();
  const countryCode = settings.country;
  
  const { toast } = useToast();
  const colors = useTheme();

  const [language, setLanguage] = useState<string>(settings.language || 'en');
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const config = await loadCountryConfig(countryCode);
        const prayerConfig = config.prayer_langs?.[prayerId];
        
        if (prayerConfig && prayerConfig.languages) {
          const langs = prayerConfig.languages.map(l => l.code);
          if (isMounted) setAvailableLanguages(langs.length > 0 ? langs : ['en']);
        } else {
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <NavbarHeader title="Prayer" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentTitle = prayerData?.title || 'Prayer';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <NavbarHeader
        title={currentTitle}
        showBack={true}
        onBack={() => navigation.goBack()}
        rightIcon="copy-outline"
        onRightPress={handleCopy}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.langContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.langLabel, { color: colors.textTertiary }]}>Language:</Text>
          <View style={styles.langChips}>
            {availableLanguages.map((langCode) => {
              const isActive = language === langCode;
              return (
                <TouchableOpacity
                  key={langCode}
                  style={[
                    styles.langChip,
                    { backgroundColor: isActive ? colors.primary : colors.chipBg, borderColor: colors.border },
                  ]}
                  onPress={() => setLanguage(langCode)}
                >
                  <Text style={[
                    styles.langChipText,
                    { color: isActive ? colors.chipTextActive : colors.chipText }
                  ]}>
                    {langCode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.contentContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.linesContainer}>
            {prayerData?.content.map((line, index) => (
              <Text 
                key={index} 
                style={[
                  styles.lineText, 
                  { color: colors.text },
                  line.trim() === '' && styles.emptyLine
                ]}
                selectable
                onLongPress={handleCopy}
              >
                {line}
              </Text>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.copyButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} 
            onPress={handleCopy}
          >
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
            <Text style={[styles.copyButtonText, { color: colors.primary }]}>Copy Text</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  langContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  langLabel: {
    fontSize: 12,
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
    borderWidth: 1,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  contentContainer: {
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
  },
  linesContainer: { gap: 4 },
  lineText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center', 
  },
  emptyLine: { height: 16 },
  copyButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});