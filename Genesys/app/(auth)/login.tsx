import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, 
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "../../constants/colors";
// Firebase Engine
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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

// Google Login
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
  appId: "1:642421745104:web:ef5298a181d4a178f145d5",
  measurementId: "G-XV52RYJVY3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
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

  // 1. MONITOR DE ESTADO
  // Removido redirecionamento automático ao iniciar o app.
  // Agora navegamos para as abas somente após login/cadastro bem-sucedido.

  // 2. CONFIGURAÇÃO GOOGLE
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "642421745104-dumta3ri29l1spsj7ikrlqfuqu922m2k.apps.googleusercontent.com",
    webClientId: "642421745104-5b5lhva0c32t6rfl72elovp71ojcl432.apps.googleusercontent.com",
  });

useEffect(() => {
  if (response?.type === 'success' && response.authentication) {
    // O segredo está em usar o idToken para criar a credencial do Firebase
    const { idToken } = response.authentication; 

    if (idToken) {
      setLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);
      
      signInWithCredential(auth, credential)
        .then(() => {
          router.replace('/(tabs)');
        })
        .catch((error) => {
          console.error("Erro detalhado:", error.code, error.message);
          Alert.alert("Erro de Credencial", "O Firebase não aceitou o token. Verifique o WebClientID no console.");
        })
        .finally(() => setLoading(false));
    }
  }
}, [response]);

  const handleSocialLogin = async (credential: any) => {
    setLoading(true);
    try {
      const result = await signInWithCredential(auth, credential);
      // Verifica se o documento do user existe, se não, cria (Gamificação)
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        await createUserData(result.user.uid, result.user.displayName || "Guerreiro", result.user.email || "");
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Erro Google", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. FUNÇÃO PARA CRIAR DADOS NO FIRESTORE
  const createUserData = async (uid: string, name: string, mail: string) => {
    await setDoc(doc(db, "users", uid), {
      username: name,
      email: mail,
      peso: 0,
      altura: 0,
      level: 1,
      xp: 0,
      moedas: 0,
      streak: 0,
      rank: "Aprendiz",
      biotipo: "Ectomorfo",
             
      createdAt: new Date().toISOString()
    });
  };

  // 4. HANDLER LOGIN/CADASTRO E-MAIL
const handleAuth = async () => {
  const cleanEmail = email.trim();
  const cleanPassword = password.trim();

  // 1. Validação básica
  if (!cleanEmail || !cleanPassword) {
    return Alert.alert("Erro", "Preencha e-mail e senha.");
  }

  setLoading(true);

  try {
    if (isLogin) {
      // --- LÓGICA DE LOGIN ---
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      console.log("Login realizado!");
      router.replace('/(tabs)');
    } else {
      // --- LÓGICA DE CADASTRO ---
      if (!username) {
        setLoading(false);
        return Alert.alert("Erro", "Informe seu nome para o cadastro.");
      }
      if (cleanPassword !== confirmPassword) {
        setLoading(false);
        return Alert.alert("Erro", "As senhas não coincidem.");
      }

      // Criamos o usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = userCredential.user;

      // Atualizamos o nome no perfil do Firebase Auth
      await updateProfile(user, { displayName: username });

      // Chamamos a sua função auxiliar para criar o perfil no Firestore
      // Isso evita o erro de 'userCr is not defined'
      await createUserData(user.uid, username, cleanEmail);
      
      console.log("Usuário e Perfil Firestore criados com sucesso!");
      router.replace('/(tabs)');
    }
  } catch (error: any) {
    console.error(error);
    Alert.alert("GenesysFit", error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Stack screenOptions={{ headerShown: false }}></Stack>
        <ThemedView style={styles.container}>
          
          <View style={styles.header}>
            <Ionicons name="fitness" size={70} color="#FFD700" />
            <ThemedText type="title" style={styles.mainTitle}>Genesys</ThemedText>
            <ThemedText style={styles.subtitle}>Sua evolução começa aqui.</ThemedText>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity style={[styles.tabBtn, isLogin && styles.activeTabBtn]} onPress={() => setIsLogin(true)}>
              <ThemedText style={[styles.tabText, isLogin && styles.activeTabText]}>LOGIN</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, !isLogin && styles.activeTabBtn]} onPress={() => setIsLogin(false)}>
              <ThemedText style={[styles.tabText, !isLogin && styles.activeTabText]}>CADASTRO</ThemedText>
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
              <TextInput placeholder="E-mail" style={styles.inputField} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
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
              {loading ? <ActivityIndicator color="#122620" /> : <ThemedText style={styles.buttonLabel}>{isLogin ? 'ENTRAR' : 'COMEÇAR JORNADA'}</ThemedText>}
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()} disabled={!request || loading}>
              <Ionicons name="logo-google" size={20} color="#ea4335" />
              <ThemedText style={styles.googleButtonLabel}>Google Sign In</ThemedText>
            </TouchableOpacity> */}
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, backgroundColor: Colors.charcoal, padding: 30, justifyContent: 'center' },
  header: { position: 'fixed', alignItems: 'center', marginBottom: 35 },
  mainTitle: { fontSize: 34, fontWeight: '900', color: '#FFD700', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#fff', opacity: 0.8 },
  tabBar: { flexDirection: 'row', marginBottom: 25, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#123600' },
  tabText: { fontWeight: 'bold', color: '#ebd86e' },
  activeTabText: { color: '#ebd86e' },
  inputArea: { gap: 12 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 15, height: 60, backgroundColor: '#fff' },
  inputField: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0c0c0c' },
  mainButton: { backgroundColor: '#FFD700', height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  buttonLabel: { color: '#122620', fontWeight: 'bold', fontSize: 16 },
  googleButton: { flexDirection: 'row', backgroundColor: '#fff', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleButtonLabel: { color: '#555', fontWeight: '600' },
});