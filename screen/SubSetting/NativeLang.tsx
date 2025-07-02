import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import { useNavigation } from '@react-navigation/native';

const LANGUAGES = [
    { key: 'te', name: 'Telugu', countryCode: 'IN' },
    { key: 'th', name: 'Thai', countryCode: 'TH' },
    { key: 'tr', name: 'Turkish', countryCode: 'TR' },
    { key: 'ur', name: 'Urdu', countryCode: 'PK' },
    { key: 'vi', name: 'Vietnamese', countryCode: 'VN' },
    { key: 'fa', name: 'Persian', countryCode: 'IR' },
    { key: 'pa', name: 'Punjabi', countryCode: 'IN' },
    { key: 'bn', name: 'Bengali', countryCode: 'BD' },
    { key: 'gu', name: 'Gujarati', countryCode: 'IN' },
];

export default function NativeLang() {
    const [selected, setSelected] = useState('vi');
    const [search, setSearch] = useState('');
    const navigation = useNavigation();
    const filtered = LANGUAGES.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
    const handleSave = () => {
        navigation.goBack();
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                <Text style={styles.title}>Select your native language</Text>
                <Text style={styles.desc}>This information is used to suggest suitable dictionaries for you</Text>
                <View style={styles.searchBox}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search by name"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.key}
                    style={{ flexGrow: 0, marginTop: 8, marginBottom: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.langRow, selected === item.key && styles.selectedRow]}
                            onPress={() => setSelected(item.key)}
                            activeOpacity={0.8}
                        >
                            <CountryFlag isoCode={item.countryCode} size={28} />
                            <Text style={styles.langName}>{item.name}</Text>
                            <View style={styles.radioOuter}>
                                {selected === item.key && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    desc: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        marginBottom: 18,
    },
    searchBox: {
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        color: '#222',
    },
    langRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    selectedRow: {
        backgroundColor: '#f5f8ff',
    },
    flag: {
        fontSize: 28,
        marginRight: 18,
    },
    langName: {
        fontSize: 18,
        flex: 1,
        marginLeft: 18,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#bbb',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    radioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#1976d2',
    },
    saveBtn: {
        backgroundColor: '#1976d2',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
