import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Animated,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VideoControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReplay: () => void;
  onFullScreen: () => void;
  onRotate?: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  brightness: number;
  onBrightnessChange: (brightness: number) => void;
  rotation?: number;
}

export default function VideoControls({
  isPlaying,
  onPlayPause,
  onReplay,
  onFullScreen,
  onRotate,
  volume,
  onVolumeChange,
  brightness,
  onBrightnessChange,
  rotation = 0,
}: VideoControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [showBrightnessIndicator, setShowBrightnessIndicator] = useState(false);
  const [volumeIndicatorOpacity] = useState(new Animated.Value(0));
  const [brightnessIndicatorOpacity] = useState(new Animated.Value(0));
  const [controlsOpacity] = useState(new Animated.Value(1));
  const [lastTap, setLastTap] = useState(0);
  const [initialVolume, setInitialVolume] = useState(volume);
  const [initialBrightness, setInitialBrightness] = useState(brightness);
  const [initialY, setInitialY] = useState(0);

  // Constants
  const screenWidth = Dimensions.get("window").width;
  const screenMiddle = screenWidth / 2;
  const controlsHideDelay = 3000; // 3 seconds before controls auto-hide

  // Auto-hide controls after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showControls) {
      timer = setTimeout(() => {
        fadeOutControls();
      }, controlsHideDelay);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showControls]);

  // Fade in/out animations for controls
  const fadeInControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setShowControls(true);
  };

  const fadeOutControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  };

  // Show indicator animations
  const showIndicator = (indicatorOpacity: Animated.Value) => {
    Animated.sequence([
      Animated.timing(indicatorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(indicatorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Double tap handler for quick play/pause
  const handleTap = (e: GestureResponderEvent) => {
    const currentTime = new Date().getTime();
    const tapLocation = e.nativeEvent.locationX;

    // Toggle controls on single tap
    if (currentTime - lastTap > 300) {
      // Not a double tap
      setLastTap(currentTime);
      showControls ? fadeOutControls() : fadeInControls();
      return;
    }

    // Double tap detected
    // Left side double tap (rewind 10s)
    if (tapLocation < screenMiddle) {
      console.log("Double tap left - rewind 10s");
      // You would add skip backward functionality here
    }
    // Right side double tap (forward 10s)
    else {
      console.log("Double tap right - forward 10s");
      // You would add skip forward functionality here
    }

    setLastTap(0); // Reset tap tracker
  };

  // Create pan responder for gesture handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only capture vertical swipes
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderGrant: (e: GestureResponderEvent) => {
      // Store initial values when gesture starts
      setInitialVolume(volume);
      setInitialBrightness(brightness);
      setInitialY(e.nativeEvent.locationY);

      // Determine if touch started on left or right side
      const touchX = e.nativeEvent.locationX;
      if (touchX < screenMiddle) {
        setShowBrightnessIndicator(true);
        showIndicator(brightnessIndicatorOpacity);
      } else {
        setShowVolumeIndicator(true);
        showIndicator(volumeIndicatorOpacity);
      }
    },
    onPanResponderMove: (
      e: GestureResponderEvent,
      gestureState: PanResponderGestureState
    ) => {
      const touchX = e.nativeEvent.locationX;

      // Calculate distance moved as percentage (swipe up decreases, swipe down increases)
      // Adjust the divisor to control sensitivity
      const sensitivity = 400; // Higher number = less sensitive
      const swipePercentage = gestureState.dy / sensitivity;

      // Apply changes based on which side of the screen was touched
      if (touchX < screenMiddle) {
        // Left side - brightness control (inverted: swipe up = brighter)
        const newBrightness = Math.max(
          0,
          Math.min(1, initialBrightness - swipePercentage)
        );
        onBrightnessChange(newBrightness);
        showIndicator(brightnessIndicatorOpacity);
      } else {
        // Right side - volume control (inverted: swipe up = louder)
        const newVolume = Math.max(
          0,
          Math.min(1, initialVolume - swipePercentage)
        );
        onVolumeChange(newVolume);
        showIndicator(volumeIndicatorOpacity);
      }
    },
    onPanResponderRelease: () => {
      setShowVolumeIndicator(false);
      setShowBrightnessIndicator(false);
    },
  });

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.controlsContainer} {...panResponder.panHandlers}>
        {/* Volume Indicator - YouTube-style UI */}
        <Animated.View
          style={[
            styles.indicator,
            styles.volumeIndicator,
            { opacity: showVolumeIndicator ? volumeIndicatorOpacity : 0 },
          ]}
        >
          <View style={styles.indicatorVertical}>
            <View style={styles.indicatorFillContainer}>
              <View
                style={[styles.indicatorFill, { height: `${volume * 100}%` }]}
              />
            </View>
            <Text style={styles.indicatorValue}>
              {Math.round(volume * 100)}
            </Text>
          </View>
          <Ionicons
            name={volume > 0 ? "volume-high" : "volume-mute"}
            size={24}
            color="white"
          />
        </Animated.View>

        {/* Brightness Indicator - YouTube-style UI */}
        <Animated.View
          style={[
            styles.indicator,
            styles.brightnessIndicator,
            {
              opacity: showBrightnessIndicator ? brightnessIndicatorOpacity : 0,
            },
          ]}
        >
          <View style={styles.indicatorVertical}>
            <View style={styles.indicatorFillContainer}>
              <View
                style={[
                  styles.indicatorFill,
                  { height: `${brightness * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.indicatorValue}>
              {Math.round(brightness * 100)}
            </Text>
          </View>
          <Ionicons name="sunny" size={24} color="white" />
        </Animated.View>

        {/* YouTube-style Player Controls */}
        <Animated.View
          style={[styles.controlsOverlay, { opacity: controlsOpacity }]}
        >
          {/* Top controls bar - title, options */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.rightControls}>
              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Center play/pause button */}
          <View style={styles.centerControls}>
            <TouchableOpacity style={styles.centerButton} onPress={onPlayPause}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={50}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Bottom controls bar - play/pause, progress, fullscreen */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onPlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={28}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={onReplay}>
              <Ionicons name="reload" size={24} color="white" />
            </TouchableOpacity>

            {/* Progress bar would go here */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <View style={styles.timingContainer}>
                <Text style={styles.timeText}>0:00</Text>
                <Text style={styles.timeText}>0:00</Text>
              </View>
            </View>

            {/* Add rotation button */}
            {onRotate && (
              <TouchableOpacity style={styles.controlButton} onPress={onRotate}>
                <Animated.View
                  style={{ transform: [{ rotate: `${rotation}deg` }] }}
                >
                  <Ionicons name="sync-outline" size={24} color="white" />
                </Animated.View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.controlButton}
              onPress={onFullScreen}
            >
              <Ionicons name="expand" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Swipe instruction - only show briefly on first use */}
        <Animated.View
          style={[styles.instructionsContainer, { opacity: controlsOpacity }]}
        >
          <View style={styles.instructionDots}>
            <View style={styles.instructionDot}>
              <Ionicons name="sunny" size={16} color="white" />
            </View>
            <View style={styles.instructionDot}>
              <Ionicons name="volume-high" size={16} color="white" />
            </View>
          </View>
          <Text style={styles.instructionsText}>Swipe up/down to adjust</Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centerControls: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 40,
    padding: 15,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  backButton: {
    padding: 8,
  },
  rightControls: {
    flexDirection: "row",
  },
  controlButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressFill: {
    width: "30%", // This would be dynamic based on progress
    height: "100%",
    backgroundColor: "#ff0000", // YouTube red
    borderRadius: 2,
  },
  timingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeText: {
    color: "white",
    fontSize: 12,
  },
  indicator: {
    position: "absolute",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 16,
    borderRadius: 12,
    flexDirection: "column",
    zIndex: 10,
  },
  volumeIndicator: {
    right: "10%",
    top: "30%",
  },
  brightnessIndicator: {
    left: "10%",
    top: "30%",
  },
  indicatorVertical: {
    alignItems: "center",
    height: 120,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  indicatorFillContainer: {
    width: 6,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  indicatorFill: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  indicatorValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 20,
    flexDirection: "column",
  },
  instructionDots: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 8,
  },
  instructionDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionsText: {
    color: "white",
    fontSize: 14,
  },
});
