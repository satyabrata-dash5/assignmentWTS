import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

const MainStack = () => {
    return (
        <Stack.Navigator initialRouteName="BottomTabs" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BottomTabs" component={BottomTabs} />
            {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
        </Stack.Navigator>
    )
}

export default MainStack
