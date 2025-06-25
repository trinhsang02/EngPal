import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '@/components/ui/Header';
import { getSuggestionTopics, generateAssignment } from '@/services/assignmentService';
import { useSelector } from 'react-redux';

const SUGGESTED_TOPICS = getSuggestionTopics();

const QUESTION_TYPES = [
    { label: 'Multiple Choice: Chọn kết quả đúng', value: 'Multiple Choice' },
    { label: 'Fill in the Blank: Điền vào chỗ trống', value: 'Fill in the Blank' },
    { label: 'Short Answer: Câu trả lời ngắn', value: 'Short Answer' },
    { label: 'Essay: Bài viết', value: 'Essay' },
];

export default function ExerciseScreen({ navigation }: { navigation: any }) {
    const [topic, setTopic] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState('10');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
    const user = useSelector((state: any) => state.user.user);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        SUGGESTED_TOPICS.then(setSuggestedTopics);
    }, []);

    const toggleTag = (tag: string) => {
        setSelectedTags(tags =>
            tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
        );
        setTopic(tag);
    };

    const toggleType = (type: string) => {
        setSelectedTypes(types =>
            types.includes(type) ? types.filter(t => t !== type) : [...types, type]
        );
    };

    const handleCreateAssignment = async () => {
        setLoading(true);
        try {
            const response = await generateAssignment({
                topic: topic,
                assignment_types: selectedTypes,
                english_level: user?.english_level,
                total_questions: parseInt(questionCount),
            });
            navigation.navigate('QuizScreen', { quizzes: response.quizzes });
        } catch (error) {
            console.error('Error creating assignment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                <View style={styles.iconBox}>
                    <MaterialIcons name="assignment" size={48} color="#fff" />
                </View>
                <Text style={styles.title}>BÀI TẬP</Text>
                <Text style={styles.subtitle}>
                    Thiết lập bài tập phù hợp với nhu cầu học tập của bạn với các chủ đề và dạng bài tập đa dạng.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nhập chủ đề bài tập..."
                    value={topic}
                    onChangeText={setTopic}
                />

                <Text style={styles.sectionLabel}>Chủ đề gợi ý</Text>
                <View style={styles.tagsRow}>
                    {suggestedTopics.map(tag => (
                        <TouchableOpacity
                            key={tag}
                            style={[
                                styles.tag,
                                selectedTags.includes(tag) && styles.tagSelected,
                            ]}
                            onPress={() => toggleTag(tag)}
                        >
                            <Text style={[
                                styles.tagText,
                                selectedTags.includes(tag) && styles.tagTextSelected,
                            ]}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionLabel}>Số lượng câu hỏi</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={questionCount}
                    onChangeText={setQuestionCount}
                />

                <Text style={styles.sectionLabel}>Chọn một hoặc nhiều dạng câu hỏi</Text>
                <View style={styles.typeBox}>
                    {QUESTION_TYPES.map(qt => (
                        <TouchableOpacity
                            key={qt.value}
                            style={[
                                styles.typeItem,
                                selectedTypes.includes(qt.value) && styles.typeItemSelected,
                            ]}
                            onPress={() => toggleType(qt.value)}
                        >
                            <Text style={[
                                styles.typeText,
                                selectedTypes.includes(qt.value) && styles.typeTextSelected,
                            ]}>{qt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity style={styles.createBtn} onPress={handleCreateAssignment} disabled={loading}>
                        <MaterialIcons name="add-task" size={22} color="#fff" />
                        {loading ? (
                            <>
                                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                                <Text style={styles.createBtnText}>Đang tạo bài tập</Text>
                            </>
                        ) : (
                            <Text style={styles.createBtnText}>Tạo bài tập</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.createBtn, { backgroundColor: '#888' }]} onPress={() => navigation.goBack()} disabled={loading}>
                        <MaterialIcons name="arrow-back" size={22} color="#fff" />
                        <Text style={styles.createBtnText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    iconBox: {
        backgroundColor: '#0ea5e9',
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
        marginTop: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0ea5e9',
        marginBottom: 4,
        marginTop: 4,
        letterSpacing: 1,
    },
    subtitle: {
        color: '#666',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 18,
        marginHorizontal: 8,
    },
    input: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    sectionLabel: {
        alignSelf: 'flex-start',
        fontWeight: 'bold',
        color: '#0ea5e9',
        marginBottom: 6,
        marginTop: 8,
        fontSize: 15,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 14,
        width: '100%',
    },
    tag: {
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    tagSelected: {
        backgroundColor: '#0ea5e9',
        borderColor: '#0ea5e9',
    },
    tagText: {
        color: '#333',
        fontSize: 14,
    },
    tagTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    typeBox: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 8,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    typeItem: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    typeItemSelected: {
        backgroundColor: '#0ea5e9',
    },
    typeText: {
        color: '#333',
        fontSize: 15,
    },
    typeTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0ea5e9',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginTop: 10,
    },
    createBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
        marginLeft: 8,
    },
});