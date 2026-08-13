import CustomNavBar from "@/components/CustomeNavBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs 
    screenOptions={{ headerShown: false }}
    tabBar={ (props) => <CustomNavBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="transactions" options={{ title: "Activity" }} />
        <Tabs.Screen name="add" options={{ title: "Add" }} />
        <Tabs.Screen name="assistance" options={{ title: "Ask AI" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
