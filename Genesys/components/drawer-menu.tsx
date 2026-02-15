import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from './themed-text';
import { getAuth, signOut } from 'firebase/auth';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const auth = getAuth();

  const menuItems = [
    { label: 'Home', icon: 'home-outline', route: '/(tabs)' },
    { label: 'Explorar', icon: 'compass-outline', route: '/(tabs)/explore' },
    { label: 'Configurações', icon: 'settings-outline', route: null },
  ];

  const handleLogout = () => {
    signOut(auth);
    router.replace('/(auth)/login');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.container}>
        {/* Overlay para fechar ao clicar fora */}
        <TouchableOpacity style={styles.overlay} onPress={onClose} />

        {/* Menu Drawer */}
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <ThemedText style={styles.drawerTitle}>Menu</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route as any);
                  }
                  onClose();
                }}
              >
                <Ionicons name={item.icon as any} size={20} color="#FFD700" />
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ff4444" />
            <ThemedText style={[styles.menuLabel, { color: '#ff4444' }]}>Sair</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: '75%',
    backgroundColor: '#0f172a',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
    paddingTop: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  menuLabel: {
    fontSize: 16,
    color: '#fff',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    marginTop: 'auto',
  },
});
