import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const createUserInDb = (uid, name, email) => {
    return firestore().collection('users').doc(uid).set(
        {
            uid,
            name,
            email
        }
    )
}



const signUp = (name, email, password) => {

    if (!name || !email || !password) {
        Alert.alert('Error', 'Input Missing!!!')
    }

    return auth().createUserWithEmailAndPassword(email, password)
        .then(cred => {
            const { uid } = cred.user;
            auth().currentUser.updateProfile({
                displayName: name
            })

            return uid
        })
        .catch(

            err => Alert.alert(err.code, err.message)
        )
        .then(uid => createUserInDb(uid, name, email))
        .catch(
            err => Alert.alert(err.code, err.message)
        )
}


const signIn = (email, password) => {
    if (!email || !password) {
        Alert.alert('Error', 'Please enter all fields')
    }

    return auth().signInWithEmailAndPassword(email, password)
        .then(() => { 'Welcome', 'Login Successull!!' })
        .catch(
            err => Alert.alert(err.code, err.message)
        )
}



const signOut = () => {
    return auth().signOut()
}

const Auth = {
    signUp,
    signIn,
    signOut,
}

export default Auth