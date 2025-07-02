import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface FloatingDictionaryModalProps {
    visible: boolean;
    onClose: () => void;
}

const FloatingDictionaryModal: React.FC<FloatingDictionaryModalProps> = ({ visible, onClose }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');

    const handleSearch = () => {
        // TODO: Tra cứu từ điển ở đây
        setResult(`Kết quả cho "${query}"`);
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.floating}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Dictionary</Text>
                        <TouchableOpacity onPress={onClose}><Text style={styles.close}>×</Text></TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Search"
                        value={query}
                        onChangeText={setQuery}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSearch}>
                        <Text style={styles.buttonText}>TRANSLATE</Text>
                    </TouchableOpacity>
                    <Text style={styles.result}>{result}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floating: {
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: { fontWeight: 'bold', fontSize: 18 },
    close: { fontSize: 24, color: '#888', padding: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#4285F4',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginBottom: 8,
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    result: { marginTop: 8, fontSize: 16 },
});

export default FloatingDictionaryModal; 