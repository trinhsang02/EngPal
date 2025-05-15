import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const VocabDetail = ({ route }: any) => {
  const { vocab } = route.params;
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.word}>{vocab.word}</Text>
      <Text style={styles.phonetic}>UK: {vocab.phonetic_text} | US: {vocab.phonetic_am_text}</Text>
      <Text style={styles.pos}>{vocab.pos}</Text>

      {vocab.senses.map((sense: any, idx: number) => (
        <View key={idx} style={styles.section}>
          <Text style={styles.definition}>• {sense.definition}</Text>
          {sense.examples.map((ex: any, i: number) => (
            <Text key={i} style={styles.example}>- {ex.x}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  word: { fontSize: 30, fontWeight: 'bold' },
  phonetic: { fontStyle: 'italic', marginBottom: 4 },
  pos: { fontWeight: 'bold', marginBottom: 10 },
  section: { marginBottom: 16 },
  definition: { fontSize: 16 },
  example: { marginLeft: 10, color: '#555' },
});
