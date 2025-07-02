import { Vocab } from '@/types/vocab';

export type RootStackParamList = {
    'SignIn': undefined;
    'SignUp': undefined;
    'Layout': undefined;
    'Setting': undefined;
    'HomePage': undefined;
    'Studying': undefined;
    'StudyingHome': undefined;
    'Exercise': undefined;
    'Vocabulary': undefined;
    'Writing': undefined;
    'Notification': undefined;
    'VocabDetail': { vocab: Vocab };
    'UserDetail': { name: string; email: string; id: string };
    'Goal': undefined;
    'Level': undefined;
    'Topics': undefined;
    'Language': undefined;
    'ReminderTime': undefined;
    'Terms': undefined;
    'Privacy': undefined;
    'Contact': undefined;
    'Review': undefined;
    'Chat': undefined;
    'QuizScreen': { quizzes: any[] };
    'FlashCardSession': {
        sessionType: 'review' | 'new' | 'mixed';
        wordCount?: number;
    };
    'Grammar': undefined;
    'GrammarDetail': { subtitle: any };
    'Story': undefined;
    'NativeLang': undefined;
};

