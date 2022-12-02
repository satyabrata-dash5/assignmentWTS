import * as React from 'react';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
//import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBfuK55QB43Qo2DND1Zd2_kykfY8qgpWIU",
    authDomain: "assignmentwts.firebaseapp.com",
    projectId: "assignmentwts",
    storageBucket: "assignmentwts.appspot.com",
    messagingSenderId: "696553089858",
    appId: "1:696553089858:web:cdcbc533c2de38cb2976db"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
export default () => {
    return { firebase, auth };
};