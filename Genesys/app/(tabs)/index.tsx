import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, TextInput, TouchableOpacity, View, 
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  // @ts-ignore
  getReactNativePersistence 
} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Google Login Nativo
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

WebBrowser.maybeCompleteAuthSession();

const firebaseConfig = {
  apiKey: "AIzaSyAC-uFM4pwfXDuKxGvsFM3Z7v7oF0BC3U4",
  authDomain: "biosyntech-8ffe1.firebaseapp.com",
  projectId: "biosyntech-8ffe1",
  storageBucket: "biosyntech-8ffe1.firebasestorage.app",
  messagingSenderId: "642421745104",
  appId: "1:642421745104:web:ef5298a181d4a178f145d5"
};

// Inicialização "Blindada" contra erros de módulo e re-inicialização
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Configuração do Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "642421745104-dumta3ri29l1spsj7ikrlqfuqu922m2k.apps.googleusercontent.com", // Você pega isso no console do Google Cloud
    iosClientId: "731720654700-vossos-ids.apps.googleusercontent.com",
    webClientId: "642421745104-5b5lhva0c32t6rfl72elovp71ojcl432.apps.googleusercontent.com",
  },{
    useProxy: true, // Importante para funcionar no Expo Go
  }
);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .catch(err => Alert.alert("Erro Google", err.message))
        .finally(() => setLoading(false));
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/(tabs)'); 
    });
    return unsubscribe;
  }, []);

  const handleAuth = async () => {
    if (!email || !password) return Alert.alert("Atenção", "Preencha tudo!");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== confirmPassword) throw new Error("Senhas não batem");
        const userCr = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCr.user, { displayName: username });
      }
    } catch (error: any) {
      Alert.alert("Erro GenesysFit", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.container}>
          
          <View style={styles.header}>
            <Ionicons name="fitness" size={70} color="#FFD700" />
            <ThemedText type="title" style={styles.mainTitle}>GenesysFitSys</ThemedText>
            <ThemedText style={styles.subtitle}>Sua evolução começa aqui.</ThemedText>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity style={[styles.tabBtn, isLogin && styles.activeTabBtn]} onPress={() => setIsLogin(true)}>
              <ThemedText style={styles.activeText}>LOGIN</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, !isLogin && styles.activeTabBtn]} onPress={() => setIsLogin(false)}>
              <ThemedText style={styles.activeText}>CRIAR CONTA</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.inputArea}>
            {!isLogin && (
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={20} color="#D4AF37" />
                <TextInput placeholder="Nome" style={styles.inputField} value={username} onChangeText={setUsername} />
              </View>
            )}
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#D4AF37" />
              <TextInput placeholder="E-mail" style={styles.inputField} autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#D4AF37" />
              <TextInput placeholder="Senha" style={styles.inputField} secureTextEntry value={password} onChangeText={setPassword} />
            </View>
            {!isLogin && (
              <View style={styles.inputBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#D4AF37" />
                <TextInput placeholder="Confirmar" style={styles.inputField} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
              </View>
            )}

            <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={loading}>
              {loading ? <ActivityIndicator color="#D4AF37" /> : <ThemedText style={styles.buttonLabel}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</ThemedText>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={() => promptAsync()} 
              disabled={!request || loading}
            >
              <Ionicons name="logo-google" size={20} color="#ea4335" />
              <ThemedText style={styles.googleButtonLabel}>Entrar com Google</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.legDayAlert}>
             <ThemedText style={styles.legDayText}>🔥 PULO LEG DAY 😡</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, backgroundColor: '#13966ecb', padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 35 },
  mainTitle: { fontSize: 34, fontWeight: '900', color: '#FFD700', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#fff', opacity: 0.8 },
  tabBar: { flexDirection: 'row', marginBottom: 25, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#fff' },
  activeText: { fontWeight: 'bold', color: '#D4AF37' },
  inputArea: { gap: 12 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 15, height: 60, backgroundColor: '#fff' },
  inputField: { flex: 1, marginLeft: 12, fontSize: 16 },
  mainButton: { backgroundColor: '#fff', height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  buttonLabel: { color: '#D4AF37', fontWeight: 'bold', fontSize: 16 },
  googleButton: { flexDirection: 'row', backgroundColor: '#fff', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleButtonLabel: { color: '#555', fontWeight: '600' },
  legDayAlert: { marginTop: 40, alignSelf: 'center', backgroundColor: '#d00000', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 50 },
  legDayText: { color: '#fff', fontWeight: 'bold', fontSize: 11 }
});