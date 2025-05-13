import { RootStackParamList } from "./navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TabNavigator } from "./TabNavigation";

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName="HomePage">
            {/* <Stack.Screen name="Layout" component={Layout} options={{ headerShown: false }} /> */}
            <Stack.Screen name="HomePage" component={TabNavigator} options={{ headerShown: false }} />

        </Stack.Navigator>
    );
}

