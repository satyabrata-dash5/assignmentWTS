import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import {
    useTheme,
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';
import firestore from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';

export function SideDrawerContent(props) {
    const [userDetails, setUserDetails] = useState({});

    useEffect(() => {
        const currentUserId = auth().currentUser ? auth().currentUser.uid : "";

        if (currentUserId) {
            firestore().collection("Users").where('id', '==', currentUserId)
                .get()
                .then((result) => {
                    result.forEach(doc => {

                        setUserDetails(doc._data)
                        //console.log("userDetails",userDetails)
                    })

                })
        }
    });

    const onSignout = () => {
        auth()
            .signOut()
            .then((res) => {
                console.log('User signed out!', res);
                //props.navigation.navigate('SignIn')
                alert('Signout Successfully')
            });
    }

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['#694fad', '#b06ab3']} style={styles.linearGradient}>
                <View style={styles.userInfoSection}>
                    <View style={{ marginTop: 15 }}>
                        <Image
                            source={{ uri: userDetails.profileImageUrl }}
                            style={styles.profile} />

                        <Text style={styles.title}>{userDetails.name}</Text>
                    </View>
                </View>
            </LinearGradient>
            <DrawerContentScrollView {...props} >
                <View style={styles.drawerContent}>

                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <Icon
                                    name="home-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Home"
                            onPress={() => { props.navigation.navigate('Home') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <Icon
                                    name="account-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="My Profile"
                            onPress={() => { props.navigation.navigate('Profile') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <Icon
                                    name="bookmark-check-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="My Bookings"
                            onPress={() => { props.navigation.navigate('Bookings') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <Icon
                                    name="heart-box-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="My Wishlist"
                            onPress={() => { props.navigation.navigate('WishlistScreen') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <Icon
                                    name="chat-processing-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Contact Us"
                            onPress={() => { props.navigation.navigate('SupportScreen') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <Icon
                                    name="cog-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Settings"
                            onPress={() => { props.navigation.navigate('SettingScreen') }}
                        />

                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem
                    icon={({ color, size }) => (
                        <Icon
                            name="exit-to-app"
                            color={color}
                            size={size}
                        />
                    )}
                    label="Sign Out"
                    onPress={onSignout}
                />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
    },
    title: {
        fontSize: 20,
        marginVertical: 8,
        fontWeight: '800',
        color: "#FFF",
    },
    caption: {
        fontSize: 20,
        lineHeight: 14,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3,
    },
    drawerSection: {
        marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    linearGradient: {
        width: undefined,
        //padding: 15,

    },
    profile: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: "#FFF",
    },
});