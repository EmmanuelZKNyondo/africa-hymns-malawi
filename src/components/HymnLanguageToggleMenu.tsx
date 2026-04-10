// src/components/HymnLanguageToggleMenu.tsx
import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, StyleSheet, Image, 
  ScrollView, ImageSourcePropType 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CrossReference } from '@/utils/dataLoader';

type Props = {
  currentCountry: string;
  currentLanguage: string;
  currentHymnNumber: number;
  crossReferences?: CrossReference[];
  onSelect: (ref: CrossReference) => void;
};

// ✅ Flag paths with proper ImageSourcePropType typing
const FLAG_PATHS: Record<string, ImageSourcePropType> = {
  mw: require('@/assets/images/flag-icons/mw.png'),
  zm: require('@/assets/images/flag-icons/zm.png')
  // Add more countries as needed
};

// Language labels
const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ch: 'Chichewa',
  tm: 'Tumbuka',
  ny: 'Nyanja',
  sn: 'Shona',
  sw: 'Swahili',
  lg: 'Luganda',
};

export const HymnLanguageToggleMenu: React.FC<Props> = ({
  currentCountry,
  currentLanguage,
  currentHymnNumber,
  crossReferences = [],
  onSelect,
}) => {
  const [visible, setVisible] = useState(false);

  // Filter out current selection from menu options
  const availableOptions = crossReferences.filter(
    (ref) => 
      !(ref.countryCode === currentCountry && 
        ref.languageCode === currentLanguage && 
        ref.hymnNumber === currentHymnNumber)
  );

  // If no alternatives available, don't render the toggle button
  if (availableOptions.length === 0) return null;

  return (
    <>
      {/* ✅ Globe Icon Button for Language/Country Toggle */}
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Switch language or country version"
      >
        <Ionicons name="globe-outline" size={20} color="#007A3D" />
      </TouchableOpacity>

      {/* Modal Menu for Language/Country Versions */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Versions</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {/* Current selection (disabled, shows checkmark) */}
              <View style={styles.optionCurrent}>
                {FLAG_PATHS[currentCountry] ? (
                  <Image 
                    source={FLAG_PATHS[currentCountry]} 
                    style={styles.flagIcon} 
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.flagPlaceholder}>
                    <Text style={styles.flagPlaceholderText}>{currentCountry.toUpperCase()}</Text>
                  </View>
                )}
                
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionLanguage}>
                    {LANGUAGE_LABELS[currentLanguage] || currentLanguage.toUpperCase()}
                  </Text>
                  <Text style={styles.optionHymn}>Hymn #{currentHymnNumber}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#007A3D" />
              </View>

              {/* Available alternative versions */}
              {availableOptions.map((ref, idx) => {
                const flagSource = FLAG_PATHS[ref.countryCode];
                const langLabel = LANGUAGE_LABELS[ref.languageCode] || ref.languageCode.toUpperCase();
                
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.optionItem}
                    onPress={() => {
                      onSelect(ref);
                      setVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    {flagSource ? (
                      <Image source={flagSource} style={styles.flagIcon} resizeMode="contain" />
                    ) : (
                      <View style={styles.flagPlaceholder}>
                        <Text style={styles.flagPlaceholderText}>
                          {ref.countryCode.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionLanguage}>{langLabel}</Text>
                      <Text style={styles.optionHymn}>Hymn #{ref.hymnNumber}</Text>
                    </View>
                    
                    <Ionicons name="chevron-forward" size={18} color="#999" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.modalFooter}>
              Tap a version to switch • Flags show country of origin
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    marginLeft: 6,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  optionsList: {
    padding: 8,
  },
  optionCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 8,
    opacity: 0.7,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  
  flagIcon: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  flagPlaceholder: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  flagPlaceholderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666',
  },
  
  optionTextContainer: { flex: 1 },
  optionLanguage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  optionHymn: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  modalFooter: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    fontStyle: 'italic',
  },
});