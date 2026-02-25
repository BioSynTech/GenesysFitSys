import React, { useState, useMemo, useEffect } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
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
  { nome: "Whey Protein", calorias: 120 },
];

export default function DietaScreen() {
  const auth = getAuth();
  const db = getFirestore();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consumido, setConsumido] = useState(0);
  const [busca, setBusca] = useState("");
  const [quantidade, setQuantidade] = useState("100");
  const [showDrawer, setShowDrawer] = useState(false);

  // 1. Monitorar dados do usuário no Firebase
  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        setUserData(snapshot.data());
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  // 2. Filtragem de busca (Memo)
  const resultado = useMemo(() => {
    if (!busca) return [];
    return alimentosBase.filter((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca]);

  const metaKcal = userData?.metaCalorica || 2000;
  const porcentagem = Math.min(100, Math.round((consumido / metaKcal) * 100));

  // 3. Adicionar alimento e ganhar XP
  const adicionarConsumo = async (alimento: { nome: string; calorias: number }) => {
    const qtd = Number(quantidade) || 0;
    const kcal = (alimento.calorias * qtd) / 100;
    
    setConsumido(prev => prev + kcal);

    // Salvar progresso de XP no Firebase por se alimentar
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        xp: increment(5), // Ganha 5 de XP por registrar alimento
      });
    }

    if (consumido + kcal > metaKcal) {
      Alert.alert("Limite Atingido", "⚠️ Você ultrapassou sua meta! Cuidado com o Rank!");
    }
  };

  // 4. Atualizar Meta no Firebase
  const atualizarMetaFirebase = async (valor: string) => {
    const novaMeta = Number(valor);
    if (novaMeta > 0 && auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { metaCalorica: novaMeta });
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.gold} /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
        <Ionicons name="menu" size={38} color={Colors.gold} />
      </TouchableOpacity>

      <Text style={styles.title}>🥗 DIETA & NUTRIÇÃO</Text>
      
      {/* Header Gamificado */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{userData?.username?.charAt(0).toUpperCase() || "U"}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.userName}>{userData?.username || "Guerreiro"}</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{userData?.rank || "Aprendiz"}</Text>
          </View>
        </View>
        <View style={styles.xpBox}>
          <Text style={styles.xpValue}>{userData?.xp || 0}</Text>
          <Text style={styles.xpLabel}>XP TOTAL</Text>
        </View>
      </View>

      {/* Painel de Calorias */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Meta Diária</Text>
          <Text style={styles.statValue}>{metaKcal} <Text style={styles.unit}>kcal</Text></Text>
        </View>
        <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#333' }]}>
          <Text style={styles.statLabel}>Consumido</Text>
          <Text style={[styles.statValue, { color: consumido > metaKcal ? '#ff4444' : Colors.gold }]}>
            {consumido.toFixed(0)} <Text style={styles.unit}>kcal</Text>
          </Text>
        </View>
      </View>

      {/* Barra de Progresso Estilizada */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill, 
            { width: `${porcentagem}%`, backgroundColor: consumido > metaKcal ? '#ff4444' : Colors.gold }
          ]} />
        </View>
        <Text style={styles.progressText}>{porcentagem}% da meta atingida</Text>
      </View>

      {/* Controles de Busca */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.inputMeta}
          placeholder="Alterar Meta Diária"
          keyboardType="numeric"
          onSubmitEditing={(e) => atualizarMetaFirebase(e.nativeEvent.text)}
          placeholderTextColor="#666"
        />
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Buscar alimento..."
            value={busca}
            onChangeText={setBusca}
            placeholderTextColor="#666"
          />
          <TextInput
            style={[styles.input, { flex: 1, textAlign: 'center' }]}
            placeholder="Gramas"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
        </View>
      </View>
      
      <FlatList
        data={resultado}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardText}>{item.nome}</Text>
              <Text style={styles.cardCalories}>{item.calorias} kcal / 100g</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => adicionarConsumo(item)}>
              <Ionicons name="add" size={24} color={Colors.charcoal} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={busca.length > 0 ? <Text style={styles.emptyText}>Nenhum alimento na base...</Text> : null}
      />

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, padding: 20, paddingTop: 50 },
  loading: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center' },
  menuButton: { marginBottom: 20 },
  title: { color: Colors.gold, fontSize: 24, fontWeight: "900", textAlign: "center", letterSpacing: 2, marginBottom: 20 },
  
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: Colors.charcoal, fontSize: 22, fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rankBadge: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  rankBadgeText: { color: Colors.gold, fontSize: 10, fontWeight: 'bold' },
  xpBox: { alignItems: 'center', paddingLeft: 15, borderLeftWidth: 1, borderLeftColor: '#333' },
  xpValue: { color: Colors.gold, fontSize: 20, fontWeight: 'bold' },
  xpLabel: { color: '#666', fontSize: 8, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 15, padding: 20, marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#666', fontSize: 11, marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  unit: { fontSize: 12, color: '#666' },

  progressContainer: { marginBottom: 30 },
  progressBar: { height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressText: { color: '#666', fontSize: 11, marginTop: 8, textAlign: 'center' },

  inputSection: { marginBottom: 20 },
  inputMeta: { backgroundColor: '#111', padding: 12, borderRadius: 10, color: '#fff', fontSize: 12, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  searchRow: { flexDirection: 'row', gap: 10 },
  input: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, color: '#fff', borderWidth: 1, borderColor: '#333' },
  
  card: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 15, marginVertical: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderLeftWidth: 4, borderLeftColor: Colors.gold },
  cardText: { color: '#fff', fontWeight: "bold", fontSize: 16 },
  cardCalories: { color: Colors.gold, fontSize: 12, marginTop: 4 },
  addButton: { backgroundColor: Colors.gold, width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 }
});