import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { initializeApp, getApps, getApp } from 'firebase/app';

import { 
  getAuth, 
  initializeAuth, 
  onAuthStateChanged,
  //@ts-ignore
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Auth } from 'firebase/auth';

// 1. Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAC-uFM4pwfXDuKxGvsFM3Z7v7oF0BC3U4",
  authDomain: "biosyntech-8ffe1.firebaseapp.com",
  projectId: "biosyntech-8ffe1",
  storageBucket: "biosyntech-8ffe1.firebasestorage.app",
  messagingSenderId: "642421745104",
  appId: "1:642421745104:web:ef5298a181d4a178f145d5",
  measurementId: "G-XV52RYJVY3"
};

// 2. Inicialização Segura (Evita o erro "already-initialized")
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  // Tenta inicializar com persistência (resolve o warning do AsyncStorage)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  // Se já estiver inicializado, apenas recupera a instância existente
  auth = getAuth(app);
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Monitora o estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Lógica de Redirecionamento Automático
    if (isAuthenticated === null) return; // Aguarda o Firebase responder

    const inTabsGroup = segments[0] === '(tabs)';

    if (isAuthenticated && !inTabsGroup) {
      // Se logado e não estiver nas abas, vai para a Home
      router.replace('/(tabs)');
    } else if (!isAuthenticated && inTabsGroup) {
      // Se deslogado e estiver nas abas, volta para o Login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments]);

  // Tela de carregamento enquanto o Firebase verifica a sessão
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" /> 
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}