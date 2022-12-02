import React from 'react'
import { View, TouchableOpacity, Image } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingScreen from '../screens/SettingScreen';
import CartScreen from '../screens/CartScreen';

const Tab = createMaterialBottomTabNavigator();

const BottomTabs = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            activeColor="#fff"
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarColor: '#2e64e5',
                    tabBarIcon: ({ color }) => (
                        <Icon name="ios-home" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarColor: '#2e64e5',
                    tabBarIcon: ({ color }) => (
                        <Icon name="ios-cart" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarColor: '#2e64e5',
                    tabBarIcon: ({ color }) => (
                        <Icon name="ios-cog" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarColor: '#2e64e5',
                    tabBarIcon: ({ color }) => (
                        <Icon name="ios-person" color={color} size={26} />
                    ),
                }}
            />

        </Tab.Navigator>
    )
}

export default BottomTabs