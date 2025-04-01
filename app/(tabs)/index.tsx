import { Text, View, StyleSheet } from "react-native";
import { Stack } from "expo-router";

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "TD Player" }} />
      <View style={styles.container}>
        <Text style={styles.title}>TD Player</Text>
        <Text style={styles.subtitle}>Welcome to your media player app</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
});
