import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { DrawerMenu } from '../../components/drawer-menu';
import { Colors } from '../../constants/colors';

export default function ConfigScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [autoSync, setAutoSync] = useState(true);
    const [showDrawer, setShowDrawer] = useState(false);
    
    const auth = getAuth();

    const handleLogout = () => {
        Alert.alert("Sair", "Deseja encerrar sua sessão no Sistema?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", onPress: () => signOut(auth), style: "destructive" }
        ]);
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowDrawer(true)}>
                        <Ionicons name="menu" size={38} color={Colors.gold} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
                    <View style={{ width: 32 }} /> 
                </View>

                {/* Seção: Interface */}
                <Text style={styles.sectionHeader}>INTERFACE DO SISTEMA</Text>
                <View style={styles.card}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLabel}>
                            <Ionicons name="moon" size={20} color={Colors.gold} />
                            <Text style={styles.settingText}>Modo Escuro (Sempre Ativo)</Text>
                        </View>
                        <Switch 
                            value={darkMode} 
                            trackColor={{ false: "#333", true: Colors.gold }}
                            thumbColor={"#fff"}
                            onValueChange={setDarkMode} 
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLabel}>
                            <Ionicons name="notifications" size={20} color={Colors.gold} />
                            <Text style={styles.settingText}>Notificações de Missão</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            trackColor={{ false: "#333", true: Colors.gold }}
                            thumbColor={"#fff"}
                            onValueChange={setNotificationsEnabled}
                        />
                    </View>
                </View>

                {/* Seção: Dados */}
                <Text style={styles.sectionHeader}>SINCRONIZAÇÃO</Text>
                <View style={styles.card}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLabel}>
                            <Ionicons name="cloud-upload" size={20} color={Colors.gold} />
                            <Text style={styles.settingText}>Auto-Sincronizar XP</Text>
                        </View>
                        <Switch 
                            value={autoSync} 
                            trackColor={{ false: "#333", true: Colors.gold }}
                            thumbColor={"#fff"}
                            onValueChange={setAutoSync} 
                        />
                    </View>
                </View>

                {/* Ações da Conta */}
                <Text style={styles.sectionHeader}>CONTA DO JOGADOR</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out" size={20} color="#ff4444" />
                    <Text style={styles.logoutText}>Encerrar Sessão</Text>
                </TouchableOpacity>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>GenesysFit v1.0.4 - SDK 54</Text>
                </View>
            </ScrollView>

            <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: Colors.charcoal },
    container: { flex: 1, padding: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30
    },
    headerTitle: {
        color: Colors.gold,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2
    },
    sectionHeader: {
        color: '#666',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 5,
        letterSpacing: 1
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#333'
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#252525'
    },
    settingLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    settingText: {
        fontSize: 15,
        color: '#fff',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#421a1a'
    },
    logoutText: {
        color: '#ff4444',
        fontWeight: 'bold',
        fontSize: 16
    },
    versionContainer: {
        marginTop: 40,
        alignItems: 'center'
    },
    versionText: {
        color: '#444',
        fontSize: 12
    }
});