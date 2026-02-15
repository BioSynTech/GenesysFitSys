import { StyleSheet, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from 'react';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DrawerMenu } from '@/components/drawer-menu';

// Itens fictícios da loja
const SHOP_ITEMS = [
  { id: '1', name: 'Poção de XP', price: 500, icon: 'flask', desc: 'Ganha +200 XP instantâneo' },
  { id: '2', name: 'Cartão de Rank', price: 1200, icon: 'card', desc: 'Muda a cor do seu nome para Ouro' },
  { id: '3', name: 'Escudo de Streak', price: 300, icon: 'shield-checkmark', desc: 'Protege sua ofensiva por 1 dia' },
];


export default function ShopScreen() {
  const [moedas, setMoedas] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
        setMoedas(doc.data()?.moedas || 0);
      });
      return () => unsub();
    }
  }, []);

  const handleBuy = (item: any) => {
    if (moedas < item.price) {
      Alert.alert("Saldo Insuficiente", "Treine mais para conseguir moedas!");
    } else {
      Alert.alert("Confirmar Compra", `Deseja gastar ${item.price} moedas em ${item.name}?`);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1e293b', dark: '#020617' }}
      headerImage={
        
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => setShowDrawer(true)}>
            <Ionicons name="menu" size={28} color="#FFD700" />
          </TouchableOpacity>
          <Ionicons name="cart" size={120} color="#FFD700" />
          <ThemedText style={styles.headerTitle}>MERCADO GENESYS</ThemedText>
        </View>
      }>

      <ThemedView style={styles.content}>
        <View style={styles.balanceContainer}>
          <ThemedText style={styles.balanceLabel}>Seu Saldo:</ThemedText>
          <View style={styles.coinBadge}>
            <Ionicons name="flash" size={18} color="#FFD700" />
            <ThemedText style={styles.coinText}>{moedas}</ThemedText>
          </View>
        </View>

        {SHOP_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.itemCard}
            onPress={() => handleBuy(item)}
          >
            <View style={styles.iconBox}>
              <Ionicons name={item.icon as any} size={30} color="#FFD700" />
            </View>
            <View style={styles.itemInfo}>
              <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              <ThemedText style={styles.itemDesc}>{item.desc}</ThemedText>
            </View>
            <View style={styles.priceTag}>
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
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#020617',
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 10,
  },
  content: { padding: 20, backgroundColor: '#020617', flex: 1 },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  balanceLabel: { color: '#94a3b8', fontSize: 16 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  coinText: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#1e293b',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  itemDesc: { color: '#64748b', fontSize: 12, marginTop: 2 },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 3,
  },
  priceText: { color: '#020617', fontWeight: 'bold', fontSize: 14 },
});