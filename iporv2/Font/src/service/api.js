import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";


const API_URL = "http://10.34.111.252:5000";

export const LoginUser = async (username,password) => {
    try {
        const response = await axios.post(`${API_URL}/Login`, {
            username,
            password,
        });
        return {
            token: response.data.token,
            profileImage: response.data.profileImage,
    }
    } catch (error) {
        throw new Error(error.response?.data?.message || "Invalid Login");
    }
};

export const GetUserName = async (username) => {
    try {
        const response = await axios.get(`${API_URL}/get-user?username=${username}`);
        return {
            username: response.data.username,
            email: response.data.email,
            bio: response.data.bio,
            profileImage: response.data.profileImage, 
        }; 
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching user data");
    }
};

export const EditUserName = async (username, newName) => {
    try {
        console.log("API call: EditUserName", { username, newName });

        if (!username || !newName) {
            throw new Error("Username and new name are required");
        }

        const response = await axios.put(`${API_URL}/update-name`,{  
                username, 
                newName 
            }, 
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("EditUserName API error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Error updating name");
    }
};




export const registerUser = async (username, email,password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error registering user");
        }
    };

    export const updateBioInDatabase = async (username, bio) => {
    try {
        console.log("Updating bio with:", username, bio); // เพิ่มคำสั่งนี้เพื่อตรวจสอบว่าได้ข้อมูลถูกต้อง
        const response = await axios.put(`${API_URL}/update-Bio`, {
            username,  // ส่ง username
            bio        // ส่ง bio
        });
        return response.data;  // คืนค่าข้อมูลที่ได้จากเซิร์ฟเวอร์
    } catch (error) {
        console.error("Error updating bio:", error);  // ตรวจสอบข้อผิดพลาด
        throw new Error(error.response?.data?.message || "Error updating bio");
        }
    };

    export const updateProfileImage = async (username, profileImage) => {
        try {
            const response = await axios.put(`${API_URL}/update-profile-image`, {
                username,
                profileImage,
            });
        
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Error updating profile image"
            );
        }
    };

    export const updatePassword = async (username, oldPassword, newPassword) => {
        try {
            const response = await axios.put(`${API_URL}/update-password`, {
                username,
                oldPassword,
                newPassword,
            });
    
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Error updating password");
        }
    };

    export const pickTranscript = async (setTranscriptFile) => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          copyToCacheDirectory: true,
        });

        if (result.type === "success") {
          setTranscriptFile(result.uri);

          const formData = new FormData();
          formData.append("file", {
            uri: result.uri,
            name: result.name,
            type: "application/pdf",
          });

          const response = await axios.post(
            `${API_URL}/upload-transcript`, // ✅ Fix
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("✅ ตรวจสอบสำเร็จ:", response.data);
          Alert.alert("สำเร็จ", "ผลการตรวจสอบได้รับแล้ว!");
        }
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการอัปโหลด:", error);
        Alert.alert("ผิดพลาด", "ไม่สามารถอัปโหลดไฟล์ได้");
      }
    };

    
