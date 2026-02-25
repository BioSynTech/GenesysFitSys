import React, { useState, useMemo, useEffect } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Colors } from "../../constants/colors";
import { DrawerMenu } from "../../components/drawer-menu";

const alimentosBase = [
  { nome: "Arroz", calorias: 130 },
  { nome: "Feijão", calorias: 90 },
  { nome: "Frango", calorias: 165 },
  { nome: "Batata", calorias: 77 },
  { nome: "Ovo", calorias: 155 },
  { nome: "Pão Integral", calorias: 250 },
  { nome: "Banana", calorias: 89 },
];

export default function PesquisaScreen() {
  const auth = getAuth();
  const db = getFirestore();
  
  const [busca, setBusca] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  
  // Controle local para evitar spam de cliques antes do Firebase atualizar
  const [kcalAdicionadasHoje, setKcalAdicionadasHoje] = useState(0);
  const LIMITE_DIARIO_XP = 200; // Limite de 200 kcal para ganhar XP

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        setUserData(data);
        // Supondo que você tenha um campo 'farmDiario' no Firebase que reseta todo dia
        setKcalAdicionadasHoje(data?.farmDiario || 0);
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const resultado = useMemo(() => {
    return alimentosBase.filter((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca]);

  const handleAdicionar = async (item: any) => {
    if (!auth.currentUser) return;

    // Verificação de Limite (Anti-Farm)
    if (kcalAdicionadasHoje >= LIMITE_DIARIO_XP) {
      Alert.alert(
        "Limite Atingido", 
        "Você já atingiu o limite de 200 kcal de identificação por hoje. Você pode continuar pesquisando, mas não ganhará mais XP até amanhã."
      );
      return;
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    
    try {
      await updateDoc(userRef, {
        xp: increment(10), // XP por identificar o item
        farmDiario: increment(item.calorias) // Registra quanto ele "farmou" hoje
      });
      
      Alert.alert("Sucesso", `+10 XP! Você identificou ${item.nome}.`);
    } catch (error) {
      console.log("Erro ao salvar XP:", error);
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.gold} /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
        <Ionicons name="menu" size={38} color={Colors.gold} />
      </TouchableOpacity>

      <Text style={styles.title}>🔎 ENCICLOPÉDIA</Text>
      
      {/* Barra de Farm Diário */}
      <View style={styles.farmContainer}>
        <View style={styles.farmInfo}>
            <Text style={styles.farmLabel}>Bônus de Identificação Diária</Text>
            <Text style={styles.farmValue}>{kcalAdicionadasHoje} / {LIMITE_DIARIO_XP} kcal</Text>
        </View>
        <View style={styles.farmBarBg}>
            <View style={[styles.farmBarFill, { width: `${Math.min(100, (kcalAdicionadasHoje/LIMITE_DIARIO_XP)*100)}%` }]} />
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={{ marginLeft: 10 }} />
        <TextInput
          style={styles.input}
          placeholder="Pesquisar item..."
          value={busca}
          onChangeText={setBusca}
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={resultado}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => {
          const isLimitReached = kcalAdicionadasHoje >= LIMITE_DIARIO_XP;
          return (
            <TouchableOpacity 
              style={[styles.card, isLimitReached && { borderColor: '#444', opacity: 0.8 }]} 
              onPress={() => handleAdicionar(item)}
            >
              <View>
                <Text style={[styles.cardText, isLimitReached && { color: '#888' }]}>{item.nome}</Text>
                <Text style={styles.cardInfo}>Valor Energético: {item.calorias} kcal</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Ionicons 
                    name={isLimitReached ? "lock-closed" : "add-circle"} 
                    size={24} 
                    color={isLimitReached ? "#444" : Colors.gold} 
                />
                {!isLimitReached && <Text style={styles.xpBonus}>+10 XP</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, padding: 20, paddingTop: 50 },
  loading: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center' },
  menuButton: { marginBottom: 15 },
  title: { color: Colors.gold, fontSize: 22, fontWeight: "900", textAlign: "center", letterSpacing: 1.5, marginBottom: 20 },
  
  // Estilo da barra de Farm
  farmContainer: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  farmInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  farmLabel: { color: '#888', fontSize: 10, fontWeight: 'bold' },
  farmValue: { color: Colors.gold, fontSize: 10, fontWeight: 'bold' },
  farmBarBg: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden' },
  farmBarFill: { height: '100%', backgroundColor: Colors.gold },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  input: { flex: 1, padding: 15, color: '#fff' },
  
  card: { 
    backgroundColor: '#1a1a1a', 
    padding: 18, 
    borderRadius: 15, 
    marginVertical: 6, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#222'
  },
  cardText: { color: '#fff', fontWeight: "bold", fontSize: 17 },
  cardInfo: { color: '#666', fontSize: 12, marginTop: 2 },
  xpBonus: { color: Colors.gold, fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  cardCalories: { color: Colors.gold, fontWeight: 'bold', fontSize: 16 }
});