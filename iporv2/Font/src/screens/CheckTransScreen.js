import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";

const CheckTransScreen = ({ navigation }) => {
  const [transcriptFile, setTranscriptFile] = useState(null);

  const pickTranscript = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      console.log("📄 result:", result);

      const uri = result.assets?.[0]?.uri || result.uri;
      const name = result.assets?.[0]?.name || result.name;

      if (!uri || !name) {
        Alert.alert("เลือกไฟล์ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setTranscriptFile(uri);

      const formData = new FormData();
      formData.append("file", {
        uri,
        name,
        type: "application/pdf",
      });

      // TODO: เปลี่ยนเป็น username จริงของผู้ใช้ที่ล็อกอิน
      formData.append("username", "trp01");

      const response = await axios.post(
        "http://10.34.111.252:5000/upload-transcript",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ ตรวจสอบสำเร็จ:", response.data);

      Alert.alert(
        response.data.canGraduate ? "🎓 สำเร็จ" : "⚠️ ยังไม่จบ",
        response.data.canGraduate
          ? "คุณเรียนครบตามเงื่อนไขแล้ว!"
          : "ยังขาดเงื่อนไขบางหมวด"
      );
    } catch (error) {
      console.error("❌ อัปโหลดผิดพลาด:", error);
      Alert.alert("ผิดพลาด", "ไม่สามารถอัปโหลดไฟล์ได้");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo_ku_th.png")} style={styles.logo} />
      <Text style={styles.title}>ระบบอัปโหลดใบทรานสคริป</Text>
      <Text style={styles.subtitle}>
        มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน
      </Text>

      <TouchableOpacity onPress={pickTranscript} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>อัปโหลดใบทรานสคริป (PDF)</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <View style={styles.Logout}>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
            Logout
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#006400",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#f0f0f0",
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
  },
  uploadButtonText: {
    color: "#006400",
    fontSize: 18,
    fontWeight: "bold",
  },
  Logout: {
    marginTop: 20,
    borderRadius: 50,
    borderWidth: 1,
    height: 40,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ec3522",
    borderColor: "white",
  },
});

export default CheckTransScreen;
