import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, onSnapshot, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Colors } from "../../constants/colors";
import { DrawerMenu } from "../../components/drawer-menu";

export default function PontoScreen() {
  const auth = getAuth();
  const db = getFirestore();
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        setUserData(snapshot.data());
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const baterPonto = async () => {
    if (!auth.currentUser || !userData) return;

    const hoje = new Date().toISOString().split('T')[0];
    const ultimaData = userData.lastWorkoutDate;

    // 1. Verificar se já bateu ponto hoje
    if (ultimaData === hoje) {
      Alert.alert("Missão Concluída", "Você já registrou seu treino de hoje, Guerreiro! Volte amanhã.");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      // 2. Atualizar Streak, XP e Moedas
      await updateDoc(userRef, {
        streak: increment(1),
        xp: increment(100),
        moedas: increment(50),
        lastWorkoutDate: hoje,
        lastUpdated: serverTimestamp()
      });

      Alert.alert("🔥 OFENSIVA AUMENTOU!", "Você ganhou +100 XP e +50 Moedas!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao acessar o Sistema Genesys.");
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.gold} /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
        <Ionicons name="menu" size={38} color={Colors.gold} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Ionicons name="calendar-outline" size={80} color={Colors.gold} />
        <Text style={styles.title}>REGISTRO DE PRESENÇA</Text>
        
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={40} color="#FF4500" />
          <Text style={styles.streakNumber}>{userData?.streak || 0}</Text>
          <Text style={styles.streakLabel}>DIAS SEGUIDOS</Text>
        </View>

        <Text style={styles.infoText}>
          Bata o ponto diariamente para manter sua ofensiva e ganhar recompensas do Sistema.
        </Text>

        <TouchableOpacity style={styles.mainButton} onPress={baterPonto}>
          <Text style={styles.buttonText}>BATER PONTO AGORA</Text>
        </TouchableOpacity>

        <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
                <Ionicons name="sparkles" size={18} color={Colors.gold} />
                <Text style={styles.rewardText}>+100 XP</Text>
            </View>
            <View style={styles.rewardItem}>
                <Ionicons name="flash" size={18} color={Colors.gold} />
                <Text style={styles.rewardText}>+50 Moedas</Text>
            </View>
        </View>
      </View>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, padding: 20 },
  loading: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center' },
  menuButton: { marginTop: 40 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  title: { color: Colors.gold, fontSize: 22, fontWeight: "900", letterSpacing: 2, marginVertical: 20 },
  
  streakCard: { 
    backgroundColor: '#1a1a1a', 
    padding: 30, 
    borderRadius: 25, 
    alignItems: 'center', 
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 30
  },
  streakNumber: { color: '#fff', fontSize: 60, fontWeight: 'bold' },
  streakLabel: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },

  infoText: { color: '#999', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  
  mainButton: { 
    backgroundColor: Colors.gold, 
    width: '100%', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  buttonText: { color: Colors.charcoal, fontWeight: "900", fontSize: 18 },

  rewardsRow: { flexDirection: 'row', gap: 20, marginTop: 25 },
  rewardItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rewardText: { color: Colors.gold, fontWeight: 'bold', fontSize: 14 }
});