import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, doc, collectionGroup, getDoc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../colors';

export default function Chat({ route }) {
    const { groupId } = route.params; // Assumindo que groupId é passado como parâmetro de navegação
    const [messages, setMessages] = useState([]);
    const [groupInfo, setGroupInfo] = useState({});
    const navigation = useNavigation();

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    // Busca as informações do grupo
    useEffect(() => {
        const fetchGroupInfo = async () => {
            try {
                const docRef = doc(database, 'groups', groupId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setGroupInfo(docSnap.data());
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching group info: ', error);
            }
        };

        fetchGroupInfo();
    }, [groupId]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.goBack()}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name="angle-left" size={24} color={colors.gray} />
                    <View>
                     <Text style={{ fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>{groupInfo.title}</Text>
                <View>
                <Text style={{ fontSize: 12, marginLeft: 10, color: 'gray' }}>{groupInfo.members ? `${groupInfo.members.length} membros` : ''}</Text>
                </View>
                </View>
                    </View>
                </TouchableOpacity>
            ),
            headerTitle: () => (
                <View>
                </View>
            ),
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 10 }}
                    onPress={onSignOut}
                >
                    <AntDesign name="logout" size={24} color={colors.gray} />
                </TouchableOpacity>
            )
        });
    }, [navigation, groupInfo]);

    // Busca e exibe as mensagens do grupo
    useEffect(() => {
        const messagesRef = collection(database, `groups/${groupId}/messages`);
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, querySnapshot => {
            setMessages(
                querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: {
                    _id: doc.data().user._id, // _id do usuário
                    name: doc.data().user._id, // Use _id como name
                    avatar: doc.data().user.avatar
                    }
                })).reverse()
            );
        });

        return unsubscribe;
    }, [groupId]);

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages)
        );
        const { _id, createdAt, text, user } = messages[0];
        addDoc(collection(database, `groups/${groupId}/messages`), {
            _id,
            createdAt,
            text,
            user
        });
    }, [groupId]);

    const renderSend = (props) => {
        return(
            <Send {...props}>
                <View>
                    <MaterialCommunityIcons
                    name='send-circle'
                    style={{marginBottom: 5, marginRight: 5}}
                    size={32}
                    color= '#2e64e5'
                    />
                </View>
            </Send>
        );
    };

    const renderBubble = (props) => {
        return (
            <Bubble 
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: '#2e64e5'
                }
            }}
            textStyle={{
                right: {
                    color: '#fff'
                }
            }}
            />
        );
    }

    return (
        <GiftedChat
            messages={messages}
            showAvatarForEveryMessage={false}
            showUserAvatar={false}
            onSend={messages => onSend(messages)}
            renderUsernameOnMessage={true}
            alwaysShowSend
            placeholder='Digite sua mensagem'
            messagesContainerStyle={{
                backgroundColor: colors.lightGray
            }}
            textInputStyle={{
                backgroundColor: '#fff',
                borderRadius: 20,
            }}
            user={{
                _id: auth?.currentUser?.email,
                avatar: 'https://i.pravatar.cc/210',
            }}
            renderBubble={renderBubble}
            renderSend={renderSend}
        />
    );
}
