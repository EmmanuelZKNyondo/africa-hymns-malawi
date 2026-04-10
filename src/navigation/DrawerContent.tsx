// src/navigation/DrawerContent.tsx
import React, { useState, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, 
  FlatList, KeyboardAvoidingView, Platform 
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';

/* ==================== COUNTRY DATA ==================== */
const COUNTRIES = [
  { code: 'mw', name: 'Malawi', dialCode: '+265' },
  // { code: 'zm', name: 'Zambia', dialCode: '+260' },
  // { code: 'zw', name: 'Zimbabwe', dialCode: '+263' },
  // { code: 'tz', name: 'Tanzania', dialCode: '+255' },
  // { code: 'ke', name: 'Kenya', dialCode: '+254' },
  // { code: 'ug', name: 'Uganda', dialCode: '+256' },
  // { code: 'rz', name: 'Rwanda', dialCode: '+250' },
  // { code: 'bz', name: 'Burundi', dialCode: '+257' },
  // { code: 'mz', name: 'Mozambique', dialCode: '+258' },
  // { code: 'ao', name: 'Angola', dialCode: '+244' },
];

/* ==================== COUNTRY SELECTOR MODAL ==================== */
interface CountrySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  selectedCode: string;
}

const CountrySelectorModal: React.FC<CountrySelectorProps> = ({ 
  visible, onClose, onSelect, selectedCode 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter countries based on search (memoized for performance)
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const query = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (code: string) => {
    onSelect(code);
    setSearchQuery(''); // Reset search for next open
    onClose();
  };

  const renderItem = ({ item }: { item: typeof COUNTRIES[0] }) => {
    const isSelected = item.code === selectedCode;
    return (
      <TouchableOpacity
        style={[styles.countryItem, isSelected && styles.countryItemSelected]}
        onPress={() => handleSelect(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.countryInfo}>
          <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
            {item.name}
          </Text>
          <Text style={styles.countryCode}>{item.code.toUpperCase()} • {item.dialCode}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#007A3D" />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {}}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No countries found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ==================== MAIN DRAWER CONTENT ==================== */
export const DrawerContent: React.FC<any> = (props) => {
  const { settings, updateSettings } = useAppStore();
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const handleCountrySelect = async (code: string) => {
    await updateSettings({ country: code as any });
    setShowCountrySelector(false);
  };

  const currentCountry = COUNTRIES.find((c) => c.code === settings.country) || COUNTRIES[0];

  return (
    <>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="globe-outline" size={32} color="#fff" />
          <Text style={styles.appName}>Africa Hymns</Text>
          <Text style={styles.appSubtitle}>Sing • Praise • Worship</Text>
        </View>

        {/* Country Selector Trigger */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Active Region</Text>
          <TouchableOpacity
            style={styles.countryTrigger}
            onPress={() => setShowCountrySelector(true)}
            activeOpacity={0.7}
          >
            <View style={styles.countryTriggerInfo}>
              <Ionicons name="location-outline" size={20} color="#007A3D" />
              <View>
                <Text style={styles.countryTriggerName}>{currentCountry.name}</Text>
                <Text style={styles.countryTriggerCode}>
                  {currentCountry.code.toUpperCase()} • {COUNTRIES.length} countries available
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <DrawerItemList {...props} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>v1.0.0</Text>
          <Text style={styles.footerText}>© {new Date().getFullYear()} EZPN</Text>
        </View>
      </DrawerContentScrollView>

      {/* Country Selector Modal */}
      <CountrySelectorModal
        visible={showCountrySelector}
        onClose={() => setShowCountrySelector(false)}
        onSelect={handleCountrySelect}
        selectedCode={settings.country}
      />
    </>
  );
};

/* ==================== STYLES ==================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  /* Header */
  header: {
    padding: 14,
    backgroundColor: '#007A3D',
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  appName: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 8 },
  appSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  
  /* Section */
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
  
  /* Country Trigger Button */
  countryTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  countryTriggerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countryTriggerName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  countryTriggerCode: { fontSize: 12, color: '#666', marginTop: 2 },
  
  /* Footer */
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 'auto',
  },
  footerText: { fontSize: 11, color: '#999', textAlign: 'center' },
  
  /* ==================== MODAL STYLES ==================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  closeButton: { padding: 4 },
  
  /* Search Input */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 12,
  },
  clearButton: { padding: 4 },
  
  /* Country List */
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  countryItemSelected: { backgroundColor: '#e8f5e9', borderRadius: 8, paddingHorizontal: 8 },
  countryInfo: { flex: 1 },
  countryName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  countryNameSelected: { fontWeight: '600', color: '#007A3D' },
  countryCode: { fontSize: 12, color: '#666', marginTop: 2 },
  
  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: { fontSize: 15, fontWeight: '500', color: '#666', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#999', marginTop: 4 },
});