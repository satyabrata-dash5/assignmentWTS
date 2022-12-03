import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { windowHeight, windowWidth } from '../utils/Dimentions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [data, setData] = useState({
    secureTextEntry: true,
    confirm_secureTextEntry: true,
    isValidEmail: true,
    isValidPassword: true,
    isValidName: true,
  });
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

  const handleValidUser = (val) => {
    if (val && val.trim().length >= 4) {
      setData({
        ...data,
        email: val,
        isValidEmail: true
      });
    } else {
      setData({
        ...data,
        email: val,
        isValidEmail: false
      });
    }
  }
  const handlePasswordChange = (val) => {
    if (val.trim().length >= 6) {
      setData({
        ...data,
        password: val,
        isValidPassword: true
      });
    } else {
      setData({
        ...data,
        password: val,
        isValidPassword: false
      });
    }
  }
  const handleNameChange = (val) => {
    if (val.trim().length >= 4) {
      setData({
        ...data,
        name: val,
        isValidName: true
      });
    } else {
      setData({
        ...data,
        name: val,
        isValidName: false
      });
    }
  }

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry
    });
  }

  const updateConfirmSecureTextEntry = () => {
    setData({
      ...data,
      confirm_secureTextEntry: !data.confirm_secureTextEntry
    });
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e64e5" />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>Create an account</Text>

      <FormInput
        labelValue={name}
        onChangeText={(userName) => setName(userName)}
        placeholderText="Full name"
        iconType="account-outline"
        keyboardType={'default'}
        autoCapitalize="none"
        autoCorrect={false}
        onEndEditing={(e) => handleNameChange(e.nativeEvent.text)}
      />

      {data.isValidName ? null :
        <View style={{ justifyContent: 'flex-start' }} >
          <Text style={styles.errorMsg}>Hey ! Name should not be empty.</Text>
        </View>}

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="email-outline"
        keyboardType={"email-address"}
        autoCapitalize="none"
        autoCorrect={false}
        onEndEditing={(e) => handleValidUser(e.nativeEvent.text)}
      />

      {data.isValidEmail ? null :
        <View style={{ justifyContent: 'flex-start' }} >
          <Text style={styles.errorMsg}>Hey ! Email should not be empty.</Text>
        </View>
      }


      <View style={styles.inputContainer}>
        <View style={styles.iconStyle}>
          <MaterialCommunityIcons name={'lock-outline'} size={25} color="#666" />
        </View>
        <TextInput
          value={password}
          style={styles.input}
          numberOfLines={1}
          placeholder='Password'
          placeholderTextColor="#666"
          keyboardType="default"
          secureTextEntry={data.secureTextEntry ? true : false}
          autoCapitalize="none"
          onChangeText={(userPassword) => setPassword(userPassword)}
          onEndEditing={(e) => handlePasswordChange(e.nativeEvent.text)}
        />
        <TouchableOpacity
          onPress={updateSecureTextEntry}
        >
          {data.secureTextEntry ?
            <Ionicons
              name="eye-off"
              color="#2e64e5"
              size={20}
            />
            :
            <Ionicons
              name="eye"
              color="#2e64e5"
              size={20}
            />
          }
        </TouchableOpacity>
      </View>

      {data.isValidPassword ? null :
        <View style={{ justifyContent: 'flex-start' }} >
          <Text style={styles.errorMsg}>Password must be 6 characters long.</Text>
        </View>
      }

      <View style={styles.inputContainer}>
        <View style={styles.iconStyle}>
          <MaterialCommunityIcons name={'lock-outline'} size={25} color="#666" />
        </View>
        <TextInput
          value={confirmPassword}
          style={styles.input}
          numberOfLines={1}
          placeholder="Confirm Password"
          placeholderTextColor="#666"
          keyboardType="default"
          secureTextEntry={data.confirm_secureTextEntry ? true : false}
          autoCapitalize="none"
          onChangeText={(userConfirmPassword) => setConfirmPassword(userConfirmPassword)}
          onEndEditing={(e) => handlePasswordChange(e.nativeEvent.text)}
        />
        <TouchableOpacity
          onPress={updateConfirmSecureTextEntry}
        >
          {data.confirm_secureTextEntry ?
            <Ionicons
              name="eye-off"
              color="#2e64e5"
              size={20}
            />
            :
            <Ionicons
              name="eye"
              color="#2e64e5"
              size={20}
            />
          }
        </TouchableOpacity>
      </View>

      <FormButton
        buttonTitle="Sign Up"
        onPress={() => onSignup()
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
      {/* </View> */}
    </KeyboardAwareScrollView>
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
  inputContainer: {
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    height: windowHeight / 15,
    borderColor: '#ccc',
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingRight: 10
  },
  iconStyle: {
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightColor: '#ccc',
    borderRightWidth: 1,
    width: 50,
  },
  input: {
    padding: 10,
    flex: 1,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorMsg: {
    color: '#FF0000',
    fontSize: 14,
    paddingLeft: 20,
  },
});
