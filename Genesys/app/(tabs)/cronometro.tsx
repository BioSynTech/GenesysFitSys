import React, { useState, useEffect } from "react"; 
import { TouchableOpacity, StyleSheet, Text, View, Pressable, SafeAreaView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { DrawerMenu } from '@/components/drawer-menu';
import { Colors } from "../../constants/colors"; // Verifique se o caminho está correto

export default function CronometroScreen() {
  const [tempo, setTempo] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval>;
    if (isRunning) {
      intervalo = setInterval(() => {
        setTempo((t) => t + 1);
      }, 1000);
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

  const resetar = () => {
    setIsRunning(false);
    setTempo(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuIcon}>
          <Ionicons name="menu" size={38} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>⏱️ Cronômetro</Text>

      {/* Círculo do Cronômetro */}
      <View style={styles.timerCircle}>
        <Text style={styles.timer}>{formatarTempo(tempo)}</Text>
        <Text style={styles.label}>{isRunning ? "FOCO NO TREINO!" : "DESCANSO"}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, isRunning ? styles.btnParar : styles.btnIniciar]}
          onPress={() => setIsRunning(!isRunning)}
        >
          <Ionicons name={isRunning ? "pause" : "play"} size={24} color="#0d0d0d" />
          <Text style={styles.buttonText}>{isRunning ? "Parar" : "Iniciar"}</Text>
        </Pressable>
        
        <Pressable style={[styles.button, styles.btnReset]} onPress={resetar}>
          <Ionicons name="refresh" size={24} color="#FFD700" />
          <Text style={[styles.buttonText, { color: "#FFD700" }]}>Resetar</Text>
        </Pressable>
      </View>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.charcoal, // Fundo Obsidian
    alignItems: "center",
    paddingTop: 50,
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  menuIcon: {
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFD700",
    marginTop: 20,
    letterSpacing: 2,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    borderColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 60,
    backgroundColor: "#1a1a1a",
    // Sombra para dar profundidade
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  timer: {
    fontSize: 70,
    fontWeight: "800",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
  label: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
    width: '100%',
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minWidth: 140,
  },
  btnIniciar: {
    backgroundColor: "#FFD700",
  },
  btnParar: {
    backgroundColor: "#ff4444",
  },
  btnReset: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  buttonText: {
    color: "#0d0d0d",
    fontWeight: "900",
    fontSize: 16,
    textTransform: "uppercase",
  },
});