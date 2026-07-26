import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';
export function FormField({ label, ...props }: TextInputProps & {label:string}) { return <View style={styles.wrap}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor={colors.muted} style={[styles.input,props.multiline&&styles.multiline]} {...props}/></View>; }
const styles=StyleSheet.create({wrap:{marginBottom:spacing(1.5)},label:{color:colors.muted,fontSize:12,fontWeight:'700',marginBottom:6,textTransform:'uppercase'},input:{color:colors.text,backgroundColor:colors.navy,borderColor:colors.line,borderWidth:1,borderRadius:10,paddingHorizontal:12,paddingVertical:11,fontSize:16},multiline:{minHeight:100,textAlignVertical:'top'}});
