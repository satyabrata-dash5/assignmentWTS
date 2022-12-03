import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Alert, Linking, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { FAB, Button, Card, Title } from 'react-native-paper';
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
  const [productId, setProductId] = useState('');
  const [productData, setProductData] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    secureTextEntry: true,
    isValidProductName: true,
    isValidProductImage: true,
    isValidProductPrice: true,
    isValidProductOfferPrice: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {
    fetchProducts();
    setDeleted(false);
  }, [deleted]);

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

  const fetchProducts = async () => {
    const currentUserId = auth().currentUser ? auth().currentUser.uid : "";
    try {
      setIsLoading(true);
      const list = [];
      await firestore()
        .collection('Products')
        .orderBy('addProductTime', 'desc')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setProductId(doc.id);
            const {
              userId,
              productName,
              productImageURI,
              addProductTime,
              productPrice,
              productOfferPrice,
              productFileName,
            } = doc.data();
            list.push({
              id: doc.id,
              userId,
              productName: productName,
              productImageURI: productImageURI,
              addProductTime: addProductTime,
              productFileName: productFileName,
              productPrice,
              productOfferPrice,
            });

          });
        });
      let SelectedList = list.filter(x => x.userId === currentUserId);
      console.log(currentUserId);
      setProductData(SelectedList);
      setIsLoading(false);
      if (loading) {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const UpdateProduct = async () => {
    if (!productName.trim()) {
      alert('Please Enter product name');
      return;
    }
    if (!fileName.trim()) {
      alert('Please Select Product Image');
      return;
    }
    if (!productPrice.trim()) {
      alert('Please Select Product Price');
      return;
    }
    if (!productOfferPrice.trim()) {
      alert('Please Select Product Offer Price');
      return;
    }
    const imageUrl = await uploadImage();
    const updatedImageUrl = productId !== '' ? fileURI : imageUrl
    console.log(updatedImageUrl);
    firestore()
      .collection('Products')
      .doc(productId)
      .update({
        userId: userDetails.id,
        addProductTime: firestore.Timestamp.fromDate(new Date()),
        productName: productName,
        productFileName: fileName,
        productImageURI: updatedImageUrl,
        productPrice: productPrice,
        productOfferPrice: productOfferPrice
      })
      .then(() => {
        console.log('Prdoduct updated!');
        Alert.alert(
          'Product updated!',
          'Your product has been updated Successfully!',
        );
        setModalVisible(!modalVisible)
        fetchProducts();
        setProductName('');
        setProductId('');
        setFileURI('');
        setFileName('');
        setProductPrice('');
        setProductOfferPrice('');
      })
      .catch((error) => {
        console.log('Something went wrong to firestore.', error);
      });
  }


  const AddProduct = async () => {
    if (!productName.trim()) {
      alert('Please Enter product name');
      return;
    }
    if (!fileName.trim()) {
      alert('Please Select Product Image');
      return;
    }
    if (!productPrice.trim()) {
      alert('Please Select Product Price');
      return;
    }
    if (!productOfferPrice.trim()) {
      alert('Please Select Product Offer Price');
      return;
    }
    const imageUrl = await uploadImage();

    firestore()
      .collection('Products')
      .add({
        userId: userDetails.id,
        addProductTime: firestore.Timestamp.fromDate(new Date()),
        productName: productName,
        productFileName: fileName,
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
        fetchProducts();
        setProductName('');
        setProductId('');
        setFileURI('');
        setFileName('');
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

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
        100,
      );
    });

    try {
      await task;
      const url = await storageRef.getDownloadURL();
      setUploading(false);
      setFileURI(null);
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

  const handleEditProduct = (item) => {
    setModalVisible(true);
    setProductName(item.productName);
    setFileURI(item.productImageURI);
    setFileName(item.productFileName)
    setProductPrice(item.productPrice);
    setProductOfferPrice(item.productOfferPrice);
  }

  const handleDeleteProduct = (pId) => {
    Alert.alert(
      'Delete product',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed!'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => deleteProduct(pId),
        },
      ],
      { cancelable: false },
    );
  };

  const deleteProduct = (pId) => {
    console.log('Current Product Id: ', pId);
    setIsLoading(true);
    firestore()
      .collection('Products')
      .doc(pId)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          const { productImg } = documentSnapshot.data();

          if (productImg != null) {
            const storageRef = storage().refFromURL(productImg);
            const imageRef = storage().ref(storageRef.fullPath);

            imageRef
              .delete()
              .then(() => {
                console.log(`${productImg} has been deleted successfully.`);
                setIsLoading(false);
                deleteFirestoreData(pId);
              })
              .catch((e) => {
                console.log('Error while deleting the image. ', e);
              });
          } else {
            deleteFirestoreData(pId);
          }
        }
      });
  };

  const handleValidProductName = (val) => {
    if (val.trim().length >= 1) {
      setData({
        ...data,
        productName: val,
        isValidProductName: true
      });
    } else {
      setData({
        ...data,
        productName: val,
        isValidProductName: false
      });
    }
  }

  const handleValidProductImage = (val) => {
    if (val.trim().length >= 1) {
      setData({
        ...data,
        fileName: val,
        isValidProductImage: true
      });
    } else {
      setData({
        ...data,
        fileName: val,
        isValidProductImage: false
      });
    }
  }

  const handleValidProductPrice = (val) => {
    if (val.trim().length >= 1) {
      setData({
        ...data,
        productPrice: val,
        isValidProductPrice: true
      });
    } else {
      setData({
        ...data,
        productPrice: val,
        isValidProductPrice: false
      });
    }
  }

  const handleValidProductOfferPrice = (val) => {
    if (val.trim().length >= 1) {
      setData({
        ...data,
        productOfferPrice: val,
        isValidProductOfferPrice: true
      });
    } else {
      setData({
        ...data,
        productOfferPrice: val,
        isValidProductOfferPrice: false
      });
    }
  }


  const deleteFirestoreData = (pId) => {
    setIsLoading(true);
    firestore()
      .collection('Products')
      .doc(pId)
      .delete()
      .then(() => {
        Alert.alert(
          'Product deleted!',
          'Your product has been deleted successfully!',
        );
        setIsLoading(false);
        setDeleted(true);
      })
      .catch((e) => console.log('Error deleting posst.', e));
  };


  const onSignout = () => {
    setIsLoading(true);
    auth()
      .signOut()
      .then((res) => {
        console.log('User signed out!', res);
        setIsLoading(false);
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
      width: 1200,
      height: 780,
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
      width: 1200,
      height: 780,
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e64e5" />
      </View>
    );
  }


  const renderProductsForm = () => {
    return (
      <View style={[styles.centeredView, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={styles.modalView}>
          <View style={styles.modalTextView}>
            <Text style={styles.modalText}>{productId == '' ? 'Add Product' : 'Update Product'}</Text>
            <TouchableOpacity onPress={() => [
              setModalVisible(!modalVisible),
              setProductName(''),
              setProductId(''),
              setFileURI(''),
              setFileName(''),
              setProductPrice(''),
              setProductOfferPrice('')]}>
              <Icon name="close-thick" color={'#2e64e5'} size={20} />
            </TouchableOpacity>
          </View>

          <FormInput
            labelValue={productName}
            onChangeText={(userProductName) => setProductName(userProductName)}
            placeholderText="Type product name"
            autoCapitalize="none"
            autoCorrect={false}
            onEndEditing={(e) => handleValidProductName(e.nativeEvent.text)}
          />

          {data.isValidProductName ? null :
            <View style={{ justifyContent: 'flex-start' }} >
              <Text style={styles.errorMsg}>Hey ! Product Name should not be empty.</Text>
            </View>
          }

          <TouchableOpacity
            onEndEditing={(e) => handleValidProductImage(e.nativeEvent.text)}
            onPress={() => setVisibilityImageUploadModal(true)}
            style={styles.inputContainer}>
            <Text style={styles.input} numberOfLines={1} >
              {fileName !== '' ? fileName : 'Select product image'}
            </Text>
            <Icon name="image-outline" color={'#2e64e5'} size={28} />
          </TouchableOpacity>

          {data.isValidProductImage ? null :
            <View style={{ justifyContent: 'flex-start' }} >
              <Text style={styles.errorMsg}>Hey ! Product Image should not be empty.</Text>
            </View>
          }


          <FormInput
            labelValue={productPrice}
            onChangeText={(userProductPrice) => setProductPrice(userProductPrice)}
            placeholderText="Type product price"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={'numeric'}
            onEndEditing={(e) => handleValidProductPrice(e.nativeEvent.text)}
          />

          {data.isValidProductPrice ? null :
            <View style={{ justifyContent: 'flex-start' }} >
              <Text style={styles.errorMsg}>Hey ! Product Price should not be empty.</Text>
            </View>
          }

          <FormInput
            labelValue={productOfferPrice}
            onChangeText={(userProductOfferPrice) => setProductOfferPrice(userProductOfferPrice)}
            placeholderText="Type product offer price"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={'numeric'}
            onEndEditing={(e) => handleValidProductOfferPrice(e.nativeEvent.text)}
          />
          {data.isValidProductOfferPrice ? null :
            <View style={{ justifyContent: 'flex-start' }} >
              <Text style={styles.errorMsg}>Hey ! Product Offer Price should not be empty.</Text>
            </View>
          }

          {uploading ? (
            <View style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text>{transferred} % Completed!</Text>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : productId == '' ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => AddProduct()}
            >
              <Text style={styles.textStyle}>{'Add Product'} </Text>
            </TouchableOpacity>) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => UpdateProduct()}
            >
              <Text style={styles.textStyle}>{'Update Product'} </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  const renderEmptyComponent = () => {
    return (
      <View
        style={styles.NodataView}>
        <Text style={styles.NoDataTxt}>
          No Products Found !
        </Text>
        <Text style={styles.NoDataTxt}>
          Please Add Products By clicking Plus Icon
        </Text>
      </View>
    );
  };


  const renderProductList = () => {
    return (
      <FlatList
        data={productData == undefined ||
          productData == [] ||
          productData.length == 0
          ? []
          : productData}
        numColumns={1}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent()}
        renderItem={({ item, index }) =>
          <Card mode='elevated' elevation={3} style={styles.renderFlatlistContainer} >
            <Card.Cover resizeMode='cover' style={{ height: 250 }} source={{ uri: item.productImageURI }} />
            <Card.Title titleStyle={styles.flatlistTitleTxt} title={item.productName} />
            <Card.Content >
              <Title style={styles.flatlistTitleSubTxt}>Price : ₹ {item.productPrice}</Title>
              <Title style={styles.flatlistTitleSubTxt}>Offer Price : ₹ {item.productOfferPrice}</Title>
            </Card.Content>
            <Card.Actions style={{ justifyContent: 'flex-end' }}>
              <Button
                onPress={() => handleEditProduct(item)}
                labelStyle={{ fontSize: 14 }}
                color={'#2e64e5'}>View</Button>
              <Button icon={"delete-outline"}
                onPress={() => handleDeleteProduct(item.id)}
                labelStyle={{ fontSize: 18 }}
                color={'#2e64e5'}
              />
            </Card.Actions>
          </Card>
        } />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Hi ,Good {Greeting()}</Text>
        <TouchableOpacity onPress={onSignout}>
          <Icon name="exit-to-app" color={'#2e64e5'} size={26} />
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        {renderProductList()}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => [
            setProductName(''),
            setProductId(''),
            setFileURI(''),
            setFileName(''),
            setProductPrice(''),
            setProductOfferPrice(''), setModalVisible(true)]}
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
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafd',
    flex: 1,
  },
  header: {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2e64e5",
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
    flex: 0.9,
    width: '100%',
    alignSelf: 'center',

  },
  renderFlatlistContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    flex: 1,
    width: '90%'
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
  flatlistTitleTxt: { color: "#2e64e5", fontSize: 18, textTransform: 'uppercase' },
  flatlistTitleSubTxt: {
    color: "#2e64e5", fontSize: 15,
  },
  errorMsg: {
    color: '#FF0000',
    fontSize: 14,
    paddingLeft: 10,
  },
  NodataView: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  NoDataTxt: {
    alignSelf: 'center',
    margin: 30,
    fontSize: 16,
    fontWeight: 'bold'
  },
})

export default HomeScreen;
