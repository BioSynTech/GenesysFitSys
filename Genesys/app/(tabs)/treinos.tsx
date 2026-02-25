import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Modal, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { DrawerMenu } from "../../components/drawer-menu";
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const { width } = Dimensions.get('window');

const exerciciosDisponiveis: Record<string, string[]> = {
  Peito: ["Supino Barra", "Supino Halter", "Crucifixo", "Cross Over", "Flexão"],
  Braços: ["Rosca Direta", "Rosca Martelo", "Tríceps Corda", "Tríceps Testa", "Rosca Scott"],
  Pernas: ["Agachamento", "Leg Press", "Extensora", "Flexora", "Afundo"],
  Costas: ["Puxada Frente", "Remada Baixa", "Remada Unilateral", "Barra Fixa", "Levantamento Terra"],
  Ombros: ["Desenvolvimento Halter", "Elevação Lateral", "Elevação Frontal", "Face Pull"],
};

export default function TreinosScreen() {
  const auth = getAuth();
  const db = getFirestore();
  const [userData, setUserData] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  
  const [modalCriar, setModalCriar] = useState(false);
  const [modalView, setModalView] = useState<any>(null);
  const [nomeRotina, setNomeRotina] = useState("");
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState<string[]>([]);
  const [grupoAtivo, setGrupoAtivo] = useState("Peito");

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        setUserData(snapshot.data());
      });
      return () => unsub();
    }
  }, []);

  const getTreinoRank = (count: number) => {
    if (count <= 3) return { label: 'RANK E', color: '#cbd5e1' }; // Cinza claro
    if (count <= 5) return { label: 'RANK C', color: '#60a5fa' }; // Azul claro
    if (count <= 7) return { label: 'RANK A', color: '#f87171' }; // Vermelho claro
    return { label: 'RANK S', color: Colors.gold };
  };

  const toggleExercicio = (ex: string) => {
    setExerciciosSelecionados(prev => 
      prev.includes(ex) ? prev.filter(item => item !== ex) : [...prev, ex]
    );
  };

  const salvarRotina = async () => {
    if (!nomeRotina || exerciciosSelecionados.length === 0) {
      return Alert.alert("Aviso", "Preencha o nome e selecione os exercícios.");
    }
    try {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      const novaRotina = {
        id: Date.now().toString(),
        nome: nomeRotina,
        exercicios: exerciciosSelecionados,
        criadoEm: new Date().toISOString()
      };
      await updateDoc(userRef, { rotinasPersonalizadas: arrayUnion(novaRotina) });
      setModalCriar(false);
      setNomeRotina("");
      setExerciciosSelecionados([]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao sincronizar.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
        <Ionicons name="menu" size={36} color={Colors.gold} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>GRIMÓRIO DE MISSÕES</Text>
            <View style={styles.titleUnderline} />
        </View>

        {/* REGISTROS ATIVOS */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>REGISTROS ATIVOS</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalCriar(true)}>
                <Ionicons name="add" size={24} color={Colors.gold} />
                <Text style={styles.addBtnText}>CRIAR</Text>
            </TouchableOpacity>
        </View>

        {userData?.rotinasPersonalizadas?.length > 0 ? (
            userData.rotinasPersonalizadas.map((rotina: any) => {
                const rank = getTreinoRank(rotina.exercicios.length);
                return (
                    <TouchableOpacity 
                        key={rotina.id} 
                        style={[styles.rotinaCard, { borderLeftColor: rank.color }]}
                        onPress={() => setModalView(rotina)}
                    >
                        <View style={styles.rotinaMainInfo}>
                            <Text style={[styles.rankText, { color: rank.color }]}>{rank.label}</Text>
                            <Text style={styles.rotinaNome}>{rotina.nome.toUpperCase()}</Text>
                            <Text style={styles.rotinaExCount}>{rotina.exercicios.length} EXERCÍCIOS</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#555" />
                    </TouchableOpacity>
                );
            })
        ) : (
            <Text style={styles.emptyText}>Nenhuma missão registrada...</Text>
        )}

        <View style={styles.divider} />

        {/* BIBLIOTECA */}
        <Text style={styles.sectionTitle}>BIBLIOTECA DO SISTEMA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
            {Object.keys(exerciciosDisponiveis).map(grupo => (
                <TouchableOpacity 
                    key={grupo} 
                    onPress={() => setGrupoAtivo(grupo)}
                    style={[styles.tabItem, grupoAtivo === grupo && styles.tabItemActive]}
                >
                    <Text style={[styles.tabText, grupoAtivo === grupo && styles.tabTextActive]}>{grupo.toUpperCase()}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
        
        <View style={styles.libList}>
            {exerciciosDisponiveis[grupoAtivo].map((ex, i) => (
                <View key={ex} style={styles.libItem}>
                    <Text style={styles.libIndex}>{i+1}</Text>
                    <Text style={styles.libText}>{ex}</Text>
                </View>
            ))}
        </View>
      </ScrollView>

      {/* MODAL DE VISUALIZAÇÃO - FONTE GRANDE E CLARA */}
      <Modal visible={!!modalView} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.viewModalContent}>
                <View style={styles.viewModalHeader}>
                    <View style={{flex: 1}}>
                        <Text style={styles.viewModalSub}>DADOS DA MISSÃO</Text>
                        <Text style={styles.viewModalTitle}>{modalView?.nome.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setModalView(null)} style={styles.closeBtn}>
                        <Ionicons name="close-outline" size={35} color={Colors.gold} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.viewExList} showsVerticalScrollIndicator={false}>
                    {modalView?.exercicios.map((ex: string, index: number) => (
                        <View key={index} style={styles.viewExItem}>
                            <View style={styles.viewExBadge}>
                                <Text style={styles.viewExBadgeText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.viewExText}>{ex}</Text>
                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity style={styles.startWorkoutBtn} onPress={() => setModalView(null)}>
                    <Text style={styles.startWorkoutText}>INICIAR AGORA</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* MODAL CRIAR */}
      <Modal visible={modalCriar} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>NOVA CONFIGURAÇÃO</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="NOME DA MISSÃO"
                    placeholderTextColor="#666"
                    value={nomeRotina}
                    onChangeText={setNomeRotina}
                />
                <View style={styles.selectionArea}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {Object.entries(exerciciosDisponiveis).map(([grupo, lista]) => (
                            <View key={grupo} style={{marginBottom: 20}}>
                                <Text style={styles.grupoLabel}>{grupo}</Text>
                                <View style={styles.chipContainer}>
                                    {lista.map(ex => (
                                        <TouchableOpacity 
                                            key={ex} 
                                            onPress={() => toggleExercicio(ex)}
                                            style={[styles.chip, exerciciosSelecionados.includes(ex) && styles.chipActive]}
                                        >
                                            <Text style={[styles.chipText, exerciciosSelecionados.includes(ex) && styles.chipTextActive]}>{ex}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalCriar(false)}>
                        <Text style={styles.cancelBtnText}>CANCELAR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={salvarRotina}>
                        <Text style={styles.saveBtnText}>SALVAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.charcoal, paddingHorizontal: 20 },
  menuButton: { marginTop: 50, marginBottom: 10 },
  headerTitleContainer: { alignItems: 'center', marginBottom: 30 },
  title: { color: Colors.gold, fontSize: 22, fontWeight: "900", letterSpacing: 2 },
  titleUnderline: { height: 3, width: 60, backgroundColor: Colors.gold, marginTop: 5 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: Colors.gold, fontSize: 14, fontWeight: '900', letterSpacing: 1, opacity: 0.9 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1a1a1a', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: Colors.gold },
  addBtnText: { color: Colors.gold, fontWeight: 'bold', fontSize: 13 },

  rotinaCard: { backgroundColor: '#111', borderRadius: 12, padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#222', borderLeftWidth: 6 },
  rotinaMainInfo: { flex: 1 },
  rankText: { fontSize: 12, fontWeight: '900', marginBottom: 4 },
  rotinaNome: { color: '#FFF', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.5 },
  rotinaExCount: { color: '#888', fontSize: 13, fontWeight: '600', marginTop: 4 },

  emptyText: { color: '#555', textAlign: 'center', marginTop: 20, fontSize: 16 },
  divider: { height: 5, backgroundColor: '#e3a300', marginVertical: 30 },

  tabBar: { marginBottom: 20 },
  tabItem: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 10, borderRadius: 8, backgroundColor: '#111', borderWidth: 1, borderColor: '#333' },
  tabItemActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  tabTextActive: { color: Colors.charcoal },

  libList: { backgroundColor: '#000', borderRadius: 12, padding: 10 },
  libItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#111', paddingHorizontal: 15 },
  libIndex: { color: Colors.gold, fontSize: 14, fontWeight: 'bold', marginRight: 20 },
  libText: { color: '#CCC', fontSize: 16, fontWeight: '500' },

  // --- MODAL VISUALIZAÇÃO (MELHORADO) ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  viewModalContent: { backgroundColor: '#0a0a0a', borderRadius: 25, padding: 25, width: '92%', maxHeight: '85%', borderWidth: 1.5, borderColor: Colors.gold },
  viewModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 20 },
  viewModalSub: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  viewModalTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', marginTop: 5 },
  closeBtn: { padding: 5 },

  viewExList: { marginVertical: 20 },
  viewExItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', padding: 20, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  viewExBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  viewExBadgeText: { color: Colors.charcoal, fontSize: 16, fontWeight: 'bold' },
  viewExText: { color: '#EEE', fontSize: 19, flex: 1, fontWeight: '600' },

  startWorkoutBtn: { backgroundColor: Colors.gold, padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  startWorkoutText: { color: Colors.charcoal, fontWeight: '900', fontSize: 18, letterSpacing: 1 },

  // --- MODAL CRIAR ---
  modalContent: { backgroundColor: '#0a0a0a', borderRadius: 25, padding: 25, width: '92%', maxHeight: '80%', borderWidth: 1, borderColor: Colors.gold },
  modalTitle: { color: Colors.gold, fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#111', color: '#FFF', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#333', fontSize: 16, fontWeight: 'bold' },
  selectionArea: { height: 380, marginVertical: 20 },
  grupoLabel: { color: Colors.gold, fontSize: 13, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { color: '#AAA', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: Colors.charcoal },
  modalFooter: { flexDirection: 'row', gap: 15 },
  cancelBtn: { flex: 1, padding: 18, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontWeight: 'bold', fontSize: 15 },
  saveBtn: { flex: 2, backgroundColor: Colors.gold, padding: 18, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: Colors.charcoal, fontWeight: 'bold', fontSize: 16 }
});