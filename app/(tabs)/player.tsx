import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Alert,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Video, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as DocumentPicker from "expo-document-picker";

// Import components
import VideoPlayer from "../components/player/VideoPlayer";
import VideoInfo from "../components/player/VideoInfo";
import ActionsBar from "../components/player/ActionsBar";
import VideoLibrary from "../components/player/VideoLibrary";
import PermissionRequest from "../components/player/PermissionRequest";

// Import types
import { VideoItem } from "../types/VideoTypes";

export default function PlayerScreen() {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>(
    {} as AVPlaybackStatus
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mediaPermission, setMediaPermission] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const screenWidth = Dimensions.get("window").width;
  const videoHeight = screenWidth * (9 / 16); // 16:9 aspect ratio

  useEffect(() => {
    // Request permissions and load videos when component mounts
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(status === "granted");

      if (status === "granted") {
        loadVideosFromLibrary();
      }
    })();

    // Set status bar to light content for better visibility on dark player background
    RNStatusBar.setBarStyle("light-content");

    return () => {
      // Reset status bar when unmounting
      RNStatusBar.setBarStyle("default");
    };
  }, []);

  useEffect(() => {
    // Reset loading state when video changes
    if (selectedVideo) {
      setIsLoading(true);
    }
  }, [selectedVideo]);

  const loadVideosFromLibrary = async () => {
    try {
      setIsLoading(true);
      const mediaAssets = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.video,
        sortBy: [MediaLibrary.SortBy.creationTime],
        first: 50, // Limit to first 50 videos for better performance
      });

      // Format the videos for display
      const formattedVideos: VideoItem[] = mediaAssets.assets.map((asset) => ({
        id: asset.id,
        uri: asset.uri,
        title: asset.filename || `Video ${asset.id}`,
        duration: asset.duration, // in seconds
        creationTime: asset.creationTime,
      }));

      setVideos(formattedVideos);

      if (formattedVideos.length > 0) {
        setSelectedVideo(formattedVideos[0]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading videos:", error);
      Alert.alert("Error", "Could not load videos from your library");
      setIsLoading(false);
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled === false) {
        // DocumentPicker returns an array of assets in newer versions
        const asset = result.assets ? result.assets[0] : result;

        const pickedVideo: VideoItem = {
          id: Date.now().toString(),
          uri: asset.uri,
          title: asset.name || "Selected Video",
          duration: 0, // Duration unknown for picked videos
          creationTime: Date.now(),
        };

        setSelectedVideo(pickedVideo);
        setVideos([pickedVideo, ...videos]);
      }
    } catch (err) {
      console.error("Error picking video:", err);
      Alert.alert("Error", "Could not pick the video");
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    if (status.isLoaded) {
      setIsLoading(false);
    }
  };

  const handleSelectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (status.isLoaded && status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleReplay = async () => {
    if (videoRef.current) {
      await videoRef.current.replayAsync();
    }
  };

  // Format video duration to MM:SS
  const formatDuration = (seconds: number): string => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setMediaPermission(status === "granted");

    if (status === "granted") {
      loadVideosFromLibrary();
    } else {
      Alert.alert(
        "Permission Required",
        "This app needs access to your media library to play your videos.",
        [{ text: "OK" }]
      );
    }
  };

  // Show permission request screen if permission not granted
  if (!mediaPermission) {
    return (
      <>
        <StatusBar style="auto" />
        <Stack.Screen
          options={{
            title: "TD Player",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <PermissionRequest onRequestPermission={requestPermission} />
      </>
    );
  }

  // Empty placeholder when no videos are selected
  const EmptyVideoPlaceholder = () => (
    <View
      style={[
        styles.videoContainer,
        { height: videoHeight },
        styles.noVideoContainer,
      ]}
    >
      <Ionicons name="videocam-outline" size={60} color="#ccc" />
      <Text style={styles.noVideoText}>No video selected</Text>
    </View>
  );

  // Empty state when no videos are found in the library
  const EmptyLibrary = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No videos found on your device</Text>
      <TouchableOpacity style={styles.permissionButton} onPress={pickVideo}>
        <Text style={styles.permissionButtonText}>Select a Video</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: "YouTube-Style Player",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerStyle: {
            backgroundColor: "#f8f8f8",
          },
        }}
      />
      <View style={styles.container}>
        {/* Video Player */}
        {selectedVideo ? (
          <VideoPlayer
            videoRef={videoRef}
            selectedVideo={selectedVideo}
            status={status}
            isLoading={isLoading}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onPlayPause={handlePlayPause}
            onReplay={handleReplay}
          />
        ) : (
          <EmptyVideoPlaceholder />
        )}

        {/* Video Title and Info */}
        {selectedVideo && (
          <VideoInfo video={selectedVideo} formatDuration={formatDuration} />
        )}

        {/* Actions Bar */}
        <ActionsBar
          onRefresh={loadVideosFromLibrary}
          onSelectVideo={pickVideo}
        />

        {/* Video Library Component */}
        <Text style={styles.sectionTitle}>Video Library</Text>
        {videos.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <VideoLibrary
            onSelectVideo={handleSelectVideo}
            selectedVideoId={selectedVideo?.id}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8", // Light gray background similar to YouTube
  },
  videoContainer: {
    width: "100%",
    position: "relative",
    backgroundColor: "#000",
  },
  noVideoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  noVideoText: {
    marginTop: 10,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 15,
    marginBottom: 10,
    color: "#212121", // YouTube-like dark gray for text
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#ff0000", // YouTube red
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
