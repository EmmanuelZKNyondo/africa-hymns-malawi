// src/components/HymnListActionsMenu.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onRefresh: () => void;
  onSettings: () => void;
};

export const HymnListActionsMenu: React.FC<Props> = ({ onRefresh, onSettings }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* 3-Dot Toggle Button */}
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="More actions"
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#007A3D" />
      </TouchableOpacity>

      {/* Modal Menu */}
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
              <Text style={styles.modalTitle}>Actions</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {/* Refresh Action */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onRefresh();
                  setVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={20} color="#007A3D" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Refresh List</Text>
                  <Text style={styles.actionSubtitle}>Reload hymns from storage</Text>
                </View>
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
    maxWidth: 320,
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
});