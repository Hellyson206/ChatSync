import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { FontAwesome } from '@expo/vector-icons';
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
    const [userGroups, setUserGroups] = useState([]);
    const [otherGroups, setOtherGroups] = useState([]);


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

    useEffect(() => {
        // Filtrar grupos do usuário atual
        const currentUserGroups = groups.filter(group => group.members.includes(currentUserEmail));
        setUserGroups(currentUserGroups);

        // Filtrar outros grupos
        const otherUserGroups = groups.filter(group => !group.members.includes(currentUserEmail));
        setOtherGroups(otherUserGroups);
    }, [groups]);

    const currentUserEmail = auth?.currentUser?.email; // Substitua com o email do usuário atual

    useEffect(() => {
        const fetchLastMessage = async () => {
            try {
                if (userGroups.length > 0) {
                    const firstUserGroup = userGroups[0];
                    const q = query(
                        collection(database, `groups/${firstUserGroup.id}/messages`),
                        orderBy('createdAt'),
                        limit(1)
                    );
                    const querySnapshot = await getDocs(q);
                    const lastMessage = querySnapshot.docs[0]?.data().text || '';
                    const lastMessageDate = querySnapshot.docs[0]?.data().createdAt?.toDate() || '';
                    const lastMessageDateString = lastMessageDate ? formatLastMessageDate(lastMessageDate) : '';
                    setUserGroups(prevUserGroups => {
                        return prevUserGroups.map(group => {
                            if (group.id === firstUserGroup.id) {
                                return { ...group, lastMessage, lastMessageDate: lastMessageDateString };
                            }
                            return group;
                        });
                    });
                }
            } catch (error) {
                console.error('Error fetching last message: ', error);
            }
        };
    
        fetchLastMessage();
    }, [userGroups]);
    

    const renderUserGroupItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userGroupContainer}
            onPress={() => navigation.navigate("Chat", { groupId: item.id })}
        >
            <View style={styles.groupHeader}>
                <View style={styles.emojiContainerHeader}>
                    <Text style={styles.emoji}>{categoryEmojis[item.category]}</Text>
                </View>
                <View style={styles.groupDetails}>
                    <View style={styles.groupTitleContainer}>
                        <Text style={styles.MyGroupText}>{item.title}</Text>
                        <Text style={styles.lastMessageDate}>{item.lastMessageDate}</Text>
                    </View>
                    <Text style={styles.groupDesc}>{item.lastMessage}</Text>
                </View>
            </View>
            <View style={[{borderBottomWidth: 1, borderBottomColor: 'rgba(128, 128, 128, 0.5)' }]}></View>
        </TouchableOpacity>
    );

    // Função para formatar a data no formato "DD/MM/AAAA"
const formatLastMessageDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Os meses começam do zero, então é necessário adicionar 1
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

    const renderOtherGroupItem = ({ item }) => (
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
            {/* Adicionando o texto "Meus Grupos" */}
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Meus Grupos</Text>
                <TouchableOpacity onPress={() => console.log("Mostrar tudo")}>
                    <Text style={styles.showAllText}>Mostrar tudo</Text>
                </TouchableOpacity>
            </View>

            {/* Renderizar grupos do usuário */}
            <FlatList
                data={userGroups}
                keyExtractor={item => item.id}
                renderItem={renderUserGroupItem}
                contentContainerStyle={styles.userGroupsList}
            />

            <View style={{ marginVertical: 10 }}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>Explorar</Text>
                    <TouchableOpacity onPress={() => console.log("Mostrar tudo")}>
                        <Text style={styles.showAllText}>Mostrar tudo</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Renderizar outros grupos */}
            <FlatList
                data={otherGroups}
                keyExtractor={item => item.id}
                renderItem={renderOtherGroupItem}
                contentContainerStyle={styles.otherGroupsList}
                numColumns={2}
            />
        </View>
    );
};
export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f2f2", 
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    MyGroupText: {
        fontSize: 18,
        fontWeight: 'bold',
      //  marginTop: 10,
    },
    showAllText: {
        color: 'gray',
    },
    groupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        margin: 10,
        padding: 20,
        borderRadius: 25,
        backgroundColor: "#fff", // Fundo totalmente branco para os grupos
        maxWidth: 180,
    },
    userGroupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        margin: 10,
        paddingho: 20,
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
    emojiContainerHeader: {
        width: 60,
        height: 60,
        borderRadius: 40, // Fundo branco circular
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
        fontSize: 12,
        color: 'gray', // Cor cinza para a descrição do grupo
        height: 40,
        marginTop: 10,
        maxWidth: 400, // Define a largura máxima para o título
        overflow: 'hidden'
    },
    enterButton: {
        backgroundColor: colors.lightGreen, // Fundo azul claro
        borderRadius: 30, // Bordas bem arredondadas
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 140,
        height: 30,
    },
    enterButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    groupDetails: {
        flex: 1,
       // marginLeft: 10,
    },
    groupTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessageDate: {
        fontSize: 12,
        color: 'gray',
    },
});
