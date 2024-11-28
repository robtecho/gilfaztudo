import { View, Text, Modal, StyleSheet, Pressable, Animated, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DoneTasks({ listOfTasks, modalVisible, setModalVisible, reload, reloadTask }) {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);        // Modal de confirmação para restaurar uma tarefa
  const [clearTasksModalVisible, setClearTasksModalVisible] = useState(false);  // Modal de confirmação para limpar todas as tarefas
  const [selectedItem, setSelectedItem] = useState(null);         // Armazena o item selecionado para operações como restaurar ou excluir
  const [successModalVisible, setSuccessModalVisible] = useState(false); // Modal de sucesso, exibido após limpar as tarefas concluídas
  const [fadeAnim] = useState(new Animated.Value(0));                    // Controle da animação (fade-in)

  // Efeito de log da lista de tarefas no console sempre que ela for modificada
  useEffect(() => {
    console.log('listOfTasks', typeof(listOfTasks));  // Mostra no console a lista de tarefas recebida como props
  }, []);

  // Função que encurta uma string para um tamanho máximo de caracteres e adiciona '...' se necessário
  function sliceStringByChars(str, n_chars) {
    if (str.length > n_chars) {
      return str.slice(0, n_chars) + '...';     // Retorna o início da string com '...' no final
    } else {
      return str;                               // Retorna a string original se não ultrapassar o limite
    }
  }

  // Função que obtém os dados armazenados em AsyncStorage para as tarefas
  const getData = async () => {
    const value = await AsyncStorage.getItem('@logs_task');
    if (value !== null) {
      return value;       // Retorna as tarefas armazenadas
    } else {
      return [];          // Retorna um array vazio caso não haja dados
    }
  }

  // Função que obtém as tarefas concluídas armazenadas
  const getDone = async () => {
    const value = await AsyncStorage.getItem('@logs_done');
    if (value !== null) {
      return value;       // Retorna as tarefas concluídas
    } else {
      return [];          // Retorna um array vazio caso não haja tarefas concluídas
    }
  }

  // Função para excluir uma tarefa concluída selecionada
  async function deleteItem(selectedItem) {
    var datos = await getDone();
    datos = JSON.parse(datos);             // Converte os dados armazenados em array
    datos = datos.filter(element => JSON.stringify(element) != JSON.stringify(selectedItem));  // Filtra a tarefa selecionada
    console.log(datos);
    await storeData(datos, '@logs_done');  // Armazena as tarefas restantes
    await reload([]);                      // Atualiza a lista de tarefas
  }

  // Função para recuperar uma tarefa concluída
  async function recoverItem(item) {
    setSelectedItem(item);
    setConfirmModalVisible(true);  // Exibe o modal de confirmação
  }

  // Função para confirmar a restauração de uma tarefa
  async function handleConfirmRecover() {
    const arrayOfTasks = [];
    var data = await getData();
    if (typeof(data) == 'string') {
      data = JSON.parse(data);        // Garante que os dados sejam um array
    }
    arrayOfTasks.push(selectedItem);  // Adiciona a tarefa selecionada ao array
    data.forEach(element => {
      arrayOfTasks.push(element);     // Adiciona as outras tarefas
    });
    console.log('Array Of Tasks', arrayOfTasks);
    await storeData(arrayOfTasks, '@logs_task').then(() => {
      Alert.alert('Tarefa Restaurada!');  // Alerta de sucesso
      setModalVisible(false);             // Fecha o modal
      setConfirmModalVisible(false);      // Fecha o modal de confirmação
      reload([]);                         // Atualiza a lista de tarefas
      reloadTask();                       // Recarrega as tarefas
    });
    await deleteItem(selectedItem);       // Exclui a tarefa concluída
  }

  // Função para cancelar a recuperação de uma tarefa
  async function handleCancelRecover() {
    setConfirmModalVisible(false);      // Fecha o modal de confirmação
  }

  // Função para limpar todas as tarefas concluídas
  async function handleClearCompletedTasks() {
    await storeData([], '@logs_done');  // Limpa os dados das tarefas concluídas
    setClearTasksModalVisible(false);   // Fecha o modal de limpeza
    setSuccessModalVisible(true);       // Exibe o modal de sucesso após a limpeza
    // Inicia a animação de fade-in após 500ms
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // A duração do fade-in (2 segundos)
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setSuccessModalVisible(false); // Fecha o modal de sucesso após 3 segundos
      reload([]);                    // Atualiza a lista de tarefas
    }, 4500);                        // Duração do modal de sucesso (4.5 segundos)
  }

  // Função para cancelar a limpeza das tarefas concluídas
  async function handleCancelClear() {
    setClearTasksModalVisible(false);  // Fecha o modal de confirmação
  }

  // Função para armazenar dados no AsyncStorage
  const storeData = async (value, key) => {
    var json = JSON.stringify(value);
    try {
      await AsyncStorage.setItem(key, json);      // Armazena os dados no AsyncStorag
    } catch (e) {
      console.log('Erro ao armazenar dados', e);  // Exibe erro no console
    }
  }

  // Função para abrir o modal de confirmação para limpar todas as tarefas concluídas
  async function deleteAllItems() {
    setClearTasksModalVisible(true);  // Exibe o modal de confirmação
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}  // Função para fechar o modal
    > 
      <View style={styles.centeredView}>
        {/* Container fixo para o conteúdo */}
        <View style={styles.modalContentContainer}>
          {/* Título do Modal */}
          <Text style={styles.modalTitle}>Lista de Tarefas Concluídas:</Text>

          {/* Botão de Fechar */}
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.textStyle}>
              <MaterialCommunityIcons name="close-octagon" size={44} color="red" />
            </Text>
          </Pressable>
          
      {/* Lista de Tarefas Concluídas */}
      <View style={styles.tasksList}>          
       {listOfTasks.map((item) => (
         <Pressable
           style={styles.taskItem}
           onPress={() => recoverItem(item)}
           key={item._id}
         >
           <Text style={styles.task_description} key={item._id + 1}>
             {sliceStringByChars(item.description || "Sem Descrição", 26)} {/* Encurta a descrição das tarefas */}
           </Text>
         </Pressable>
       ))}
      </View>

      {/* Caixa do botão "Limpar" */}
        <View style={styles.clearTasksBox}>  
          <Pressable
            style={styles.clearButton}
            onPress={deleteAllItems}       // Chama a função de limpar todas as tarefas
          >
            <Text style={styles.clearButtonText}>Limpar</Text>
            <MaterialIcons name="task-alt" size={38} color="white" />
          </Pressable>
        </View>
      </View>
    </View> 

      {/* Modal de confirmação para restaurar tarefa */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={handleCancelRecover}
      >
        <View style={styles.centeredView}>
          <View style={styles.confirmModalView}>
            <Text style={styles.confirmText}>Restaurar Tarefa?</Text>
            <View style={styles.confirmButtons}>
              <Pressable style={styles.confirmButton} onPress={handleConfirmRecover}>
                <Text style={styles.confirmButtonText}>Sim</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={handleCancelRecover}>
                <Text style={styles.confirmButtonText}>Não</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmação para limpar todas as tarefas concluídas */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={clearTasksModalVisible}
        onRequestClose={handleCancelClear}
      >
        <View style={styles.centeredView}>
          <View style={styles.confirmModalView}>
            <Text style={styles.confirmText}>Esvaziar Tarefas Concluídas?</Text>
            <View style={styles.confirmButtons}>
              <Pressable style={styles.confirmButton} onPress={handleClearCompletedTasks}>
                <Text style={styles.confirmButtonText}>Sim</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={handleCancelClear}>
                <Text style={styles.confirmButtonText}>Não</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de sucesso após limpar as tarefas concluídas */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successModalView}>
          <Animated.View style={[styles.animationContainer, { opacity: fadeAnim }]}>
            <Image
              source={require('../assets/images/gilman.png')}
              style={styles.successImage}
            />
            <View style={styles.successTextContainer}>
              <Text style={styles.successTextTop}>Perfeitamente!</Text>
              <Text style={styles.successTextBottom}>Tarefas Concluídas com Sucesso!</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Adiciona sobreposição escura para melhor contraste
  },
  // Container fixo para o conteúdo
  modalContentContainer: {
    backgroundColor: 'white',
    padding: 35,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '95%',                           // Largura controlada para o modal
    height: '90%',                          // Altura controlada para o modal
    borderRadius: 10,
    elevation: 5,
    position: 'relative',                   // Torna o contêiner relativo ao posicionamento
  },
  modalTitle: {
    position: 'absolute',                   // Para posicionar no topo
    top: 62,
    fontFamily: 'Montserrat',
    fontSize: 23,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',                          // Garantir que ocupe toda a largura
    borderBottomWidth: 2,                   // Adiciona a linha na parte inferior
    borderBottomColor: '#006400',           // Cor da linha
  },
  buttonClose: {
    position: 'absolute',
    top: 10,                                // Ajuste do espaço entre o botão de fechar e o topo da tela/modal
    right: 12,                              // Ajuste do espaço entre o botão de fechar e a borda direita
  },
  tasksList: {
    width: '100%',
    top: 25,
    marginTop: 60,                          // Espaço entre a lista e o botão "Limpar"
    maxHeight: '60%',                       // Limita a altura máxima da lista de tarefas
    overflow: 'scroll',                     // Permite rolagem caso a lista seja muito grande
  },
  taskItem: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,                          // Bordas Visíveis
    borderColor: '#ddd',                     // Cor da borda
  },
  task_description: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  clearTasksBox: {
    width: '100%',                           // Caixa ocupa toda a largura do container
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 46,                           // Espaço acima do botão
  },
  clearButton: {
    backgroundColor: '#00b4fc',
    paddingVertical: 10,
    paddingHorizontal: 30,                   // Ajustando o tamanho do botão
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  clearButtonText: {
    fontSize: 20,
    elevation: 7,
    color: 'white',
    fontFamily: 'Montserrat',
    marginRight: 10,                          // Espaço entre o texto e o ícone
  },
  successModalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 20, 0, 0.7)',
  },
  animationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    width: '80%',
    height: '80%',                            // Garantir que o modal de sucesso ocupe uma boa parte da tela
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,                            // Garantir que o container se sobreponha corretamente
    textAlign: 'center',                      // Garantir que o texto e a imagem estejam centralizado
    position: 'relative',                     // Necessário para usar o posicionamento absoluto dentro do container
  },
  successImage: {
    width: 290,                               // Largura ajustada para não ocupar muito espaço
    height: 290,                              // Altura ajustada para manter o tamanho da imagem
    resizeMode: 'contain',                    // Garante que a imagem se ajuste sem ser cortada ou distorcida
    marginBottom: 30,                         // Espaço entre a imagem e o texto
  },
  successTextContainer: {
    flexDirection: 'column',                  // Organiza os textos em coluna
    justifyContent: 'center',                 // Garante que os textos fiquem centralizados
    alignItems: 'center',                     // Centraliza os textos no container
  },
  successTextTop: {
    fontSize: 30,                             // Fonte maior para o "Perfeitamente!"
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,                         // Espaço entre o textos
    color: 'black',
    fontFamily: 'Montserrat',    
  },
  successTextBottom: {
    fontSize: 20,                             // Fonte menor para o "Tarefas Concluídas com Sucesso!"
    textAlign: 'center',
    marginTop: 10,
    color: 'black',
    fontFamily: 'Montserrat', 
  },
  confirmModalView: {
    backgroundColor: 'white',
    padding: 35,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 200,                              // Ajusta a altura do modal para garantir mais espaço
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmText: {
    fontSize: 20,
    fontFamily: 'Montserrat',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#008B8B',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    
  },
});
