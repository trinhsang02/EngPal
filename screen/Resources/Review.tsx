import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { getReview } from '../../services/reviewService';
import { ReviewRequest, ReviewResponse } from '../../services/model';

// Add level conversion function
const convertToCEFR = (level: string): string => {
    const levelMap: { [key: string]: string } = {
        'beginner': 'A1',
        'Elementary': 'A2',
        'Intermediate': 'B1',
        'Upper-Intermediate': 'B2',
        'Advanced': 'C1',
        'Proficient': 'C2'
    };
    return levelMap[level] || 'A1';
};

const Review = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const [loading, setLoading] = useState(false);
    const [request, setRequest] = useState<ReviewRequest>({
        content: '',
        user_level: convertToCEFR(user?.level || 'beginner'),
        requirement: '',
        category: 'writing',
        language: 'en',
    });
    const [response, setResponse] = useState<ReviewResponse | null>(null);

    const handleSubmit = async () => {
        if (!request.content || !request.requirement) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            console.log('Sending review request:', {
                ...request,
                content: request.content.substring(0, 100) + (request.content.length > 100 ? '...' : ''), // Log only first 100 chars of content
            });
            const reviewResponse = await getReview(request);
            setResponse(reviewResponse);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to get review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderScoreBar = (label: string, score: number) => (
        <View style={styles.scoreBarContainer}>
            <Text style={styles.scoreLabel}>{label}</Text>
            <View style={styles.scoreBar}>
                <View style={[styles.scoreFill, { width: `${score * 10}%` }]} />
            </View>
            <Text style={styles.scoreValue}>{score.toFixed(1)}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>

                {/* <Text style={styles.title}>Writing Review</Text> */}

                <Text style={styles.label}>Your Level</Text>
                <View style={styles.levelDisplay}>
                    <Text style={styles.levelText}>{user?.level || 'Beginner'}</Text>
                </View>

                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={request.category}
                        onValueChange={(value) => setRequest({ ...request, category: value })}
                        style={styles.picker}
                    >
                        <Picker.Item label="Writing" value="writing" />
                        <Picker.Item label="Speaking" value="speaking" />
                        <Picker.Item label="Reading" value="reading" />
                        <Picker.Item label="Listening" value="listening" />
                        <Picker.Item label="Essays" value="essays" />
                    </Picker>
                </View>

                <Text style={styles.label}>Language</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={request.language}
                        onValueChange={(value) => setRequest({ ...request, language: value })}
                        style={styles.picker}
                    >
                        <Picker.Item label="English" value="en" />
                        <Picker.Item label="Vietnamese" value="vi" />
                    </Picker>
                </View>

                <Text style={styles.label}>Requirement</Text>
                <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    value={request.requirement}
                    onChangeText={(text) => setRequest({ ...request, requirement: text })}
                    placeholder="Enter the requirement or prompt"
                />

                <Text style={styles.label}>Content</Text>
                <TextInput
                    style={[styles.input, styles.contentInput]}
                    multiline
                    numberOfLines={6}
                    value={request.content}
                    onChangeText={(text) => setRequest({ ...request, content: text })}
                    placeholder="Enter your content here"
                />

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Get Review</Text>
                    )}
                </TouchableOpacity>
            </View>

            {response && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Review Results</Text>

                    <View style={styles.scoresContainer}>
                        <Text style={styles.sectionTitle}>Scores</Text>
                        {renderScoreBar('Grammar', response.scores.grammar)}
                        {renderScoreBar('Vocabulary', response.scores.vocabulary)}
                        {renderScoreBar('Coherence', response.scores.coherence)}
                        {renderScoreBar('Task Response', response.scores.task_response)}
                        {renderScoreBar('Overall', response.scores.overall)}
                    </View>

                    <View style={styles.feedbackContainer}>
                        <Text style={styles.sectionTitle}>Overall Feedback</Text>
                        <Text style={styles.feedbackText}>{response.overall_feedback}</Text>
                    </View>

                    <View style={styles.strengthsContainer}>
                        <Text style={styles.sectionTitle}>Strengths</Text>
                        {response.strength_points.map((point, index) => (
                            <Text key={index} style={styles.listItem}>• {point}</Text>
                        ))}
                    </View>

                    <View style={styles.improvementsContainer}>
                        <Text style={styles.sectionTitle}>Areas for Improvement</Text>
                        {response.improvement_areas.map((area, index) => (
                            <Text key={index} style={styles.listItem}>• {area}</Text>
                        ))}
                    </View>

                    <View style={styles.suggestionsContainer}>
                        <Text style={styles.sectionTitle}>Suggestions</Text>
                        {response.suggestions.map((suggestion, index) => (
                            <View key={index} style={styles.suggestionItem}>
                                <Text style={styles.suggestionCategory}>{suggestion.category}</Text>
                                <Text style={styles.suggestionIssue}>Issue: {suggestion.issue}</Text>
                                <Text style={styles.suggestionText}>Suggestion: {suggestion.suggestion}</Text>
                                <Text style={styles.suggestionExample}>Example: {suggestion.example}</Text>
                                <Text style={styles.suggestionPriority}>Priority: {suggestion.priority}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.correctedContainer}>
                        <Text style={styles.sectionTitle}>Corrected Version</Text>
                        <Text style={styles.correctedText}>{response.corrected_version}</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
    },
    picker: {
        height: 50,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    contentInput: {
        height: 150,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#4285F4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    scoresContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    scoreBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreLabel: {
        width: 100,
        fontSize: 14,
        color: '#666',
    },
    scoreBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        marginHorizontal: 8,
    },
    scoreFill: {
        height: '100%',
        backgroundColor: '#4285F4',
        borderRadius: 4,
    },
    scoreValue: {
        width: 40,
        fontSize: 14,
        color: '#666',
        textAlign: 'right',
    },
    feedbackContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    feedbackText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    strengthsContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    improvementsContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    listItem: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        lineHeight: 24,
    },
    suggestionsContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    suggestionItem: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    suggestionCategory: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    suggestionIssue: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    suggestionText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    suggestionExample: {
        fontSize: 14,
        color: '#4285F4',
        marginBottom: 4,
    },
    suggestionPriority: {
        fontSize: 14,
        color: '#666',
    },
    correctedContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    correctedText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    levelDisplay: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    levelText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        minHeight: 56,
    },
});

export default Review;