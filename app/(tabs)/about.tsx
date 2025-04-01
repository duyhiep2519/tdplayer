import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AboutScreen() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          title: "About",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>TD Player</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This App</Text>
          <Text style={styles.sectionText}>
            TD Player is a modern media player application built with React
            Native and Expo. Enjoy seamless playback of your favorite media
            content with our intuitive user interface.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.bulletPoint}>
            • Cross-platform support for iOS and Android
          </Text>
          <Text style={styles.bulletPoint}>
            • Clean and intuitive user interface
          </Text>
          <Text style={styles.bulletPoint}>
            • Optimized performance for smooth playback
          </Text>
          <Text style={styles.bulletPoint}>• Customizable theme options</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("mailto:support@tdplayer.com")}
          >
            support@tdplayer.com
          </Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://tdplayer.com")}
          >
            Visit our website
          </Text>
        </View>

        <Text style={styles.copyright}>
          © 2025 TD Player. All rights reserved.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
    color: "#444",
  },
  link: {
    fontSize: 16,
    color: "#0066cc",
    marginBottom: 8,
  },
  copyright: {
    marginTop: 30,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#888",
  },
});
