import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const MAJORS = [
  'Ngân hàng',
  'Kế toán',
  'Tài chính',
  'Luật',
  'Công nghệ',
  'Y học',
  'Xây dựng',
  'Marketing',
  'Kinh doanh',
];

export default function Goal() {
  const [selected, setSelected] = useState('Công nghệ');
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const navigation = useNavigation();
  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Why are you learning English?</Text>
        <Text style={styles.desc}>
          This information is used to suggest content suitable to your goal
        </Text>

        {/* Dropdown header */}
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setDropdownOpen(open => !open)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownHeaderText}>Chuyên ngành</Text>
          <Ionicons
            name={dropdownOpen ? 'chevron-down' : 'chevron-up'}
            size={24}
            color="#888"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <FlatList
            data={MAJORS}
            keyExtractor={item => item}
            style={{ flexGrow: 0, marginTop: 8, marginBottom: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.majorRow, selected === item && styles.selectedRow]}
                onPress={() => setSelected(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.majorName}>{item}</Text>
                <View style={styles.radioOuter}>
                  {selected === item && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

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
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'space-between',
  },
  dropdownHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownIcon: {
    fontSize: 22,
    color: '#888',
    marginLeft: 8,
    // Không cần transform nữa, dùng ký tự khác cho mũi tên lên/xuống
  },
  majorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedRow: {
    backgroundColor: '#f5f8ff',
  },
  majorName: {
    fontSize: 18,
    flex: 1,
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
