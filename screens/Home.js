import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../config/firebase';
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import colors from '../colors';

// Mapeamento dos emojis correspondentes aos tipos de grupo
const categoryEmojis = {
    'Jogos': '🎮',
    'Futebol': '⚽',
    'Basquete': '🏀',
    'Natação': '🏊',
    'Livros': '📚',
    'Jornal': '📰',
    'Televisão': '📺',
    'Religião': '⛪',
    'Estudos': '📖',
};

const Home = () => {
    const navigation = useNavigation();
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, 'groups'));
                const groupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGroups(groupsData);
            } catch (error) {
                console.error('Error fetching groups: ', error);
            }
        };

        fetchGroups();
    }, []);

    const renderGroupItem = ({ item }) => (
        <TouchableOpacity
            style={styles.groupContainer}
            onPress={() => navigation.navigate("Chat", { groupId: item.id })}
        >
            <View style={styles.groupHeader}>
                <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{categoryEmojis[item.category]}</Text>
                </View>
                <Text style={styles.groupTitle}>{item.title}</Text>
            </View>
            <View>
            <Text style={styles.groupDesc}>{item.description}</Text>
            </View>
            <TouchableOpacity style={styles.enterButton} onPress={() => navigation.navigate("Chat", { groupId: item.id })}>
                <Text style={styles.enterButtonText}>Entrar no grupo</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={groups}
                keyExtractor={item => item.id}
                renderItem={renderGroupItem}
                numColumns={2}
            />
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f2f2", // Altera o background da view para #f1f2f2
    },
    groupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        margin: 10,
        padding: 20,
        borderRadius: 25,
        backgroundColor: "#fff", // Fundo totalmente branco para os grupos
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    emojiContainer: {
        width: 40,
        height: 40,
        borderRadius: 20, // Fundo branco circular
        backgroundColor: colors.lightBlue, // Fundo azul para o emoji
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    emoji: {
        fontSize: 20,
        color: '#fff', // Cor do emoji branca para contrastar com o fundo azul
    },
    groupTitle: {
        fontSize: 12, // Diminui o tamanho do título
        fontWeight: 'bold',
        maxWidth: 120, // Define a largura máxima para o título
        overflow: 'hidden', // Oculta qualquer texto que exceda a largura máxima
    },
    groupDesc: {
        fontSize: 10,
        color: 'gray', // Cor cinza para a descrição do grupo
        height: 40,
    },
    enterButton: {
        backgroundColor: colors.lightBlue, // Fundo azul claro
        borderRadius: 30, // Bordas bem arredondadas
       // paddingHorizontal: 20,
       // paddingVertical: 8,
       marginVertical: 10,
       justifyContent: 'center',
       alignItems: 'center',
       width: 150,
       height: 30,

    },
    enterButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
});
