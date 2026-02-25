import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Colors } from "../../constants/colors";
import { DrawerMenu } from "../../components/drawer-menu";

const RANK_SYSTEM = [
  { min: 1, max: 5, name: "Aprendiz" },
  { min: 6, max: 10, name: "Rank E" },
  { min: 11, max: 20, name: "Rank D" },
  { min: 21, max: 35, name: "Rank C" },
  { min: 36, max: 45, name: "Rank B" },
  { min: 46, max: 55, name: "Rank A" },
  { min: 56, max: 70, name: "Rank S" },
  { min: 71, max: 85, name: "Rank S Internacional" },
  { min: 86, max: 100, name: "Monarca" },
];

const BIOTIPOS_DATA = [
    { id: 'Ectomorfo', desc: 'Dificuldade em ganhar peso/massa.' },
    { id: 'Mesomorfo', desc: 'Facilidade em ganhar massa/perder gordura.' },
    { id: 'Endomorfo', desc: 'Tendência a acumular gordura.' }
];

export default function StatusScreen() {
  const auth = getAuth();
  const db = getFirestore();
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  
  // Modais
  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalTreino, setModalTreino] = useState<any>(null); // Armazena o treino selecionado

  // Estados de Edição
  const [novoPeso, setNovoPeso] = useState('');
  const [novaAltura, setNovaAltura] = useState('');
  const [novoBiotipo, setNovoBiotipo] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        const data = snapshot.data();
        setUserData(data);
        setNovoPeso(data?.peso?.toString() || '');
        setNovaAltura(data?.altura?.toString() || '');
        setNovoBiotipo(data?.biotipo || '');
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const xpNecessario = useMemo(() => (userData?.level || 1) * 1000, [userData?.level]);
  const porcentagemXp = Math.min(100, Math.round(((userData?.xp || 0) / xpNecessario) * 100));
  
  const rankAtual = useMemo(() => {
    const nivel = userData?.level || 1;
    return RANK_SYSTEM.find(r => nivel >= r.min && nivel <= r.max)?.name || 'Monarca';
  }, [userData?.level]);

  const atualizarPerfil = async () => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userRef, {
        peso: parseFloat(novoPeso),
        altura: parseFloat(novaAltura),
        biotipo: novoBiotipo
    });
    setModalPerfil(false);
    Alert.alert("Sistema", "Dados biométricos atualizados.");
  };

  const uparAtributo = async (atributo: string) => {
    if (userData?.pontos > 0) {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, { [atributo]: increment(1), pontos: increment(-1) });
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.gold} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.charcoal }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setShowDrawer(true)}>
                <Ionicons name="menu" size={32} color={Colors.gold} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalPerfil(true)} style={styles.settingsBtn}>
                <Ionicons name="settings-outline" size={24} color={Colors.gold} />
                <Text style={styles.settingsText}>EDITAR STATUS</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.title}>JANELA DE STATUS</Text>

        {/* Hunter ID Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{userData?.username?.charAt(0).toUpperCase() || "G"}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.userName}>{userData?.username?.toUpperCase()}</Text>
            <Text style={styles.biotipoText}>{userData?.biotipo || 'Não definido'}</Text>
            <View style={styles.rankBadge}>
               <Text style={styles.rankBadgeText}>{rankAtual}</Text>
            </View>
          </View>
          <View style={styles.pointsDisplay}>
            <Text style={styles.pointsValue}>{userData?.pontos || 0}</Text>
            <Text style={styles.pointsLabel}>PONTOS</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
            <View style={styles.xpRow}>
                <Text style={styles.xpText}>NÍVEL {userData?.level || 1}</Text>
                <Text style={styles.xpText}>{userData?.xp || 0} / {xpNecessario} XP</Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressFill, { width: `${porcentagemXp}%` }]} />
            </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionHeader}>▣ ATRIBUTOS DO JOGADOR</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'FORÇA', val: userData?.forca || 1, key: 'forca', icon: 'fitness' },
            { label: 'AGILIDADE', val: userData?.resistencia || 1, key: 'resistencia', icon: 'speedometer' },
            { label: 'INTELIGÊNCIA', val: userData?.inteligencia || 1, key: 'inteligencia', icon: 'flash' }
          ].map((stat, idx) => (
            <View key={idx} style={styles.statBox}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.val}</Text>
              <TouchableOpacity 
                style={[styles.plusButton, { opacity: (userData?.pontos || 0) > 0 ? 1 : 0.2 }]} 
                onPress={() => uparAtributo(stat.key)}
              >
                <Ionicons name="caret-up" size={18} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Rotinas Salvas - Visual Bonito */}
        <Text style={styles.sectionHeader}>▣ GRIMÓRIO DE MISSÕES (TREINOS)</Text>
        {userData?.rotinasPersonalizadas?.length > 0 ? (
            userData.rotinasPersonalizadas.map((treino: any) => (
                <TouchableOpacity 
                    key={treino.id} 
                    style={styles.treinoCard}
                    onPress={() => setModalTreino(treino)}
                >
                    <View style={styles.treinoIconArea}>
                        <Ionicons name="document-text" size={24} color={Colors.gold} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.treinoTitle}>{treino.nome.toUpperCase()}</Text>
                        <Text style={styles.treinoSub}>{treino.exercicios.length} Exercícios registrados</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#333" />
                </TouchableOpacity>
            ))
        ) : (
            <Text style={styles.emptyText}>Nenhum registro encontrado no Grimório.</Text>
        )}

      </ScrollView>

      {/* MODAL EDITAR PERFIL/BIOTIPO */}
      <Modal visible={modalPerfil} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>REDEFINIR DADOS</Text>
                
                <View style={styles.inputRow}>
                    <View style={{flex: 1}}>
                        <Text style={styles.inputLabel}>PESO (KG)</Text>
                        <TextInput style={styles.input} value={novoPeso} onChangeText={setNovoPeso} keyboardType="numeric" />
                    </View>
                    <View style={{flex: 1, marginLeft: 10}}>
                        <Text style={styles.inputLabel}>ALTURA (M)</Text>
                        <TextInput style={styles.input} value={novaAltura} onChangeText={setNovaAltura} keyboardType="numeric" />
                    </View>
                </View>

                <Text style={styles.inputLabel}>SELECIONAR BIOTIPO</Text>
                {BIOTIPOS_DATA.map(b => (
                    <TouchableOpacity 
                        key={b.id} 
                        style={[styles.bioOption, novoBiotipo === b.id && styles.bioOptionActive]}
                        onPress={() => setNovoBiotipo(b.id)}
                    >
                        <Text style={[styles.bioTitle, novoBiotipo === b.id && {color: Colors.charcoal}]}>{b.id}</Text>
                        <Text style={[styles.bioDesc, novoBiotipo === b.id && {color: Colors.charcoal}]}>{b.desc}</Text>
                    </TouchableOpacity>
                ))}

                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setModalPerfil(false)}><Text style={{color: '#666'}}>CANCELAR</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={atualizarPerfil}>
                        <Text style={styles.saveBtnText}>ATUALIZAR STATUS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* MODAL VISUALIZAR TREINO */}
      <Modal visible={!!modalTreino} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.treinoModal}>
                <View style={styles.treinoModalHeader}>
                    <Text style={styles.treinoModalTitle}>{modalTreino?.nome.toUpperCase()}</Text>
                    <TouchableOpacity onPress={() => setModalTreino(null)}>
                        <Ionicons name="close" size={24} color={Colors.gold} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{marginTop: 20}}>
                    {modalTreino?.exercicios.map((ex: string, i: number) => (
                        <View key={i} style={styles.exItem}>
                            <Text style={styles.exNumber}>{i + 1}</Text>
                            <Text style={styles.exText}>{ex}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
      </Modal>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loading: { flex: 1, backgroundColor: Colors.charcoal, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  settingsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1a1a1a', padding: 10, borderRadius: 12 },
  settingsText: { color: Colors.gold, fontSize: 10, fontWeight: 'bold' },
  
  title: { color: Colors.gold, fontSize: 22, fontWeight: "900", textAlign: "center", letterSpacing: 3, marginBottom: 25 },
  
  userCard: { flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 65, height: 65, borderRadius: 32, backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center', borderColor: '#fff' },
  avatarLetter: { fontSize: 30, fontWeight: 'bold', color: Colors.charcoal },
  userName: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  biotipoText: { color: Colors.gold, fontSize: 12, opacity: 0.8 },
  rankBadge: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 5, alignSelf: 'flex-start', marginTop: 8, borderWidth: 1, borderColor: Colors.gold },
  rankBadgeText: { color: Colors.gold, fontSize: 10, fontWeight: 'bold' },
  pointsDisplay: { alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#333', paddingLeft: 15 },
  pointsValue: { color: Colors.gold, fontSize: 28, fontWeight: 'bold' },
  pointsLabel: { color: '#666', fontSize: 8, fontWeight: 'bold' },

  xpSection: { marginBottom: 30 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpText: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#1a1a1a', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.gold },

  sectionHeader: { color: Colors.gold, fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15, marginTop: 10 },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { width: '31%', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statLabel: { color: '#666', fontSize: 8, fontWeight: 'bold' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  plusButton: { backgroundColor: Colors.gold, width: '100%', padding: 5, borderRadius: 8, alignItems: 'center' },

  treinoCard: { flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  treinoIconArea: { backgroundColor: '#222', padding: 10, borderRadius: 12 },
  treinoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
  treinoSub: { color: '#666', fontSize: 11, marginTop: 2 },
  emptyText: { color: '#444', textAlign: 'center', fontStyle: 'italic', marginTop: 10 },

  // Estilos Modais
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a1a1a', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: Colors.gold },
  modalTitle: { color: Colors.gold, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
  inputLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#000', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  bioOption: { backgroundColor: '#222', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  bioOptionActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  bioTitle: { color: Colors.gold, fontWeight: 'bold' },
  bioDesc: { color: '#666', fontSize: 11, marginTop: 4 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  saveBtn: { backgroundColor: Colors.gold, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { color: Colors.charcoal, fontWeight: 'bold' },

  treinoModal: { backgroundColor: '#111', padding: 25, borderRadius: 30, maxHeight: '80%', borderWidth: 1, borderColor: Colors.gold },
  treinoModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 15 },
  treinoModalTitle: { color: Colors.gold, fontSize: 18, fontWeight: 'bold' },
  exItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#1a1a1a', padding: 15, borderRadius: 15 },
  exNumber: { color: Colors.gold, fontWeight: 'bold', marginRight: 15, fontSize: 18 },
  exText: { color: '#eee', fontSize: 16 }
});