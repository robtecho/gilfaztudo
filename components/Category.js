import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Category({ Reload }) {
  const [createCategory, setCreateCategory] = useState(false);  // Controla a visibilidade do modal de criação de categoria
  const [deleteCategory, setDeleteCategory] = useState(false);  // Controla a visibilidade do modal de exclusão de categoria
  const [category, setCategory] = useState('');                 // Armazena o nome da nova categoria
  const [listOfCategory, setListOfCategory] = useState([]);     // Lista de categorias disponíveis

  // Função para obter categorias do AsyncStorage
  const getCategory = async () => {
    const value = await AsyncStorage.getItem('@logs_category');  // Obtém os dados do AsyncStorage
    if (value !== null) {
      try {
      const parsedValue = JSON.parse(value);               // Tenta fazer o parsing da string JSON armazenada
      console.log('Categorias carregadas:', parsedValue);  // Verifica o valor carregado
      
      // Filtra e retorna apenas categorias válidas
      return parsedValue.filter(category => typeof category === 'string');
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);  // Caso ocorra erro no parsing
        return [];    // Retorna um array vazio em caso de erro
      }
    }  
    return [];        // Retorna array vazio caso não haja categorias
  }; 

  // Função para armazenar dados no AsyncStorage
  const storeData = async (categories) => {
    try {
      console.log('Categorias sendo salvas:', categories);                       // Adiciona log para verificar os dados
      await AsyncStorage.setItem('@logs_category', JSON.stringify(categories));  // Salva as categorias no AsyncStorage
    } catch (error) {  
      console.error('Erro ao salvar categoria', error);                          // Log em caso de erro ao salvar
    }
  };
  
  // Função para criar uma nova categoria
  const createCategoryItem = async () => {
    const trimmedCategory = category.trim();  // Remove espaços extras ao redor
    if (trimmedCategory.length > 0) {         // Verifica se a categoria não está vazia
      const categories = await getCategory(); // Obtenha as categorias atuais

      // Verifica se a categoria já existe
      if (categories.includes(trimmedCategory)) {
        console.log('Categoria já existe:', trimmedCategory);  // Log se a categoria já existe
        return;                                                // Não cria a categoria se ela já existir
      }  

      categories.push(trimmedCategory); // Adiciona a nova categoria à lista

      await storeData(categories);      // Armazena novamente as categorias no AsyncStorage      
      setListOfCategory(categories);    // Atualiza a lista local com a nova categoria
      
      // Chama a função Reload para atualizar a lista no CreateTask.js
      if (Reload) {
        Reload(categories);
      }

      // Limpa o campo e fecha o modal
      setCategory(''); 
      setCreateCategory(false);

    } else {
      console.log('Categoria inválida (vazia)');   // Log caso a categoria seja inválida
    }
  };

  // Função para excluir uma categoria
  const deleteCategoryItem = async (categoryToDelete) => {
      // Impede a exclusão de "Nenhuma Selecionada"
      if (categoryToDelete === "Nenhuma Selecionada") {
        console.log("Não é possível excluir a categoria 'Nenhuma Selecionada'.");
        return;
      }

      // Verifica se a categoria existe na lista de categorias
      if (!categoryToDelete || !listOfCategory.includes(categoryToDelete)) {
        console.log("Categoria não encontrada ou inválida.");
        return;  // Caso não exista, não faz nada
      }
      
      // Filtra a categoria a ser excluída da lista
      const updatedCategories = listOfCategory.filter(item => item !== categoryToDelete);

      // Atualiza AsyncStorage e o estado local
      await storeData(updatedCategories);
      setListOfCategory(updatedCategories); 
      
      // Chama o Reload para atualizar a lista em CreateTask.js
      if (Reload) {   
        Reload(updatedCategories);
      }

      console.log('Categoria removida com sucesso:', categoryToDelete);  // Log da categoria removida
  };

  // Hook useEffect para carregar as categorias assim que o componente for montado
  useEffect(() => {
    const loadCategories = async () => {
      const categories = await getCategory();   // Obtém as categorias
      // Remove "Nenhuma Selecionada" da lista de categorias que podem ser removidas
      const validCategories = categories.filter(category => category !== "Nenhuma Selecionada");
      setListOfCategory(validCategories); // Atualiza a lista sem "Nenhuma Selecionada"
      console.log('Categorias carregadas e ordenadas:', validCategories);   // Log para verificar
    };

    loadCategories();  // Carrega as categorias ao montar o componente
  }, []);  // O array vazio significa que o código será executado apenas uma vez, na montagem do componente

  return (
    <>
      {/* Modal para criação de nova categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createCategory}
        onRequestClose={() => setCreateCategory(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Criar Nova Categoria:</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => {
                setCategory(text)     // Atualiza o estado com o texto digitado
                console.log(text)     // Exibe o valor digitado no console
              }}  
              value={category}        // Garante que category sempre seja uma string
              placeholder="Nova Categoria ..."
            />
            <View style={styles.novaCategoria_button_container}>
              <Pressable
                style={[styles.buttonClose]}
                onPress={() => {
                  createCategoryItem()          // Cria a categoria
                  setCreateCategory(false)      // Fecha o modal
                }}>
                <Text style={styles.textStyle}>Criar</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonClose]}
                onPress={() => setCreateCategory(false)}>
                <Text style={styles.textStyle}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para deletar categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteCategory}
        onRequestClose={() => setDeleteCategory(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Selecione a Categoria que deseja Remover:</Text>
            <ScrollView style={styles.listOfCategory_container}>
              {listOfCategory.length > 0 ? (
                listOfCategory.map((item, index) => (
                  <Pressable
                    onPress={() => deleteCategoryItem(item)}  // Exclui a categoria ao clicar
                    style={styles.listOfCategory}
                    key={index}>
                    <Text style={{ textAlign: 'center', fontFamily: 'Montserrat', fontSize: 16 }}>
                      {item}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noCategoriesText}>Nenhuma categoria encontrada</Text>
              )}
            </ScrollView>
            {/* Botão de fechar no canto inferior com "Cancelar" */}
            <Pressable
              style={[styles.buttonClose]}
              onPress={() => setDeleteCategory(false)}>
              <Text style={styles.textStyle}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Botões para abrir os modais de criação e exclusão */}
      <View style={styles.categoria_button_container}>
        <Pressable style={styles.categoria_button} onPress={() => setCreateCategory(true)}>
          <Text style={styles.categoria_button_text}>Nova Categoria</Text>
        </Pressable>
        <Pressable
          style={styles.categoria_button}
          onPress={() => setDeleteCategory(true)}
        >  
          <Text style={styles.categoria_button_text}>Remover Categoria</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adiciona sobreposição escura para melhor contraste
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
    width: '85%',
    height: '72%',
    borderRadius: 10,             // Bordas arredondadas
    justifyContent: 'center',
    position: 'relative',         // Permite o posicionamento absoluto do botão de fechar
  },
  novaCategoria_button_container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',     // Alinha os botões no centro
    alignItems: 'center',
    width: '80%',                 // Para garantir que ocupe o espaço desejado
    marginTop: '10%',
  },
  categoria_button_container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',       // Centraliza os botões
    marginTop: '5%',
    marginBottom: 6,
    width: '100%',              // Garantir que o contêiner ocupe toda a largura disponível
  },
  categoria_button: {
    backgroundColor: '#000fff', // Cor de fundo do botão
    elevation: 10,              // Sombra do botão (Android)
    borderRadius: 20,           // Bordas arredondadas
    padding: 10,                // Padding para o botão
    alignItems: 'center',       // Centraliza o texto dentro do botão
    justifyContent: 'center',   // Garante que o texto seja centralizado verticalmente
    marginHorizontal: 5,        // Margem entre os botões
  },
  categoria_button_text: {
    color: 'white',
    fontFamily: 'Montserrat',
    fontSize: 16, 
    textAlign: 'center', 
  },
  buttonClose: {
    backgroundColor: '#00b4fc',
    elevation: 10,
    borderRadius: 15,
    color: 'white',
    fontFamily: 'Montserrat',
    padding: 12,
    margin: '10%',
    width: '60%',               // Aumenta a largura do botão
    marginHorizontal: 7,        // Ajusta a margem entre os botões
  },
  modalText: {
    fontFamily: 'Montserrat',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: '15%',
  },
  input: {
    borderWidth: 1,
    width: '100%',
    borderRadius: 20,
    padding: 12,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
    fontFamily: 'Montserrat',
    fontSize: 15,
  },
  textStyle: {
    color: 'white',
    fontFamily: 'Montserrat',
    fontSize: 17,
    textAlign: 'center',
  },
  listOfCategory: {
    textAlign: 'center',
    padding: 10,
    borderWidth: 0.25,
    borderRadius: 10,
    marginVertical: 7,
    width: '95%',
    alignSelf: 'center',
  },
  listOfCategory_container: {
    display: 'flex',
    marginTop: -20,
  },
  noCategoriesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
});