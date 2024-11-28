import React, { useEffect } from 'react';
import Home from "./screens/Home";                                    // Importa o componente da tela principal (Home)
import { StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';                                 // Hook para carregar fontes personalizadas
import * as SplashScreen from 'expo-splash-screen';

export default function App() {
  // Carrega a fonte personalizada 'Montserrat'
  const [fontsLoaded] = useFonts({
    'Montserrat': require('./assets/fonts/Montserrat-Medium.ttf'),
  });

  // Hook useEffect que impede o auto-hide da splash screen enquanto as fontes estão sendo carregadas
  useEffect(() => {
    // Função assíncrona que gerencia a exibição da splash screen
    const hideSplashScreen = async () => {
      // Primeiro, previne o comportamento padrão de auto-hide da splash screen
      await SplashScreen.preventAutoHideAsync();
      
      // Verifica se as fontes foram carregadas
      if (fontsLoaded) {
        // Espera um tempo para a splash screen ser visível antes de esconder
        setTimeout(() => {
          SplashScreen.hideAsync();    // Esconde a splash screen
        }, 2000);                      // 2000ms = 2 segundos
      }
    };

    // Chama a função para controlar o comportamento da splash screen
    hideSplashScreen();
  }, [fontsLoaded]); // Reage à mudança de fontsLoaded

  // Enquanto as fontes não carregarem, não renderiza a aplicação
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { fontFamily: 'Montserrat' }]}>
      {/* Renderiza a tela principal (Home) após as fontes serem carregadas */}
      <Home />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
  }
});