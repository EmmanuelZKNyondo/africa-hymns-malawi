import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  visible: boolean; 
  onAccept: () => void;
};

export const TermsModal: React.FC<Props> = ({visible, onAccept}) => {
  const [scrollEnabled, setScrollEnabled] = useState(false);

  return(
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <ScrollView style={styles.scroll} onContentSizeChange={() => setScrollEnabled(true)} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.text}>
              1. Personal Use Only: This app is for non-commercial worship and study.{'\n'}
              2. Copyright: Hymn writers retain original rights. No redistribution allowed.{'\n'}
              3. Privacy: Zero tracking. Favorites & settings stay on-device.{'\n'}
              4. Offline Sync: Updates download only with consent. No personal data sent.{'\n'}
              5. Liability: Provided "as-is". Not liable for theological interpretation or typos.
              {'\n\n'}By tapping "I Accept", you agree to these terms.
            </Text>
          </ScrollView>

          <TouchableOpacity style={[styles.button, !scrollEnabled && {opacity: 0.5 }]} disabled={!scrollEnabled} onPress={onAccept}>
            <Text style={styles.buttonText}>I Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
  

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '85%'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: "#1a1a1a"
  },
  scroll: {
    marginBottom: 16
  },
  scrollContent: {
    paddingBottom: 10
  },
  text: {
    fontSize: 15, 
    lineHeight: 22,
    color: "#333"
  },
  button: {
    backgroundColor: '#007A3D',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});