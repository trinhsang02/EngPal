import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlashCardWord } from '../../services/flashCardDatabase';
import * as Speech from 'expo-speech';

interface FlashCardProps {
    word: FlashCardWord;
    onAnswer: (isCorrect: boolean) => void;
    onSkip: () => void;
    showAnswer: boolean;
    onToggleAnswer: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function FlashCard({
    word,
    onAnswer,
    onSkip,
    showAnswer,
    onToggleAnswer
}: FlashCardProps) {
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const [isFlipping, setIsFlipping] = useState(false);

    const handleFlip = () => {
        if (isFlipping) return;

        setIsFlipping(true);
        onToggleAnswer();

        Animated.timing(flipAnimation, {
            toValue: showAnswer ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsFlipping(false);
        });
    };

    const handlePronunciation = () => {
        if (word.phonetic) {
            // Try to speak the word using TTS as fallback
            Speech.speak(word.word, {
                language: 'en-US',
                pitch: 1,
                rate: 0.8,
            });
        }
    };

    const frontInterpolate = flipAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });

    const frontOpacity = flipAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0, 0],
    });

    const backOpacity = flipAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    const getMemoryLevelColor = (level?: number) => {
        if (!level) return '#E5E7EB';
        const colors = ['#FEE2E2', '#FED7D7', '#FEF3C7', '#D1FAE5', '#DBEAFE', '#E0E7FF'];
        return colors[Math.min(level - 1, colors.length - 1)] || '#E5E7EB';
    };

    return (
        <View style={styles.container}>
            {/* Memory Level Indicator */}
            {word.learning_stats && (
                <View
                    style={[
                        styles.memoryIndicator,
                        { backgroundColor: getMemoryLevelColor(word.learning_stats.memory_level) }
                    ]}
                >
                    <Text style={styles.memoryText}>
                        Level {word.learning_stats.memory_level || 'New'}
                    </Text>
                </View>
            )}

            {/* Card Container */}
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={handleFlip}
                activeOpacity={0.9}
            >
                {/* Front of Card */}
                <Animated.View
                    style={[
                        styles.cardFace,
                        styles.cardFront,
                        {
                            transform: [{ rotateY: frontInterpolate }],
                            opacity: frontOpacity,
                        },
                    ]}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.wordHeader}>
                            <Text style={styles.wordText}>{word.word}</Text>
                            <TouchableOpacity onPress={handlePronunciation} style={styles.soundButton}>
                                <Ionicons name="volume-high" size={24} color="#4A90E2" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.posText}>{word.pos}</Text>

                        {word.phonetic_text && (
                            <Text style={styles.phoneticText}>{word.phonetic_text}</Text>
                        )}

                        <View style={styles.tapHint}>
                            <Ionicons name="hand-left" size={20} color="#9CA3AF" />
                            <Text style={styles.tapHintText}>Tap to reveal meaning</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Back of Card */}
                <Animated.View
                    style={[
                        styles.cardFace,
                        styles.cardBack,
                        {
                            transform: [{ rotateY: backInterpolate }],
                            opacity: backOpacity,
                        },
                    ]}
                >
                    <View style={styles.cardContent}>
                        <Text style={styles.wordTextSmall}>{word.word}</Text>
                        <Text style={styles.posTextSmall}>{word.pos}</Text>

                        {/* Show first definition and example */}
                        {word.senses && word.senses.length > 0 && (
                            <View style={styles.definitionContainer}>
                                <Text style={styles.definitionText}>
                                    {word.senses[0].definition}
                                </Text>

                                {word.senses[0].examples && word.senses[0].examples.length > 0 && (
                                    <View style={styles.exampleContainer}>
                                        <Text style={styles.exampleText}>
                                            "{word.senses[0].examples[0].example}"
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.tapHint}>
                            <Ionicons name="hand-left" size={20} color="#9CA3AF" />
                            <Text style={styles.tapHintText}>Tap to hide meaning</Text>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.skipButton]}
                    onPress={onSkip}
                >
                    <Ionicons name="close" size={24} color="#EF4444" />
                    <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.wrongButton,
                        !showAnswer && styles.disabledButton
                    ]}
                    onPress={() => onAnswer(false)}
                    disabled={!showAnswer}
                >
                    <Ionicons name="thumbs-down" size={24} color={!showAnswer ? "#9CA3AF" : "#F59E0B"} />
                    <Text style={[styles.actionButtonText, { color: !showAnswer ? "#9CA3AF" : "#F59E0B" }]}>Hard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.correctButton,
                        !showAnswer && styles.disabledButton
                    ]}
                    onPress={() => onAnswer(true)}
                    disabled={!showAnswer}
                >
                    <Ionicons name="thumbs-up" size={24} color={!showAnswer ? "#9CA3AF" : "#10B981"} />
                    <Text style={[styles.actionButtonText, { color: !showAnswer ? "#9CA3AF" : "#10B981" }]}>Easy</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Stats */}
            {/* {word.learning_stats && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>
                        Seen: {word.learning_stats.times_seen} |
                        Correct: {word.learning_stats.times_correct}
                    </Text>
                </View>
            )} */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    memoryIndicator: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    memoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    cardContainer: {
        width: screenWidth - 40,
        height: 400,
        marginBottom: 30,
    },
    cardFace: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
    },
    cardFront: {
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardBack: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardContent: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    wordText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginRight: 16,
    },
    wordTextSmall: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    soundButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#EBF4FF',
    },
    posText: {
        fontSize: 18,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 12,
        textAlign: 'center',
    },
    posTextSmall: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 20,
        textAlign: 'center',
    },
    phoneticText: {
        fontSize: 16,
        color: '#4A90E2',
        marginBottom: 20,
        textAlign: 'center',
    },
    definitionContainer: {
        marginBottom: 20,
    },
    definitionText: {
        fontSize: 18,
        color: '#374151',
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 16,
    },
    exampleContainer: {
        backgroundColor: '#EBF4FF',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2',
    },
    exampleText: {
        fontSize: 16,
        color: '#4B5563',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 22,
    },
    tapHint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto',
    },
    tapHintText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginLeft: 8,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 80,
    },
    skipButton: {
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    wrongButton: {
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    correctButton: {
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#F3F4F6',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    statsContainer: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statsText: {
        fontSize: 12,
        color: '#6B7280',
    },
}); 