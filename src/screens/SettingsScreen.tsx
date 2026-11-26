// src/screens/SettingsScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAppStore } from '@/store/useAppStore';
import { NavbarHeader } from '@/components/NavbarHeader';
import { UpdateModal } from '@/components/UpdateModal';
import { useUpdateCheck } from '@/hooks/useUpdateCheck';
import { useToast } from '@/contexts/ToastContext';
import { useTheme, type ThemeColors } from '@/utils/theme';
import { getAvailableCountries } from '@/utils/dataLoader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootDrawerParamList } from '@/navigation/AppNavigator';
import type { CountryCode } from '@/utils/storageUtils';

type Props = NativeStackScreenProps<RootDrawerParamList, 'Settings'>;

const FONT_SIZES = [11, 12, 14, 16, 18, 20, 22] as const;

const THEMES = [
  { key: 'light', label: 'Light', icon: 'sunny-outline' as const },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' as const },
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' as const },
] as const;

const COUNTRY_LABELS: Record<CountryCode, { flag: string; name: string }> = {
  mw: { flag: '🇲🇼', name: 'Malawi' },
  zm: { flag: '🇿🇲', name: 'Zambia' },
};

interface SectionProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  colors: ThemeColors;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  iconName, iconColor, iconBg, title, colors, children,
}) => (
  <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={15} color={iconColor} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{title}</Text>
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
  colors: ThemeColors;
  onPress: () => void;
  showDivider?: boolean;
}

const ActionRow: React.FC<ActionRowProps> = ({
  iconName, iconColor, iconBg, label, labelColor, colors, onPress, showDivider,
}) => (
  <>
    {showDivider && <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />}
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.65}>
      <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={14} color={iconColor} />
      </View>
      <Text style={[styles.actionLabel, { color: labelColor ?? colors.text }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
    </TouchableOpacity>
  </>
);

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { settings, updateSettings, reset } = useAppStore();
  const colors = useTheme();
  const availableCountries = useMemo(() => getAvailableCountries(), []);
  const { toast } = useToast();
  
  const { 
    hasUpdate, 
    latestVersionInfo, 
    allVersions, 
    handleUpdate, 
  } = useUpdateCheck();
  
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const appName    = Constants.expoConfig?.name    ?? 'Africa Hymns';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset All Settings',
      'This will restore all settings to their default values. Are you sure?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', 
          onPress: async () => {
            await reset();
            toast.success('Settings restored to defaults successfully.');
          }
        }
      ]
    );
  }, [reset, toast]);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache', 
      'This will clear all cached hymn data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive',
          onPress: () => {
            toast.success('Cache cleared');
          }
        }
      ]
    );
  }, [toast]);

  const handleCountrySelect = useCallback(
    (code: CountryCode) => {
      updateSettings({ country: code });
      const label = COUNTRY_LABELS[code]?.name ?? code.toUpperCase();
      toast.success(`Country set to ${label}`);
    },
    [updateSettings, toast],
  );

  const handleThemeSelect = useCallback((theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    toast.success(`Theme set to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
  }, [updateSettings, toast]);

  const handleFontSizeSelect = useCallback((size: number) => {
    updateSettings({ fontSize: size as 11 | 12 | 14 | 16 | 18 | 20 | 22 });
    toast.success(`Font size set to ${size}`);
  }, [updateSettings, toast]);

  const recentVersions = useMemo(() => allVersions.slice(0, 2), [allVersions]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <NavbarHeader
        title="Settings"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="refresh-outline"
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
        {/* Country */}
        <Section
          iconName="globe-outline"
          iconColor={colors.primary}
          iconBg={colors.primaryLight}
          title="Country"
          colors={colors}
        >
          <View style={styles.countryGrid}>
            {availableCountries.map((code) => {
              const info = COUNTRY_LABELS[code as CountryCode];
              const active = settings.country === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[
                    styles.countryCard, 
                    { backgroundColor: colors.chipBg, borderColor: colors.border },
                    active && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                  ]}
                  onPress={() => handleCountrySelect(code as CountryCode)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{info?.flag ?? '🏳️'}</Text>
                  <Text style={[styles.countryName, { color: colors.textSecondary }, active && { color: colors.primary, fontWeight: '600' }]}>
                    {info?.name ?? code.toUpperCase()}
                  </Text>
                  {active && (
                    <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Theme */}
        <Section
          iconName="sunny-outline"
          iconColor="#b45309"
          iconBg="#fff8e1"
          title="Theme"
          colors={colors}
        >
          <View style={styles.chipRow}>
            {THEMES.map((t) => {
              const active = settings.theme === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.chipBg, borderColor: colors.border },
                    active && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => handleThemeSelect(t.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={t.icon}
                    size={13}
                    color={active ? '#fff' : colors.textSecondary}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.chipText, { color: colors.chipText }, active && { color: colors.chipTextActive }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Font Size */}
        <Section
          iconName="text-outline"
          iconColor="#1565c0"
          iconBg="#e3f2fd"
          title="Font size"
          colors={colors}
        >
          <View style={styles.chipRow}>
            {FONT_SIZES.map((size) => {
              const active = settings.fontSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.chipBg, borderColor: colors.border },
                    active && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => handleFontSizeSelect(size)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: colors.chipText }, active && { color: colors.chipTextActive }]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Data */}
        <Section
          iconName="server-outline"
          iconColor="#00796b"
          iconBg="#e0f2f1"
          title="Data"
          colors={colors}
        >
          <ActionRow
            iconName="trash-outline"
            iconColor="#00796b"
            iconBg="#e0f2f1"
            label="Clear cache"
            colors={colors}
            onPress={handleClearCache}
          />
          <ActionRow
            iconName="refresh-outline"
            iconColor={colors.error}
            iconBg={colors.error + '20'}
            label="Reset all settings"
            labelColor={colors.error}
            colors={colors}
            onPress={handleReset}
            showDivider
          />
        </Section>

        {/* About */}
        <Section
          iconName="information-circle-outline"
          iconColor={colors.primary}
          iconBg={colors.primaryLight}
          title="About"
          colors={colors}
        >
          <View style={styles.aboutContainer}>
            <View style={styles.appInfoRow}>
              <Text style={[styles.appName, { color: colors.text }]}>{appName}</Text>
              <View style={[styles.versionBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.versionText, { color: colors.primary }]}>v{appVersion}</Text>
              </View>
            </View>
            
            {hasUpdate && (
              <TouchableOpacity 
                style={[styles.updateAlertRow, { backgroundColor: colors.error + '15', borderColor: colors.error + '40' }]} 
                onPress={() => setShowUpdateModal(true)}
              >
                <Ionicons name="information-circle" size={20} color={colors.error} />
                <Text style={[styles.updateAlertText, { color: colors.error }]}>
                  Update Available (v{latestVersionInfo?.version})
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            )}

            <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>Update History</Text>
            {recentVersions.map((v, index) => (
              <View key={`${v.version}-${index}`} style={[styles.historyItem, { borderBottomColor: colors.borderLight }]}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyVersion, { color: colors.primary }]}>v{v.version}</Text>
                  <Text style={[styles.historyDate, { color: colors.textTertiary }]}>{v.releaseDate}</Text>
                </View>
                {v.notes.map((note, i) => (
                  <Text key={i} style={[styles.historyNote, { color: colors.textSecondary }]}>• {note}</Text>
                ))}
              </View>
            ))}
            {allVersions.length > 2 && (
              <Text style={[styles.historyMore, { color: colors.textTertiary }]}>
                + {allVersions.length - 2} more versions
              </Text>
            )}
          </View>
        </Section>
      </ScrollView>

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
const CHIP_RADIUS = 3;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 12, paddingBottom: 32, gap: 8 },

  section: {
    borderRadius: SECTION_RADIUS,
    borderWidth: 0.5,
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
    borderRadius: SECTION_RADIUS,
    gap: 6,
  },
  countryFlag: { fontSize: 18 },
  countryName: { fontSize: 13 },

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
  },
  chipText: { fontSize: 13 },

  divider: { height: 0.5, marginHorizontal: 14 },
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
  actionLabel: { flex: 1, fontSize: 14 },

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
  },
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  versionText: { fontSize: 12, fontWeight: '600' },
  
  updateAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  updateAlertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },

  historyTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 4,
  },
  historyItem: {
    marginBottom: 16,
    borderBottomWidth: 0.5,
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
  },
  historyDate: {
    fontSize: 12,
  },
  historyNote: {
    fontSize: 12,
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 16,
  },
  historyMore: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
});