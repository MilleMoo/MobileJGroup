import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Image,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { analyzeTranscript } from "../utils/transcriptAnalyzer";
import curriculumData from "../utils/curriculum.json";
import { getTranscriptJson } from "../service/api";
import { useNavigation } from "@react-navigation/native";

const TranscriptScreen = ({route}) => {
  const navigation = useNavigation(); 
  const user = route.params?.user || {};
  const [username, setUsername] = useState(user?.Username || ""); 
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchAndAnalyzeTranscript = async () => {
      try {
        const transcriptData = await getTranscriptJson(username);
        console.log(transcriptData)
        const analysis = analyzeTranscript(transcriptData, curriculumData);
        setResult(analysis);
      } catch (error) {
        console.error("Error analyzing transcript:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndAnalyzeTranscript();
  }, [username]);

  if (!result) {
    return (
      <View style={styles.loadingContainer}>
        <Text>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/logo_ku_th.png')} 
          style={styles.logo}
        />
        <Text style={styles.universityText}>ม.เกษตรศาสตร์ กำแพงแสน</Text>
      </View>

      {/* Analysis Results */}
      <View style={styles.resultsContainer}>
        {/* 🔙 ปุ่มย้อนกลับ */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.resultsHeader}>สรุปผลการวิเคราะห์</Text>
        
        {/* Status Card */}
        <View style={[
          styles.statusCard,
          result.canGraduate ? styles.passedCard : styles.failedCard
        ]}>
          <Text style={styles.statusText}>
            {result.canGraduate ? "✅ เรียนจบได้" : "❌ ยังเรียนไม่ครบ"}
          </Text>
          <Text style={styles.creditText}>หน่วยกิตรวม: {result.summary.total}</Text>
        </View>

        {/* Conditions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>เงื่อนไขที่ผ่านแล้ว</Text>
          <FlatList
            data={result.metConditions}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.conditionItem}>
                <MaterialIcons name="check-circle" size={20} color="#2ecc71" />
                <Text style={styles.conditionText}>{item}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>เงื่อนไขที่ยังไม่ผ่าน</Text>
          <FlatList
            data={result.unmetConditions}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.conditionItem}>
                <MaterialIcons name="error" size={20} color="#e74c3c" />
                <Text style={styles.conditionText}>{item}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        {/* Missing Required Courses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>วิชาเฉพาะบังคับที่ยังไม่ได้ลงเรียน</Text>
          {result.missingRequiredCourses && result.missingRequiredCourses.length > 0 ? (
            <View style={styles.coursesGrid}>
              {result.missingRequiredCourses.map((course) => (
                <View key={course.courseId} style={[styles.courseCard, styles.missingCourseCard]}>
                  <Text style={styles.courseCode}>{course.courseId}</Text>
                  <Text style={styles.courseName} numberOfLines={2}>{course.nameTH}</Text>
                  <Text style={styles.courseCredit}>{course.credits} หน่วยกิต</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noMissingCourses}>✓ ลงทะเบียนครบทุกวิชาเฉพาะบังคับแล้ว</Text>
          )}
        </View>

        {/* Passed Courses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>วิชาที่ผ่านทั้งหมด</Text>
          <View style={styles.coursesGrid}>
            {result.passedCourses.map((course) => (
              <View key={course.courseId} style={styles.courseCard}>
                <Text style={styles.courseCode}>{course.courseId}</Text>
                <Text style={styles.courseName} numberOfLines={2}>{course.nameTH}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: '#006400',
    padding: 60,
    //paddingBottom: 70,
    alignItems: 'center',
    justifyContent: "flex-end",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    // เพิ่มส่วนนี้เพื่อให้ Header ทับเนื้อหา
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, // ให้ Header อยู่ด้านบนสุด
    elevation: 5, // สำหรับ Android
    shadowColor: '#000', // สำหรับ iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 100,
    height: 100,
  },
  universityText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  resultsContainer: {
    padding: 15,
    marginTop: 250, 
  },
  resultsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#006400',
    textAlign: 'center',
  },
  statusCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  passedCard: {
    backgroundColor: '#d5f5e3',
  },
  failedCard: {
    backgroundColor: '#fadbd8',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  creditText: {
    fontSize: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#006400',
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  conditionText: {
    marginLeft: 10,
    flex: 1,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  courseCard: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  missingCourseCard: {
    backgroundColor: '#fff0f0',
    borderColor: '#ffcccc',
    borderWidth: 1,
  },
  courseCode: {
    fontWeight: 'bold',
    color: '#006400',
  },
  courseName: {
    fontSize: 12,
    color: '#555',
  },
  courseCredit: {
    fontSize: 11,
    color: '#ff4444',
    marginTop: 4,
    fontWeight: 'bold',
  },
  noMissingCourses: {
    color: '#2ecc71',
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
  },
});

export default TranscriptScreen;
