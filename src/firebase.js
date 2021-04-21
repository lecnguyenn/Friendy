import firebase from "firebase/app";
 import "firebase/auth";
 import "firebase/database";
 import "firebase/storage";



var firebaseConfig = {
    apiKey: "AIzaSyAwWVrj0CkF7kseYcVaK3YrVPOWalW2Zic",
    authDomain: "friendy-cba7f.firebaseapp.com",
    projectId: "friendy-cba7f",
    storageBucket: "friendy-cba7f.appspot.com",
    messagingSenderId: "1037886632617",
    appId: "1:1037886632617:web:7c283f7ae049428a3fefb8",
    measurementId: "G-EGK0FDT2KV"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase;
 