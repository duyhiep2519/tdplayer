import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import {
  Video,
  VideoFullscreenUpdate,
  AVPlaybackStatus,
  ResizeMode,
} from "expo-av";
import * as Brightness from "expo-brightness";

// Using path aliases instead of relative paths
import { VideoItem } from "@/app/types/VideoTypes";
import VideoControls from "@/app/components/player/VideoControls";

interface VideoPlayerProps {
  videoRef: React.RefObject<Video>;
  selectedVideo: VideoItem | null;
  status: AVPlaybackStatus;
  isLoading: boolean;
  onPlaybackStatusUpdate: (status: AVPlaybackStatus) => void;
  onPlayPause: () => void;
  onReplay: () => void;
}

export default function VideoPlayer({
  videoRef,
  selectedVideo,
  status,
  isLoading,
  onPlaybackStatusUpdate,
  onPlayPause,
  onReplay,
}: VideoPlayerProps) {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const videoHeight = screenWidth * (9 / 16); // 16:9 aspect ratio

  const [volume, setVolume] = useState<number>(1.0); // Default volume to 100%
  const [brightness, setBrightness] = useState<number>(0.5); // Default brightness to 50%
  const [initialBrightness, setInitialBrightness] = useState<number>(0.5);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, or 270 degrees
  const [showRotateIndicator, setShowRotateIndicator] =
    useState<boolean>(false);
  const rotateIndicatorOpacity = useRef(new Animated.Value(0)).current;

  // Monitor screen dimensions for orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      const dim = Dimensions.get("window");
      const isLandscape = dim.width > dim.height;
      setOrientation(isLandscape ? "landscape" : "portrait");
    };

    // Set initial orientation
    updateOrientation();

    // Add event listener for orientation changes
    Dimensions.addEventListener("change", updateOrientation);

    return () => {
      // This is now deprecated, but we're keeping it for older Expo SDK compatibility
      // For newer versions, you would use the return value from addEventListener to remove the listener
      // const subscription = Dimensions.addEventListener("change", updateOrientation);
      // return () => subscription.remove();
    };
  }, []);

  // Get system brightness on component mount
  useEffect(() => {
    (async () => {
      try {
        // Request permission to access system brightness (only needed for iOS)
        const { status } = await Brightness.requestPermissionsAsync();

        if (status === "granted") {
          // Get the current system brightness
          const currentBrightness = await Brightness.getBrightnessAsync();
          setBrightness(currentBrightness);
          setInitialBrightness(currentBrightness);
        }
      } catch (error) {
        console.error("Failed to get brightness:", error);
      }
    })();
  }, []);

  // Handle fullscreen toggle
  const handleFullscreenUpdate = ({
    fullscreenUpdate,
  }: {
    fullscreenUpdate: VideoFullscreenUpdate;
  }) => {
    switch (fullscreenUpdate) {
      case VideoFullscreenUpdate.PLAYER_DID_PRESENT:
        setIsFullscreen(true);
        // Hide status bar in fullscreen
        StatusBar.setHidden(true);
        break;
      case VideoFullscreenUpdate.PLAYER_WILL_DISMISS:
        setIsFullscreen(false);
        // Show status bar when exiting fullscreen
        StatusBar.setHidden(false);
        break;
    }
  };

  // Handle volume change
  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);

    if (videoRef.current) {
      await videoRef.current.setVolumeAsync(newVolume);
    }
  };

  // Handle brightness change
  const handleBrightnessChange = async (newBrightness: number) => {
    setBrightness(newBrightness);

    try {
      await Brightness.setBrightnessAsync(newBrightness);
    } catch (error) {
      console.error("Failed to set brightness:", error);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (videoRef.current) {
      if (isFullscreen) {
        await videoRef.current.dismissFullscreenPlayer();
      } else {
        await videoRef.current.presentFullscreenPlayer();
      }
    }
  };

  // Handle video rotation
  const rotateVideo = () => {
    // Rotate in 90-degree increments (0 -> 90 -> 180 -> 270 -> 0)
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);

    // Show rotation indicator
    setShowRotateIndicator(true);

    // Animate rotation indicator
    Animated.sequence([
      Animated.timing(rotateIndicatorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(rotateIndicatorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowRotateIndicator(false);
    });
  };

  // Reset brightness when unmounting
  useEffect(() => {
    return () => {
      // Reset brightness to initial value when component unmounts
      (async () => {
        try {
          await Brightness.setBrightnessAsync(initialBrightness);
        } catch (error) {
          console.error("Failed to reset brightness:", error);
        }
      })();
    };
  }, [initialBrightness]);

  if (!selectedVideo) {
    return null;
  }

  // Determine video container styles based on rotation
  const getVideoContainerStyle = () => {
    const baseStyle = [
      styles.videoContainer,
      { height: videoHeight },
      orientation === "landscape" && styles.landscapeContainer,
    ];

    // No additional styles for 0 and 180 degrees rotation
    if (rotation === 0 || rotation === 180) {
      return baseStyle;
    }

    // For 90 and 270 degrees, change aspect ratio to maintain video proportions
    return [...baseStyle, { height: screenWidth * (16 / 9) }];
  };

  return (
    <View style={getVideoContainerStyle()}>
      <Animated.View
        style={[
          styles.video,
          {
            transform: [
              { rotate: `${rotation}deg` },
              // Conditionally adjust video position and scaling based on rotation
              ...(rotation === 90 || rotation === 270
                ? [
                    { scale: orientation === "portrait" ? 0.5625 : 1 }, // 9/16 ratio for proper scaling
                  ]
                : []),
            ],
          },
        ]}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: selectedVideo.uri }}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          volume={volume}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onFullscreenUpdate={handleFullscreenUpdate}
        />
      </Animated.View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff0000" />
        </View>
      )}

      {/* Rotation Indicator */}
      {showRotateIndicator && (
        <Animated.View
          style={[styles.rotateIndicator, { opacity: rotateIndicatorOpacity }]}
        >
          <View style={styles.rotateIndicatorContent}>
            <Animated.View
              style={{ transform: [{ rotate: `${rotation}deg` }] }}
            >
              <Ionicons name="phone-portrait" size={24} color="white" />
            </Animated.View>
            <Text style={styles.rotateIndicatorText}>{rotation}°</Text>
          </View>
        </Animated.View>
      )}

      {/* Video Controls */}
      <VideoControls
        isPlaying={status.isLoaded && status.isPlaying}
        onPlayPause={onPlayPause}
        onReplay={onReplay}
        onFullScreen={toggleFullscreen}
        onRotate={rotateVideo}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        brightness={brightness}
        onBrightnessChange={handleBrightnessChange}
        rotation={rotation}
      />
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

const styles = StyleSheet.create({
  videoContainer: {
    width: "100%",
    position: "relative",
    backgroundColor: "#000",
    overflow: "hidden",
  },
  landscapeContainer: {
    height: "100%", // Take full height in landscape mode
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  rotateIndicator: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 8,
    zIndex: 5,
  },
  rotateIndicatorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rotateIndicatorText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
});
