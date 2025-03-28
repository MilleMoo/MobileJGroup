import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator} from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import CheckTransScreen from "./src/screens/CheckTransScreen";
import RegisForm from "./src/screens/RegisForm";
import TranscriptScreen from "./src/screens/TranscriptScreen"
import ProfileScreen from "./src/screens/ProfileScreen"

const Stack = createStackNavigator()

const App = ()=>{
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
      <Stack.Screen
      name= "Home"
      component={HomeScreen}
      options={{ title:"Home Screen  "}}
      />
      <Stack.Screen
      name= "Login"
      component={LoginScreen}
      options={{ title:"Login Screen  "}}
      />
      <Stack.Screen
      name= "Register"
      component={RegisForm}
      options={{ title:"Register Screen  "}}
      />
      <Stack.Screen
      name= "CheckTransScreen"
      component={CheckTransScreen}
      options={{ title:"CheckTransScreen  "}}
      />
      <Stack.Screen
      name= "TranscriptScreen"
      component={TranscriptScreen}
      options={{ title:"TranscriptScreen"}}
      />
      <Stack.Screen
      name= "ProfileScreen"
      component={ProfileScreen}
      options={{ title:"ProfileScreen"}}
      />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;

