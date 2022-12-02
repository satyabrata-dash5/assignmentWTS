import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  ScrollView
} from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState({
    secureTextEntry: true,
    confirm_secureTextEntry: true,
    isValidEmail: true,
    isValidPassword: true,
    isValidName: true,
  });

  const [isLoading, setIsLoading] = useState(false);


  const onSignin = () => {
    if (!email.trim()) {
      alert('Please Enter Email');
      return;
    }
    if (!password.trim()) {
      alert('Please Enter Password');
      return;
    }
    setIsLoading(true);
    auth()
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        console.log('User signed in!', res);
        navigation.navigate('BottomTabs')
        setIsLoading(false);
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
          alert('That email address is already in use!')
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
          alert('That email address is invalid!')
        }

        if (error.code === 'auth/wrong-password') {
          console.log('That Password is invalid!');
          alert('That Password is invalid or Wrong Password !')
        }
        if (error.code === 'auth/unknown') {
          console.log('Internet not available !');
          alert('Internet not available ! Please Turn on Mobile Internet or Wifi')
        }
        if (error.code === 'auth/user-not-found') {
          console.log('No Record Found !');
          alert('No Record Found ? Please Register Yourself ! ')
        }

        console.error(error);
        setIsLoading(false);
        //setError(error);
      });

  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/webskitters-logo.png')}
        style={styles.logo}
      />
      <Text style={styles.text}>Webskitters App</Text>

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="email-outline"
        keyboardType={"email-address"}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Password"
        iconType="lock-outline"
        secureTextEntry={true}
      />

      <FormButton
        buttonTitle="Sign In"
        onPress={() => onSignin()}
      />

      <TouchableOpacity style={styles.forgotButton} onPress={() => { }}>
        <Text style={styles.navButtonText}>Forgot Password?</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={styles.forgotButton}
        onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.navButtonText}>
          Don't have an acount? Create here
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  logo: {
    height: 250,
    width: 300,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
  },
  navButton: {
    marginTop: 15,
  },
  forgotButton: {
    marginVertical: 35,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',

  },
});
