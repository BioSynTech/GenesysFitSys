import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { gerarTreinoIA } from '../../services/gemini';
import { DrawerMenu } from '@/components/drawer-menu';


const { width } = Dimensions.get('window');

export default function HomePage() {
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  // Estados para IA
  const [aiResponse, setAIResponse] = useState("");
  const [loadingIA, setLoadingAI] = useState(false);

  const handleAiConsult = async () => {
    setLoadingAI(true);
    try {
      const response = await gerarTreinoIA(userData);
      setAIResponse(response);
      Alert.alert("Personal IA", response);
    } catch (error) {
      Alert.alert("Erro", "Falha ao gerar treino. Tente novamente.");
    } finally {
      setLoadingAI(false);
    }
  }

  // Estados do Treino
  const [isTraining, setIsTraining] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Monitor de Dados e Level Up
  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setUserData(data);
          if (data.peso === 0 || data.altura === 0) setShowWelcome(true);

          // Lógica automática de Level Up
          if (data.xp >= 1000) {
            handleLevelUp(data.level);
          }
        }
      });
      return () => unsub();
    }
  }, []);

  // Cronômetro do Treino
  useEffect(() => {
    let interval: any;
    if (isTraining) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  const handleLevelUp = async (currentLevel: number) => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userRef, {
      level: increment(1),
      xp: 0 // Reseta o XP ao subir de nível
    });
    Alert.alert("LEVEL UP! 🎊", `Você atingiu o nível ${currentLevel + 1}!`);
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Vai desistir igual ela fez com você?", [
      { text: "Não, vou treinar!", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => { signOut(auth); router.replace('/(auth)/login'); } }
    ]);
  };

  const finishWorkout = async () => {
    if (seconds < 100) return Alert.alert("Muito rápido!", "Treine um pouco mais para ganhar XP.");
    setIsTraining(false);
    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, {
        xp: increment(150),
        moedas: increment(30)
      });
      setSeconds(0);
      Alert.alert("Missão Cumprida!", "Você ganhou 150 XP e 30 Moedas!");
    } finally { setSaving(false); }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  const xpLimite = 1000;
  const porcentagemXP = Math.min((userData?.xp || 0) / xpLimite * 100, 100);

  const handleFirstUpdate = async () => {
    if (!peso || !altura) {
      return Alert.alert("Erro", "Por favor, preencha peso e altura.");
    }

    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, {
        peso: parseFloat(peso),
        altura: parseFloat(altura)
      });
      setShowWelcome(false);
      setPeso('');
      setAltura('');
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowDrawer(true)}>
            <Ionicons name="menu" size={28} color="#FFD700" />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.welcomeText}>Bem-vindo, guerreiro</ThemedText>
            <ThemedText type="title" style={styles.userName}>{userData?.username || 'Usuário'}</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.coinContainer}>
              <Ionicons name="flash" size={16} color="#FFD700" />
              <ThemedText style={styles.coinText}>{userData?.moedas || 0}</ThemedText>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* PROGRESS CARD */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <ThemedText style={styles.levelLabel}>NÍVEL {userData?.level || 1}</ThemedText>
            <ThemedText style={styles.xpLabel}>{userData?.xp || 0} / {xpLimite} XP</ThemedText>
          </View>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${porcentagemXP}%` }]} />
          </View>
        </View>

        {/* STATUS GRID */}
        <View style={styles.statusGrid}>
          <View style={styles.statBox}>
            <Ionicons name="speedometer-outline" size={22} color="#FFD700" />
            <ThemedText style={styles.statValue}>{userData?.peso || '--'} kg</ThemedText>
            <ThemedText style={styles.statLabel}>Peso</ThemedText>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="resize-outline" size={22} color="#FFD700" />
            <ThemedText style={styles.statValue}>{userData?.altura || '--'} m</ThemedText>
            <ThemedText style={styles.statLabel}>Altura</ThemedText>
          </View>
        </View>

        {/* WORKOUT SECTION */}
        <ThemedText style={styles.sectionTitle}>Atividade</ThemedText>
        {!isTraining ? (
          <TouchableOpacity style={styles.workoutAction} onPress={() => setIsTraining(true)}>
            <View style={styles.workoutTextContainer}>
              <ThemedText style={styles.workoutTitle}>Treino de Hoje</ThemedText>
              <ThemedText style={styles.workoutSub}>Inicie para ganhar XP</ThemedText>
            </View>
            <View style={styles.playCircle}>
              <Ionicons name="play" size={24} color="#020617" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.workoutAction, styles.activeWorkout]}>
            <View style={styles.workoutTextContainer}>
              <ThemedText style={[styles.workoutTitle, { color: '#FFD700' }]}>{formatTime(seconds)}</ThemedText>
              <ThemedText style={{ color: '#94a3b8' }}>Em movimento...</ThemedText>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={finishWorkout}>
              <Ionicons name="stop" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* AI SPACE (Placeholder para o Gemini) */}
        <TouchableOpacity
          style={[styles.aiCard, loadingIA && { opacity: 0.7 }]}
          onPress={handleAiConsult}
          disabled={loadingIA}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <Ionicons name="sparkles" size={20} color="#FFD700" />
              <ThemedText style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 12 }}>
                PERSONAL TRAINER IA
              </ThemedText>
            </View>

            {loadingIA ? (
              <ActivityIndicator color="#FFD700" style={{ marginVertical: 10 }} />
            ) : (
              <ThemedText style={styles.aiText}>
                {aiResponse || "Toque aqui para gerar o seu treino personalizado do dia com base nos seus dados!"}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL DE BOAS-VINDAS */}
      <Modal visible={showWelcome} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="trophy" size={50} color="#FFD700" />
            <ThemedText style={styles.modalTitle}>Configuração Inicial</ThemedText>
            <View style={styles.modalInputArea}>
              <TextInput style={styles.modalInput} placeholder="Peso (kg)" placeholderTextColor="#64748b" keyboardType="numeric" onChangeText={setPeso} />
              <TextInput style={styles.modalInput} placeholder="Altura (m)" placeholderTextColor="#64748b" keyboardType="numeric" onChangeText={setAltura} />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleFirstUpdate}>
              <ThemedText style={styles.saveButtonText}>COMEÇAR JORNADA 🚀</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menu Drawer */}
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#072018' }, // Fundo Obsidian
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40 // Espaço extra no final para não "cortar" o último card
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  welcomeText: { color: '#64748b', fontSize: 12 },
  userName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  coinContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 },
  coinText: { color: '#FFD700', fontWeight: 'bold' },
  logoutBtn: { padding: 8, backgroundColor: '#1e293b', borderRadius: 12 },

  levelCard: { backgroundColor: '#0f172a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  levelLabel: { color: '#FFD700', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  xpLabel: { color: '#64748b', fontSize: 12 },
  xpBarBackground: { height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#FFD700' },

  statusGrid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statBox: { flex: 1, backgroundColor: '#0f172a', padding: 15, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  statLabel: { color: '#64748b', fontSize: 11 },

  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  workoutAction: { backgroundColor: '#FFD700', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' },
  activeWorkout: { backgroundColor: '#0f172a', borderWidth: 2, borderColor: '#FFD700' },
  workoutTextContainer: { flex: 1 },
  workoutTitle: { color: '#020617', fontSize: 18, fontWeight: 'bold' },
  workoutSub: { color: '#020617', opacity: 0.6, fontSize: 12 },
  playCircle: { backgroundColor: '#020617', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  stopButton: { backgroundColor: '#ff4444', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  aiCard: {
    marginTop: 20,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FFD700',
    // Adicione isso para garantir que o toque seja registrado:
    minHeight: 80,
    zIndex: 10
  },
  aiText: { color: '#94a3b8', fontSize: 13, flex: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#0f172a', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginVertical: 15 },
  modalInputArea: { width: '100%', gap: 12, marginBottom: 20 },
  modalInput: { backgroundColor: '#020617', color: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  saveButton: { backgroundColor: '#FFD700', padding: 18, borderRadius: 15, width: '100%', alignItems: 'center' },
  saveButtonText: { fontWeight: 'bold' }
});