import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { DrawerMenu } from '@/components/drawer-menu'; // Importação do Menu
import { Colors } from '../../constants/colors';

// Tipagem para silenciar os erros do TypeScript
interface UserRanking {
  id: string;
  username?: string;
  rank?: string;
  xp: number;
  streak?: number;
}

export default function LeaderboardScreen() {
  const [topUsers, setTopUsers] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false); // Estado do Menu
  const db = getFirestore();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as UserRanking[];
      
      setTopUsers(users);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const renderMedal = (index: number) => {
    if (index === 0) return <Ionicons name="trophy" size={26} color="#FFD700" />;
    if (index === 1) return <Ionicons name="trophy" size={26} color="#C0C0C0" />;
    if (index === 2) return <Ionicons name="trophy" size={26} color="#CD7F32" />;
    return <ThemedText style={styles.rankNumber}>{index + 1}</ThemedText>;
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botão do Menu Lateral */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setShowDrawer(true)}>
        <Ionicons name="menu" size={38} color="#FFD700" />
      </TouchableOpacity>

      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>LIGA DOS MONARCAS</ThemedText>
        <ThemedText style={styles.headerSub}>Os 10 guerreiros mais poderosos</ThemedText>
      </View>

      <FlatList
        data={topUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <View style={[styles.userCard, index < 3 && styles.topThreeCard]}>
            <View style={styles.rankSection}>
              {renderMedal(index)}
            </View>
            
            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>{item.username || "Guerreiro"}</ThemedText>
              <ThemedText style={styles.userRankBadge}>{item.rank || "Rank E"}</ThemedText>
            </View>

            <View style={styles.statsSection}>
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={16} color="#FF4500" />
                <ThemedText style={styles.streakText}>{item.streak || 0}</ThemedText>
              </View>
              <ThemedText style={styles.xpText}>{item.xp} XP</ThemedText>
            </View>
          </View>
        )}
      />

      {/* Componente do Menu */}
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor:Colors.charcoal, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  menuButton: { marginTop: 50, marginBottom: 10, alignSelf: 'flex-start' },
  
  header: { alignItems: 'center', marginBottom: 25 },
  headerTitle: { color: '#FFD700', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  headerSub: { color: '#64748b', fontSize: 12, marginTop: 4 },

  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0f172a', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  topThreeCard: {
    borderColor: '#FFD700',
    backgroundColor: '#1e293b',
    elevation: 5,
    shadowColor: '#FFD700',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  rankSection: { width: 45, alignItems: 'center' },
  rankNumber: { color: '#475569', fontWeight: '900', fontSize: 18 },
  
  userInfo: { flex: 1, marginLeft: 10 },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userRankBadge: { color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  
  statsSection: { alignItems: 'flex-end' },
  streakContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  streakText: { color: '#FF4500', fontWeight: 'bold', fontSize: 14 },
  xpText: { color: '#FFD700', fontSize: 12, fontWeight: '800' }
});