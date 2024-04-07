import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert, ScrollView } from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  setDoc
} from 'firebase/firestore';


const logoImage = require("../assets/chatLogo.jpeg");

export default function Signup({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);

  const recommendationsData = [
    { type: '🎮', text: 'Jogos' },
    { type: '⚽', text: 'Futebol' },
    { type: '🏀', text: 'Basquete' },
    { type: '🏊', text: 'Natação' },
    { type: '📚', text: 'Livros' },
    { type: '📰', text: 'Jornal' },
    { type: '📺', text: 'Televisão' },
    { type: '⛪', text: 'Religião' },
    { type: '📖', text: 'Estudos' },
  ];

  const onHandleSignup = () => {
  if (email !== '' && password !== '' && selectedRecommendations.length > 0) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setDoc(collection(database, 'users', userCredential.user.uid), {
          email: email,
          recommendations: selectedRecommendations.map(recommendation => recommendation.text)
        });
        console.log('Cadastro realizado com sucesso');
      })
      .catch((err) => Alert.alert("Erro no cadastro", err.message));
  } else {
    Alert.alert("Erro no cadastro", "Por favor, preencha todos os campos e selecione pelo menos uma recomendação.");
  }
};

  const saveUserWithRecommendations = (userId) => {
    // Salvando o usuário com recomendações no Firebase
    const userRef = database.collection('users').doc(userId);
    userRef.set({
      email: email,
      recommendations: selectedRecommendations.map(recommendation => recommendation.text)
    }, { merge: true }); // Use merge: true para não sobrescrever outros campos do documento
  };

  const toggleRecommendation = (recommendation) => {
    if (selectedRecommendations.includes(recommendation)) {
      setSelectedRecommendations(selectedRecommendations.filter(rec => rec !== recommendation));
    } else {
      setSelectedRecommendations([...selectedRecommendations, recommendation]);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Cadastre-se</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Digite a senha"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <Text style={styles.subtitle}>Recomendações:</Text>
        <Text style={styles.subsubtitle}>Selecione pelo menos um dos itens de seu interesse e iremos personalizar sua experiência aqui.</Text>
        <View style={styles.recommendationContainer}>
          {recommendationsData.map((recommendation, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.recommendationItem,
                selectedRecommendations.includes(recommendation.text) && styles.selectedRecommendationItem,
                (index + 1) % 3 !== 0 && styles.itemMarginRight // Adicione margem à direita para itens que não são o último de cada linha
              ]}
              onPress={() => toggleRecommendation(recommendation.text)}>
              <Text style={[styles.recommendationIcon, selectedRecommendations.includes(recommendation.text) && styles.selectedRecommendationText]}>{recommendation.type}</Text>
              <Text style={[styles.recommendationText, selectedRecommendations.includes(recommendation.text) && styles.selectedRecommendationText]}>{recommendation.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Cadastrar</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
          <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Já possui uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: '#4a86f7', fontWeight: '600', fontSize: 14 }}> Faça Login</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar barStyle="light-content" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a86f7',
    alignSelf: "center",
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#000",
    alignSelf: "center",
    marginBottom: 10,
  },
  subsubtitle: {
    fontSize: 14,
    color: "gray",
    alignSelf: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  backImage: {
    width: 200,
    height: 80,
    position: "absolute",
    top: 0,
    resizeMode: 'cover',
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#4a86f7',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  recommendationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  recommendationItem: {
    width: 100,
    height: 50,
    backgroundColor: '#F6F7FB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    flexDirection: 'row',
    padding: 5,
  },
  selectedRecommendationItem: {
    backgroundColor: '#4a86f7', // Altera a cor de fundo para azul quando selecionado
  },
  itemMarginRight: {
    marginRight: 10, // Margem à direita para os itens que não são o último de cada linha
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5, // Ajuste conforme necessário
  },
  logoImage: {
    width: '80%', // Define a largura como 60% da largura da tela
    aspectRatio: 1, // Mantém a proporção da imagem
    resizeMode: 'contain', // Redimensiona a imagem para caber dentro do espaço definido
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: 5,
  },
  recommendationText: {
    fontSize: 14,
    marginTop: 5,
  },
  selectedRecommendationText: {
    color: '#fff', // Altera a cor do texto para branco quando selecionado
  },
});
