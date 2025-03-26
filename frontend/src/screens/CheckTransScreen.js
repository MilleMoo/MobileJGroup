import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import * as DocumentPicker from 'expo-document-picker';

const CheckTransScreen = ({navigation}) => {
    const [transcriptFile, setTranscriptFile] = useState(null);

    const pickTranscript = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
            copyToCacheDirectory: true,
        });
        
        if (result.type === "success") {
            setTranscriptFile(result.uri);
            Alert.alert("อัปโหลดสำเร็จ", "ไฟล์ทรานสคริปของคุณถูกอัปโหลดแล้ว!");
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require("../assets/logo_ku_th.png")} style={styles.logo} />
            <Text style={styles.title}>ระบบอัปโหลดใบทรานสคริป</Text>
            <Text style={styles.subtitle}>มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน</Text>

            <TouchableOpacity onPress={pickTranscript} style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>อัปโหลดใบทรานสคริป (PDF)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <View style={[styles.Logout,{borderRadius: 50,borderWidth: 1}]}>
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 15, }}>
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
    Logout:{
        marginTop: 20,
        borderRadius: 50,
        borderWidth: 1,
        height: 40,
        width: 80,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "auto",
        fontSize: 10,
        backgroundColor: "#ec3522",
        borderColor: "white",
    },
});

export default CheckTransScreen;
