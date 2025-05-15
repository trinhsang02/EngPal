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
    'Grammar': undefined;
    'Writing': undefined;
    'Notification': undefined;
    'VocabDetail': { vocab: Vocab };
    'UserDetail': { name: string; email: string; id: string };
};

