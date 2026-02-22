import React, { useState, useEffect } from "react"; 
import {  TouchableOpacity } from "react-native";
import { Button, StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from '@expo/vector-icons';
import { DrawerMenu } from '@/components/drawer-menu';

export default function CronometroScreen() {
  const router = useRouter();
  const [tempo, setTempo] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const textColor = useThemeColor({}, "text");
  const accentColor = useThemeColor({}, "tint");

  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (isRunning) {
      //@ts-ignore
      intervalo = setInterval(() => setTempo((t) => t + 1), 1000);
    }
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [isRunning]);

  const formatarTempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${String(mins).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
  };

  const iniciar = () => setIsRunning(true);
  const parar = () => setIsRunning(false);
  const resetar = () => {
    setIsRunning(false);
    setTempo(0);
  };

  return (
    <View style={styles.container}>
          <TouchableOpacity onPress={() => setShowDrawer(true)}>
            <Ionicons name="menu" size={28} color="#FFD700" />
          </TouchableOpacity>
      
      <Text style={[styles.title, { color: accentColor }]}>⏱️ Cronômetro</Text>
      <Text style={[styles.timer, { color: accentColor }]}>{formatarTempo(tempo)}</Text>
      
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={iniciar}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Iniciar</Text>
        </Pressable>
        
        <Pressable
          style={[styles.button, !isRunning && styles.buttonDisabled]}
          onPress={parar}
          disabled={!isRunning}
        >
          <Text style={styles.buttonText}>Parar</Text>
        </Pressable>
        
        <Pressable style={styles.button} onPress={resetar}>
          <Text style={styles.buttonText}>Resetar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#072018",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#e8a322",
  },
  backButtonText: {
    color: "#0d0d0d",
    fontWeight: "600",
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  timer: {
    fontSize: 64,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFD700",
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#0d0d0d",
    fontWeight: "600",
    fontSize: 14,
  },
});
