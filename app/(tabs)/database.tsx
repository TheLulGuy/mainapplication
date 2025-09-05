import { TextInput, FlatList, TouchableOpacity, Text, SafeAreaView, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function TabTwoScreen() {
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState<any>([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const todosCollection = collection(db, 'todos');

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    if (user) {
      const q = query(todosCollection, where("userId", "==", user.uid));
      const data = await getDocs(q);
      setTodos(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } else {
      console.log("No user logged in");
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
    <SafeAreaView className='flex-1 bg-gray-100'>
      <View className='flex-1 items-center justify-center p-5'>
        <Text className='text-2xl font-bold mb-2 text-gray-800'>Todo List</Text>
        
        <View className='flex-row justify-between items-center w-full mb-4'>
          <TextInput
            placeholder="New Task"
            placeholderTextColor="#9CA3AF"
            value={task}
            onChangeText={(text) => setTask(text)}
            className='flex-1 h-10 border border-gray-300 px-3 mr-2 rounded-lg bg-white'
          />
          <TouchableOpacity 
            className='px-4 py-2 bg-orange-400 rounded-full items-center justify-center shadow-lg'
            onPress={addTodo}
          >
            <Text className='text-white text-lg font-semibold'>Add</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={todos}
          className='w-full'
          renderItem={({ item }) => (
            <View className='flex-row justify-between items-center my-2 p-3 bg-white rounded-lg shadow-sm'>
              <Text className={`flex-1 text-base ${item.completed ? 'line-through text-gray-500' : ''}`}>
                {item.task}
              </Text>
              
              <TouchableOpacity 
                className='px-3 py-2 bg-indigo-500 rounded-xl ml-2 shadow'
                onPress={() => updateTodo(item.id, item.completed)}
              >
                <Text className='text-white text-sm font-medium'>
                  {item.completed ? "Undo" : "Complete"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className='px-3 py-2 bg-red-500 rounded-xl ml-2 shadow'
                onPress={() => deleteTodo(item.id)}
              >
                <Text className='text-white text-sm font-medium'>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </SafeAreaView>
  );
}