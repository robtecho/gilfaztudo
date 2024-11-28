import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { Entypo, FontAwesome5 } from '@expo/vector-icons'; 
import { AntDesign } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componente para comparar duas datas e retornar ícones de status
const CompareDates = ({ date1, date2 }) => {
    const d1 = new Date(date1);              // Converte a primeira data para o formato Date
    const d2 = new Date(date2);              // Converte a segunda data para o formato Date
    d1.setHours(0,0,0,0);                    // Zera as horas da primeira data
    d2.setHours(0,0,0,0);                    // Zera as horas da segunda data
    
    // Compara as duas datas e retorna o ícone correspondente
    if (d1 > d2) {
      return <FontAwesome5 name="user-clock" size={28} color="blue" />;
    } else if (d1 < d2) {
      return <Entypo name="warning" size={30} color="red" />;
    } else {
      return <Entypo name="warning" size={30} color="orange" />;
    }
}

// Componente principal para exibir uma tarefa
export default function Task({setModal, TaskObject, reload, date}) {
  // Função assíncrona para armazenar dados no AsyncStorage
  const storeData = async (value, key) => {
    var json = JSON.stringify(value)
    try {
        await AsyncStorage.setItem(key, json)     // Armazena o valor no AsyncStorag
    } catch (e) {
        // Caso ocorra um erro ao armazenar, o erro é ignorado (poderia ser tratado)
    }
  }

  // Função assíncrona para buscar dados do AsyncStorage
  const getData = async () => {
    const value = await AsyncStorage.getItem('@logs_task')      // Busca dados de tarefas
    if(value !== null) {
        return value                                            // Retorna os dados se existirem
    }
    else{
      return []                                                 // Retorna um array vazio se não houver dados
    }
  }

  // Função assíncrona para buscar tarefas marcadas como concluídas
  const getDone = async () => {
    const value = await AsyncStorage.getItem('@logs_done')      // Busca tarefas concluídas
    if(value !== null) {
        return value
    }
    else{
      return []                                                 // Retorna um array vazio se não houver tarefas concluíd
    }
  }

  // Função para formatar a data para o formato 'dd/mm/yyyy'
  function parseDate(date){
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return null; // Retorna null se a data for inválida

    const day = parsedDate.getUTCDate();
    const month = parsedDate.getUTCMonth() + 1;   // Adiciona 1 ao mês, pois o mês começa em 0
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Função para formatar a hora para o formato 'hh:mm AM/PM'
  function parseTime(time){
    const parsedTime = new Date(time);
    if (isNaN(parsedTime)) return null; // Retorna null se a hora for inválida

    let hours = parsedTime.getHours();
    let minutes = parsedTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM'            // Determina se é AM ou PM
    hours = hours % 12;                               // Converte para formato de 12 horas
    hours = hours ? hours : 12;                       // Se a hora for 0, ajusta para 12
    minutes = minutes < 10 ? '0'+minutes : minutes;   // Adiciona 0 à frente dos minutos menores que 10

    return `${hours}:${minutes} ${ampm}`; 
  }
  
  // Função para cortar uma string se exceder o número de caracteres
  function sliceStringByChars(str, n_chars) {
    if (str.length > n_chars) {
      return str.slice(0, n_chars) + '...';     // Adiciona '...' se a string for maior que o limite
    } else {
      return str;                               // Retorna a string original se for dentro do limite
    }
  }

  // Função assíncrona para adicionar uma tarefa concluída no AsyncStorage
  async function createDone(selectedItem){
    const arrayOfDone = []
    var data = await getDone()
    if(typeof(data) == 'string'){
      data = JSON.parse(data)                   // Converte para array se estiver em formato de string
    }
    data.forEach(element => {
      arrayOfDone.push(element)                 // Adiciona cada item da lista de concluídos
    });
    arrayOfDone.push(selectedItem)              // Adiciona a tarefa selecionada como concluída
    await storeData(arrayOfDone, '@logs_done')  // Armazena a lista atualizada de tarefas concluídas
  }

  // Função assíncrona para marcar uma tarefa como concluída
  async function handleDone(selectedItem){
    var datos = await getData()               // Obtém a lista de tarefas
    datos = JSON.parse(datos)                 // Converte para array
    datos = datos.filter(element => JSON.stringify(element) != JSON.stringify(selectedItem))    // Remove a tarefa concluída
    await storeData(datos, '@logs_task')      // Atualiza a lista de tarefas no AsyncStorage
    await createDone(selectedItem)            // Adiciona à lista de concluídas
    await reload()                            // Recarrega os dados
  }

  // Função assíncrona para excluir uma tarefa
  async function handleDelete(selectedItem){
    var datos = await getData()               // Obtém a lista de tarefas
    datos = JSON.parse(datos)                 // Converte para array
    datos = datos.filter(element => JSON.stringify(element) != JSON.stringify(selectedItem))    // Remove a tarefa
    console.log(datos)                        // Exibe a lista atualizada no console
    await storeData(datos, '@logs_task')      // Atualiza o AsyncStorage com a lista modificada
    await reload()                            // Recarrega os dados
  }

  return (
    <View style = {{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
      {/* Botão de check: marca a tarefa como concluída */}
      <Pressable style = {styles.button} onPress={()=>handleDone(TaskObject)}>
        <AntDesign name="checkcircle" size={40} color="green" />
      </Pressable>
      
      {/* Container da tarefa */}
      <View style = {styles.container}>
          <Pressable onPress = {()=>{setModal({
            visible: true, 
            content:TaskObject                  // Exibe os detalhes da tarefa no modal
          })}}>
          <View style = {{        
              elevation:10,
              width:'100%',
              height:'100%',
              backgroundColor:'#fff',
              borderRadius:20,
              borderColor: TaskObject.priority == 1 ? "red": TaskObject.priority == 2?'orange':'blue',
              borderWidth:2,
              padding:20
          }}>
              <View style = {styles.item_top}>
                  <Text style = {styles.priority}>
                    {/* Exibe a prioridade da tarefa */}
                    {TaskObject.priority == 1 ? "Alta Prioridade": TaskObject.priority == 2?"Média Prioridade":'Baixa Prioridade'}
                  </Text>
              </View>

              {/* Exibição da categoria */}
              {TaskObject.category && TaskObject.category.trim() !== "" ? (
                <View style={styles.item_category}>
                  <Text style={styles.categoryText}>{sliceStringByChars(TaskObject.category, 26)}</Text>
                </View>
              ) : (
                <View style={styles.item_category}>
                  <Text style={styles.categoryText}>Sem Categoria</Text>
                </View>
              )}

              {/* Exibição da descrição da tarefa */}
              <View style = {styles.item_bottom}>
                  <Text style = {styles.description}>
                  {TaskObject.description && TaskObject.description.trim() !== "" 
                    ? sliceStringByChars(TaskObject.description, 26) // Exibe os primeiros 26 caracteres ou adiciona '...' caso a descrição seja longa
                    : "Sem Descrição"}
                  </Text>
              </View>

              {/* Exibição do prazo */}
              {
                  TaskObject.deadline_date ? (
                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10, justifyContent: 'space-evenly', alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Montserrat' }}>Prazo:</Text>
                      <View>
                        {/* Verifica se a data é válida antes de exibir */}
                        <Text>{parseDate(TaskObject.deadline_date) || "Sem data"}</Text>

                        {/* Verifica se o horário é válido antes de exibir */}
                        {TaskObject.deadline_time ? (
                          <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text>{parseTime(TaskObject.deadline_time) || "Sem horário"}</Text>
                          </View>
                        ) : (
                          <Text>Sem horário</Text> // Exibe "Sem horário" se não houver hora definida
                        )}
                      </View>
                      {/* Compara as datas e exibe o ícone apropriado */}
                      <CompareDates date1 = {TaskObject.deadline_date} date2={date} />
                    </View>
                  ) : (
                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10, justifyContent: 'space-evenly', alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Montserrat' }}>Prazo:</Text>
                      <Text>Sem data</Text> {/* Exibe "Sem data" se não houver data definida */}
                    </View>
                  )  
                }
              </View>
            </Pressable>
          </View>

      {/* Botão de delete: exclui a tarefa */}
      <Pressable style = {styles.button} onPress={()=>handleDelete(TaskObject)}>
        <AntDesign name="closecircle" size={40} color="red" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
      width: 250,
      height: 150,
      marginBottom: 15,
  },
  item_top:{
      display: 'flex',
      flexDirection:'row',
      width:'100%',
      justifyContent:'space-between',
  },
  button:{
    margin: 5,
  },
  item_category:{
      width:'auto', 
      textAlign:'center', 
      borderRadius:20,
      padding:5,
  }, 
  categoryText: {
      fontFamily: 'Montserrat',
      fontWeight: '700',
      fontStyle: 'italic',
      color: 'black',
      textAlign: 'center',
  },
  priority:{
      fontWeight:'700',
      fontFamily:'Montserrat',
      marginTop: -5,
  },
  description:{
    fontFamily:'Montserrat',
  }
})
