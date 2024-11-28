import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SortData({modal, setModal, reload}) {

    // Função para armazenar dados no AsyncStorage
    const storeData = async (value, key) => {
        var json = JSON.stringify(value)                    // Converte o valor para uma string JSON
        try {
            await AsyncStorage.setItem(key, json)           // Tenta armazenar o item no AsyncStorage
        } catch (e) {
            console.error("Erro ao armazenar dados:", e);   // Exibe erro se falhar ao salvar
        }
    }

    // Função para obter os dados do AsyncStorage
    const getData = async () => {
        const value = await AsyncStorage.getItem('@logs_task')  // Busca os dados das tarefas
        if(value !== null) {
          return JSON.parse(value);                             // Retorna os dados como um objeto se encontrados
        }
        else{
          return [];                                            // Retorna um array vazio se não encontrar dados
        }
    }

    // Função para ordenar os dados por prazo (mais antigo para o mais recente)
    function sortObjectByOldestDate(obj) {
        return obj.sort((a, b) => new Date(a.deadline_date) - new Date(b.deadline_date));   // Ordena pela data de prazo
    }

    // Função para ordenar as tarefas por prazo e atualizar o AsyncStorage
    async function sortByDeadline() {
        let datos = await getData();            // Obtém as tarefas do AsyncStorage
        datos = sortObjectByOldestDate(datos);  // Ordena as tarefas pela data de prazo
        console.log(datos);                     // Exibe as tarefas ordenadas no console para depuração
        await storeData(datos, '@logs_task');   // Armazena novamente as tarefas ordenadas
        setModal(false);                        // Fecha o modal após a operação
        await reload();                         // Atualiza a lista de tarefas (função passada por props)
    }

    // Função para ordenar as tarefas por prioridade
    async function sortByPriority() {
        let datos = await getData();                            // Obtém as tarefas do AsyncStorage
        datos = datos.sort((a, b) => a.priority - b.priority);  // Ordena por prioridade (menor para maior)
        console.log(datos);                                     // Exibe as tarefas ordenadas no console para depuração
        await storeData(datos, '@logs_task');                   // Armazena as tarefas ordenadas de volta no AsyncStorage
        setModal(false);                                        // Fecha o modal após a operação
        await reload();                                         // Atualiza a lista de tarefas (função passada por props)
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modal}
            onRequestClose={() => setModal(false)}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {/* Botão de fechar o modal */}
                    <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModal(false)}>
                        <Text style={styles.textStyle}>
                            <MaterialCommunityIcons name="close-octagon" size={42} color="red" />
                        </Text>
                    </Pressable>
                    {/* Botão para ordenar as tarefas por prazo */}
                    <Pressable onPress={sortByDeadline} style={styles.sort_item}>
                        <Text style={styles.sort_item_text}>Ordenar por Prazo</Text>
                    </Pressable>
                    {/* Botão para ordenar as tarefas por prioridade */}
                    <Pressable onPress={sortByPriority} style={styles.sort_item}>
                        <Text style={styles.sort_item_text}>Ordenar por Prioridade</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adiciona um fundo semitransparente escuro para melhor contraste
    },
    modalView: {
        backgroundColor: 'white',
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,   
        width: '85%',           // Largura do Modal
        height: '30%',          // Altura do Modal
        borderRadius: 10,       // Bordas arredondadas
        paddingVertical: 58,    // Espaçamento vertical
        position: 'relative',   // Posição relativa para permitir que o botão de fechar seja posicionado
    },
    buttonClose: {
        position: 'absolute',   // Posição absoluta para o botão de fechar
        top: 10,
        right: 10,
        padding: 5,
        zIndex: 1,              // Coloca o botão acima de outros elementos
    },
    sort_item: {
        justifyContent: 'center', // Alinha o conteúdo verticalmente
        alignItems: 'center',     // Alinha o conteúdo horizontalmente      
        textAlign: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        elevation: 7,
        borderRadius: 10,
        backgroundColor: '#008080',
        marginVertical: 14,       // Espaçamento entre os botões
        width: '85%',             // Largura dos botões
    },
    sort_item_text: {
        textAlign: 'center',      // Centraliza o texto dentro do botão
        fontSize: 18,
        fontFamily: 'Montserrat',
        color: 'white',
    },
});
