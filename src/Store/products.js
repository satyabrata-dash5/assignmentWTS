import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

const addProduct = (productName, image, price, offerPrice) => {
    if (!productName || !price) {
        Alert.alert('Error', 'Please enter all fields')
    }

    return firestore()
        .collection('products')
        .doc()
        .set({
            productName,
            price,
            offerPrice
        })
        .catch(err => err)
}


const getProduct = () => {
    return firestore()
        .collection('products')
        .get()
        .then(snap => {
            const products = []
            snap.forEach(product => products.push(product.data()))
            return products;
        })
        .catch(err => err)
}

const updateProduct = (updateDoc) => {
    return firestore()
        .collection('products')
        .doc(updateDoc.id)
        .update(updateDoc)
        .then(() => {
            Alert.alert(
                'Product Updated!',
                'Your Product has been deleted successfully!',
            );
            // setDeleted(true);
        })
        .catch((e) => console.log('Error deleting Product.', e));
}

const deleteProduct = (postId) => {
    return firestore()
        .collection('products')
        .doc(postId)
        .delete()
        .then(() => {
            Alert.alert(
                'Product deleted!',
                'Your Product has been deleted successfully!',
            );
            // setDeleted(true);
        })
        .catch((e) => console.log('Error deleting Product.', e));
};


const Product = {
    addProduct,
    getProduct,
    updateProduct,
    deleteProduct,
}
export default Product;


