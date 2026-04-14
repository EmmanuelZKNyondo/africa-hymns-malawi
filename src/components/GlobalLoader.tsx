// src/components/GlobalLoader.tsx
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

export const GlobalLoader: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#007A3D" />
        <Text style={styles.text}>Loading Africa Hymns...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});