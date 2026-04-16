import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Hymn, Verse, Chorus } from '@/utils/dataLoader';

type Props = {
  hymn: Hymn;
  fontSize: number;
  onPress: () => void;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
  highlightQuery?: string;
  contextLabel?: string;
};

const highlightText = (text: string, query: string, highlightStyle: any) => {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) ? (
      <Text key={i} style={highlightStyle}>{part}</Text>
    ) : (
      <Text key={i}>{part}</Text>
    )
  );
};

export const HymnCard = React.memo(({ 
  hymn, fontSize, onPress, isFavourite = false, onToggleFavourite, highlightQuery = '', contextLabel 
}: Props) => {
  const baseFontSize = fontSize;
  
  const highlightedTitle = useMemo(() => {
    if (!highlightQuery.trim()) return hymn.title;
    return highlightText(hymn.title, highlightQuery, styles.highlight);
  }, [hymn.title, highlightQuery]);

  const firstVersePreview = useMemo(() => {
    const firstVerse: Verse | undefined = hymn.content.verses[0];
    return firstVerse?.lines[0] || '';
  }, [hymn.content.verses]);

  const chorusFirstLine = useMemo(() => {
    const chorus: Chorus | null = hymn.content.chorus;
    return chorus?.lines[0] || null;
  }, [hymn.content.chorus]);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.number, { fontSize: baseFontSize }]}>
          {hymn.number}.
        </Text>
        
        <View style={styles.titleContainer}>
          <Text 
            style={[styles.title, { fontSize: baseFontSize }]} 
            numberOfLines={2}
          >
            {highlightedTitle}
          </Text>
          {contextLabel && (
            <Text style={styles.contextLabel}>{contextLabel}</Text>
          )}
        </View>
        
        {onToggleFavourite && (
          <TouchableOpacity 
            onPress={(e) => { e.stopPropagation(); onToggleFavourite(); }}
            style={styles.favButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isFavourite ? 'heart' : 'heart-outline'} 
              size={20} 
              color={isFavourite ? '#eb0e0e' : '#ccc'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {firstVersePreview ? (
        <Text 
          style={[styles.versePreview, { fontSize: Math.max(10, baseFontSize - 4) }]} 
          numberOfLines={1}
        >
          "{firstVersePreview}..."
        </Text>
      ) : null}
      
      {chorusFirstLine && (
        <Text 
          style={[styles.chorusPreview, { fontSize: Math.max(10, baseFontSize - 4) }]} 
          numberOfLines={1}
        >
          🎵 "{chorusFirstLine}..."
        </Text>
      )}
    </TouchableOpacity>
  );
});

HymnCard.displayName = 'HymnCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  number: { 
    fontWeight: '700', 
    color: '#007A3D', 
    marginRight: 6,
    minWidth: 24,
  },
  titleContainer: { flex: 1 },
  title: { 
    fontWeight: '600', 
    color: '#1a1a1a',
    lineHeight: 22,
  },
  contextLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  highlight: {
    backgroundColor: '#fff3cd',
    fontWeight: '700',
    color: '#856404',
  },
  favButton: { padding: 4 },
  versePreview: { 
    fontSize: 11, 
    color: '#555',
    marginBottom: 2,
  },
  chorusPreview: { 
    fontSize: 11, 
    color: '#6C63FF', 
    fontStyle: 'italic',
  },
});