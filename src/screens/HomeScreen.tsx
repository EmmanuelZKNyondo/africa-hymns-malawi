import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Africa Hymns (Malawi)</Text>
        <Text style={styles.subtitle}>Offline hymnal, search & worship companion</Text>
        
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Hymn library, search, favorites, and prayers will populate here as we build the next modules.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => console.log('Navigate to Settings')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 28 },
  placeholderCard: {
    backgroundColor: '#e9ecef',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  placeholderText: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
  button: {
    backgroundColor: '#007A3D',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});