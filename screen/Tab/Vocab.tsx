import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const vocabData = [
    {
        word: "abortion",
        type: "noun",
        pronunciations: ["/əˈbɔːʃn/", "/əˈbɔːrʃn/"],
        definition: "the deliberate ending of a pregnancy at an early stage",
        isFavorite: true,
    },
    {
        word: "about",
        type: "adverb",
        pronunciations: ["/əˈbaʊt/", "/əˈbaʊt/"],
        definition: "a little more or less than; a little before or after",
        isFavorite: true,
    },
    {
        word: "about",
        type: "preposition",
        pronunciations: ["/əˈbaʊt/", "/əˈbaʊt/"],
        definition: "on the subject of somebody/something; in connection with somebody/something",
        isFavorite: true,
    },
    {
        word: "above",
        type: "adverb",
        pronunciations: ["/əˈbʌv/", "/əˈbʌv/"],
        definition: "at or to a higher place",
        isFavorite: true,
    },
    {
        word: "above",
        type: "preposition",
        pronunciations: ["/əˈbʌv/", "/əˈbʌv/"],
        definition: "at or to a higher place or position than something/somebody",
        isFavorite: true,
        isHot: true,
    },
];

const typeColors: Record<string, string> = {
    noun: "#b2a06a",
    adverb: "#5b8fd6",
    preposition: "#b24a4a",
};

export default function VocabScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Vocabulary</Text>
                <MaterialIcons name="search" size={24} color="#6b5e3c" style={{ marginRight: 16 }} />
            </View>
            <Text style={styles.allWords}>All words</Text>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                {vocabData.map((item, idx) => (
                    <View key={idx} style={styles.card}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                            <Text style={styles.word}>{item.word}</Text>
                            {item.isFavorite && (
                                <MaterialIcons name="star" size={18} color="#fff" style={styles.starIcon} />
                            )}
                            {item.isHot && (
                                <MaterialIcons name="whatshot" size={22} color="#ff9800" style={{ marginLeft: 6 }} />
                            )}
                            <View style={{ flex: 1, alignItems: "flex-end" }}>
                                <View style={[styles.typeTag, { backgroundColor: typeColors[item.type] || "#ccc" }]}>
                                    <Text style={styles.typeText}>{item.type}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                            <TouchableOpacity>
                                <MaterialIcons name="volume-up" size={20} color="#388e3c" />
                            </TouchableOpacity>
                            <Text style={styles.pronunciation}>{item.pronunciations[0]}</Text>
                            <TouchableOpacity style={{ marginLeft: 8 }}>
                                <MaterialIcons name="volume-up" size={20} color="#b71c1c" />
                            </TouchableOpacity>
                            <Text style={styles.pronunciation}>{item.pronunciations[1]}</Text>
                        </View>
                        <Text style={styles.definition}>{item.definition}</Text>
                        <TouchableOpacity style={styles.editBtn}>
                            <MaterialIcons name="edit" size={18} color="#6b5e3c" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 32,
        paddingBottom: 8,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#a88c2c",
        letterSpacing: 0.5,
    },
    allWords: {
        color: "#a88c2c",
        fontSize: 16,
        marginLeft: 24,
        marginBottom: 8,
        marginTop: 2,
    },
    card: {
        backgroundColor: "#f7e3b3",
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        position: "relative",
    },
    word: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2d2d2d",
        marginRight: 6,
    },
    starIcon: {
        backgroundColor: "#bfa13a",
        borderRadius: 10,
        marginLeft: 2,
        padding: 1,
    },
    typeTag: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 2,
        alignSelf: "flex-end",
    },
    typeText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13,
        textTransform: "capitalize",
    },
    pronunciation: {
        fontSize: 16,
        color: "#222",
        marginLeft: 4,
        marginRight: 8,
    },
    definition: {
        fontSize: 15,
        color: "#3a3a3a",
        marginTop: 2,
        marginBottom: 4,
    },
    editBtn: {
        position: "absolute",
        bottom: 10,
        right: 10,
        backgroundColor: "#f7e3b3",
        borderRadius: 16,
        padding: 4,
    },
});