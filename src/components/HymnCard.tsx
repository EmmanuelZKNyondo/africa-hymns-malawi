import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/utils/theme';
import type { Hymn, Verse, Chorus, Line } from '@/utils/dataLoader';

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
  const colors = useTheme();
  const baseFontSize = fontSize;
  
  const highlightedTitle = useMemo(() => {
    if (!highlightQuery.trim()) return hymn.title;
    return highlightText(hymn.title, highlightQuery, styles.highlight);
  }, [hymn.title, highlightQuery]);

  const firstVersePreview = useMemo(() => {
    const firstVerse: Verse | undefined = hymn.content.verses[0];
    const firstLine: Line | undefined = firstVerse?.lines[0];
    return firstLine?.text || '';
  }, [hymn.content.verses]);

  const chorusFirstLine = useMemo(() => {
    const mainChorus = hymn.content.choruses?.find(c => c.position === 0 || c.position === 1);
    const fallbackChorus = hymn.content.chorus; 
    const lines = mainChorus?.lines || fallbackChorus?.lines || [];
    const firstLine: Line | string | undefined = lines[0];
    return typeof firstLine === 'string' ? firstLine : firstLine?.text || null;
  }, [hymn.content.choruses, hymn.content.chorus]);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.number, { fontSize: baseFontSize, color: colors.primary }]}>
          {hymn.number}.
        </Text>
        
        <View style={styles.titleContainer}>
          <Text 
            style={[styles.title, { fontSize: baseFontSize, color: colors.text }]} 
            numberOfLines={2}
          >
            {highlightedTitle}
          </Text>
          {contextLabel && (
            <Text style={[styles.contextLabel, { color: colors.textTertiary }]}>{contextLabel}</Text>
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
              color={isFavourite ? colors.error : colors.textTertiary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {firstVersePreview ? (
        <Text 
          style={[styles.versePreview, { fontSize: Math.max(10, baseFontSize - 4), color: colors.textSecondary }]} 
          numberOfLines={1}
        >
          "{firstVersePreview}..."
        </Text>
      ) : null}
      
      {chorusFirstLine && (
        <Text 
          style={[styles.chorusPreview, { fontSize: Math.max(10, baseFontSize - 4), color: colors.accent }]} 
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
    padding: 14,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 0.5,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  number: { 
    fontWeight: '700', 
    marginRight: 6,
    minWidth: 24,
  },
  titleContainer: { flex: 1 },
  title: { 
    fontWeight: '600', 
    lineHeight: 22,
  },
  contextLabel: {
    fontSize: 11,
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
    marginBottom: 2,
  },
  chorusPreview: { 
    fontStyle: 'italic',
  },
});