import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ImageBackground, Dimensions, Alert, Linking, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { FAB } from 'react-native-paper';
import FormInput from '../components/FormInput';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';

const H = Dimensions.get('window').height;
const W = Dimensions.get('window').width;

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [visibilityImageUploadModal, setVisibilityImageUploadModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productOfferPrice, setProductOfferPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const [fileURI, setFileURI] = useState('');
  const [fileName, setFileName] = useState('');
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    const currentUserId = auth().currentUser ? auth().currentUser.uid : "";
    if (currentUserId) {
      firestore().collection("Users").where('id', '==', currentUserId)
        .get()
        .then((result) => {
          result.forEach(doc => {
            setUserDetails(doc._data)
          })
        })
    }
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const list = [];

      await firestore()
        .collection('Products')
        .orderBy('addProductTime', 'desc')
        .get()
        .then((querySnapshot) => {
          console.log('Total Posts: ', querySnapshot.size);

          querySnapshot.forEach((doc) => {
            const {
              userId,
              productName,
              productImageURI,
              addProductTime,
              productPrice,
              productOfferPrice,
            } = doc.data();
            list.push({
              id: doc.id,
              userId,
              productName: productName,
              productImageURI: productImageURI,
              addProductTime: addProductTime,
              productPrice,
              productOfferPrice,
            });
          });
        });

      setProductData(list);

      if (loading) {
        setLoading(false);
      }

      console.log('productData: ', productData);
    } catch (e) {
      console.log(e);
    }
  };


  const AddProduct = async () => {
    const imageUrl = await uploadImage();
    console.log('Image Url: ', imageUrl);
    // console.log("userDetails====?>>>>>>", userDetails.id, firestore.Timestamp.fromDate(new Date()), productName, imageUrl, productPrice, productOfferPrice);

    firestore()
      .collection('Products')
      .add({
        userId: userDetails.id,
        addProductTime: firestore.Timestamp.fromDate(new Date()),
        productName: productName,
        productImageURI: imageUrl,
        productPrice: productPrice,
        productOfferPrice: productOfferPrice
      })
      .then(() => {
        console.log('Prdoduct Added!');
        Alert.alert(
          'Product saved!',
          'Your product has been saved Successfully!',
        );
        setModalVisible(!modalVisible)
        setProductName('');
        setFileURI('');
        setProductPrice('');
        setProductOfferPrice('');
      })
      .catch((error) => {
        console.log('Something went wrong to firestore.', error);
      });
  }

  const uploadImage = async () => {
    if (fileURI == null) {
      return null;
    }
    const uploadUri = fileURI;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    // setUploading(true);
    // setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      // setTransferred(
      //   Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
      //   100,
      // );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      // setUploading(false);
      setFileURI('');

      // Alert.alert(
      //   'Image uploaded!',
      //   'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
      // );
      return url;

    } catch (e) {
      console.log(e);
      return null;
    }

  };

  const Greeting = () => {
    var myDate = new Date();
    var hours = myDate.getHours();
    var greet;

    if (hours < 12)
      greet = "Morning";
    else if (hours >= 12 && hours <= 17)
      greet = "Afternoon";
    else if (hours >= 17 && hours <= 24)
      greet = "Evening";

    return greet
  }

  const onSignout = () => {
    auth()
      .signOut()
      .then((res) => {
        console.log('User signed out!', res);
        alert('Signout Successfully')
      });
  }

  const renderChoosePicModal = () => (
    <View style={styles.profileUploadModalContainer}>
      <View style={[styles.profileUploadModalContentUp, { paddingTop: 0 }]}>
        <TouchableOpacity
          onPress={() => pickImageFromGallery()}
          style={styles.profileUploadModalTouchBtnYes}>
          <Text style={styles.profileUploadModalBtnYes}>
            {'Access Photo Library'}
          </Text>
        </TouchableOpacity>
        <View style={styles.profileUploadModalViewSeparator} />
        <TouchableOpacity
          onPress={() => pickImageUsingCamera()}
          style={styles.profileUploadModalTouchBtnYes}>
          <Text style={styles.profileUploadModalBtnYes}>
            {'Take a Photo'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.profileUploadModalContentDown}>
        <TouchableOpacity
          style={styles.profileUploadModalTouchBtnYes}
          onPress={() => setVisibilityImageUploadModal(false)}>
          <Text style={styles.profileUploadModalBtnCancel}>
            {'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  const pickImageFromGallery = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      width: 500,
      height: 700,
      cropping: true
    })
      .then((image) => {
        setVisibilityImageUploadModal(false);
        let name = '';
        if ('filename' in image) {
          console.log('image::::ifffffffff ' + JSON.stringify(image));
          name = image.filename;
        } else {
          console.log('image::::elseeeee ' + JSON.stringify(image));
          let splittedName = image.path.split(
            'file:///storage/emulated/0/Android/data/com.assignmentwts/files/Pictures/'
            // 'file:///data/user/0/com.assignmentwts/cache/react-native-image-crop-picker/'
          );
          console.log('image::::elseeeee ' + splittedName[1]);
          name = splittedName[1];
        }
        setFileURI(image.path);
        setFileName(name);
      })
      .catch((e) => checkPhotoGalleryError(e));
  };

  const pickImageUsingCamera = () => {
    ImagePicker.openCamera({
      mediaType: 'photo',
      width: 500,
      height: 700,
      cropping: true
    })
      .then((image) => {
        setVisibilityImageUploadModal(false);
        let name = '';
        if ('filename' in image) {
          name = image.filename;
        } else {
          let splittedName = image.path.split(
            'file:///storage/emulated/0/Pictures/'
          );
          name = splittedName[1];
        }
        if (name === null || name === undefined) {
          var getFilename = image.path.split('/');
          name = getFilename[getFilename.length - 1];
        }
        setFileURI(image.path);
        setFileName(name);
      })
      .catch((e) => checkCameraError(e));
  };

  const checkCameraError = (mError) => {
    if (mError.toString() == 'Error: User did not grant camera permission.') {
      checkCameraPermissionforIOS();
    }
  };

  const checkCameraPermissionforIOS = () => {
    Alert.alert(
      'Alert',
      'You did not grant camera permission, please turn on Camera Permission from settings to allow Webskitters App to take photo from camera',
      [
        {
          text: 'Cancel',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Settings',
          onPress: () => {
            open_setting_tab();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const checkPhotoGalleryError = (mError) => {
    if (
      mError.toString() ==
      'Error: Cannot access images. Please allow access if you want to be able to select images.'
    ) {
      checkPhotoLibraryPermissionforIOS();
    }
  };

  const checkPhotoLibraryPermissionforIOS = () => {
    Alert.alert(
      'Alert',
      'You did not grant Photos permission, please turn on Photos Permission from settings to allow Webskitters App to select images',
      [
        {
          text: 'Cancel',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Settings',
          onPress: () => {
            open_setting_tab();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const open_setting_tab = () => {
    Linking.openURL('app-settings:');
  };


  const renderProductsForm = () => {
    return (
      <View style={[styles.centeredView, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={styles.modalView}>
          <View style={styles.modalTextView}>
            <Text style={styles.modalText}>Add Product</Text>
            <TouchableOpacity onPress={() => [
              setModalVisible(!modalVisible),
              setProductName(''),
              setFileURI(''),
              setProductPrice(''),
              setProductOfferPrice(''),]}>
              <Icon name="close-thick" color={'#2e64e5'} size={20} />
            </TouchableOpacity>
          </View>

          <FormInput
            labelValue={productName}
            onChangeText={(userProductName) => setProductName(userProductName)}
            placeholderText="Type product name"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            onPress={() => setVisibilityImageUploadModal(true)}
            style={styles.inputContainer}>
            <Text style={styles.input} numberOfLines={1} >
              {fileName !== '' ? fileName : 'Select product image'}
            </Text>
            <Icon name="image-outline" color={'#2e64e5'} size={28} />
          </TouchableOpacity>

          <FormInput
            labelValue={productPrice}
            onChangeText={(userProductPrice) => setProductPrice(userProductPrice)}
            placeholderText="Type product price"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={'numeric'}
          />
          <FormInput
            labelValue={productOfferPrice}
            onChangeText={(userProductOfferPrice) => setProductOfferPrice(userProductOfferPrice)}
            placeholderText="Type product offer price"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={'numeric'}
          />
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={() => AddProduct()}
          >
            <Text style={styles.textStyle}>Add Product</Text>
          </TouchableOpacity>

        </View>
      </View>
    )
  }

  const renderProductList = () => {
    return (
      <FlatList
        data={productData}
        numColumns={2}
        renderItem={({ item, index }) =>
          <View style={styles.renderContainer} >
            <TouchableOpacity
              onPress={() => { }} >
              <ImageBackground resizeMode='contain' source={{ uri: item.productImageURI }} style={{ height: H / 3.02, width: W / 2.03, borderTopLeftRadius: 5, borderTopRightRadius: 5 }} >
              </ImageBackground>
            </TouchableOpacity>
            <View style={styles.productInfo}>
              <Text style={styles.title} numberOfLines={1}>{item.productName}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>{item.productName}</Text>
            <Text style={styles.title} numberOfLines={1}>{item.productPrice}</Text>
            <Text style={styles.title} numberOfLines={1}>{item.productOfferPrice}</Text>
          </View>
        } />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Hi ,Good {Greeting()}!</Text>
        <TouchableOpacity onPress={onSignout}>
          <Icon name="exit-to-app" color={'#2e64e5'} size={26} />
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        {renderProductList()}
      </View>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)} >
          {renderProductsForm()}
        </Modal>
      </View>
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={visibilityImageUploadModal}
          onRequestClose={() => setVisibilityImageUploadModal(!visibilityImageUploadModal)} >
          {renderChoosePicModal()}
        </Modal>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafd',
    flex: 1,
  },
  header: {
    flex: 0.2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 15,
    marginTop: 10
  },
  text: {
    fontSize: 22,
    color: '#051d5f',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2e64e5'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    //alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 12,
    padding: 10,
    elevation: 2
  },

  buttonClose: {
    backgroundColor: "#2e64e5",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    fontSize: 18
  },
  modalTextView: { flexDirection: 'row', justifyContent: 'space-between' },
  footer: {
    flex: 0.8,
    width: '100%',
    alignSelf: 'center',
  },
  renderContainer: {
    marginTop: "0.5%",
    flex: 1,
    backgroundColor: 'red'
  },
  productInfo: {
    marginLeft: 10
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  subTitle: {
    fontSize: 15,
    opacity: 0.5,
  },
  inputContainer: {
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    borderColor: '#ccc',
    borderRadius: 3,
    borderWidth: 1,
    height: W / 7,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingRight: 10,
  },
  input: {
    padding: 10,
    flex: 1,
    fontSize: 16,
    color: "#666"
  },
  profileUploadModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingLeft: 35,
    paddingRight: 35,
    marginBottom: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  profileUploadModalContentUp: {
    width: '100%',
    backgroundColor: 'white',
    paddingTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  profileUploadModalBtnYes: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.75,
  },
  profileUploadModalBtnCancel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.75,
    color: '#F0506E',
    height: 50,
    paddingTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileUploadModalViewSeparator: {
    width: '100%',
    backgroundColor: 'rgba(240,242,247,0.9)',
    height: 1,
  },
  profileUploadModalTouchBtnYes: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  profileUploadModalContentDown: {
    height: 50,
    width: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 10,
  },
})

export default HomeScreen;
