import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Quiz {
    id: number;
    type: string;
    question: string;
    answer?: string;
    options?: string[];
    correct_index?: number;
    explanation?: string;
}

interface QuizScreenProps {
    route: { params: { quizzes: Quiz[] } };
    navigation: any;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ route, navigation }) => {
    const { quizzes } = route.params;
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<(number | string | null)[]>(Array(quizzes.length).fill(null));
    const [submitted, setSubmitted] = useState(false);

    const currentQuiz = quizzes[current];

    const handleSelect = (idx: number | string) => {
        const newAnswers = [...answers];
        newAnswers[current] = idx;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (current < quizzes.length - 1) setCurrent(current + 1);
    };
    const handlePrev = () => {
        if (current > 0) setCurrent(current - 1);
    };
    const handleSubmit = () => {
        setSubmitted(true);
    };

    // Tính điểm cho Multiple Choice
    const score = quizzes.reduce((acc, q, idx) => {
        if (q.type === 'Multiple Choice' && typeof answers[idx] === 'number' && q.correct_index === answers[idx]) {
            return acc + 1;
        }
        if (q.type === 'Fill in the Blank' && typeof answers[idx] === 'string' && q.answer?.toLowerCase().trim() === (answers[idx] as string).toLowerCase().trim()) {
            return acc + 1;
        }
        if (q.type === 'Short Answer' && typeof answers[idx] === 'string' && q.answer?.toLowerCase().trim() === (answers[idx] as string).toLowerCase().trim()) {
            return acc + 1;
        }
        // Essay: không tự động chấm
        return acc;
    }, 0);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.progress}>Câu {current + 1}/{quizzes.length}</Text>
            <View style={styles.questionBox}>
                <Text style={styles.question}>{currentQuiz.question}</Text>
                {currentQuiz.options && (
                    <View style={{ marginTop: 16 }}>
                        {currentQuiz.options.map((opt, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.option, answers[current] === idx && styles.optionSelected, submitted && currentQuiz.correct_index === idx && styles.optionCorrect, submitted && answers[current] === idx && answers[current] !== currentQuiz.correct_index && styles.optionWrong]}
                                onPress={() => !submitted && handleSelect(idx)}
                                disabled={submitted}
                            >
                                <Text>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                {currentQuiz.type === 'Fill in the Blank' || currentQuiz.type === 'Short Answer' ? (
                    <TextInput
                        style={styles.input}
                        value={typeof answers[current] === 'string' ? answers[current] as string : ''}
                        onChangeText={text => handleSelect(text)}
                        editable={!submitted}
                        placeholder="Nhập đáp án..."
                    />
                ) : null}
                {submitted && currentQuiz.explanation && (
                    <Text style={styles.explanation}>Giải thích: {currentQuiz.explanation}</Text>
                )}
            </View>
            <View style={styles.navRow}>
                <TouchableOpacity style={styles.navBtn} onPress={handlePrev} disabled={current === 0}>
                    <Text style={{ color: current === 0 ? '#aaa' : '#333' }}>Câu trước</Text>
                </TouchableOpacity>
                {current < quizzes.length - 1 ? (
                    <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
                        <Text style={{ color: '#4285F4' }}>Câu tiếp</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#e91e63' }]} onPress={handleSubmit} disabled={submitted}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Nộp bài ngay</Text>
                    </TouchableOpacity>
                )}
            </View>
            {submitted && (
                <View style={styles.resultBox}>
                    <Text style={styles.resultText}>Bạn đúng {score}/{quizzes.length} câu!</Text>
                    <View style={{ width: '100%', marginTop: 12 }}>
                        {quizzes.map((q, idx) => {
                            let isCorrect = false;
                            if (q.type === 'Multiple Choice' && typeof answers[idx] === 'number') {
                                isCorrect = q.correct_index === answers[idx];
                            } else if ((q.type === 'Fill in the Blank' || q.type === 'Short Answer') && typeof answers[idx] === 'string') {
                                isCorrect = q.answer?.toLowerCase().trim() === (answers[idx] as string).toLowerCase().trim();
                            }
                            return (
                                <View key={idx} style={{ marginBottom: 8, padding: 10, borderRadius: 8, backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee', borderWidth: 1, borderColor: isCorrect ? '#4caf50' : '#e91e63' }}>
                                    <Text style={{ fontWeight: 'bold' }}>Câu {idx + 1}: {isCorrect ? 'Đúng' : 'Sai'}</Text>
                                    <Text style={{ marginTop: 2 }}>{q.question}</Text>
                                    {q.type === 'Multiple Choice' && (
                                        <>
                                            <Text style={{ color: '#888', marginTop: 2 }}>Đáp án đúng: {q.options?.[q.correct_index ?? 0]}</Text>
                                            <Text style={{ color: '#888' }}>Bạn chọn: {typeof answers[idx] === 'number' ? q.options?.[answers[idx] as number] : 'Chưa chọn'}</Text>
                                        </>
                                    )}
                                    {(q.type === 'Fill in the Blank' || q.type === 'Short Answer') && (
                                        <>
                                            <Text style={{ color: '#888', marginTop: 2 }}>Đáp án đúng: {q.answer}</Text>
                                            <Text style={{ color: '#888' }}>Bạn trả lời: {answers[idx] ?? 'Chưa trả lời'}</Text>
                                        </>
                                    )}
                                    {q.explanation && (
                                        <Text style={{ color: '#888', fontStyle: 'italic', marginTop: 2 }}>Giải thích: {q.explanation}</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                    <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
                        <Text style={{ color: '#4285F4' }}>Làm bài tập mới</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
    progress: { fontWeight: 'bold', marginBottom: 8 },
    questionBox: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 16 },
    question: { fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
    option: { backgroundColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 8 },
    optionSelected: { borderWidth: 2, borderColor: '#4285F4', backgroundColor: '#e3f0fd' },
    optionCorrect: { borderWidth: 2, borderColor: '#4caf50', backgroundColor: '#e8f5e9' },
    optionWrong: { borderWidth: 2, borderColor: '#e91e63', backgroundColor: '#ffebee' },
    input: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', padding: 10, marginTop: 12, marginBottom: 8 },
    explanation: { color: '#888', marginTop: 8, fontStyle: 'italic' },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    navBtn: { padding: 12, borderRadius: 8, backgroundColor: '#eee', minWidth: 90, alignItems: 'center' },
    resultBox: { marginTop: 24, alignItems: 'center' },
    resultText: { fontWeight: 'bold', fontSize: 18, color: '#4caf50', marginBottom: 12 },
});

export default QuizScreen; 