import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { ValidationIssue } from '@/types/submission';
export function ValidationRow({issue}:{issue:ValidationIssue}) { const color=issue.severity==='error'?colors.coral:colors.amber; return <View style={styles.row}><Ionicons name={issue.severity==='error'?'alert-circle':'warning'} color={color} size={20}/><Text style={styles.text}>{issue.message}</Text></View>; }
const styles=StyleSheet.create({row:{flexDirection:'row',gap:10,alignItems:'flex-start',paddingVertical:10},text:{color:colors.text,flex:1,fontSize:14}});
