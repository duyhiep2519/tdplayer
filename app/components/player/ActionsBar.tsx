import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActionsBarProps {
  onRefresh: () => void;
  onSelectVideo: () => void;
}

export default function ActionsBar({
  onRefresh,
  onSelectVideo,
}: ActionsBarProps) {
  return (
    <View style={styles.actionsBar}>
      <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
        <Ionicons name="refresh" size={20} color="#0066cc" />
        <Text style={styles.actionText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onSelectVideo}>
        <Ionicons name="add-circle" size={20} color="#0066cc" />
        <Text style={styles.actionText}>Select File</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsBar: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    padding: 5,
  },
  actionText: {
    marginLeft: 5,
    color: "#0066cc",
    fontWeight: "500",
  },
});
