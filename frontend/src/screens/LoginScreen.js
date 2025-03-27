import React ,{ useState,useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert,TouchableOpacity } from "react-native"
import axios from "axios";
import Icon from "react-native-vector-icons/Feather";
import Icon1 from "react-native-vector-icons/Fontisto";
import { LoginUser } from "../service/api";
import { EditUserName } from "../service/api";

const LoginScreen = ({ navigation,route }) => {
    const user = route.params?.user || {}; 
    console.log(user.Username);
    const [Username, setUsername] = useState(user?.Username || ""); 
    const [Password, setPassword] = useState("");
    const userData = {
        Username: Username,
        password: Password,
    };
    
    const handleLogin = async () => {
        try {
            const response = await LoginUser(Username, Password);
            Alert.alert("Login Successful");
            navigation.navigate("CheckTransScreen", { user: userData });

        } catch (error) {
            Alert.alert("login Failed!", error.message)
        }
    }
    return (
        <View style={style.container}>
            <View style = {{ justifyContent: "center", alignItems: "center" }}>
                <Text style= {{ fontSize: 30, color: "white", fontWeight: "bold" }}>
                    Login
                </Text>
            </View>
            <View style = {style.inputContainer}>
                <TextInput
                    style = {style.button} // เปลี่ยนสีเส้นขอบเมื่อมี error
                    placeholder = {(Username == "") ? "Username": Username} // ถ้ามี error ให้ขึ้นข้อความแทน
                    value = {Username}
                    onChangeText = {setUsername}
                    cursorColor={"white"}
                    placeholderTextColor={"white"}
                />
        <Icon name = "user" size = {20} color = "white" style = {style.iconemail}/>    
        </View>
        <View style = {style.inputContainer}>
                <TextInput
                    style = {style.button} // เปลี่ยนสีเส้นขอบเมื่อมี error
                    placeholder = "Password" // ถ้ามี error ให้ขึ้นข้อความแทน
                    value = {Password}
                    onChangeText = {setPassword}
                    cursorColor={"white"}
                    placeholderTextColor={"white"}
                    secureTextEntry
                />
            <Icon name = "lock" size = {20} color = "white" style = {style.iconemail}/>    
        </View>
        
            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={handleLogin}>
                    <View style={style.Login}>
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 20, }}>
                            Sign In
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <View style={[style.FPassword,{borderRadius: 50, borderWidth: 1,borderColor: "white"}]}>
                            <Text style={{ color: "white",fontSize: 20, fontWeight: "bold" }}>
                                Sign Up
                            </Text>
                        </View>
                </TouchableOpacity>

            </View>
            <View style = {{ marginLeft: 80 }}>
                <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                        <View style={[style.FPassword,{borderRadius: 50, borderWidth: 1,borderColor: "white"}]}>
                            <Text style={{ color: "white",fontSize: 20, fontWeight: "bold" }}>
                                Home
                            </Text>
                        </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 5,
        justifyContent: "center",
        padding: 16,
        backgroundColor: "#007A33"
    },
    input: {
        height: 45,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    Login:{
        borderRadius: 50,
        borderWidth: 1,
        height: 50,
        width: 130,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "auto",
        fontSize: 10,
        marginTop: 30,
        marginLeft: 40,
        borderColor: "white",
    },
    FPassword:{
        borderRadius: 50,
        height: 50,
        width: 140,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "auto",
        fontSize: 10,
        marginTop: 30,
        marginLeft: 50,
    },
    button: {
        width: "100%",
        borderRadius: 5,
        marginVertical: "15",
        backgroundColor: "rgba(240, 233, 233, 0.25)",
        color: "white",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: 'bold',
        textAlign:'center',
    },
    buttonRegis: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginVertical: 5,
        width: "40%",
        alignSelf: "center",
        backgroundColor: "rgba(43, 175, 43, 0.5)",
    },
    error:{
        color: "red",
        marginVertical: 5,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        position: "absolute",
        left: 340,
    },
    iconemail: {
        position: "absolute",
        left: 370,
    },
    inputError: {
        borderColor: "red",
        borderWidth: 1,
    },
})

export default LoginScreen
