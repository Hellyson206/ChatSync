import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { AuthenticatedUserContext } from '../App';
import { database } from '../config/firebase';

export default function PrivateChat({ route, navigation }) {
    const { user } = useContext(AuthenticatedUserContext);
    const { otherUserId } = route.params;
    const [privateChatId, setPrivateChatId] = useState(null);

    useEffect(() => {
        const fetchPrivateChat = async () => {
            try {
                // Procura por um chat privado entre os dois usuários
                const q = query(collection(database, 'privateChats'), 
                                where('users', '==', [user.uid, otherUserId]));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    // Se já existe um chat privado, obtém o ID
                    querySnapshot.forEach(doc => {
                        setPrivateChatId(doc.id);
                    });
                } else {
                    // Se não existe, cria um novo chat privado
                    const newPrivateChatRef = await addDoc(collection(database, 'privateChats'), {
                        users: [user.uid, otherUserId]
                    });
                    setPrivateChatId(newPrivateChatRef.id);
                }
            } catch (error) {
                console.error('Error fetching private chat:', error);
            }
        };

        if (user && otherUserId) {
            fetchPrivateChat();
        }
    }, [user, otherUserId]);

    const handleStartChat = () => {
        navigation.navigate('Chat', { chatId: privateChatId });
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Chat privado com o usuário {otherUserId}</Text>
            <Button title="Iniciar Chat" onPress={handleStartChat} />
        </View>
    );
}
