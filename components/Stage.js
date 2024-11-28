import { StyleSheet, Pressable, Animated} from 'react-native'
import React, {useEffect, useState} from 'react'
import { FontAwesome5 } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import DoneTasks from './DoneTasks';

export default function Stage({reload, reloadTasks}) {
  const [doneData, setDoneData] = useState([])             // Estado para armazenar a lista de tarefas concluídas
  const [modalVisible, setModalVisible] = useState(false)  // Estado para controlar a visibilidade do modal
  const [fadeAnim] = useState(new Animated.Value(0));      // Inicializa a opacidade com 0 (invisível)
  
  // Função para buscar dados armazenados no AsyncStorage
  const getData = async () => {
    const value = await AsyncStorage.getItem('@logs_done')    // Obtém dados de tarefas concluídas armazenados
    if(value !== null) {
      // Se houver dados armazenados, convertemos para JSON e atualizamos o estado
      console.log('data done', value)   // Para debug, exibe os dados no console
      setDoneData(JSON.parse(value))    // Atualiza o estado com as tarefas concluídas
      return value;
    } else {
      return [];                        // Retorna um array vazio se não houver dados armazenados
    }
  }

  // useEffect para carregar dados quando o componente for montado ou quando `reload` mudar
  useEffect(() => {
    getData()       // Chama a função para buscar dados sempre que o componente é montado ou o `reload` mudar
  }, [reload])

  // Efeito de fade sempre que `doneData` for atualizado
  useEffect(() => {
    // Reinicia a animação para 0 (invisível)
    fadeAnim.setValue(0);

    // Inicia a animação de fade para 1 (opacidade total)
    Animated.timing(fadeAnim, {
      toValue: 1,             // Faz a animação para opacidade 1
      duration: 1000,         // A duração da animação será de 1000 milissegundos (1 segundo)
      useNativeDriver: true,  // Usa o driver nativo para melhorar o desempenho
    }).start();               // Inicia a animação
  }, [doneData]);             // A animação será disparada sempre que `doneData` mudar
  
  return (
    <>
      {JSON.stringify(doneData)!= JSON.stringify([]) && (
        <>
          {/* Container para a exibição do botão de "Tarefas Concluídas" */} 
          <Pressable style = {styles.container} onPress = {()=>{setModalVisible(true)}}>
            <Animated.View style={{ opacity: fadeAnim, flexDirection: 'row', alignItems: 'center' }}>
              <Animated.Text style={styles.stage_title}>
                Lista Tarefas Concluídas
              </Animated.Text>
              {/* Ícone de tarefas */}
              <FontAwesome5 name="tasks" size={30} color="white" />
            </Animated.View>
          </Pressable>
          {/* Componente que exibe a lista de tarefas concluídas */}
          <DoneTasks reloadTask = {reloadTasks} reload = {setDoneData} listOfTasks={doneData} modalVisible = {modalVisible} setModalVisible = {setModalVisible}></DoneTasks>
        </>
      )}
    </>
  );
}
  
const styles = StyleSheet.create({
    container:{
        backgroundColor:'#2E8B57',
        position: 'absolute',      // Posiciona o botão na parte inferior da tela
        bottom:0,
        left:0,
        width:'100%',
        height:'10%',
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        alignContent:'center',
        alignItems:'center',
    },
    stage_title:{
        color:'white',
        fontFamily:'Montserrat',
        marginRight:10,
        fontSize: 20,
    }
});
