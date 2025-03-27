import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TextInput, 
    TouchableOpacity, 
    Alert,
    ScrollView,
    SafeAreaView,
    Dimensions
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from "@expo/vector-icons";
import { updateBioInDatabase, GetUserName, updateProfileImage } from "../service/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";
import { updatePassword } from "../service/api";

const { width } = Dimensions.get("window");

const ProfileScreen = ({ navigation, route }) => {
    const { user } = route.params || {}; 
    const [bio, setBio] = useState("");  
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [name, setName] = useState("");
    const [Email, setEmail] = useState("");
    const [username, setUsername] = useState(user?.Username || ""); 
    const [profileImage, setProfileImage] = useState("https://cdn.marvel.com/content/1x/349red_com_crd_01.png");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    
    const userData = {
        Username: username,
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData(); 
        }, [username])
    );

    const fetchUserData = async () => {
        try {
            const data = await GetUserName(username);
            if (data != null) {
                setName(data.username);
                setEmail(data.email);
                setBio(data.bio);
                setProfileImage(data.profileImage); 
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const updateBio = async () => {
        try {
            const response = await updateBioInDatabase(username, bio);
            if (response.message === "Bio updated successfully") {
                setIsEditingBio(false);
                Alert.alert("สำเร็จ", "อัปเดตไบโอเรียบร้อยแล้ว!");
            } else {
                throw new Error('Error updating bio');
            }
        } catch (error) {
            console.error("Error updating bio:", error);
            Alert.alert("ข้อผิดพลาด", error.message);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Denied",
                "We need access to your photos to upload an image."
            );
            return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
    
        if (!result.canceled) {
            const newImage = result.assets[0].uri;
            setProfileImage(newImage);
            await updateUserProfileImage(newImage);
        }
    };

    const updateUserProfileImage = async (newImage) => {
        try {
            await updateProfileImage(username, newImage); 
            Alert.alert("สำเร็จ", "อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว!");
        } catch (error) {
            console.error("Update profile image error:", error);
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถอัปเดตรูปโปรไฟล์ได้");
        }
    };

    const updateUserPassword = async () => {
        if (!oldPassword || !newPassword) {
            Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        try {
            const response = await updatePassword(username, oldPassword, newPassword);
            navigation.navigate("Login", { user: userData });
            Alert.alert("สำเร็จ", response.message);
            setOldPassword("");
            setNewPassword("");
        } catch (error) {
            Alert.alert("ข้อผิดพลาด", error.message);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header with Back Button */}
                <View style={[styles.header,{marginTop: 50,}]}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>โปรไฟล์</Text>
                </View>

                {/* Profile Image Section */}
                <View style={styles.profileImageContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image 
                            source={{ uri: profileImage }} 
                            style={styles.profileImage} 
                        />
                        <View style={styles.editPhotoButton}>
                            <MaterialIcons name="edit" size={16} color="#006400" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{name}</Text>
                    <Text style={styles.profileUsername}>@{username}</Text>
                </View>

                {/* Profile Info Section */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                        <MaterialIcons name="email" size={20} color="white" />
                        <Text style={styles.infoText}>{Email}</Text>
                    </View>
                    
                    {/* Bio Section with Edit Functionality */}
                    <View style={styles.infoItem}>
                        <MaterialIcons name="info" size={20} color="white" />
                        {isEditingBio ? (
                            <View style={styles.bioEditContainer}>
                                <TextInput
                                    style={styles.bioInput}
                                    value={bio}
                                    onChangeText={setBio}
                                    placeholder="เพิ่มข้อมูลเกี่ยวกับคุณ"
                                    placeholderTextColor="#888"
                                    multiline
                                    autoFocus
                                />
                                <View style={styles.bioButtonContainer}>
                                    <TouchableOpacity 
                                        style={styles.cancelButton}
                                        onPress={() => setIsEditingBio(false)}
                                    >
                                        <Text style={styles.buttonText}>ยกเลิก</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.saveButton}
                                        onPress={updateBio}
                                    >
                                        <Text style={styles.buttonText}>บันทึก</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.bioTextContainer}
                                onPress={() => setIsEditingBio(true)}
                            >
                                <Text style={styles.infoText}>
                                    {bio || "แตะเพื่อเพิ่มข้อมูลเกี่ยวกับคุณ"}
                                </Text>
                                <MaterialIcons 
                                    name="edit" 
                                    size={16} 
                                    color="#FFD700" 
                                    style={styles.bioEditIcon}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Password Change Section */}
                {isEditingPassword ? (
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            placeholder="รหัสผ่านเดิม"
                            placeholderTextColor="#888"
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="รหัสผ่านใหม่"
                            placeholderTextColor="#888"
                            secureTextEntry
                        />
                        <View style={styles.passwordButtonContainer}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => setIsEditingPassword(false)}
                            >
                                <Text style={styles.buttonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.saveButton}
                                onPress={updateUserPassword}
                            >
                                <Text style={styles.buttonText}>บันทึก</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.changePasswordButton}
                        onPress={() => setIsEditingPassword(true)}
                    >
                        <Text style={styles.changePasswordText}>เปลี่ยนรหัสผ่าน</Text>
                    </TouchableOpacity>
                )}

                {/* Logout Button */}
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={() => navigation.navigate("Login", { user: userData })}
                >
                    <Text style={styles.logoutText}>ออกจากระบบ</Text>
                    <MaterialIcons name="logout" size={16} color="white" />
                </TouchableOpacity>
            </ScrollView>
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
        paddingBottom: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFD700",
    },
    profileImageContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#FFD700",
    },
    editPhotoButton: {
        position: "absolute",
        right: 10,
        bottom: 10,
        backgroundColor: "#FFD700",
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginTop: 15,
    },
    profileUsername: {
        fontSize: 16,
        color: "#FFD700",
        marginTop: 5,
    },
    infoContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    infoText: {
        fontSize: 16,
        color: "white",
        marginLeft: 10,
        flex: 1,
    },
    bioTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    bioEditIcon: {
        marginLeft: 10,
    },
    bioEditContainer: {
        flex: 1,
        marginLeft: 10,
    },
    bioInput: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
        padding: 15,
        color: "white",
        marginBottom: 10,
        textAlignVertical: "top",
        minHeight: 100,
    },
    bioButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    passwordContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    input: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
        padding: 15,
        color: "white",
        marginBottom: 15,
    },
    passwordButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelButton: {
        backgroundColor: "#8B0000",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: "center",
    },
    saveButton: {
        backgroundColor: "#1e8449",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    changePasswordButton: {
        backgroundColor: "#FFD700",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    changePasswordText: {
        color: "#006400",
        fontWeight: "bold",
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        backgroundColor: "rgba(236, 53, 34, 0.8)",
        borderRadius: 8,
    },
    logoutText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        marginRight: 8,
    },
});

export default ProfileScreen;