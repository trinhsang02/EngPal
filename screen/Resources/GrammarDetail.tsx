import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function GrammarDetail() {
    const route = useRoute();
    const navigation = useNavigation();
    // subtitle có thể là sub_topic hoặc topic không có sub_topics
    const { subtitle } = route.params as any;

    // Helper to render examples with optional translation in parentheses
    const renderExample = (ex: string, idx: number) => {
        // Split example and translation if present (e.g., "Example (Translation)")
        const match = ex.match(/^(.*?)(\([^)]*\))?$/);
        const main = match ? match[1].trim() : ex;
        const translation = match && match[2] ? match[2] : null;
        return (
            <Text key={idx} style={styles.example}>• <Text style={{ color: '#22223b' }}>{main}</Text> {translation && <Text style={styles.translation}>{translation}</Text>}</Text>
        );
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#22223b" />
                {/* Section Header  */}
                <Text style={styles.header}>{subtitle.header || subtitle.name || subtitle.topic || 'Detail'}</Text>
            </TouchableOpacity>



            {/* Subsection Title (lettered if available) */}
            {subtitle.subheader && (
                <Text style={styles.subheader}>{subtitle.subheader}</Text>
            )}

            {/* Explanation (italic) */}
            {subtitle.usage && (
                <Text style={styles.usage}><Text style={{ fontStyle: 'italic' }}>– Cách dùng: </Text>{subtitle.usage}</Text>
            )}

            {/* Explanation (normal) */}
            {subtitle.explanation && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Giải thích:</Text>
                    <Text style={styles.text}>{subtitle.explanation}</Text>
                </View>
            )}

            {/* Formula in a colored box */}
            {subtitle.formula && (
                <View style={styles.formulaBox}>
                    <Text style={styles.sectionTitle}>Cấu trúc:</Text>
                    {typeof subtitle.formula === 'string' ? (
                        <Text style={styles.formulaText}>{subtitle.formula}</Text>
                    ) : (
                        Object.entries(subtitle.formula).map(([key, value]) => (
                            <Text key={key} style={styles.formulaText}>
                                <Text style={{ fontWeight: 'bold' }}>{key}: </Text>
                                {String(value)}
                            </Text>
                        ))
                    )}
                </View>
            )}

            {/* Examples with translation */}
            {subtitle.examples && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ví dụ:</Text>
                    {subtitle.examples.map(renderExample)}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        // marginBottom: 10,
        marginLeft: 10,
        color: '#22223b',
    },
    subheader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: 8,
    },
    usage: {
        fontSize: 16,
        color: '#475569',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0ea5e9',
        marginBottom: 4,
    },
    formulaBox: {
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#bae6fd',
    },
    formulaText: {
        fontSize: 16,
        color: '#334155',
        marginBottom: 2,
        fontFamily: 'monospace',
    },
    text: {
        fontSize: 16,
        color: '#334155',
    },
    example: {
        fontSize: 15,
        color: '#22223b',
        marginLeft: 8,
        marginBottom: 2,
        fontStyle: 'italic',
    },
    translation: {
        color: '#22223b',
        fontSize: 14,
        fontStyle: 'italic',
    },
}); 