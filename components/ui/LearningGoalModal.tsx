import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
// import BarChart from 'react-native-bar-chart';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setGoal } from '../../store/userSlice';
import { getStreakStatus, getTodayDate } from '../../utils/streakHelper';

type Props = {
    visible: boolean;
    onClose: () => void;
    learnedToday: number;
};

const getLast7Days = () => {
    const today = new Date(getTodayDate());
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        return { date: dateStr, label };
    });
};

const renderBarChart = (history: { date: string; value: number }[], goal: number) => {
    const days = getLast7Days();
    const max = Math.max(...history.map(h => h.value), goal, 1);
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, marginVertical: 12 }}>
            {days.map((d, idx) => {
                const item = history.find(h => h.date === d.date);
                const val = item ? item.value : 0;
                return (
                    <View key={d.date} style={{ alignItems: 'center', flex: 1 }}>
                        <View
                            style={{
                                width: 16,
                                height: (val / max) * 60 >= 2 ? (val / max) * 60 : 2,
                                backgroundColor: idx === 6 ? '#2563eb' : '#90cdf4',
                                borderRadius: 6,
                                marginBottom: 4,
                            }}
                        />
                        <Text style={{ fontSize: 12, color: '#888' }}>{val}</Text>
                        <Text style={{ fontSize: 11, color: '#bbb' }}>{d.label}</Text>
                    </View>
                );
            })}
            {/* Đường mục tiêu */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: (goal / max) * 60,
                    height: 2,
                    backgroundColor: '#0ea5e9',
                    opacity: 0.5,
                }}
            />
        </View>
    );
};

const LearningGoalModal: React.FC<Props> = ({ visible, onClose, learnedToday }) => {
    const goal = useSelector((state: RootState) => state.user.learningGoal);
    const history = useSelector((state: RootState) => state.user.history);
    const streak = useSelector((state: RootState) => state.user.streak);
    const dispatch = useDispatch();
    const [editMode, setEditMode] = useState(false);
    const [newGoal, setNewGoal] = useState(goal.toString());

    useEffect(() => {
        setNewGoal(goal.toString());
    }, [goal]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={{ fontSize: 22 }}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Learning goal</Text>
                    <Text style={styles.progressText}>
                        Today: <Text style={styles.bold}>{learnedToday}/{goal}</Text>
                    </Text>
                    <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
                        <Text style={styles.editBtnText}>Edit goal</Text>
                    </TouchableOpacity>
                    {renderBarChart(history, goal)}
                    <Text style={styles.streak}>🔥 {getStreakStatus(streak)}</Text>
                    {editMode && (
                        <View style={styles.editGoalBox}>
                            <TextInput
                                style={styles.input}
                                value={newGoal}
                                onChangeText={setNewGoal}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={() => {
                                    dispatch(setGoal(Number(newGoal)));
                                    setEditMode(false);
                                }}
                            >
                                <Text style={styles.saveBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%', alignItems: 'center' },
    closeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 2 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    progressText: { fontSize: 18, marginBottom: 8 },
    bold: { fontWeight: 'bold' },
    editBtn: { backgroundColor: '#e0e7ef', borderRadius: 8, padding: 8, marginBottom: 12 },
    editBtnText: { color: '#2563eb', fontWeight: 'bold' },
    streak: { marginTop: 12, fontSize: 16, color: '#2563eb' },
    editGoalBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, width: 60, marginRight: 8, textAlign: 'center' },
    saveBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 8 },
    saveBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default LearningGoalModal;