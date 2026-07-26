import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';
export function SectionCard({ title, children }: React.PropsWithChildren<{title:string}>) { return <View style={styles.card}><Text style={styles.title}>{title}</Text>{children}</View>; }
const styles=StyleSheet.create({card:{backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:16,padding:spacing(2),marginBottom:spacing(2)},title:{color:colors.text,fontSize:17,fontWeight:'700',marginBottom:spacing(1.5)}});
