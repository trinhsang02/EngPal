import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TOPICS = [
  {
    key: 'science',
    name: 'Khoa học',
    image: 'https://img.icons8.com/ios-filled/100/000000/physics.png',
    following: true,
  },
  {
    key: 'society',
    name: 'Xã hội',
    image: 'https://img.icons8.com/ios-filled/100/000000/city.png',
    following: true,
  },
  {
    key: 'entertainment',
    name: 'Giải trí',
    image: 'https://img.icons8.com/ios-filled/100/000000/concert.png',
    following: true,
  },
  {
    key: 'travel',
    name: 'Du lịch',
    image: 'https://img.icons8.com/ios-filled/100/000000/beach.png',
    following: true,
  },
  {
    key: 'education',
    name: 'Giáo dục',
    image: 'https://img.icons8.com/ios-filled/100/000000/classroom.png',
    following: false,
  },
  {
    key: 'business',
    name: 'Kinh doanh',
    image: 'https://img.icons8.com/ios-filled/100/000000/business.png',
    following: false,
  },
  {
    key: 'kpop',
    name: 'K-Pop',
    image: 'https://img.icons8.com/ios-filled/100/000000/headphones.png',
    following: false,
  },
];

export default function Topics() {
  const [topics, setTopics] = useState(TOPICS);
  const navigation = useNavigation();

  const handleToggleFollow = (key: string) => {
    setTopics(prev =>
      prev.map(topic =>
        topic.key === key ? { ...topic, following: !topic.following } : topic
      )
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.header}>Topics</Text>
          <View style={{ width: 28 }} />
        </View>
        <Text style={styles.sectionTitle}>Chủ đề</Text>
        <FlatList
          data={topics}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <View style={styles.topicRow}>
              <Image source={{ uri: item.image }} style={styles.topicImage} />
              <Text style={styles.topicName}>{item.name}</Text>
              <TouchableOpacity
                style={[
                  styles.followBtn,
                  item.following ? styles.followingBtn : styles.notFollowingBtn,
                ]}
                onPress={() => handleToggleFollow(item.key)}
              >
                <Text
                  style={[
                    styles.followText,
                    item.following ? styles.followingText : styles.notFollowingText,
                  ]}
                >
                  {item.following ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  topicImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  topicName: {
    fontSize: 17,
    flex: 1,
  },
  followBtn: {
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 6,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingBtn: {
    borderColor: '#bbb',
    backgroundColor: '#f7f7f7',
  },
  notFollowingBtn: {
    borderColor: '#1976d2',
    backgroundColor: '#fff',
  },
  followText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  followingText: {
    color: '#bbb',
  },
  notFollowingText: {
    color: '#1976d2',
  },
});
