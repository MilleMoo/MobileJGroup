import React, { useState } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    Alert, 
    Dimensions,
    ScrollView,
    SafeAreaView
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

const CheckTransScreen = ({ navigation,route }) => {
    const { user } = route.params || {};
    const [transcriptFile, setTranscriptFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [Username, setUsername] = useState(user?.Username || ""); 
    const [Password, setPassword] = useState("");
    const userData = {
        Username: Username,
        password: Password,
    };

    const pickTranscript = async () => {
        setIsUploading(true);
        try {
            let result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
            });

            if (result.type === "success") {
                setTranscriptFile(result.uri);
                setTimeout(() => {
                    setIsUploading(false);
                    Alert.alert(
                        "📂 อัปโหลดสำเร็จ", 
                        "ไฟล์ทรานสคริปของคุณถูกอัปโหลดแล้ว!",
                        [
                            { 
                                text: "ตกลง", 
                                onPress: () => navigation.navigate("TranscriptSummary") 
                            }
                        ]
                    );
                }, 1000);
            } else {
                setIsUploading(false);
            }
        } catch (error) {
            setIsUploading(false);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดไฟล์ได้");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Profile Button - Positioned in top right */}
            <TouchableOpacity 
                onPress={() => navigation.navigate("ProfileScreen", { user: userData })} 
                style={styles.profileButton}
            >
                <MaterialIcons name="account-circle" size={24} color="#FFD700" />
            </TouchableOpacity>

            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Image 
                        source={require("../assets/logo_ku_th.png")} 
                        style={styles.logo} 
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>อัปโหลดใบทรานสคริป</Text>
                    <Text style={styles.subtitle}>ม.เกษตรศาสตร์ กำแพงแสน</Text>
                </View>

                {/* Upload Area */}
                <TouchableOpacity 
                    onPress={pickTranscript}
                    style={styles.uploadArea}
                    disabled={isUploading}
                >
                    <MaterialIcons 
                        name="cloud-upload" 
                        size={width * 0.12} 
                        color="#FFD700" 
                    />
                    <Text style={styles.uploadText}>
                        {isUploading ? "กำลังประมวลผล..." 
                        : transcriptFile ? "ไฟล์พร้อมวิเคราะห์" 
                        : "แตะเพื่ออัปโหลด PDF"}
                    </Text>
                    {transcriptFile && (
                        <Text style={styles.fileName} numberOfLines={1}>
                            {transcriptFile.split('/').pop()}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        onPress={pickTranscript} 
                        style={[
                            styles.actionButton,
                            styles.uploadButton,
                            isUploading && styles.disabledButton
                        ]}
                        disabled={isUploading}
                    >
                        <Text style={styles.buttonText}>
                            {transcriptFile ? "เปลี่ยนไฟล์" : "เลือกไฟล์"}
                        </Text>
                    </TouchableOpacity>

                    {transcriptFile && (
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("TranscriptSummary")}
                            style={[styles.actionButton, styles.analyzeButton]}
                        >
                            <Text style={styles.buttonText}>วิเคราะห์ผล</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Footer */}
            <TouchableOpacity 
                onPress={() => navigation.navigate("Home")} 
                style={styles.logoutButton}
            >
                <Text style={styles.logoutText}>ออกจากระบบ</Text>
                <MaterialIcons name="logout" size={16} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#006400",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: height * 0.02,
        paddingBottom: 20,
    },
    // Profile button styles
    profileButton: {
        position: 'absolute',
        top: height * 0.05,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 20,
        padding: 8,
    },
    header: {
        marginTop: height * 0.05,
        alignItems: "center",
        marginBottom: height * 0.03,
    },
    logo: {
        width: width * 0.3,
        height: width * 0.3,
        marginBottom: 10,
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: width * 0.035,
        color: "rgba(255,255,255,0.8)",
    },
    uploadArea: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderStyle: "dashed",
    },
    uploadText: {
        color: "#fff",
        fontSize: width * 0.04,
        marginTop: 10,
        textAlign: "center",
    },
    fileName: {
        color: "#FFD700",
        fontSize: width * 0.03,
        marginTop: 8,
        textAlign: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 5,
    },
    uploadButton: {
        backgroundColor: "#FFD700",
    },
    analyzeButton: {
        backgroundColor: "#1e8449",
    },
    disabledButton: {
        backgroundColor: "#b3a369",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: width * 0.04,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        backgroundColor: "rgba(236, 53, 34, 0.8)",
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 8,
    },
    logoutText: {
        color: "white",
        fontWeight: "bold",
        fontSize: width * 0.035,
        marginRight: 8,
    },
});

export default CheckTransScreen;