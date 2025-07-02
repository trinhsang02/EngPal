import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { getChatbotResponse } from '../../services/chatbot';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

const CHAT_HISTORY_KEY = 'CHAT_HISTORY';

function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Load chat history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
                if (history) {
                    setMessages(JSON.parse(history));
                }
            } catch (e) {
                // ignore
            }
        };
        loadHistory();
    }, []);

    // Save chat history whenever messages change
    useEffect(() => {
        AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage: Message = {
            id: Date.now() + '_user',
            text: input,
            sender: 'user',
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        try {
            const res = await getChatbotResponse(input);
            const aiText = res.message_in_markdown || res.message || 'AI không trả lời được.';
            const aiMessage: Message = {
                id: Date.now() + '_ai',
                text: aiText,
                sender: 'ai',
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (e) {
            setMessages((prev) => [...prev, { id: Date.now() + '_ai', text: 'Có lỗi xảy ra, thử lại sau.', sender: 'ai' }]);
        } finally {
            setLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const renderItem = ({ item }: { item: Message }) => (
        <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMsg : styles.aiMsg]}>
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior="padding" keyboardVerticalOffset={150}>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Nhập tin nhắn..."
                    editable={!loading}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading || !input.trim()}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Gửi</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    messageContainer: {
        maxWidth: '80%',
        marginBottom: 12,
        padding: 12,
        borderRadius: 16,
    },
    userMsg: {
        alignSelf: 'flex-end',
        backgroundColor: '#4285F4',
    },
    aiMsg: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    messageText: {
        color: '#222',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#eee',
        // position: 'relative',
        bottom: 0,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
        marginRight: 8,
    },
    sendBtn: {
        backgroundColor: '#4285F4',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Chat;
