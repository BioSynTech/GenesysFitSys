import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { useState, useEffect } from 'react';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DrawerMenu } from '@/components/drawer-menu';

const SHOP_ITEMS = [
  { id: '1', name: 'Poção de XP', price: 500, icon: 'flask', desc: 'Consuma para ganhar +200 XP instantâneo', type: 'xp' },
  { id: '2', name: 'Cartão de Rank', price: 1200, icon: 'card', desc: 'Destaque seu status na comunidade', type: 'cosmetic' },
  { id: '3', name: 'Escudo de Streak', price: 300, icon: 'shield-checkmark', desc: 'Protege sua ofensiva por 1 dia', type: 'buff' },
];

export default function ShopScreen() {
  const [moedas, setMoedas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
        setMoedas(snapshot.data()?.moedas || 0);
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

  const processarCompra = async (item: any) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);

    try {
      // 1. Deduz as moedas
      const updateData: any = {
        moedas: increment(-item.price)
      };

      // 2. Aplica o efeito do item baseado no tipo
      if (item.type === 'xp') {
        updateData.xp = increment(200);
      }

      await updateDoc(userRef, updateData);
      
      Alert.alert("Sucesso!", `Você adquiriu ${item.name}! ${item.type === 'xp' ? '+200 XP adicionados.' : ''}`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível processar a compra.");
    }
  };

  const handleBuy = (item: any) => {
    if (moedas < item.price) {
      Alert.alert("Saldo Insuficiente", "Você precisa de mais moedas. Continue treinando duro!");
      return;
    }

    Alert.alert(
      "Confirmar Compra",
      `Deseja gastar ${item.price} moedas em ${item.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Comprar", onPress: () => processarCompra(item) }
      ]
    );
  };

  if (loading) return <ThemedView style={styles.loading}><ActivityIndicator color="#FFD700" /></ThemedView>;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1e293b', dark: '#020617' }}
      headerImage={
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.menuIcon}>
            <Ionicons name="menu" size={38} color="#FFD700" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="cart" size={100} color="#FFD700" />
            <ThemedText style={styles.headerTitle}>MERCADO GENESYS</ThemedText>
          </View>
        </View>
      }>

      <ThemedView style={styles.content}>
        <View style={styles.balanceContainer}>
          <ThemedText style={styles.balanceLabel}>Seu Tesouro:</ThemedText>
          <View style={styles.coinBadge}>
            <Ionicons name="flash" size={20} color="#FFD700" />
            <ThemedText style={styles.coinText}>{moedas}</ThemedText>
          </View>
        </View>

        {SHOP_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.itemCard, moedas < item.price && styles.itemCardDisabled]}
            onPress={() => handleBuy(item)}
          >
            <View style={styles.iconBox}>
              <Ionicons name={item.icon as any} size={30} color="#FFD700" />
            </View>
            <View style={styles.itemInfo}>
              <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              <ThemedText style={styles.itemDesc}>{item.desc}</ThemedText>
            </View>
            <View style={[styles.priceTag, moedas < item.price && styles.priceTagDisabled]}>
              <ThemedText style={styles.priceText}>{item.price}</ThemedText>
              <Ionicons name="flash" size={12} color="#020617" />
            </View>
          </TouchableOpacity>
        ))}
        
        <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  headerContainer: {
    height: '100%',
    backgroundColor: '#020617',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  menuIcon: { zIndex: 10, position: 'absolute', top: 50, left: 20 },
  headerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 5,
  },
  content: { padding: 20, backgroundColor: '#020617', minHeight: 600 },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  balanceLabel: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coinText: { color: '#FFD700', fontSize: 24, fontWeight: 'bold' },
  
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 18,
    borderRadius: 22,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  itemCardDisabled: { opacity: 0.6, borderColor: '#0f172a' },
  iconBox: {
    width: 65,
    height: 65,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  itemDesc: { color: '#64748b', fontSize: 12, marginTop: 4, lineHeight: 16 },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  priceTagDisabled: { backgroundColor: '#475569' },
  priceText: { color: '#020617', fontWeight: 'bold', fontSize: 15 },
});