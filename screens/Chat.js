import React, { useState, useEffect, useLayoutEffect, useCallback, useContext } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Bubble, GiftedChat, Send, Avatar } from 'react-native-gifted-chat'; 
import { collection, addDoc, orderBy, query, onSnapshot, doc, collectionGroup, getDoc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../colors';

export default function Chat({ route }) {
    const { groupId } = route.params; 
    const [messages, setMessages] = useState([]);
    const [groupInfo, setGroupInfo] = useState({});
    const navigation = useNavigation();

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

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
                            <Text style={{ fontSize: 12, marginLeft: 10, color: 'gray' }}>{groupInfo.members ? `${groupInfo.members.length} membros` : ''}</Text>
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
                        _id: doc.data().user._id,
                        name: doc.data().user._id,
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

    const onPressUserAvatar = async (user) => {
        console.log('ID do usuário selecionado:', user._id);
        console.log('ID do usuário logado:', auth?.currentUser?.email);
        // Aqui você deve redirecionar para o chat privado
        // Verifique se o usuário está autenticado
        if (auth.currentUser) {
            // Crie a referência para o chat privado
            const privateChatId = `${auth.currentUser.email}_${user._id}`;
            navigation.navigate('PrivateChat', { privateChatId: privateChatId });
        } else {
            // O usuário não está autenticado, você pode redirecioná-lo para a página de login
            navigation.navigate('Login');
        }
    };

    const renderAvatar = (props) => {
        const { currentMessage } = props;
        return (
            <TouchableOpacity onPress={() => onPressUserAvatar(currentMessage.user)}>
                <Avatar {...props} />
            </TouchableOpacity>
        );
    };

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
            renderAvatar={renderAvatar} 
        />
    );
}
