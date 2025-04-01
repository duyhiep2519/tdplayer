import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VideoItem } from "@/app/types/VideoTypes";

interface VideoListItemProps {
  item: VideoItem;
  isSelected: boolean;
  onSelect: (video: VideoItem) => void;
  formatDuration: (seconds: number) => string;
}

export default function VideoListItem({
  item,
  isSelected,
  onSelect,
  formatDuration,
}: VideoListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.videoListItem, isSelected && styles.selectedVideo]}
      onPress={() => onSelect(item)}
    >
      <Ionicons
        name="videocam"
        size={24}
        color={isSelected ? "#0066cc" : "#666"}
        style={styles.videoIcon}
      />
      <View style={styles.videoItemInfo}>
        <Text
          style={[styles.videoItemTitle, isSelected && styles.selectedText]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
        {item.duration > 0 && (
          <Text style={styles.videoItemDuration}>
            {formatDuration(item.duration)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  videoListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedVideo: {
    backgroundColor: "#f5f5f5",
  },
  selectedText: {
    color: "#0066cc",
    fontWeight: "bold",
  },
  videoIcon: {
    marginRight: 12,
  },
  videoItemInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  videoItemTitle: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  videoItemDuration: {
    fontSize: 14,
    color: "#888",
  },
});
