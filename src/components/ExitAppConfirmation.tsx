import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ExitAppConfirmation: React.FC<Props> = ({ visible, onConfirm, onCancel }) => {
  return(
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Exit App</Text>
          <Text style={styles.message}>Are you sure you want to exit?</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.exitBtn]} onPress={onConfirm}>
              <Text style={styles.exitText}>Exit App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e9ecef',
  },
  exitBtn: {
    backgroundColor: '#dc3545',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  exitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});