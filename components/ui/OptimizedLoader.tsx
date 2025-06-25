import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptimizedLoaderProps {
    isVisible: boolean;
    sessionType?: 'review' | 'new' | 'mixed';
    message?: string;
}

export default function OptimizedLoader({ isVisible, sessionType = 'mixed', message }: OptimizedLoaderProps) {
    const [step, setStep] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (!isVisible) return;

        const stepInterval = setInterval(() => {
            setStep(prev => (prev + 1) % 3);
        }, 800);

        const dotsInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 300);

        return () => {
            clearInterval(stepInterval);
            clearInterval(dotsInterval);
        };
    }, [isVisible]);

    const getStepMessage = () => {
        if (message) return message;

        switch (sessionType) {
            case 'mixed':
                switch (step) {
                    case 0: return 'Optimizing word selection';
                    case 1: return 'Mixing review & new words';
                    case 2: return 'Randomizing order';
                    default: return 'Loading flashcards';
                }
            case 'review':
                return 'Loading review words';
            case 'new':
                return 'Loading new words';
            default:
                return 'Loading flashcards';
        }
    };

    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={sessionType === 'mixed' ? 'shuffle' : 'library'}
                        size={32}
                        color="#4A90E2"
                    />
                    <ActivityIndicator
                        size="small"
                        color="#4A90E2"
                        style={styles.spinner}
                    />
                </View>

                <Text style={styles.message}>
                    {getStepMessage()}{dots}
                </Text>

                {sessionType === 'mixed' && (
                    <Text style={styles.optimizationNote}>
                        ⚡ Using optimized single-query loading
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    spinner: {
        marginLeft: 12,
    },
    message: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 8,
        minHeight: 20,
    },
    optimizationNote: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '400',
        textAlign: 'center',
        marginTop: 8,
    },
}); 