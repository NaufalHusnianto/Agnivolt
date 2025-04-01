import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",

        headerTitle: () => (
          <Image
            source={require("../../assets/images/Company.png")}
            style={{ width: 100, height: 30, marginBottom: 20 }}
          />
        ),

        headerLeft: () => (
          <TouchableOpacity onPress={() => alert("Menu Opened!")}>
            <Ionicons name="menu" size={24} style={{ marginLeft: 15 }} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart-sharp" : "bar-chart-outline"}
              color={color}
              size={24}
            />
          ),
          tabBarLabel: "History",
        }}
      />
      <Tabs.Screen
        name="device"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "medkit-sharp" : "medkit-outline"}
              color={color}
              size={24}
            />
          ),
          tabBarLabel: "Device",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-sharp" : "person-outline"}
              color={color}
              size={24}
            />
          ),
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}
