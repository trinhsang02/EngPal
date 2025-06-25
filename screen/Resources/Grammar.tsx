import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const grammarJson = require('../../assets/json/grammar/grammar.json');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Grammar({ navigation }: { navigation: any }) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [topics, setTopics] = useState<any[]>([]);

    useEffect(() => {
        if (Array.isArray(grammarJson)) {
            setTopics(grammarJson);
        }
    }, []);

    const handleToggle = (idx: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === idx ? null : idx);
    };

    const handleSubtitlePress = (subtitle: any) => {
        navigation.navigate('GrammarDetail', { subtitle });
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            {/* Animated Header */}
            <View style={styles.headerContainer}>
                <View style={styles.iconCircle}>
                    <Ionicons name="school" size={52} color="#fff" />
                </View>
                <Text style={styles.bigTitle}>NGỮ PHÁP</Text>
                <Text style={styles.desc}>Tìm hiểu và học ngữ pháp tiếng Anh một cách hiệu quả với các chủ đề và cấu trúc ngữ pháp đa dạng.</Text>
            </View>
            {/* List grammar topics */}
            <Text style={styles.header}>Grammar Topics</Text>
            {topics.map((topic, idx) => (
                <View key={idx} style={styles.topicBox}>
                    <TouchableOpacity onPress={() => handleToggle(idx)}>
                        <Text style={styles.topicText}>{topic.topic}</Text>
                    </TouchableOpacity>
                    {expandedIndex === idx && (
                        <View style={styles.subList}>
                            {/* Có thể là sub_topics hoặc examples nếu không có sub_topics */}
                            {Array.isArray(topic.sub_topics)
                                ? topic.sub_topics.map((sub: any, subIdx: number) => (
                                    <TouchableOpacity
                                        key={subIdx}
                                        style={styles.subtitleBox}
                                        onPress={() => handleSubtitlePress(sub)}
                                    >
                                        <Text style={styles.subtitleText}>{sub.name || sub.topic || sub.formula || 'Detail'}</Text>
                                    </TouchableOpacity>
                                ))
                                : null}
                            {/* Nếu không có sub_topics mà có formula/explanation/examples (ví dụ Passive, Relative Clauses) */}
                            {!topic.sub_topics && (
                                <TouchableOpacity
                                    style={styles.subtitleBox}
                                    onPress={() => handleSubtitlePress(topic)}
                                >
                                    <Text style={styles.subtitleText}>{topic.topic}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            ))}
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
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    backText: {
        color: '#2563eb',
        fontSize: 16,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 20,
        backgroundColor: '#0ea5e9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    bigTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#22223b',
        marginBottom: 6,
        letterSpacing: 1,
    },
    desc: {
        fontSize: 14,
        color: '#6c6c6c',
        textAlign: 'center',
        marginBottom: 14,
        lineHeight: 20,
    },
    input: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#f4f4f4',
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#22223b',
        borderWidth: 1,
        borderColor: '#ececec',
        marginBottom: 8,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#2563eb',
    },
    topicBox: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        marginBottom: 12,
    },
    topicText: {
        fontSize: 18,
        color: '#1e293b',
        fontWeight: 'bold',
    },
    subList: {
        marginTop: 10,
        paddingLeft: 10,
    },
    subtitleBox: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#e0e7ef',
        marginBottom: 6,
    },
    subtitleText: {
        fontSize: 16,
        color: '#334155',
    },
});
