import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { VideoItem } from "@/app/types/VideoTypes";

interface VideoInfoProps {
  video: VideoItem;
  formatDuration: (seconds: number) => string;
}

export default function VideoInfo({ video, formatDuration }: VideoInfoProps) {
  return (
    <View style={styles.infoContainer}>
      <Text style={styles.videoTitle}>{video.title}</Text>
      {video.duration > 0 && (
        <Text style={styles.videoDuration}>
          Duration: {formatDuration(video.duration)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  videoDuration: {
    fontSize: 14,
    color: "#666",
  },
});
