import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Alert, Pressable, ScrollView, SafeAreaView, Image } from 'react-native';
import { Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from '../components/Task';                              // Componente para exibir cada tarefa
import Details from '../components/Details';                        // Componente de detalhes de tarefa
import CreateTask from '../components/CreateTask';                  // Componente para criar novas tarefas
import SortData from '../components/SortData';                      // Componente para ordenar tarefas
import Stage from '../components/Stage';                            // Componente que filtra as tarefas

export default function Home() {
    // Estado para armazenar a lista de tarefas
    const [tasksList, setTasksList] = useState([])
    // Estado para armazenar a data atual
    const [fecha, setFecha] = useState(new Date())
    // Estado para controlar a visibilidade do modal de ordenação
    const [sortModal, setSortModal]= useState(false)
    // Estado para controlar a visibilidade e o conteúdo do modal de detalhes
    const [modal, setModal] = useState({
        visible: false,
        content: {}
    });
    
    // Estado para controlar a visibilidade do modal de criação de tarefa
    const [createTaskVisible, setCreateTaskVisible] = useState(false);

    // Função para salvar dados no AsyncStorage
    const storeData = async (value) => {
        var json = JSON.stringify(value)                    // Converte os dados para o formato JSON
        try {
            await AsyncStorage.setItem('@logs_task', json)  // Armazena as tarefas
        } catch (e) {
            console.error(e);                               // Em caso de erro, exibe no console
        }
    }

    // Função para obter os dados armazenados no AsyncStorage
    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('@logs_task')   // Recupera os dados
            if(value !== null) {
               console.log('obtendo dados', value)                   // Exibe os dados no console
               setTasksList(JSON.parse(value))                       // Atualiza a lista de tarefas
            }
        } catch(e) {
            console.error(e);                                        // Em caso de erro, exibe no console
        }
    }

    // Função para limpar o AsyncStorage
    const clearAsyncStorage = async() => {
        if (tasksList.length === 0) {
           // Se não houver tarefas, mostrar uma mensagem informando
           Alert.alert('Não há Tarefas para Excluir !');
           return; // Não continua com a exclusão
        }

        // Se houver tarefas, mostra o alerta de confirmação para deletar
        Alert.alert('Excluir Tarefas:', 'Tem certeza que quer Deletar TODAS as Tarefas?', 
            [
                {
                    text: 'Cancelar', 
                    style: 'cancel',    // Cancela a operação
                },
                {
                    text: 'Sim',
                    onPress: () => {
                        Alert.alert('Tarefas Deletadas!'); // Exibe confirmação
                        storeData([]); // Limpa as tarefas
                        getData(); // Atualiza a lista de tarefas após a exclusão
                    },
                }
            ]
        )
    }

    // Hook useEffect para carregar os dados e configurar a data atual ao montar o componente
    useEffect(() => {
        getData()               // Carrega os dados de tarefas
        setFecha(new Date())    // Atualiza a data atual
    }, [])                      // O array vazio significa que o efeito será executado apenas uma vez após o componente ser montado

    return (
        <SafeAreaView style={styles.container}>
            <Image style={styles.img} source={require('./gilworks.jpg')} />
            <View style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', marginBottom: '10%' }}>
                {/* Ícone para criar uma nova tarefa */}
                <Pressable onPress={() => { setCreateTaskVisible(true); }}>
                    <MaterialIcons name="add-home-work" size={40} color="#5A3B56" />
                </Pressable>
                {/* Ícone para abrir o modal de ordenação */}
                <Pressable onPress={() => { setSortModal(true); }}>
                    <MaterialCommunityIcons name="sort" size={40} color="#5A3B56" />
                </Pressable>
                {/* Ícone para limpar todas as tarefas */}
                <Pressable onPress={() => clearAsyncStorage()}>
                    <Entypo name="trash" size={38} color="#5A3B56" />
                </Pressable>
            </View>
            <Text style={styles.title}>Lista de Tarefas:</Text>
            {/* Modal para criar uma nova tarefa */}
            <CreateTask reload={getData} createTask={storeData} taskVisible={createTaskVisible} setTaskVisible={setCreateTaskVisible} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollview}>
                <View style={styles.taskContainer}>
                    {
                        tasksList.length > 0 ? (
                            // Exibe uma lista de tarefas se houver tarefas
                            tasksList.map((element) => (
                                <Task date={fecha} reload={getData} key={element._id} TaskObject={element} setModal={setModal} />
                            ))
                        ) : (
                            // Exibe mensagem se não houver tarefas
                            <Text style={styles.noTasksText}>Nenhuma tarefa a cumprir ...</Text>
                        )    
                    }
                </View>
            </ScrollView>
            {/* Modal de detalhes da tarefa */}
            <Details modal={modal} setModal={setModal} />
            {/* Modal de ordenação */}
            <SortData reload={getData} modal={sortModal} setModal={setSortModal} />
            {/* Componente de Filtra as Tarefas */}
            <Stage reloadTasks={getData} reload={tasksList} />
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        marginTop:'10%',    // Espaçamento superior
    }, 
    img: {
        width: 320,
        height: 120,
        marginBottom: 20,   // Espaçamento inferior da imagem
    },
    taskContainer: {
        alignContent:'center', 
        alignItems:'center',
        display:'flex',
        flexDirection:'column',
        width:'100%',
        marginBottom:'20%', // Espaçamento inferior da lista de tarefas
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'relative', 
        top: -30,           // Ajuste de posição do título
        marginBottom: -15,  // Espaçamento abaixo do título
    },
    scrollview: {
        width:'100%',
    },
    noTasksText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'gray',
        textAlign: 'center',
        marginTop: 90,   // Ajuste para centralizar a mensagem
    }
});
