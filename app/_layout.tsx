import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SubmissionProvider } from '@/context/SubmissionContext';
export default function RootLayout(){return <SubmissionProvider><StatusBar style="light"/><Stack screenOptions={{headerShown:false}}/></SubmissionProvider>;}
