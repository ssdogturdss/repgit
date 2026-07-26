import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';
export function Screen({ children }: React.PropsWithChildren) { return <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View>{children}</View></ScrollView>; }
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.navy},content:{padding:spacing(2),paddingBottom:spacing(5)}});
