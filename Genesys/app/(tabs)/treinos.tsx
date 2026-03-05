import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Modal, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { DrawerMenu } from "../../components/drawer-menu";
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Image } from "react-native"; // Certifique-se de importar Image
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const { width } = Dimensions.get('window');

const exerciciosDisponiveis: Record<string, string[]> = {
    Peito: ["Supino Barra", "Supino Halter", "Supino Inclinado", "Crucifixo", "Cross Over", "Flexão", "Peck Deck"],
    Costas: ["Puxada Frente", "Remada Baixa", "Remada Unilateral", "Barra Fixa", "Levantamento Terra", "Pull Down", "Remada Curvada"],
    Pernas: ["Agachamento", "Leg Press", "Extensora", "Flexora", "Afundo", "Stiff", "Cadeira Abdutora", "Panturrilha em Pé"],
    Gluteos: ["Hip Thrust", "Elevação de Quadril", "Abdução de Quadril", "Glute Bridge", "Kickback", "Agachamento Búlgaro"],
    Ombros: ["Desenvolvimento Halter", "Elevação Lateral", "Elevação Frontal", "Face Pull", "Desenvolvimento Arnold", "Encolhimento"],
    Biceps: ["Rosca Direta", "Rosca Martelo", "Rosca Scott", "Rosca Concentrada", "Rosca Inversa"],
    Triceps: ["Tríceps Corda", "Tríceps Testa", "Tríceps Pulley", "Mergulho Banco", "Tríceps Francês"],
    Abdomen: ["Abdominal Supra", "Abdominal Infra", "Plancha", "Russian Twist", "Elevação de Pernas"],
};

// Interface para estruturar o exercício com os novos dados
interface Exercicio {
    nome: string;
    series: number;
    reps: number;
}

export default function TreinosScreen() {
    SplashScreen.preventAutoHideAsync();

    export default function TreinosScreen() {
        // 1. CARREGAMENTO DA FONTE
        const [fontsLoaded, fontError] = useFonts({
            'Grimorio-Main': require('../../assets/fonts/SuaFonte.ttf'), // Nomeie como quiser
            'Grimorio-Bold': require('../../assets/fonts/SuaFonte-Bold.ttf'),
        });
        const auth = getAuth();
        const db = getFirestore();
        const [userData, setUserData] = useState<any>(null);
        const [showDrawer, setShowDrawer] = useState(false);

        const [modalCriar, setModalCriar] = useState(false);
        const [modalView, setModalView] = useState<any>(null);
        const [nomeRotina, setNomeRotina] = useState("");

        // Agora guardamos objetos em vez de apenas strings
        const [exerciciosSelecionados, setExerciciosSelecionados] = useState<Exercicio[]>([]);
        const [grupoAtivo, setGrupoAtivo] = useState("Peito");

        useEffect(() => {
            if (fontsLoaded || fontError) {
                SplashScreen.hideAsync();
            }
        }, [fontsLoaded, fontError]);

        useEffect(() => {
            if (auth.currentUser) {
                const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
                    setUserData(snapshot.data());
                });
                return () => unsub();
            }
        }, []);

        // Se as fontes não carregarem, não renderiza nada (evita erro)
        if (!fontsLoaded && !fontError) {
            return null;
        }


        useEffect(() => {
            if (auth.currentUser) {
                const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
                    setUserData(snapshot.data());
                });
                return () => unsub();
            }
        }, []);


        const imagensExercicios: Record<string, string> = {
            // peito:
            "Supino Barra": "https://grandeatleta.com.br/blog/wp-content/uploads/2025/08/supino-inclinado-com-barra-como-fazer.gif",
            "Supino Halter": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-reto-com-halteres.gif",
            "Peck Deck": "https://i.pinimg.com/originals/a2/12/cd/a212cde8804175ee82be3abe83ca51e3.gif",
            // biceps
            "Rosca Direta": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmN4eXoxbm93bmZid2R4eHh4eHh4eHh4eHh4eHh4eHh4eHh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCBhbmRfaWQ9MA/3o7TKMGpxx8y93NAdq/giphy.gif",
            // gluteos
            "Hip Thrust": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif",
            //costas

            // pernas

            // ombros

            // triceps
                            
            // abdomen

            // Adicione uma URL para cada exercício da sua lista...
        };

        const deletarRotina = (rotina: any) => {
            Alert.alert(
                "EXTERMINAR REGISTRO",
                `Tem certeza que deseja apagar a missão "${rotina.nome.toUpperCase()}"? Esta ação não pode ser desfeita.`,
                [
                    { text: "ABORTAR", style: "cancel" },
                    {
                        text: "CONFIRMAR",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const userRef = doc(db, "users", auth.currentUser!.uid);
                                await updateDoc(userRef, {
                                    rotinasPersonalizadas: arrayRemove(rotina)
                                });
                            } catch (error) {
                                Alert.alert("Erro", "Falha ao deletar do Grimório.");
                            }
                        }
                    }
                ]
            );
        };


        const getTreinoRank = (count: number) => {
            if (count <= 3) return { label: 'RANK E', color: '#cbd5e1' };
            if (count <= 5) return { label: 'RANK C', color: '#60a5fa' };
            if (count <= 7) return { label: 'RANK A', color: '#f87171' };
            return { label: 'RANK S', color: Colors.gold };
        };

        const toggleExercicio = (nomeEx: string) => {
            setExerciciosSelecionados(prev => {
                const existe = prev.find(item => item.nome === nomeEx);
                if (existe) {
                    return prev.filter(item => item.nome !== nomeEx);
                } else {
                    // Valor padrão ao selecionar: 3 séries de 12 repetições
                    return [...prev, { nome: nomeEx, series: 3, reps: 12 }];
                }
            });
        };

        // Função para aumentar/diminuir séries ou repetições
        const ajustarValor = (nome: string, campo: 'series' | 'reps', delta: number) => {
            setExerciciosSelecionados(prev => prev.map(ex => {
                if (ex.nome === nome) {
                    const novoValor = Math.max(1, ex[campo] + delta);
                    return { ...ex, [campo]: novoValor };
                }
                return ex;
            }));
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
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>REGISTROS ATIVOS</Text>
                        <TouchableOpacity style={styles.addBtn} onPress={() => setModalCriar(true)}>
                            <Ionicons name="add" size={24} color={Colors.gold} />
                            <Text style={styles.addBtnText}>CRIAR</Text>
                        </TouchableOpacity>
                    </View>
                    {userData?.rotinasPersonalizadas?.map((rotina: any) => {
                        const rank = getTreinoRank(rotina.exercicios.length);
                        return (
                            <TouchableOpacity
                                key={rotina.id}
                                style={[styles.rotinaCard, { borderLeftColor: rank.color }]}
                                onPress={() => setModalView(rotina)}
                                onLongPress={() => deletarRotina(rotina)} // Deletar ao segurar
                            >
                                <View style={styles.rotinaMainInfo}>
                                    <Text style={[styles.rankText, { color: rank.color }]}>{rank.label}</Text>
                                    <Text style={styles.rotinaNome}>{rotina.nome.toUpperCase()}</Text>
                                    <Text style={styles.rotinaExCount}>{rotina.exercicios.length} OBJETIVOS</Text>
                                </View>

                                {/* BOTÃO DE EXCLUIR DIRETO NO CARD */}
                                <TouchableOpacity
                                    style={styles.deleteIconButton}
                                    onPress={() => deletarRotina(rotina)}
                                >
                                    <Ionicons name="trash-outline" size={22} color="#ff4444" />
                                </TouchableOpacity>

                                <Ionicons name="chevron-forward" size={24} color="#555" />
                            </TouchableOpacity>
                        );
                    })}
                    <View style={styles.divider} />

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
                            <View key={ex} style={styles.libItemContainer}>
                                <View style={styles.libItem}>
                                    <Text style={styles.libIndex}>{i + 1}</Text>
                                    <Text style={styles.libText}>{ex}</Text>
                                </View>

                                {/* IMAGEM DE EXEMPLO */}
                                <Image
                                    source={{ uri: imagensExercicios[ex] || imagensExercicios["Padrão"] }}
                                    style={styles.exercisePreview}
                                    resizeMode="cover"
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* MODAL DE VISUALIZAÇÃO COM SÉRIES E REPS */}
                <Modal visible={!!modalView} animationType="fade" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.viewModalContent}>
                            <View style={styles.viewModalHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.viewModalSub}>DADOS DA MISSÃO</Text>
                                    <Text style={styles.viewModalTitle}>{modalView?.nome.toUpperCase()}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setModalView(null)}>
                                    <Ionicons name="close-outline" size={35} color={Colors.gold} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.viewExList} showsVerticalScrollIndicator={false}>
                                {modalView?.exercicios.map((ex: Exercicio, index: number) => (
                                    <View key={index} style={styles.viewExItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.viewExText}>{ex.nome}</Text>
                                            <Text style={styles.viewExStats}>{ex.series} Séries  •  {ex.reps} Repetições</Text>
                                        </View>
                                        <View style={styles.viewExBadge}>
                                            <Text style={styles.viewExBadgeText}>{ex.series}x{ex.reps}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                            <TouchableOpacity style={styles.startWorkoutBtn} onPress={() => setModalView(null)}>
                                <Text style={styles.startWorkoutText}>FECHAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* MODAL CRIAR COM SELETOR DE SÉRIES/REPS */}
                <Modal visible={modalCriar} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>NOVA MISSÃO</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="NOME DO TREINO"
                                placeholderTextColor="#666"
                                value={nomeRotina}
                                onChangeText={setNomeRotina}
                            />

                            <ScrollView style={{ marginVertical: 15 }} showsVerticalScrollIndicator={false}>
                                <Text style={styles.grupoLabel}>ESCOLHA OS EXERCÍCIOS</Text>

                                {/* AQUI ESTÁ A MUDANÇA: Mapeando as categorias separadamente */}
                                {Object.entries(exerciciosDisponiveis).map(([categoria, lista]) => (
                                    <View key={categoria} style={{ marginBottom: 20 }}>
                                        {/* Título do Grupo Muscular */}
                                        <Text style={{
                                            color: Colors.gold,
                                            fontSize: 12,
                                            fontWeight: '900',
                                            marginBottom: 10,
                                            letterSpacing: 1,
                                            opacity: 0.7
                                        }}>
                                            {categoria.toUpperCase()}
                                        </Text>

                                        <View style={styles.chipContainer}>
                                            {lista.map(ex => {
                                                const selecionado = exerciciosSelecionados.find(s => s.nome === ex);
                                                return (
                                                    <TouchableOpacity
                                                        key={ex}
                                                        onPress={() => toggleExercicio(ex)}
                                                        style={[styles.chip, selecionado && styles.chipActive]}
                                                    >
                                                        <Text style={[styles.chipText, selecionado && styles.chipTextActive]}>{ex}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                ))}

                                {/* CONFIGURAÇÃO DE SÉRIES/REPS */}
                                {exerciciosSelecionados.length > 0 && (
                                    <>
                                        <View style={{ height: 1, backgroundColor: '#333', marginVertical: 20 }} />
                                        <Text style={[styles.grupoLabel, { color: Colors.gold }]}>CONFIGURAR SÉRIES/REPS</Text>
                                        {exerciciosSelecionados.map((ex) => (
                                            <View key={ex.nome} style={styles.editCard}>
                                                <Text style={styles.editCardTitle}>{ex.nome}</Text>
                                                <View style={styles.editRow}>
                                                    <View style={styles.counterGroup}>
                                                        <Text style={styles.counterLabel}>SETS</Text>
                                                        <View style={styles.counterActions}>
                                                            <TouchableOpacity onPress={() => ajustarValor(ex.nome, 'series', -1)}>
                                                                <Ionicons name="remove-circle" size={28} color="#444" />
                                                            </TouchableOpacity>
                                                            <Text style={styles.counterValue}>{ex.series}</Text>
                                                            <TouchableOpacity onPress={() => ajustarValor(ex.nome, 'series', 1)}>
                                                                <Ionicons name="add-circle" size={28} color={Colors.gold} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                    <View style={styles.counterGroup}>
                                                        <Text style={styles.counterLabel}>REPS</Text>
                                                        <View style={styles.counterActions}>
                                                            <TouchableOpacity onPress={() => ajustarValor(ex.nome, 'reps', -1)}>
                                                                <Ionicons name="remove-circle" size={28} color="#444" />
                                                            </TouchableOpacity>
                                                            <Text style={styles.counterValue}>{ex.reps}</Text>
                                                            <TouchableOpacity onPress={() => ajustarValor(ex.nome, 'reps', 1)}>
                                                                <Ionicons name="add-circle" size={28} color={Colors.gold} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </ScrollView>

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

        divider: { height: 1, backgroundColor: '#222', marginVertical: 30 },

        tabBar: { marginBottom: 20 },
        tabItem: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 10, borderRadius: 8, backgroundColor: '#111', borderWidth: 1, borderColor: '#333' },
        tabItemActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
        tabText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
        tabTextActive: { color: Colors.charcoal },

        libList: { backgroundColor: '#000', borderRadius: 12, padding: 10 },
        libIndex: { color: Colors.gold, fontSize: 14, fontWeight: 'bold', marginRight: 20 },
        libText: { color: '#CCC', fontSize: 16, fontWeight: '500' },
        libItemContainer: {
            backgroundColor: '#111',
            borderRadius: 15,
            marginBottom: 15,
            overflow: 'hidden', // Para a imagem respeitar o border da caixa
            borderWidth: 1,
            borderColor: '#222'
        },
        libItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15
        },
        exercisePreview: { width: 'auto', height: 430, backgroundColor: '#000', },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
        viewModalContent: { backgroundColor: '#0a0a0a', borderRadius: 25, padding: 25, width: '94%', maxHeight: '85%', borderWidth: 1.5, borderColor: Colors.gold },
        viewModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 20 },
        viewModalSub: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
        viewModalTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', marginTop: 5 },
        viewExList: { marginVertical: 20 },
        viewExItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', padding: 20, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
        viewExText: { color: '#EEE', fontSize: 20, fontWeight: '700' },
        viewExStats: { color: Colors.gold, fontSize: 14, fontWeight: 'bold', marginTop: 5 },
        viewExBadge: { backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.gold },
        viewExBadgeText: { color: Colors.gold, fontSize: 14, fontWeight: '900' },
        startWorkoutBtn: { backgroundColor: Colors.gold, padding: 20, borderRadius: 12, alignItems: 'center' },
        startWorkoutText: { color: Colors.charcoal, fontWeight: '900', fontSize: 18 },
        deleteIconButton: {
            padding: 10,
            marginRight: 10,
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            borderRadius: 10,
        },
        modalContent: { backgroundColor: '#0a0a0a', borderRadius: 25, padding: 25, width: '96%', maxHeight: '90%', borderWidth: 1, borderColor: Colors.gold },
        modalTitle: { color: Colors.gold, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
        input: { backgroundColor: '#111', color: '#FFF', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#333', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
        grupoLabel: { color: Colors.gold, fontSize: 13, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 },
        chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        chip: { backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
        chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
        chipText: { color: '#888', fontSize: 12, fontWeight: '600' },
        chipTextActive: { color: Colors.charcoal },

        // Novos estilos para os cards de edição
        editCard: { backgroundColor: '#111', padding: 15, borderRadius: 15, marginTop: 10, borderWidth: 1, borderColor: '#222' },
        editCardTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
        editRow: { flexDirection: 'row', justifyContent: 'space-between' },
        counterGroup: { alignItems: 'center', flex: 1 },
        counterLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
        counterActions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
        counterValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },

        modalFooter: { flexDirection: 'row', gap: 15, marginTop: 20 },
        cancelBtn: { flex: 1, padding: 18, alignItems: 'center' },
        cancelBtnText: { color: '#888', fontWeight: 'bold', fontSize: 16 },
        saveBtn: { flex: 2, backgroundColor: Colors.gold, padding: 18, borderRadius: 12, alignItems: 'center' },
        saveBtnText: { color: Colors.charcoal, fontWeight: 'bold', fontSize: 18 }
    });