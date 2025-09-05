import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const Database = () => {
//   const [task, setTask] = useState('');
//   const [taskItems, setTodos] = useState<string[]>([]);
//   const auth = getAuth();
//   const user = auth.currentUser;
//   const todosCollection = collection(db, 'todos')

  
  return (
    <SafeAreaView className='flex-1 items-center justify-center'>
        <Text className='text-2xl font-bold'>Database</Text>

    </SafeAreaView>
  )
}

export default Database

const styles = StyleSheet.create({})

function getAuth() {
  throw new Error('Function not implemented.');
}
function collection(db: any, arg1: string) {
  throw new Error('Function not implemented.');
}

