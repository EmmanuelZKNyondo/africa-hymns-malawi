// src/screens/PrayerScreen.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Clipboard, 
  Alert, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { NavbarHeader } from '@/components/NavbarHeader';
import { loadPrayerContent } from '@/utils/dataLoader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Prayers'>;

type PrayerType = 'creed' | 'lords-prayer';

export const PrayerScreen: React.FC<Props> = ({ navigation }) => {
  const { settings } = useAppStore();
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerType>('creed');
  const [language, setLanguage] = useState<'en' | 'ch'>(settings.language);
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  // Load prayer content on mount / change
  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await loadPrayerContent(
          selectedPrayer === 'creed' ? 'creed.json' : 'lords-prayer.json'
        );
        setContent(data);
      } catch (error) {
        console.error('[PrayerScreen] Load failed:', error);
        setContent({ en: 'Content not available', ch: 'Zamkatimu sizipezeka' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedPrayer]);

  // Handle copy
  const handleCopy = useCallback(() => {
    const text = content?.[language] || '';
    if (text) {
      Clipboard.setString(text);
      Alert.alert(
        'Copied', 
        `${selectedPrayer === 'creed' ? 'Apostles\' Creed' : 'Lord\'s Prayer'} copied`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  }, [content, language, selectedPrayer]);

  // Prayer titles
  const prayerTitles: Record<PrayerType, string> = {
    'creed': 'Apostles\' Creed',
    'lords-prayer': 'Lord\'s Prayer',
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarHeader
          title="Prayers"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading prayer...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ✅ NavbarHeader */}
      <NavbarHeader
        title="Prayers"
        showBack={true}
        onBack={() => navigation.goBack()}
        rightIcon="copy-outline"
        onRightPress={handleCopy}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Prayer Selector */}
        <View style={styles.prayerSelector}>
          <TouchableOpacity
            style={[
              styles.prayerTab,
              selectedPrayer === 'creed' && styles.prayerTabActive,
            ]}
            onPress={() => setSelectedPrayer('creed')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.prayerTabText,
              selectedPrayer === 'creed' && styles.prayerTabTextActive,
            ]}>
              Apostles' Creed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.prayerTab,
              selectedPrayer === 'lords-prayer' && styles.prayerTabActive,
            ]}
            onPress={() => setSelectedPrayer('lords-prayer')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.prayerTabText,
              selectedPrayer === 'lords-prayer' && styles.prayerTabTextActive,
            ]}>
              Lord's Prayer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Language Toggle */}
        <View style={styles.langToggle}>
          <Text style={styles.langLabel}>Language:</Text>
          <TouchableOpacity
            style={[
              styles.langChip,
              language === 'en' && styles.langChipActive,
            ]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.langChipText,
              language === 'en' && styles.langChipTextActive,
            ]}>
              English
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.langChip,
              language === 'ch' && styles.langChipActive,
            ]}
            onPress={() => setLanguage('ch')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.langChipText,
              language === 'ch' && styles.langChipTextActive,
            ]}>
              Chichewa
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prayer Content */}
        <View style={styles.prayerContent}>
          <Text style={styles.prayerTitle}>
            {prayerTitles[selectedPrayer]}
          </Text>
          <Text 
            style={styles.prayerText}
            selectable
            onLongPress={handleCopy}
          >
            {content?.[language] || 'Content not available'}
          </Text>
        </View>

        {/* Copy Button */}
        <TouchableOpacity 
          style={styles.copyButton} 
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Ionicons name="copy-outline" size={18} color="#007A3D" />
          <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          Long-press text to select • Tap copy icon to save
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  content: { padding: 12 },
  
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: '#666' },
  
  // Prayer Selector Tabs
  prayerSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8, // ✅ Reduced
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  prayerTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  prayerTabActive: {
    backgroundColor: '#007A3D',
  },
  prayerTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  prayerTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Language Toggle
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  langLabel: { fontSize: 13, color: '#666' },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
  },
  langChipActive: {
    backgroundColor: '#007A3D',
  },
  langChipText: { fontSize: 12, color: '#333' },
  langChipTextActive: { color: '#fff', fontWeight: '600' },
  
  // Prayer Content
  prayerContent: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6C63FF',
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  prayerText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1a1a1a',
    textAlign: 'justify',
  },
  
  // Copy Button
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007A3D',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#007A3D',
    fontWeight: '600',
  },
  
  // Footer
  footerNote: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 8,
    fontStyle: 'italic',
  },
});