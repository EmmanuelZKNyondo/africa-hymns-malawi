// src/components/UpdateModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type VersionInfo = {
  version: string;
  releaseDate: string;
  required: boolean;
  notes: string[];
};

type Props = {
  visible: boolean;
  versionInfo: VersionInfo | null;
  onUpdate: () => void;
  onLater: () => void;
};

export const UpdateModal: React.FC<Props> = ({ visible, versionInfo, onUpdate, onLater }) => {
  if (!versionInfo) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="information-circle" size={32} color="#007A3D" />
            <View>
              <Text style={styles.title}>Update Available</Text>
              <Text style={styles.date}>{versionInfo.releaseDate}</Text>
            </View>
          </View>
          
          <Text style={styles.subtitle}>Version {versionInfo.version} is ready!</Text>
          
          <ScrollView style={styles.notesContainer}>
            <Text style={styles.notesLabel}>What's New:</Text>
            {versionInfo.notes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Ionicons name="checkmark-circle" size={16} color="#007A3D" style={styles.noteIcon} />
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            {!versionInfo.required && (
              <TouchableOpacity style={styles.laterButton} onPress={onLater}>
                <Text style={styles.laterText}>Later</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.updateButton} onPress={onUpdate}>
              <Text style={styles.updateButtonText}>Update Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ... styles remain the same, add .date { fontSize: 12, color: '#999' }
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { width: '85%', backgroundColor: '#fff', borderRadius: 8, padding: 20, elevation: 5 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  date: { fontSize: 12, color: '#999' },
  notesContainer: { maxHeight: 200, marginBottom: 20 },
  notesLabel: { fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 8 },
  noteItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  noteIcon: { marginTop: 2 },
  noteText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  laterButton: { paddingVertical: 10, paddingHorizontal: 16 },
  laterText: { color: '#666', fontWeight: '500' },
  updateButton: { backgroundColor: '#007A3D', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 4 },
  updateButtonText: { color: '#fff', fontWeight: '600' },
});