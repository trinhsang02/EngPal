import { RootStackParamList } from "./navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TabNavigator } from "./TabNavigation";
import NotificationScreen from "@/screen/Tab/Notification";
import SignUpScreen from "@/screen/Auth/SignUp";
import SignInScreen from "@/screen/Auth/SignIn";
import ExerciseScreen from "@/screen/Tab/Exercise";

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName="HomePage">
            <Stack.Screen name="HomePage" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ headerShown: true }} />
        </Stack.Navigator>
    );
}

