import React, {useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Icon1 from "react-native-vector-icons/Fontisto";
import { registerUser } from "../service/api";

const RegisForm = ({navigation}) => {
    const [UserName, setUserName] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({ UserName: "", Email: "", Password: "" });

    const validateField = (field, value) => {
        let error = "";
        switch (field) {
            case "UserName":
                if (!value) error = "กรุณากรอกชื่อผู้ใช้";
                break;
            case "Email":
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                const phoneRegex = /^[0-9]{10}$/;
                if (!value) {
                    error = "กรุณากรอกอีเมลหรือเบอร์โทร";
                } else if (!emailRegex.test(value) && !phoneRegex.test(value)) {
                    error = "กรุณากรอกอีเมลหรือเบอร์โทรที่ถูกต้อง";
                }
                break;
            case "Password":
                if (!value) error = "กรุณากรอกรหัสผ่าน";
                break;
            case "ConfirmPassword":
                if (!value) {
                    error = "กรุณากรอกรหัสผ่านอีกครั้ง";
                } else if (value !== Password) {
                    error = "รหัสผ่านไม่ตรงกัน";
                }
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
        return error;
    };

    const checkAll = () => {
        const usernameCheck = validateField("UserName", UserName);
        const emailCheck = validateField("Email", Email);
        const passwordCheck = validateField("Password", Password);
        const confirmPasswordCheck = validateField("ConfirmPassword", ConfirmPassword);

        if (!usernameCheck && !emailCheck && !passwordCheck && !confirmPasswordCheck) {
            Alert.alert("Register:", "SUCCESS!!");
            return true;
        }
        Alert.alert("Register Failed");
        return false;
    };

    const handleRegister = async () => {
        if (checkAll()) {
            await registerUser(UserName, Email, Password);
            navigation.navigate("CheckTransScreen", { user: { Username: UserName } });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headers}>Create Your Account</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.UserName && styles.inputError]}
                    placeholder="Full Name"
                    placeholderTextColor={errors.UserName ? "red" : "white"}
                    value={UserName}
                    onChangeText={setUserName}
                    onBlur={() => validateField("UserName", UserName)}
                />
                <Icon name="user" size={20} color="white" style={styles.icon} />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.Email && styles.inputError]}
                    placeholder="Phone or Email"
                    placeholderTextColor="white"
                    value={Email}
                    onChangeText={setEmail}
                    onBlur={() => validateField("Email", Email)}
                />
                <Icon1 name="email" size={20} color="white" style={styles.icon} />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.Password && styles.inputError]}
                    placeholder="Password"
                    placeholderTextColor="white"
                    value={Password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onBlur={() => validateField("Password", Password)}
                />
                <Icon name="lock" size={20} color="white" style={styles.icon} />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.ConfirmPassword && styles.inputError]}
                    placeholder="Confirm Password"
                    placeholderTextColor="white"
                    value={ConfirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    onBlur={() => validateField("ConfirmPassword", ConfirmPassword)}
                />
                <Icon name="lock" size={20} color="white" style={styles.icon} />
            </View>

            <TouchableOpacity onPress={handleRegister} style={styles.buttonRegis}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.buttonRegis}>
                <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#007A33", // KU Green
    },
    headers: {
        fontSize: 34,
        fontWeight: "bold",
        color: "#FFD700", // Gold
        alignSelf: "center",
        marginBottom: 50,
        marginTop: 30,
    },
    input: {
        flex: 1,
        borderRadius: 5,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "white",
        paddingHorizontal: 10,
        height: 50,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    icon: {
        position: "absolute",
        right: 10,
    },
    buttonRegis: {
        paddingVertical: 15,
        borderRadius: 25,
        backgroundColor: "#FFD700",
        alignItems: "center",
        marginTop: 30,
    },
    buttonText: {
        color: "#007A33",
        fontSize: 16,
        fontWeight: "bold",
    },
    inputError: {
        borderColor: "red",
        borderWidth: 1,
    },
});

export default RegisForm;
