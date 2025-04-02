import { Link } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/Company.png")}
        style={{ width: 150, height: 50, marginBottom: 20 }}
      />

      <Text style={styles.title}>Empowers Your Energy</Text>
      <Text style={styles.description}>
        Agnivolt Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum
        deserunt, perspiciatis dolor explicabo, quis et assumenda hic sequi
      </Text>

      <Image
        source={require("../assets/images/Artboard.png")}
        style={{ width: 300, height: 180, marginTop: 50 }}
      />

      <Link href="/(tabs)/home" style={styles.button}>
        Get Started
      </Link>
      <Text style={{ marginTop: 30 }}>
        Already have an account?{" "}
        <Link href="/(tabs)/home" style={styles.link}>
          Login
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
  },
  button: {
    fontSize: 20,
    padding: 10,
    paddingHorizontal: 50,
    marginTop: 50,
    borderRadius: 20,
    color: "#fff",
    backgroundColor: "#007AFF",
  },
  link: {
    color: "#007AFF",
  },
});
