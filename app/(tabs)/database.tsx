import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { db } from 'FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';


const Database = () => {
    const [task, setTask] = useState('');
    const [taskItems, setTodos] = useState<string[]>([]);
    const auth = getAuth();
    const user = auth.currentUser;
    const todosCollection = collection(db, 'todos');

    const fetchTodos = async () => {
        if (user) {
            // Fetch todos for the current user
            const q = query(todosCollection, where("userId", "==", user.uid));
            const data = await getDocs(q);
            const todosList = data.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTodos(todosList);
        }else{
            console.log('No user is signed in');
        }

    };
    const addTodo = async () => {
        if (user) {
            await addDoc(todosCollection, { task, completed: false, userId: user.uid });
            setTask('');
            fetchTodos();
        } else {
            console.log("No user logged in");
        }
    };

    const updateTodo = async (id: string, completed: any) => {
        const todoDoc = doc(db, 'todos', id);
        await updateDoc(todoDoc, { completed: !completed });
        fetchTodos();
    };

    const deleteTodo = async (id: string) => {
        const todoDoc = doc(db, 'todos', id);
        await deleteDoc(todoDoc);
        fetchTodos();
    };

    return (
        <SafeAreaView className='flex-1 items-center justify-center'>
            <Text className='text-2xl font-bold'>Database</Text>
        </SafeAreaView>
    )
}

export default Database

const styles = StyleSheet.create({})
