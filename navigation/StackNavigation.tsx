import { RootStackParamList } from "./navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TabNavigator } from "./TabNavigation";
import NotificationScreen from "@/screen/Tab/Notification";
import SignUpScreen from "@/screen/Auth/SignUp";
import SignInScreen from "@/screen/Auth/SignIn";
import ExerciseScreen from "@/screen/Tab/Exercise";
import { VocabDetail } from "@/screen/Tab/VocabDetail";
import UserDetailScreen from "@/screen/Tab/UserDetail";

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName="HomePage">
            <Stack.Screen name="HomePage" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: true, headerTitle: 'Thông báo' }} />
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ headerShown: true }} />
            <Stack.Screen name="VocabDetail" component={VocabDetail} options={{ headerShown: true }} />
            <Stack.Screen name="UserDetail" component={UserDetailScreen} options={{ headerShown: true, headerTitle: 'Sửa thông tin' }} />
        </Stack.Navigator>
    );
}

