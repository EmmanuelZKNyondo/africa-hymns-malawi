import { TERMS_CONTENT } from '@/data/termsAndConditions';
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { ExitAppConfirmation } from './ExitAppConfirmation';

interface Props {
  visible: boolean; 
  onAccept: () => void;
  onExit: () => void;
};

export const TermsModal: React.FC<Props> = ({visible, onAccept, onExit}) => {
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if(visible){
        setShowExitConfirm(true);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible]);

  const handleCancel = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onExit();
  };

  const handleCancelExit = () => {
    //Stay in app
    setShowExitConfirm(false); 
  };

  return(
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
        <view style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Terms of Use</Text>

            <ScrollView 
              style={styles.scroll} 
              contentContainerStyle={styles.scrollContent} 
              onContentSizeChange={(w,h) => setScrollEnabled(h > 300)} 
              scrollEnabled={scrollEnabled}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.text}>{ TERMS_CONTENT }</Text>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.acceptButton, !scrollEnabled && { opacity: 0.6 }]}
                disabled={!scrollEnabled}
                onPress={onAccept}
              >
                <Text style={styles.acceptButtonText}>I Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </view>
      </Modal>

      <ExitAppConfirmation
        visible={showExitConfirm}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </>
  );
};
  

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  scroll: {
    marginBottom: 16,
    maxHeight: '60%',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'justify',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  acceptButton: {
    backgroundColor: '#007A3D', // Malawi green
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});