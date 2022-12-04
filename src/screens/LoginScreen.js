import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput
} from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import auth from '@react-native-firebase/auth';
import { windowHeight, windowWidth } from '../utils/Dimentions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState({
    secureTextEntry: true,
    isValidEmail: true,
    isValidPassword: true,
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
          alert('That email address is already in use!')
        }

        if (error.code === 'auth/invalid-email') {
          alert('That email address is invalid!')
        }

        if (error.code === 'auth/wrong-password') {
          alert('That Password is invalid or Wrong Password !')
        }
        if (error.code === 'auth/unknown') {
          alert('Internet not available ! Please Turn on Mobile Internet or Wifi')
        }
        if (error.code === 'auth/user-not-found') {
          alert('No Record Found ? Please Register Yourself ! ')
        }

        console.error(error);
        setIsLoading(false);
        //setError(error);
      });
  }

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

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry
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
