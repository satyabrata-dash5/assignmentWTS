import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import MainStack from './src/navigation/MainStack';
import RootStack from './src/navigation/RootStack';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);


  if (initializing) return null;
  return (
    <NavigationContainer>
      {user ? <MainStack /> : <RootStack />}
    </NavigationContainer>
  )
}

export default App
