import HomePage from "@/screen/HomePage";
import Setting from "@/screen/Setting";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import HomeNavigators from "./HomeNavigators";
import StudyingNavigators from "./StudyingNavigator";
const Tab = createBottomTabNavigator();


export function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{
            tabBarStyle: styles.container,
            tabBarItemStyle: styles.itemStyle,
            headerShown: false
        }}>
            <Tab.Screen name="Home" component={HomeNavigators}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                    headerShown: false,
                }} />
            <Tab.Screen name="Studying" component={StudyingNavigators}
                options={{
                    title: 'Studying',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="book" color={color} />,
                    headerShown: false,
                }} />


            <Tab.Screen name="Settings" component={Setting}
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="settings" color={color} />,
                    headerShown: false,
                }} />
 
        </Tab.Navigator>
    );
}


const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        height: "7%",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.7,
        shadowRadius: 16,
        elevation: 24,
        // marginBottom: 100
    },

    itemStyle: {
        marginBottom: 5
    }
})
