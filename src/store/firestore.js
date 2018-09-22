import firebase from 'firebase/app'
import 'firebase/firestore'
firebase.initializeApp({
  apiKey: 'AIzaSyDgPNnncRq9d3KylyRDUdZqzIf-aCh0694',
  authDomain: 'locary-0.firebaseapp.com',
  databaseURL: 'https://locary-0.firebaseio.com',
  projectId: 'locary-0',
  storageBucket: 'locary-0.appspot.com',
  messagingSenderId: '1062407146615'
})
const firestore = firebase.firestore()
firestore.settings({ timestampsInSnapshots: true })
export {firestore, firebase}
