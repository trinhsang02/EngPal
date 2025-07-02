import { RootStackParamList } from "./Navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TabNavigator } from "./TabNavigation";
import NotificationScreen from "@/screen/Tab/Notification";
import SignUpScreen from "@/screen/Auth/SignUp";
import SignInScreen from "@/screen/Auth/SignIn";
import ExerciseScreen from "@/screen/Resources/Exercise";
import { VocabDetail } from "@/screen/Tab/VocabDetail";
import UserDetailScreen from "@/screen/Tab/UserDetail";
import GoalScreen from "@/screen/SubSetting/goal";
import LevelScreen from "@/screen/SubSetting/level";
import TopicsScreen from "@/screen/SubSetting/topics";
import Review from "@/screen/Resources/Review";
import Chat from "@/screen/Resources/Chat";
import QuizScreen from "@/screen/Resources/QuizScreen";
import Grammar from "@/screen/Resources/Grammar";
import GrammarDetail from "@/screen/Resources/GrammarDetail";
import StoryScreen from "@/screen/Resources/Story";

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName="HomePage">
            <Stack.Screen name="HomePage" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: true, headerTitle: 'Thông báo' }} />
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VocabDetail" component={VocabDetail} options={{ headerShown: true, headerTitle: 'Word Detail' }} />
            <Stack.Screen name="UserDetail" component={UserDetailScreen} options={{ headerShown: true, headerTitle: 'Sửa thông tin' }} />
            <Stack.Screen name="Goal" component={GoalScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Level" component={LevelScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Topics" component={TopicsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Review" component={Review} options={{ headerShown: true, headerTitle: 'Review' }} />
            <Stack.Screen name="Chat" component={Chat} options={{ headerShown: true, headerTitle: 'Chat' }} />
            <Stack.Screen name="QuizScreen" component={QuizScreen} options={{ headerShown: true, headerTitle: 'Làm bài tập' }} />
            <Stack.Screen name="Grammar" component={Grammar} options={{ headerShown: false }} />
            <Stack.Screen name="GrammarDetail" component={GrammarDetail} options={{ headerShown: false }} />
            <Stack.Screen name="Story" component={StoryScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

