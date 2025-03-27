import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TextInput, Switch, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from "@expo/vector-icons";
import { updateBioInDatabase, GetUserName, updateProfileImage} from "../service/api"; // Import API
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { useFocusEffect } from "@react-navigation/native";
import { updatePassword } from "../service/api";

const ProfileScreen = ({ navigation,route }) => {
    const { user } = route.params || {}; 
    const [bio, setBio] = useState("");  
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [name, setName] = useState("");
    const [Email, setEmail] = useState("");
    const [username, setUsername] = useState(user.Username || ""); 
    const [profileImage, setProfileImage] = useState("https://cdn.marvel.com/content/1x/349red_com_crd_01.png");
    const [isEditing, setIsEditing] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const userData = {
        Username: username,
    };

    const updateUserPassword = async () => {
        console.log(updatePassword);
        if (!oldPassword || !newPassword) {
            Alert.alert("Error", "Please fill in both fields");
            return;
        }
        try {
            const response = await updatePassword(username, oldPassword, newPassword);
            navigation.navigate("Login", { user: userData });
            Alert.alert("Success", response.message);
            setOldPassword("");
            setNewPassword("");
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };


    useEffect(() => {
        // Load dark mode preference from AsyncStorage
        const loadDarkMode = async () => {
            const storedMode = await AsyncStorage.getItem('darkMode');
            if (storedMode !== null) {
                setIsDarkMode(JSON.parse(storedMode)); // Set the mode based on the stored value
            }
        };
        loadDarkMode();
        fetchUserData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData(); 
        }, [username])
    );

    useEffect(() => {
        // Save dark mode preference to AsyncStorage
        const saveDarkMode = async () => {
            await AsyncStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        };

        saveDarkMode();
    }, [isDarkMode]);

    const toggleSwitch = () => setIsDarkMode(!isDarkMode);

    const fetchUserData = async () => {
        try {
            const data = await GetUserName(username);
            console.log("Update response:", data); 
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
            setProfileImage(newImage); // ✅ เปลี่ยนรูปใน UI ทันที
            await updateUserProfileImage(newImage); // ✅ บันทึกลงฐานข้อมูล
        }
    };

    const updateUserProfileImage = async (newImage) => {
        try {
            await updateProfileImage(username, newImage); 
            Alert.alert("Success", "Profile image updated!");
        } catch (error) {
            console.error("Update profile image error:", error);
            Alert.alert("Error", "Could not update profile image");
        }
    };


    const updateBio = async () => {
        try {
            const response = await updateBioInDatabase(username, bio);
            if (response.message === "Bio updated successfully") {
                setIsEditingBio(false);
                Alert.alert("Success", "Bio updated successfully!");
            } else {
                throw new Error('Error updating bio');
            }
        } catch (error) {
            console.error("Error updating bio:", error);
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Login", { user: userData })}>
                    <View style={[styles.Logout,{borderRadius: 50,borderWidth: 1,borderColor: (isDarkMode)?"white":"black"}]}>
                        <Text style={[isDarkMode?{ color: "white", fontWeight: "bold", fontSize: 15, }:{ color: "black", fontWeight: "bold", fontSize: 15, }]}>
                            Logout
                        </Text>
                    </View>
                </TouchableOpacity>
                <Switch value={isDarkMode} onValueChange={toggleSwitch} />
            </View>
    
            <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                <Text style={styles.editText}>Edit Photo</Text>
            </TouchableOpacity>
    
            <View style={[styles.profileCard, isDarkMode ? styles.darkCard : styles.lightCard]}>
                <View style={styles.nameContainer}>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, isDarkMode ? styles.darkText : styles.lightText]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter name"
                            placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
                            autoFocus
                            onBlur={() => setIsEditing(false)}
                        />
                    ) : (
                        <TouchableOpacity style={styles.nameRow} onPress={() => setIsEditing(true)}>
                            <Text style={[styles.input, isDarkMode ? styles.darkText : styles.lightText]}>
                                {name}
                            </Text>
                            <MaterialIcons name="edit" size={20} color={isDarkMode ? "#aaa" : "#555"} />
                        </TouchableOpacity>
                    )}
                </View>
    
                <Text style={[styles.username, isDarkMode ? styles.darkText : styles.lightText]}>
                    Username: {username}
                </Text>
                <Text style={[styles.username, isDarkMode ? styles.darkText : styles.lightText]}>
                    Email: {Email}
                </Text>
                <Text style={[styles.username, isDarkMode ? styles.darkText : styles.lightText]}>
                    Bio: {bio}
                </Text>
            </View>
    
            {/* Bio Section */}
            <View style={[styles.profileCard, isDarkMode ? styles.darkCard : styles.lightCard]}>
                <View style={styles.bioContainer}>
                    {isEditingBio ? (
                        <TextInput
                            style={[styles.bioInput, isDarkMode ? styles.darkText : styles.lightText]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Enter bio"
                            placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
                            autoFocus
                            multiline
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditingBio(true)}>
                            <Text style={[styles.bioText, isDarkMode ? styles.darkText : styles.lightText]}>
                                {bio || "Tap to add bio"}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {isEditingBio && (
                        <TouchableOpacity style={styles.updateButton} onPress={updateBio}>
                            <Text style={styles.updateButtonText}>Update Bio</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            {isEditingPassword ? (
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, isDarkMode ? styles.darkText : styles.lightText]}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Old Password"
                        placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
                        secureTextEntry
                    />
                    <TextInput
                        style={[styles.input, isDarkMode ? styles.darkText : styles.lightText]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="New Password"
                        placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.updateButton} onPress={updateUserPassword}>
                        <Text style={styles.updateButtonText}>Update Password</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity onPress={() => setIsEditingPassword(true)}>
                    <Text style={styles.editText}>Change Password</Text>
                </TouchableOpacity>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        alignItems: "center", 
        paddingTop: 50 
    },
    lightContainer: { 
        backgroundColor: "#ffffff" 
    },
    darkContainer: { 
        backgroundColor: "#121212" 
    },
    header: { 
        position: "absolute", 
        top: 10, 
        right: 10, 
        padding: 10 
    },
    profileImage: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        borderWidth: 2, 
        borderColor: "#ccc" 
    },
    editText: { 
        color: "#007bff", 
        textAlign: "center" 
    },
    profileCard: { 
        alignItems: "center", 
        padding: 20, 
        borderRadius: 10, 
        width: "90%", 
        marginTop: 10, 
    },
    nameContainer: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        width: "100%" 
    },
    nameRow: { 
        flexDirection: "row", 
        alignItems: "center" 
    },
    input: { 
        fontSize: 18, 
        fontWeight: "bold", 
        textAlign: "center", 
        flex: 1 
    },
    username: { 
        fontSize: 16, 
        color: "gray", 
        marginTop: 5,
        textAlign: "left",
        width: "100%",
    },
    lightText: {
        color: "#000",
    },
    darkText: {
        color: "#fff",
    },
    lightCard: {
        backgroundColor: "#f5f5f5",
    },
    darkCard: {
        backgroundColor: "#1e1e1e",
    },
    bioContainer: {
        marginTop: 10,
        width: "100%",
        alignItems: "center",
    },
    bioText: {
        fontSize: 14,
        color: "gray",
        textAlign: "center",
        flexWrap: "wrap",
        width: "80%",
    },
    bioInput: {
        fontSize: 14,
        textAlign: "center",
        borderBottomWidth: 1,
        borderColor: "gray",
        width: "80%",
        padding: 5,
        flexWrap: "wrap",
    },
    updateButton: {
        backgroundColor: "#007bff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    updateButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    passwordContainer:{
        alignItems: "center", 
        padding: 20, 
        borderRadius: 10, 
        width: "100%", 
        height: 200,
        marginTop: 10, 
    },
    Logout:{
        borderRadius: 50,
        borderWidth: 1,
        height: 30,
        width: 60,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "auto",
        fontSize: 10,
        backgroundColor: "#275b81 ",
        borderColor: "white",
    },
});

export default ProfileScreen;
