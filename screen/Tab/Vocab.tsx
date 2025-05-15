// import React from "react";
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import VocabCard from "@/components/ui/VocabCard";
// import { loadAllVocab } from "@/utils/vocabLoader";

// const vocabData = [
//     {
//         word: "abortion",
//         type: "noun",
//         pronunciations: ["/əˈbɔːʃn/", "/əˈbɔːrʃn/"],
//         definition: "the deliberate ending of a pregnancy at an early stage",
//         isFavorite: true,
//     },
//     {
//         word: "about",
//         type: "adverb",
//         pronunciations: ["/əˈbaʊt/", "/əˈbaʊt/"],
//         definition: "a little more or less than; a little before or after",
//         isFavorite: true,
//     },
//     {
//         word: "about",
//         type: "preposition",
//         pronunciations: ["/əˈbaʊt/", "/əˈbaʊt/"],
//         definition: "on the subject of somebody/something; in connection with somebody/something",
//         isFavorite: true,
//     },
//     {
//         word: "above",
//         type: "adverb",
//         pronunciations: ["/əˈbʌv/", "/əˈbʌv/"],
//         definition: "at or to a higher place",
//         isFavorite: true,
//     },
//     {
//         word: "above",
//         type: "preposition",
//         pronunciations: ["/əˈbʌv/", "/əˈbʌv/"],
//         definition: "at or to a higher place or position than something/somebody",
//         isFavorite: true,
//         isHot: true,
//     },
// ];

// export default function VocabScreen() {
//     return (
//         <View style={{ flex: 1, backgroundColor: "#fff" }}>
//             <View style={styles.headerRow}>
//                 <Text style={styles.headerTitle}>Vocabulary</Text>
//                 <MaterialIcons name="search" size={24} color="#6b5e3c" style={{ marginRight: 16 }} />
//             </View>
//             <Text style={styles.allWords}>All words</Text>
//             <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
//                 {vocabData.map((item, idx) => (
//                     <VocabCard key={idx} item={item} onEdit={() => { }} />
//                 ))}
//             </ScrollView>
//         </View>
//     );
// }


// const styles = StyleSheet.create({
//     headerRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         paddingTop: 32,
//         paddingBottom: 8,
//         paddingHorizontal: 20,
//         backgroundColor: "#fff",
//     },
//     headerTitle: {
//         fontSize: 22,
//         fontWeight: "bold",
//         color: "#a88c2c",
//         letterSpacing: 0.5,
//     },
//     allWords: {
//         color: "#a88c2c",
//         fontSize: 16,
//         marginLeft: 24,
//         marginBottom: 8,
//         marginTop: 2,
//     },
// });


import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { loadAllVocab } from '@/utils/vocabLoader';

const VocabScreen = () => {
  const [vocabList, setVocabList] = useState<any[]>([]);

  useEffect(() => {
    setVocabList(loadAllVocab());
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Text style={styles.word}>{item.word} ({item.pos})</Text>
      <Text style={styles.phonetic}>{item.phonetic_text}</Text>
      {item.senses?.length > 0 && (
        <>
          <Text style={styles.definition}>• {item.senses[0].definition}</Text>
          {item.senses[0].examples?.slice(0, 2).map((ex: any, idx: number) => (
            <Text key={idx} style={styles.example}>- {ex.x}</Text>
          ))}
        </>
      )}
    </View>
  );

  return (
    <FlatList
      data={vocabList}
      keyExtractor={(item, index) => `${item.word}-${index}`}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  word: { fontWeight: 'bold', fontSize: 18 },
  phonetic: { fontStyle: 'italic' },
  definition: { marginTop: 4 },
  example: { marginLeft: 10, color: '#555' },
});

export default VocabScreen;
