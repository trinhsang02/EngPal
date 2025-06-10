import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateLevel, UserLevel } from '@/store/userSlice';

const LEVELS = [
    {
        key: 'a1',
        label: 'A1 - Beginner',
        color: '#4F8EF7',
        icon: <MaterialCommunityIcons name="leaf" size={24} color="#4F8EF7" />,
    },
    {
        key: 'a2',
        label: 'A2 - Elementary',
        color: '#4CAF50',
        icon: <MaterialCommunityIcons name="sprout" size={24} color="#4CAF50" />,
    },
    {
        key: 'b1',
        label: 'B1 - Intermediate',
        color: '#FFB300',
        icon: <FontAwesome5 name="seedling" size={22} color="#FFB300" />,
    },
    {
        key: 'b2',
        label: 'B2 - Upper Intermediate',
        color: '#8D6E63',
        icon: <MaterialCommunityIcons name="tree" size={24} color="#8D6E63" />,
    },
    {
        key: 'c1',
        label: 'C1 - Advanced',
        color: '#E57373',
        icon: <FontAwesome5 name="apple-alt" size={22} color="#E57373" />,
    },
    {
        key: 'c2',
        label: 'C2 - Proficient',
        color: '#6A1B9A',
        icon: <MaterialCommunityIcons name="star-circle" size={24} color="#6A1B9A" />,
    },
];

function Level() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const currentLevel = useAppSelector((state) => state.user.user?.level);

    console.log('Current User Level:', currentLevel);

    // Map current level to key
    const levelToKey = {
        'beginner': 'a1',
        'Elementary': 'a2',
        'Intermediate': 'b1',
        'Upper-Intermediate': 'b2',
        'Advanced': 'c1',
        'Proficient': 'c2'
    };

    const [selected, setSelected] = useState(levelToKey[currentLevel || 'Elementary']);

    const handleLevelSelect = (key: string) => {
        setSelected(key);
        const levelMap: Record<string, UserLevel> = {
            'a1': 'beginner',
            'a2': 'Elementary',
            'b1': 'Intermediate',
            'b2': 'Upper-Intermediate',
            'c1': 'Advanced',
            'c2': 'Proficient'
        };
        const newLevel = levelMap[key];
        console.log('Selected Level:', newLevel);
        dispatch(updateLevel(newLevel));
    };

    const handleSave = () => {
        navigation.goBack();
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#888" />
            </TouchableOpacity>
            <Text style={styles.title}>Choose your level</Text>
            <Text style={styles.desc}>This information is used to suggest{"\n"}content suitable to your level</Text>
            <View style={styles.card}>
                {LEVELS.map((level) => (
                    <TouchableOpacity
                        key={level.key}
                        style={[styles.levelRow, selected === level.key && styles.selectedRow]}
                        activeOpacity={0.8}
                        onPress={() => handleLevelSelect(level.key)}
                    >
                        <View style={styles.iconWrap}>{level.icon}</View>
                        <Text style={[styles.levelLabel, { color: level.color }]}>{level.label}</Text>
                        <View style={{ flex: 1 }} />
                        <View style={styles.radioOuter}>
                            {selected === level.key ? <View style={styles.radioInner} /> : null}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafbfc', alignItems: 'center', paddingTop: 24 },
    backBtn: { position: 'absolute', left: 16, top: 24, zIndex: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#222', textAlign: 'center' },
    desc: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 24 },
    card: { backgroundColor: '#fff', borderRadius: 18, paddingVertical: 8, width: '88%', alignSelf: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, marginBottom: 32 },
    levelRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    selectedRow: { backgroundColor: '#f3f7ff' },
    iconWrap: { width: 32, alignItems: 'center' },
    levelLabel: { fontSize: 18, fontWeight: '600', marginLeft: 12 },
    radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#4F8EF7', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4F8EF7' },
    saveBtn: { position: 'absolute', bottom: 32, left: 24, right: 24, backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 2 },
    saveText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default Level;
