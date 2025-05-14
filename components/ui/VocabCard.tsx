import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const typeColors = {
    noun: "#42a5f5",
    verb: "#66bb6a",
    adj: "#ffa726",
    adverb: "#5b8fd6",
    preposition: "#b24a4a",
};

export default function VocabCard({ item, onEdit }: { item: any, onEdit: () => void }) {
    return (
        <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                <Text style={styles.word}>{item.word}</Text>
                {item.isFavorite && (
                    <MaterialIcons name="star" size={18} color="#fff" style={styles.starIcon} />
                )}
                {item.isHot && (
                    <MaterialIcons name="whatshot" size={22} color="#ff9800" style={{ marginLeft: 6 }} />
                )}
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <View style={[styles.typeTag, { backgroundColor: typeColors[item.type as keyof typeof typeColors] || "#ccc" }]}>
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
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
                <MaterialIcons name="edit" size={18} color="#6b5e3c" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
