import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from './themed-text';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import iconSet from '@expo/vector-icons/build/Fontisto';


const { width } = Dimensions.get('window');

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const [userData, setUserData] = useState<any>(null);
  const [slideAnim] = React.useState(new Animated.Value(-300));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsub = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
          setUserData(snapshot.data());
        });
        return unsub;
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    { label: 'Início', icon: 'home', route: '/(tabs)', emoji: '🏠' },
    { label: 'Treinos', icon: 'dumbbell', route: '/(tabs)/treinos', emoji: '🏋️' },
    { label: 'Ranking', icon: 'trophy', route: '/(tabs)/Ranking', emoji: '👑' },
    { label: 'Cronômetro', icon: 'timer', route: '/(tabs)/cronometro', emoji: '⏱️' },
    { label: 'Dieta', icon: 'nutrition', route: '/(tabs)/dieta', emoji: '🥗' },
    { label: 'Pesquisa', icon: 'search', route: '/(tabs)/pesquisa', emoji: '🔍' },
    { label: 'Explorar', icon: 'compass', route: '/(tabs)/explore', emoji: '🗺️' },
    { label: 'Ponto', icon: 'location', route: '/(tabs)/ponto', emoji: '📍' },
    { label: 'Perfil', icon: 'trophy', route: '/(tabs)/gamificacao', emoji: '👤' },
    { label: 'Configurações', icon: 'settings', route: '/(tabs)/config', emoji: '⚙️' },
  ];

  const handleLogout = () => {
    signOut(auth);
    onClose();
    router.replace('/(auth)/login');
  };

  const handleNavigation = (route: string) => {
    router.push(route as any);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="none" transparent={true}>
      <View style={styles.container}>
        {/* Overlay para fechar ao clicar fora */}
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={onClose}
          activeOpacity={1}
        />

        {/* Menu Drawer */}
        <Animated.View style={[styles.drawer, { left: slideAnim }]}>
          {/* Header com Usuário */}
          <View style={styles.drawerHeader}>
            <View style={styles.userContainer}>
              <View style={styles.avatarCircle}>
                <ThemedText style={styles.avatarText}>
                  {userData?.username?.charAt(0).toUpperCase() || 'U'}
                </ThemedText>
              </View>
              <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>
                  {userData?.username || 'Usuário'}
                </ThemedText>
                <ThemedText style={styles.userRank}>
                  {userData?.rank || 'Novato'} • Nível {userData?.level || 1}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={32} color="#FFD700" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            {/* Seção de Navegação */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>NAVEGAÇÃO</ThemedText>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>
                  </View>
                  <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Seção de Informações */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>INFORMAÇÕES</ThemedText>
              <View style={styles.infoBox}>
                <View style={styles.infoItem}>
                  <Ionicons name="sparkles" size={18} color="#FFD700" />
                  <View>
                    <ThemedText style={styles.infoLabel}>XP</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {userData?.xp || 0} / 1000
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                  <Ionicons name="flash" size={18} color="#FFD700" />
                  <View>
                    <ThemedText style={styles.infoLabel}>Moedas</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {userData?.moedas || 0}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Botão de Sair */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity 
              style={styles.logoutItem} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out" size={20} color="#ff6b6b" />
              <ThemedText style={styles.logoutLabel}>Sair</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  drawer: {
    width: '80%',
    backgroundColor: '#0f172a',
    borderRightWidth: 2,
    borderRightColor: '#FFD700',
    paddingTop: -10,
    flexDirection: 'column',
  },
  
  /* HEADER COM USUÁRIO */
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRank: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 2,
  },

  /* CONTEÚDO SCROLL */
  scrollContent: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    bottom: 23,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 1,
    paddingHorizontal: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  /* ITEM MENU */
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    marginHorizontal: 8,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  menuLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },

  /* INFO BOX */
  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
    marginTop: 2,
  },

  /* LOGOUT */
  logoutContainer: {
    borderTopWidth: 2,
    borderTopColor: '#1e293b',
    paddingHorizontal: 12,
    bottom: 23,
    paddingVertical: 12,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  logoutLabel: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
  },
});
