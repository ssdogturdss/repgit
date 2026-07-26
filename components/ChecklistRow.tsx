import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistItem } from '@/constants/checklist';
import { colors, spacing } from '@/constants/theme';
export function ChecklistRow({item,checked,onPress}:{item:ChecklistItem;checked:boolean;onPress:()=>void}) { return <Pressable onPress={onPress} style={styles.row}><Ionicons name={checked?'checkmark-circle':'ellipse-outline'} size={28} color={checked?colors.mint:colors.muted}/><View style={styles.copy}><Text style={styles.title}>{item.title}{item.required?' *':''}</Text><Text style={styles.desc}>{item.description}</Text></View></Pressable>; }
const styles=StyleSheet.create({row:{flexDirection:'row',gap:12,paddingVertical:14,borderBottomWidth:1,borderColor:colors.line},copy:{flex:1},title:{color:colors.text,fontWeight:'700'},desc:{color:colors.muted,fontSize:13,marginTop:3}});
