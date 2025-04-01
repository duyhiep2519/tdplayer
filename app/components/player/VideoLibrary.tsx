import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";

// Import types
import {
  VideoItem,
  VideoLibraryProps,
  VideoViewMode,
  VideoLibraryState,
} from "@/app/types/VideoTypes";

export default function VideoLibrary({
  onSelectVideo,
  selectedVideoId,
}: VideoLibraryProps) {
  // Using the VideoLibraryState type for our state management
  const [state, setState] = useState<VideoLibraryState>({
    videos: [],
    isLoading: false,
    refreshing: false,
    hasNextPage: true,
    endCursor: undefined,
    viewMode: "grid",
    albumTitle: "All Videos",
  });

  const {
    videos,
    isLoading,
    refreshing,
    hasNextPage,
    endCursor,
    viewMode,
    albumTitle,
  } = state;

  const screenWidth = Dimensions.get("window").width;
  const numColumns = viewMode === "grid" ? 2 : 1;
  const columnWidth = screenWidth / numColumns - 12;

  // Load videos on component mount
  useEffect(() => {
    loadVideos();
  }, []);

  // Format video duration to MM:SS
  const formatDuration = (seconds: number): string => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Extract video thumbnail
  const getVideoThumbnail = async (
    asset: MediaLibrary.Asset
  ): Promise<string> => {
    try {
      // You can use generateThumbnail from expo-video-thumbnails package as an alternative
      // For now, we'll just use the uri from the asset directly
      return asset.uri;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return "";
    }
  };

  // Load videos from media library
  const loadVideos = async (after?: string) => {
    try {
      if (after === undefined) {
        setState((prev) => ({ ...prev, isLoading: true }));
      }

      // Get videos from library with pagination
      const mediaAssets = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.video,
        sortBy: [MediaLibrary.SortBy.creationTime],
        first: 20, // Load 20 videos per batch
        after,
      });

      // Format the videos for display
      const formattedVideos: VideoItem[] = await Promise.all(
        mediaAssets.assets.map(async (asset) => ({
          id: asset.id,
          uri: asset.uri,
          title: asset.filename || `Video ${asset.id}`,
          duration: asset.duration, // in seconds
          creationTime: asset.creationTime,
          thumbnail: await getVideoThumbnail(asset),
        }))
      );

      setState((prev) => ({
        ...prev,
        videos:
          after === undefined
            ? formattedVideos
            : [...prev.videos, ...formattedVideos],
        hasNextPage: mediaAssets.hasNextPage,
        endCursor: mediaAssets.endCursor,
        isLoading: false,
        refreshing: false,
      }));
    } catch (error) {
      console.error("Error loading videos:", error);
      Alert.alert("Error", "Could not load videos from your library");
      setState((prev) => ({ ...prev, isLoading: false, refreshing: false }));
    }
  };

  // Load more videos when reaching end of list
  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      loadVideos(endCursor);
    }
  };

  // Refresh the video list
  const handleRefresh = () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    loadVideos();
  };

  // Toggle view mode between grid and list
  const toggleViewMode = () => {
    const newViewMode: VideoViewMode = viewMode === "grid" ? "list" : "grid";
    setState((prev) => ({ ...prev, viewMode: newViewMode }));
  };

  // Render video item in list/grid
  const renderVideoItem = ({ item }: { item: VideoItem }) => {
    const isSelected = selectedVideoId === item.id;

    return viewMode === "grid" ? (
      <TouchableOpacity
        style={[
          styles.gridItem,
          { width: columnWidth },
          isSelected && styles.selectedItem,
        ]}
        onPress={() => onSelectVideo(item)}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          {/* Thumbnail or placeholder */}
          {item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="videocam" size={32} color="#ccc" />
            </View>
          )}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[styles.videoTitle, isSelected && styles.selectedText]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.selectedItem]}
        onPress={() => onSelectVideo(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listThumbnailContainer}>
          {item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.listThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.listThumbnailPlaceholder}>
              <Ionicons name="videocam" size={24} color="#ccc" />
            </View>
          )}
          <View style={styles.listDurationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
        <View style={styles.listItemDetails}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[styles.listItemTitle, isSelected && styles.selectedText]}
          >
            {item.title}
          </Text>
          <Text style={styles.listItemDate}>
            {new Date(item.creationTime).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state when no videos
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.emptyStateText}>Loading videos...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="videocam-outline" size={60} color="#ccc" />
        <Text style={styles.emptyStateTitle}>No Videos Found</Text>
        <Text style={styles.emptyStateText}>
          Try adding videos to your device or check your permissions settings.
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render footer when loading more videos
  const renderFooter = () => {
    if (!isLoading || videos.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0066cc" />
        <Text style={styles.footerText}>Loading more videos...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{albumTitle}</Text>
        <TouchableOpacity
          onPress={toggleViewMode}
          style={styles.viewModeButton}
        >
          <Ionicons
            name={viewMode === "grid" ? "list" : "grid"}
            size={22}
            color="#0066cc"
          />
        </TouchableOpacity>
      </View>

      {/* Video list/grid */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideoItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        numColumns={numColumns}
        key={viewMode} // Force re-render when viewMode changes
        contentContainerStyle={
          videos.length === 0 ? { flex: 1 } : styles.listContent
        }
        columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  viewModeButton: {
    padding: 8,
  },
  listContent: {
    padding: 8,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  gridItem: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  thumbnailContainer: {
    height: 100,
    backgroundColor: "#eee",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  durationBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  videoTitle: {
    fontSize: 13,
    padding: 8,
    color: "#333",
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  listThumbnailContainer: {
    width: 120,
    height: 70,
    backgroundColor: "#eee",
    position: "relative",
  },
  listThumbnail: {
    width: "100%",
    height: "100%",
  },
  listThumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  listDurationBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listItemDetails: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  listItemTitle: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  listItemDate: {
    fontSize: 12,
    color: "#777",
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: "#0066cc",
  },
  selectedText: {
    color: "#0066cc",
    fontWeight: "500",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: "#0066cc",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 6,
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
});
