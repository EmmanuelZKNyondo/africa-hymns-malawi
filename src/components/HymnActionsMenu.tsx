import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import type { Hymn } from '@/utils/dataLoader';
import { useToast } from '@/contexts/ToastContext';

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
  const { toast } = useToast();

  const handleCopyHymn = async () => {
    const { verses, choruses, chorus } = hymn.content;
    
    const getLinesText = (lines: any[]) => 
      lines.map((l: any) => (typeof l === 'string' ? l : l.text)).join('\n');

    let fullText = `${hymn.number}. ${hymn.title}\nBy ${hymn.writer}\n\n`;
    
    const chorusesByPosition: Record<number, any[]> = {};
    choruses?.forEach(c => {
      if (!chorusesByPosition[c.position]) chorusesByPosition[c.position] = [];
      chorusesByPosition[c.position].push(c);
    });

    if (chorusesByPosition[0]) {
      chorusesByPosition[0].forEach(c => {
        fullText += `[${c.label}]\n${getLinesText(c.lines)}\n\n`;
      });
    }

    verses.forEach((v, i) => {
      fullText += `[Verse ${v.number}]\n${getLinesText(v.lines)}\n\n`;
      const nextPos = i + 1;
      if (chorusesByPosition[nextPos]) {
        chorusesByPosition[nextPos].forEach(c => {
          fullText += `[${c.label}]\n${getLinesText(c.lines)}\n\n`;
        });
      }
    });

    const outroChoruses = choruses?.filter(c => c.position === -1 || c.position > verses.length) || [];
    if (outroChoruses.length > 0) {
      outroChoruses.forEach(c => {
        fullText += `[${c.label}]\n${getLinesText(c.lines)}\n\n`;
      });
    }

    if (!choruses && chorus) {
      fullText += `\nChorus:\n${getLinesText(chorus.lines)}\n`;
    }

    await Clipboard.setStringAsync(fullText.trim());
    toast.success('Hymn copied to clipboard');
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="More actions"
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#007A3D" />
      </TouchableOpacity>

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
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => { onShare(); setVisible(false); }}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={20} color="#007A3D" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Share Hymn</Text>
                  <Text style={styles.actionSubtitle}>Send via WhatsApp, SMS, etc.</Text>
                </View>
              </TouchableOpacity>

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
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => { onToggleFavourite(); setVisible(false); }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isFavourite ? 'heart' : 'heart-outline'} 
                  size={20} 
                  color={isFavourite ? '#f31111' : '#007A3D'} 
                />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>
                    {isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    {isFavourite ? 'Remove from saved hymns' : 'Save for quick access'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => { onSettings(); setVisible(false); }}
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
  toggleButton: { padding: 6, borderRadius: 20, backgroundColor: '#e8f5e9', marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 340, maxHeight: '70%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  optionsList: { padding: 8 },
  actionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 4, backgroundColor: '#f8f9fa' },
  actionTextContainer: { flex: 1, marginLeft: 12 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  actionSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  modalFooter: { fontSize: 11, color: '#999', textAlign: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', fontStyle: 'italic' },
});