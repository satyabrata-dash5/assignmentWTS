import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
//import Auth from '../Store/auth';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const onSignup = () => {
    if (!name.trim()) {
      alert('Please Enter Name');
      return;
    }
    if (!email.trim()) {
      alert('Please Enter Email');
      return;
    }
    if (!password.trim()) {
      alert('Please Enter Password');
      return;
    }
    if (!confirmPassword.trim()) {
      alert('Please Enter confirmPassword');
      return;
    }
    setIsLoading(true);
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(async (result) => {
        console.log("Result", result);
        let userObj = {
          id: result.user.uid,
          name: name,
          email: email,
          password: password,
          confirmPassword: confirmPassword
        };
        firestore()
          .collection('Users')
          .doc(result.user.uid)
          .set(userObj)
          .then((userInfo) => {
            console.log(userInfo);
          })
          .then(() => {
            console.log('User added!');
            navigation.navigate('BottomTabs')
          });
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
        if (error.code === 'auth/unknown') {
          console.log('Internet not available !');
          alert('Internet not available ! Please Turn on Mobile Internet or Wifi')
        }
        if (error.code === 'auth/weak-password') {
          console.log('Password weak!');
          alert('Password should be at least 6 characters and includes upper-case letters, lower-case letters, a symbol, and some numbers')
        }
        console.error(error);
        setIsLoading(false);
        //setError(error);
      });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e64e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create an account</Text>

      <FormInput
        labelValue={name}
        onChangeText={(userName) => setName(userName)}
        placeholderText="Full name"
        iconType="account-outline"
        keyboardType={'default'}
        autoCapitalize="none"
        autoCorrect={false}
      />
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
        keyboardType={'default'}
      />

      <FormInput
        labelValue={confirmPassword}
        onChangeText={(userPassword) => setConfirmPassword(userPassword)}
        placeholderText="Confirm Password"
        iconType="lock-outline"
        secureTextEntry={true}
        keyboardType={'default'}
      />

      <FormButton
        buttonTitle="Sign Up"
        onPress={() => onSignup()

          //   Auth.signUp(email, password).then(
          //   alert('Successfully Created'),
          //   navigation.navigate('login')
          // )
        }
      />

      <View style={styles.textPrivate}>
        <Text style={styles.color_textPrivate}>
          By registering, you confirm that you accept our{' '}
        </Text>
        <TouchableOpacity onPress={() => alert('Terms Clicked!')}>
          <Text style={[styles.color_textPrivate, { color: '#e88832' }]}>
            Terms of service
          </Text>
        </TouchableOpacity>
        <Text style={styles.color_textPrivate}> and </Text>
        <Text style={[styles.color_textPrivate, { color: '#e88832' }]}>
          Privacy Policy
        </Text>
      </View>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('login')}>
        <Text style={styles.navButtonText}>Have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafd',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
  },
  navButton: {
    marginTop: 15,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 35,
    justifyContent: 'center',
  },
  color_textPrivate: {
    fontSize: 13,
    fontWeight: '400',
    color: 'grey',
  },
});
