// src/components/SearchBar.tsx
import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  resultCount?: number;
};

export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  resultCount,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isFocused && styles.containerFocused]} 
      onPress={handleContainerPress}
      activeOpacity={1}
    >
      <Ionicons name="search" size={20} color={isFocused ? '#007A3D' : '#999'} style={styles.icon} />
      
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {value.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}

      {resultCount !== undefined && (
        <Text style={styles.resultCount}>{resultCount}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  containerFocused: {
    borderColor: '#007A3D',
    shadowColor: '#007A3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 4,
    minHeight: 24,
  },
  clearButton: { padding: 4, marginRight: 4 },
  resultCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
});