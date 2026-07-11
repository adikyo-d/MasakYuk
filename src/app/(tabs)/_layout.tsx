// src/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import {
    Heart,
    HouseLine,
    Plus,
    Sparkle,
    UserCircle,
    type Icon,
} from "phosphor-react-native";
import { View } from "react-native";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, Icon> = {
    home: HouseLine,
    explore: Sparkle,
    add: Plus,
    favorites: Heart,
    profile: UserCircle,
  };
  const IconComponent = icons[name] ?? HouseLine;
  const isAdd = name === "add";
  const color = focused ? "#E07A5F" : "#7F8C8D";

  if (isAdd) {
    return (
      <View
        className={`-mt-4 h-14 w-14 items-center justify-center rounded-full ${
          focused ? "bg-sketchTerracotta" : "bg-sketchTerracotta/90"
        }`}
        style={{
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        <IconComponent color="#FFFFFF" size={30} weight="bold" />
      </View>
    );
  }
  return <IconComponent color={color} size={26} weight="duotone" />;
}

export default function TabLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E07A5F",
        tabBarInactiveTintColor: "#7F8C8D",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="explore" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tambah"
        options={{
          title: "Add",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => <TabIcon name="add" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorit"
        options={{
          title: "Favorites",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="favorites" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
