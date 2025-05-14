import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '@/components/ui/Header';

const SUGGESTED_TOPICS = [
    'Cultural festivals',
    'Music preferences',
    'Historical events',
    'Sports achievements',
    'Healthy lifestyles',
];

const QUESTION_TYPES = [
    { label: 'Matching Headings: Chọn tiêu đề phù hợp', value: 'matching' },
    { label: 'Dialogue Completion: Hoàn thành đoạn hội thoại', value: 'dialogue' },
    { label: 'Sentence Ordering: Sắp xếp câu', value: 'ordering' },
    { label: 'Word Meaning in Context: Tìm nghĩa của từ trong ngữ cảnh', value: 'meaning' },
    { label: 'Most Suitable Word: Chọn từ thích hợp nhất', value: 'most_suitable_word' },
    { label: 'Verb Conjugation: Chia động từ', value: 'verb_conjugation' },
    { label: 'Conditional Sentences: Câu điều kiện', value: 'conditional_sentences' },
    { label: 'Indirect Speech: Câu gián tiếp', value: 'indirect_speech' },
    { label: 'Sentence Completion: Điền vào chỗ trống', value: 'sentence_completion' },
    { label: 'Reading Comprehension: Đọc hiểu văn bản', value: 'reading_comprehension' },
    { label: 'Grammar: Ngữ pháp', value: 'grammar' },
    { label: 'Collocation: Phối hợp từ', value: 'collocation' },    
    { label: 'Synonym/Antonym: Từ đồng nghĩa/trái nghĩa', value: 'synonym_antonym' },
    { label: 'Vocabulary: Từ vựng', value: 'vocabulary' },
    { label: 'Error Identification: Xác định lỗi sai', value: 'error_identification' },
    { label: 'Word Formation: Chuyển đổi từ loại', value: 'word_formation' },
    { label: 'Passive Voice: Câu bị động', value: 'passive_voice' },
    { label: 'Relative Clauses: Mệnh đề quan hệ', value: 'relative_clauses' },
    { label: 'Comparison Sentences: Câu so sánh', value: 'comparison_sentences' },
    { label: 'Inversion: Câu đảo ngữ', value: 'inversion' },
    { label: 'Articles: Mạo từ', value: 'articles' },
    { label: 'Prepositions: Giới từ', value: 'prepositions' },
    { label: 'Idioms: Thành ngữ', value: 'idioms' },
    { label: 'Sentence Transformation: Câu đồng nghĩa', value: 'sentence_transformation' },
    { label: 'Pronunciation & Stress: Trọng âm và phát âm', value: 'pronunciation_stress' },
    { label: 'Cloze Test: Đọc điền từ', value: 'cloze_test' },
    { label: 'Sentence Combination: Nối câu', value: 'sentence_combination' },
];

export default function ExerciseScreen() {
    const [topic, setTopic] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState('10');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

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

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                <View style={styles.iconBox}>
                    <MaterialIcons name="school" size={48} color="#fff" />
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
                    {SUGGESTED_TOPICS.map(tag => (
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

                <TouchableOpacity style={styles.createBtn}>
                    <MaterialIcons name="add-task" size={22} color="#fff" />
                    <Text style={styles.createBtnText}>Tạo bài tập</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    iconBox: {
        backgroundColor: '#a88c2c',
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
        marginTop: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#222',
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
        color: '#a88c2c',
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
        backgroundColor: '#a88c2c',
        borderColor: '#a88c2c',
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
        backgroundColor: '#a88c2c',
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
        backgroundColor: '#a88c2c',
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