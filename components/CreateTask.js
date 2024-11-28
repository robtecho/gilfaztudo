import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Alert, Pressable, View, TextInput, SafeAreaView} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Category from './Category';

export default function CreateTask ({taskVisible, setTaskVisible, createTask, reload}){

  // Estados para armazenar os dados da tarefa
  const [text, onChangeText] = useState('');                    // Descrição da tarefa
  const [selectedCategory, setSelectCategory] = useState('');   // Categoria selecionada
  const [selectedPriority, setSelectedPriority] = useState(2);  // Prioridade da tarefa
  const [selectedDate, setSelectedDate] = useState(null);       // Data selecionada
  const [selectedTime, setSelectedTime] = useState(null);       // Hora selecionada 
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);  // Controle da visibilidade do seletor de data
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);  // Controle da visibilidade do seletor de hora
  const [listOfCategory, setListOfCategory] = useState([]);             // Lista de categorias carregadas

  // Função para obter dados armazenados (ex. tarefas)
  const getData = async () => {
    const value = await AsyncStorage.getItem('@logs_task')
    if(value !== null) {
      return value     // Retorna o valor se houver
    }
    else{
      return []        // Caso contrário, retorna um array vazio
    }
}

  // Função para exibir o seletor de data
  const showDatePicker = () => {
    setDatePickerVisible(true);  // Exibe o seletor de data
  };

  // Função para exibir o seletor de hora
  const showTimePicker = () => {
    setTimePickerVisible(true);  // Exibe o seletor de hora
  };

  // Funções para esconder os seletores de data e hora
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  // Função para confirmar a data e atualizar o estado
  const handleConfirmDate = (date) => {
    // Garante que a data seja um objeto Date válido
    if (date instanceof Date && !isNaN(date)) {
      setSelectedDate(date);  // Atualiza o estado com a data selecionada
    }
    hideDatePicker();         // Esconde o seletor de data
  };

  // Função para formatar a data
  const formatDate = (date) => {
    // Verifica se a data é válida antes de tentar formatá-la
    if (date && date instanceof Date && !isNaN(date)) {
      return date.toLocaleDateString();   // Retorna a data formatada
    }
    return "Selecione a Data";  // Retorna string padrão
  };

  // Função para confirmar o horário e atualizar o estado
  const handleConfirmTime = (time) => {
    setSelectedTime(time);  // Atualiza o estado com a hora selecionada
    hideTimePicker();       // Esconde o seletor de hora
  };
  
  // Função para formatar o horário
  const formatTime = (time) => {
    if (!time) return 'Selecione a Hora';                    // Se não houver horário, retorna uma string padrão
    // Formatar a hora (exemplo: 14:30)
    const hours = time.getHours();                           // Obtém as horas
    const minutes = time.getMinutes();                       // Obtém os minutos
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;  // Retorna a hora formatada
  };
  
  // Hook para carregar as categorias do AsyncStorage quando CreateTask.js for montado
  useEffect(() => {
    const getCategory = async () => {
      const value = await AsyncStorage.getItem('@logs_category');
      if (value !== null) {
        const categories = JSON.parse(value);           // Converte a string JSON de volta para o array
        categories.sort((a, b) => a.localeCompare(b));  // Ordena as categorias
        const updatedCategories = ["Nenhuma Selecionada", ...categories];  // Adiciona "Nenhuma Selecionada" no início
        setListOfCategory(updatedCategories);           // Atualiza o estado com as categorias carregadas
      }
    };
  
    getCategory();  // Chama a função para carregar as categorias
  }, []);           // Carrega as categorias apenas uma vez quando o componente for montado

  // Função para criar nova tarefa
  async function createNewTask(){
    console.log("selectedCategory no createNewTask: ", selectedCategory); // Verificar o valor de selectedCategory

    const arrayOfTasks = []       // Array para armazenar as tarefas
    let data = await getData()    // Obtém os dados armazenados

    // Se os dados forem uma string, converte de volta para um array
    if(typeof data === 'string') {
      data = JSON.parse(data)
    }

    // Adiciona os dados existentes à lista de tarefas
    data.forEach(element => {
      arrayOfTasks.push(element)
    });

    // Verifica o valor de selectedCategory antes de criar a tarefa
    console.log('Categoria Selecionada antes de criar a tarefa:', selectedCategory);

    // Criação da tarefa
    const TaskObject = {
      description: text,
      category: selectedCategory === "" ? "Nenhuma Selecionada" : selectedCategory,  // Se não houver categoria, atribui "Nenhuma Selecionada"
      priority: selectedPriority,
      deadline_date: selectedDate ? selectedDate : 'Sem Data',      // Se não houver data, exibe 'Sem Data'
      deadline_time: selectedTime ? selectedTime : 'Sem Horário',   // Se não houver horário, exibe 'Sem Horário'
      _id: `${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 10)}`  // Gera um ID único
    }

    console.log("TaskObject no createNewTask: ", TaskObject); // Verificar o objeto da tarefa

    // Adiciona a nova tarefa ao array
    arrayOfTasks.push(TaskObject)
    console.log('Tarefa Criada:', TaskObject);
    console.log('Array Of Tasks', arrayOfTasks);

    // Chama a função de criação da tarefa
    await createTask(arrayOfTasks).then(()=>{
      Alert.alert('Criação de Tarefa:', 'Tarefa Criada com Sucesso !')
      setTaskVisible(false);    // Fecha o modal
      onChangeText('');         // Limpa o campo de descrição
      setSelectCategory('');    // Limpa a categoria selecionada
      setSelectedPriority(1);   // Reseta a prioridade
      setSelectedDate(null);    // Limpa a data
      setSelectedTime(null);    // Limpa o horário
      reload();                 // Atualiza a lista de tarefas
    })
  }

  return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={taskVisible}
        onRequestClose={() => setTaskVisible(!taskVisible)}    // Fecha o modal ao pressionar o botão de fechar
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <SafeAreaView style={styles.modal_form}>
              <View style = {styles.modal_top}>
                <Text style = {styles.modal_title}>Criar Nova Tarefa</Text>
                <Pressable onPress={() => setTaskVisible(!taskVisible)}>
                  <MaterialCommunityIcons name="close-octagon" size={45} color="red" style={{ marginLeft: -28, top: -22 }} />
                </Pressable>
              </View>

              {/* Campo de descrição */}
              <View style = {styles.form_item}>
                <Text style = {styles.form_item_title}>Descrição:</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeText}
                  placeholder = "Definir a Tarefa..."
                  value={text}
                  multiline
                />
              </View>

              {/* Categoria Picker */}
              <View style = {styles.form_item}>
                <Text style = {styles.form_item_title}>Categoria:</Text>
                {/* Passando setListOfCategory para Category.js */}
                <Category Reload = {setListOfCategory} />
                <View style={styles.pickerWrapper}></View>
                <Picker
                  prompt='Selecionar Categoria:'
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => {
                    console.log('Categoria Selecionada:', itemValue); // Adiciona um log para verificar o valor
                    setSelectCategory(itemValue); // Atualiza a categoria selecionada
                  }}
                  style={styles.picker}
                >
                  {/* Renderiza as categorias ordenadas */}
                  {listOfCategory.length > 0 && listOfCategory.map((item, index) => ( 
                    <Picker.Item key = {index} label={item} value={item} />
                    ))}
                </Picker>
              </View>

              {/* Prioridade Picker */}
              <View style = {styles.form_item}>
                <Text style = {styles.form_item_title}>Prioridade:</Text>
                <View style={styles.pickerWrapper}></View>
                <Picker
                  prompt='Selecionar Prioridade:'
                  selectedValue={selectedPriority}
                  onValueChange={(itemValue) => setSelectedPriority(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Alta" value={1} />
                  <Picker.Item label="Média" value={2} />
                  <Picker.Item label="Baixa" value={3} />
                </Picker>
              </View>

              {/* Seletor de Data Limite */}
              <View style = {styles.form_item_date}>
                <Text style = {styles.form_item_title}>Data Limite:</Text>
                <Pressable style= {styles.form_item_input} onPress={showDatePicker}>
                  {/* Exibe a data formatada ou o texto padrão */}
                  <Text style = {styles.form_item_label}>{formatDate(selectedDate)}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}    // Controla a visibilidade do picker de data
                  mode="date"
                  onConfirm={handleConfirmDate}
                  onCancel={hideDatePicker}
                />
              </View>

              {/* Seletor de Horário Limite */}
              <View style={styles.form_item_time}>
                <Text style = {styles.form_item_title}>Horário Limite:</Text>
                <Pressable style={styles.form_item_input} onPress={showTimePicker}>
                  {/* Exibe a data formatada ou o texto padrão */}
                  <Text style={styles.form_item_label}>{formatTime(selectedTime)}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={isTimePickerVisible}    // Controla a visibilidade do picker de hora
                  mode="time"
                  onConfirm={handleConfirmTime}
                  onCancel={hideTimePicker}
                />
              </View> 

              {/* Botão de Criar Tarefa */}
              <View style = {styles.form_item}>
                <Pressable onPress={() => createNewTask()} style={styles.createButton}>
                  <Text style={styles.createButtonText}>Criar</Text>
                  <Ionicons name="create" size={34} color="white" style={{ marginTop: -3 }} />
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    );
  };

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  modal_form: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    flex: 1,
    width: '100%',
  },
  modal_top: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: '8%',
  },
  modal_title: {
    fontSize: 28,
    padding: 10,
    marginRight: 15,
    color: 'black',
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '90%',
    marginLeft: '4%',
    borderBottomWidth: 2,          // Adiciona a linha na parte inferior
    borderBottomColor: '#006400',  // Cor da linha
  },
  input: {
    height: 70,
    margin: 12,
    marginBottom: 6,      // Ajusta a margem inferior diretamente no campo de entrada
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    width: 325,
    alignSelf: 'center',  // Centraliza o campo no contêiner
  },
  picker: {
    height: 50,                    // Define a altura do picker
    width: '100%',                 // Define a largura como 100%
    borderWidth: 1,                // Bordas visíveis
    borderColor: '#d3d3d3',        // Cor da borda (cinza claro)
    borderRadius: 10,              // Bordas arredondadas
    elevation: 5,                  // Sombra para o Android
    shadowColor: '#000',           // Cor da sombra
    shadowOffset: { width: 0, height: 2 },  // Deslocamento da sombra
    shadowOpacity: 0.25,           // Opacidade da sombra
    shadowRadius: 4,               // Difusão da sombra
    backgroundColor: 'white',      // Fundo branco para o picker
    marginBottom: 5,               // Espaçamento abaixo do picker
  },
  pickerWrapper: {
    width: '100%',
    marginBottom: 10,              // Garantindo mais espaço abaixo do picker
  },
  form_item: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',      // Ajusta alinhamento dos itens
    marginBottom: 15,              // Espaçamento entre os campos
  },
  form_item_title: {
    fontSize: 20,
    color:'#d62828',
    fontFamily: 'Montserrat',
    marginRight: 10,               // Ajuste para adicionar espaço entre o título e o componente de input
  },
  form_item_label: {
    color: 'black',
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Montserrat',
  },
  form_item_input: {
    textAlign: 'center',
    padding: 10, 
    elevation: 7,
    borderRadius: 10,
    backgroundColor: 'white',
    marginLeft: 10,
    width: 150,                    // Largura fixa para o campo de horário
  },
  form_item_date: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',       // Centraliza o "Data Limite"
    alignItems: 'center',
    marginBottom: '5%',
  },
  form_item_time: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',   // Alinha "Horário Limite" à esquerda
    alignItems: 'center',
    marginBottom: '5%',
    marginLeft: '-1%',
  },
  createButton: {
    backgroundColor: '#00008b',
    marginTop: '6%',
    width: '90%',                   // Ajuste o botão para ter 90% da largura do container
    borderRadius: 20,
    alignItems: 'center',           // Centraliza o texto dentro do botão
    padding: 12,
    flexDirection: 'row',           // Coloca o conteúdo do botão (texto e ícone) lado a lado
    justifyContent: 'center',       // Espalha o conteúdo entre o texto e o ícone
    alignSelf: 'center',            // Garante que o botão fique centralizado horizontalmente
    shadowColor: '#000',            // Cor da sombra (preto)
    shadowOffset: { width: 0, height: 4 },  // Deslocamento da sombra (aumenta a altura)
    shadowOpacity: 0.3,             // Opacidade da sombra (quanto mais alto, mais forte é a sombra)
    shadowRadius: 4,                // Difusão da sombra (quanto maior, mais difusa ela fica)
    elevation: 8,                   // Sombras no Android (quanto maior o valor, mais forte é a sombra)
  },
  createButtonText: {
    fontSize: 25,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Montserrat',
    marginRight: 10,                // Espaço entre o texto e o ícone
  }
});

