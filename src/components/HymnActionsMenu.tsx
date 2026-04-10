// src/components/HymnActionsMenu.tsx
import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, StyleSheet, Clipboard, 
  Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Hymn } from '@/utils/dataLoader';

type Props = {
  hymn: Hymn;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  onShare: () => void;
  onSettings: () => void;
};

export const HymnActionsMenu: React.FC<Props> = ({
  hymn,
  isFavourite,
  onToggleFavourite,
  onShare,
  onSettings
}) => {
  const [visible, setVisible] = useState(false);

  // Handle copy entire hymn
  const handleCopyHymn = () => {
    const versesText = hymn.content.verses
      .map((v, i) => `${i + 1}. ${v.lines.join('\n')}`)
      .join('\n\n');
    const chorusText = hymn.content.chorus 
      ? `\n\nChorus:\n${hymn.content.chorus.lines.join('\n')}` 
      : '';
    
    const fullText = `${hymn.number}. ${hymn.title}\nBy ${hymn.writer}\n\n${versesText}${chorusText}`;
    
    Clipboard.setString(fullText);
    Alert.alert('Copied', 'Hymn copied to clipboard', [{ text: 'OK' }], { cancelable: true });
    setVisible(false);
  };

  return (
    <>
      {/* ✅ 3-Dot Icon Button for Actions Menu */}
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="More actions"
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#007A3D" />
      </TouchableOpacity>

      {/* Modal Menu for Actions */}
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
              <Text style={styles.modalTitle}>Hymn Actions</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {/* Share Action */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onShare();
                  setVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={20} color="#007A3D" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Share Hymn</Text>
                  <Text style={styles.actionSubtitle}>Send via WhatsApp, SMS, etc.</Text>
                </View>
                {/* <Ionicons name="chevron-forward" size={18} color="#999" /> */}
              </TouchableOpacity>

              {/* Copy Entire Hymn */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleCopyHymn}
                activeOpacity={0.7}
              >
                <Ionicons name="copy-outline" size={20} color="#007A3D" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Copy Full Hymn</Text>
                  <Text style={styles.actionSubtitle}>Copy all verses and chorus</Text>
                </View>
                {/* <Ionicons name="chevron-forward" size={18} color="#999" /> */}
              </TouchableOpacity>

              {/* Favourite Toggle */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onToggleFavourite();
                  setVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isFavourite ? 'star' : 'star-outline'} 
                  size={20} 
                  color={isFavourite ? '#FFB800' : '#007A3D'} 
                />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>
                    {isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    {isFavourite ? 'Remove from saved hymns' : 'Save for quick access'}
                  </Text>
                </View>
                {/* <Ionicons name="chevron-forward" size={18} color="#999" /> */}
              </TouchableOpacity>

              {/* Settings Action */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onSettings();
                  setVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={20} color="#007A3D" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Settings</Text>
                  <Text style={styles.actionSubtitle}>Theme, font, language preferences</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFooter}>
              Hymn #{hymn.number} • {hymn.title}
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
    maxHeight: '70%',
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
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
  },
  actionTextContainer: { flex: 1, marginLeft: 12 },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionSubtitle: {
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