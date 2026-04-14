// src/screens/SettingsScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAppStore } from '@/store/useAppStore';
import { NavbarHeader } from '@/components/NavbarHeader';
import { UpdateModal } from '@/components/UpdateModal';
import { useUpdateCheck } from '@/hooks/useUpdateCheck';
import { useToast } from '@/components/ToastAlert';
import { getAvailableCountries } from '@/utils/dataLoader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootDrawerParamList } from '@/navigation/AppNavigator';
import type { CountryCode } from '@/utils/storageUtils';

type Props = NativeStackScreenProps<RootDrawerParamList, 'Settings'>;

const FONT_SIZES = [ 11, 12, 14, 16, 18, 20, 22] as const;

const THEMES = [
  { key: 'light',  label: 'Light',  icon: 'sunny-outline'    as const },
  { key: 'dark',   label: 'Dark',   icon: 'moon-outline'     as const },
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' as const },
] as const;

const COUNTRY_LABELS: Record<CountryCode, { flag: string; name: string }> = {
  mw: { flag: '🇲🇼', name: 'Malawi' },
  zm: { flag: '🇿🇲', name: 'Zambia' },
};

const IC = {
  green:  '#007A3D',
  purple: '#7c3aed',
  blue:   '#1565c0',
  amber:  '#b45309',
  teal:   '#00796b',
  red:    '#c62828',
} as const;

interface SectionProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  iconName, iconColor, iconBg, title, children,
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={15} color={iconColor} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

interface ActionRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  labelColor?: string;
  onPress: () => void;
  showDivider?: boolean;
}

const ActionRow: React.FC<ActionRowProps> = ({
  iconName, iconColor, iconBg, label, labelColor, onPress, showDivider,
}) => (
  <>
    {showDivider && <View style={styles.divider} />}
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.65}>
      <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={14} color={iconColor} />
      </View>
      <Text style={[styles.actionLabel, labelColor ? { color: labelColor } : null]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color="#c0c0c0" />
    </TouchableOpacity>
  </>
);

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { settings, updateSettings, reset } = useAppStore();
  const availableCountries = useMemo(() => getAvailableCountries(), []);
  const { toast, ToastProvider } = useToast();
  
  // ✅ Update Check Hook
  const { 
    hasUpdate, 
    latestVersionInfo, 
    allVersions, 
    handleUpdate, 
    handleDismiss 
  } = useUpdateCheck();
  
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const appName    = Constants.expoConfig?.name        ?? 'Africa Hymns';
  const appVersion = Constants.expoConfig?.version     ?? '1.0.0';

  const handleReset = useCallback(() => {
    toast.warning('Reset all settings?', {
      duration: 6000,
      action: {
        label: 'Reset',
        onPress: async () => {
          await reset();
          toast.success('Settings restored to defaults');
        },
      },
    });
  }, [reset, toast]);

  const handleClearCache = useCallback(() => {
    toast.info('Clear cached hymn data?', {
      duration: 6000,
      action: {
        label: 'Clear',
        onPress: () => toast.success('Cache cleared'),
      },
    });
  }, [toast]);

  const handleCountrySelect = useCallback(
    (code: CountryCode) => {
      updateSettings({ country: code });
      const label = COUNTRY_LABELS[code]?.name ?? code.toUpperCase();
      toast.success(`Country set to ${label}`);
    },
    [updateSettings, toast],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ToastProvider />

      <NavbarHeader
        title="Settings"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="refresh-outline"
        rightLabel="Reset"
        onRightPress={handleReset}
        showUpdateIndicator={hasUpdate}
        onUpdatePress={() => setShowUpdateModal(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Country ── */}
        <Section
          iconName="globe-outline"
          iconColor={IC.green}
          iconBg="#e8f5e9"
          title="Country"
        >
          <View style={styles.countryGrid}>
            {availableCountries.map((code) => {
              const info = COUNTRY_LABELS[code as CountryCode];
              const active = settings.country === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.countryCard, active && styles.countryCardActive]}
                  onPress={() => handleCountrySelect(code as CountryCode)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{info?.flag ?? '🏳️'}</Text>
                  <Text style={[styles.countryName, active && styles.countryNameActive]}>
                    {info?.name ?? code.toUpperCase()}
                  </Text>
                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={IC.green}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* ── Theme ── */}
        <Section
          iconName="sunny-outline"
          iconColor={IC.amber}
          iconBg="#fff8e1"
          title="Theme"
        >
          <View style={styles.chipRow}>
            {THEMES.map((t) => {
              const active = settings.theme === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => updateSettings({ theme: t.key })}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={t.icon}
                    size={13}
                    color={active ? '#fff' : '#555'}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* ── Font Size ── */}
        <Section
          iconName="text-outline"
          iconColor={IC.blue}
          iconBg="#e3f2fd"
          title="Font size"
        >
          <View style={styles.chipRow}>
            {FONT_SIZES.map((size) => {
              const active = settings.fontSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => updateSettings({ fontSize: size })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* ── Language ── */}
        <Section
          iconName="chatbubble-ellipses-outline"
          iconColor={IC.purple}
          iconBg="#ede7f6"
          title="Default language"
        >
          <View style={styles.toggleRow}>
            <Ionicons name="language-outline" size={15} color="#888" style={{ marginRight: 4 }} />
            <Text style={[styles.toggleLabel, settings.language === 'en' && styles.toggleLabelActive]}>
              English
            </Text>
            <Switch
              value={settings.language === 'ch'}
              onValueChange={(val) => updateSettings({ language: val ? 'ch' : 'en' })}
              trackColor={{ false: '#e0e0e0', true: IC.green }}
              thumbColor="#fff"
              ios_backgroundColor="#e0e0e0"
            />
            <Text style={[styles.toggleLabel, settings.language === 'ch' && styles.toggleLabelActive]}>
              Chichewa
            </Text>
          </View>
        </Section>

        {/* ── Data ── */}
        <Section
          iconName="server-outline"
          iconColor={IC.teal}
          iconBg="#e0f2f1"
          title="Data"
        >
          <ActionRow
            iconName="trash-outline"
            iconColor={IC.teal}
            iconBg="#e0f2f1"
            label="Clear cache"
            onPress={handleClearCache}
          />
          <ActionRow
            iconName="refresh-outline"
            iconColor={IC.red}
            iconBg="#fce4e4"
            label="Reset all settings"
            labelColor={IC.red}
            onPress={handleReset}
            showDivider
          />
        </Section>

        {/* ── About & Updates ── */}
        <Section
          iconName="information-circle-outline"
          iconColor={IC.green}
          iconBg="#e8f5e9"
          title="About"
        >
          <View style={styles.aboutContainer}>
            <View style={styles.appInfoRow}>
              <Text style={styles.appName}>{appName}</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v{appVersion}</Text>
              </View>
            </View>
            
            {/* ✅ Update Alert in About Section */}
            {hasUpdate && (
              <TouchableOpacity 
                style={styles.updateAlertRow} 
                onPress={() => setShowUpdateModal(true)}
              >
                <Ionicons name="information-circle" size={20} color="#FF3B30" />
                <Text style={styles.updateAlertText}>Update Available (v{latestVersionInfo?.version})</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            )}

            <Text style={styles.historyTitle}>Update History</Text>
            {/* ✅ Fix: Use index + version as key to prevent duplicates */}
            {allVersions.map((v, index) => (
              <View key={`${v.version}-${index}`} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyVersion}>v{v.version}</Text>
                  <Text style={styles.historyDate}>{v.releaseDate}</Text>
                </View>
                {v.notes.map((note, i) => (
                  <Text key={i} style={styles.historyNote}>• {note}</Text>
                ))}
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>

      {/* ✅ Update Modal */}
      <UpdateModal 
        visible={showUpdateModal} 
        versionInfo={latestVersionInfo}
        onUpdate={handleUpdate}
        onLater={() => setShowUpdateModal(false)}
      />
    </SafeAreaView>
  );
};

const SECTION_RADIUS = 4;
const CHIP_RADIUS    = 3;

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f0f2f5' },
  scrollView: { flex: 1 },
  content:    { padding: 12, paddingBottom: 32, gap: 8 },

  section: {
    backgroundColor: '#fff',
    borderRadius: SECTION_RADIUS,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: SECTION_RADIUS,
    backgroundColor: '#fafafa',
    gap: 6,
  },
  countryCardActive: {
    borderWidth: 1.5,
    borderColor: '#007A3D',
    backgroundColor: '#e8f5e9',
  },
  countryFlag: { fontSize: 18 },
  countryName: { fontSize: 13, color: '#444' },
  countryNameActive: { color: '#007A3D', fontWeight: '600' },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: CHIP_RADIUS,
    borderWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  chipActive: {
    backgroundColor: '#007A3D',
    borderColor: '#006633',
  },
  chipText:       { fontSize: 13, color: '#444' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  toggleLabel:       { fontSize: 13, color: '#aaa' },
  toggleLabelActive: { color: '#007A3D', fontWeight: '600' },

  divider: { height: 0.5, backgroundColor: '#f0f0f0', marginHorizontal: 14 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  actionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontSize: 14, color: '#222' },

  // About Styles
  aboutContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  versionBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  versionText: { fontSize: 12, color: '#007A3D', fontWeight: '600' },
  
  updateAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    marginBottom: 16,
    gap: 10,
  },
  updateAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#c62828',
    fontWeight: '600',
  },

  historyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 4,
  },
  historyItem: {
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyVersion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007A3D',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  historyNote: {
    fontSize: 12,
    color: '#555',
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 16,
  },
});