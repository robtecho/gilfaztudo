import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import React from 'react';

// Função para formatar a data
function parseDate(date){
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return null;           // Verifica se a data é válida
  const day = parsedDate.getUTCDate();
  const month = parsedDate.getUTCMonth() + 1;   // Meses começam do 0, então somamos 1
  const year = parsedDate.getFullYear();
  return `${day}/${month}/${year}`;             // Retorna a data no formato "dd/mm/aaaa"
}

// Função para formatar o horário
function parseTime(time){
  if (!time) return null;                // Retorna null se o horário não for fornecido
  const parsedTime = new Date(time);
  if (isNaN(parsedTime)) return null;    // Verifica se a hora é válida

  let hours = parsedTime.getHours();
  let minutes = parsedTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';            // Determina AM ou PM
  hours = hours % 12;
  hours = hours ? hours : 12;                        // Corrige a hora "0" para "12"
  minutes = minutes < 10 ? '0' + minutes : minutes;  // Adiciona zero à esquerda se os minutos forem menores que 10
  return `${hours}:${minutes} ${ampm}`;              // Retorna o horário no formato "hh:mm AM/PM"
}

// Componente principal que exibe os detalhes de uma tarefa
export default function Details({modal, setModal}) {
  const { content } = modal;

  // Verifica se `content` existe antes de tentar acessar suas propriedades 
  if (!content) {
    return <Text>Erro: Nenhuma tarefa selecionada!</Text>;   // Exibe uma mensagem de erro se não houver conteúdo
  }

  // Formatação de data e hora com as funções de parsing
  const displayDate = content.deadline_date ? parseDate(content.deadline_date) : null;
  const displayTime = content.deadline_time ? parseTime(content.deadline_time) : null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modal.visible}
      onRequestClose={() => {
        setModal({
          visible: false,     // Fecha o modal ao pressionar a área externa
          content: {}         // Limpa o conteúdo ao fechar
        });
      }}>
      
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Botão de fechar o modal */}
          <Pressable
            onPress={() => setModal({visible: false, content: {}})}   // Fecha o modal ao clicar no ícone
            style={styles.closeButton}>
            <MaterialCommunityIcons name="close-octagon" size={38} color="red" />
          </Pressable>

          {/* Exibe as informações detalhadas da tarefa */}
          <View style={styles.details_item}>
            <Text style={styles.title}>Categoria:</Text>
            <Text style={styles.description}>{modal.content.category || 'Sem Categoria'}</Text>
          </View>

          <View style={styles.details_item}>
            <Text style={styles.title}>Prioridade:</Text>
            {modal.content.priority === 1 && <Text style={styles.description}>Alta</Text>}
            {modal.content.priority === 2 && <Text style={styles.description}>Média</Text>}
            {modal.content.priority === 3 && <Text style={styles.description}>Baixa</Text>}
          </View>
          
          <View style={styles.details_item}>
            <Text style={styles.title}>Prazo:</Text>
            {displayDate ? (
              <Text style={styles.description}>{displayDate}</Text>
            ) : (
              <Text style={styles.description}>Sem Data</Text>
            )}
            {displayTime ? (
              <Text style={styles.description}>{displayTime}</Text>
            ) : (
              <Text style={styles.description}>Sem Horário</Text>
            )}  
          </View>

          <View style={styles.details_item}>
            <Text style={styles.title}>Descrição:</Text>
            <Text style={styles.description}>{modal.content.description || 'Sem Descrição'}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',               // Centraliza verticalmente
    alignItems: 'center',                   // Centraliza horizontalmente
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Adiciona sobreposição escura para melhor contraste
  },
  modalView: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,                         // Adiciona um espaço no topo
    alignItems: 'center',                   // Centraliza o conteúdo dentro do modal
    justifyContent: 'center',               // Garante que o conteúdo esteja centralizado verticalmente
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',                           // Controla a largura do modal
    maxWidth: 400,                          // Largura máxima para evitar que o modal se estique demais
    borderRadius: 10,                       // Bordas arredondadas para um visual mais suave
  },
  closeButton: {
    position: 'absolute',                   // Posiciona o ícone de fechar de forma absoluta
    top: 10,                                // Posiciona o ícone de fechar no topo
    right: 10,                              // Posiciona o ícone de fechar à direita
  },
  title: {
    color: '#00b4fc',
    textAlign: 'center',                    // Centraliza o texto do título
    fontSize: 24,                           // Tamanho da fonte para o título
    marginBottom: 5,                        // Espaço entre o título e a descrição
  },
  details_item: {
    width: '100%',
    alignItems: 'center',                   // Centraliza os itens de detalhe
    marginBottom: 15,                       // Espaço entre os itens de detalhe
  },
  description: {
    fontSize: 18,                           // Tamanho da fonte para a descrição
    color: '#333',                          // Cor do texto da descrição
    textAlign: 'center',                    // Garante que a descrição esteja centralizada
  },
});

