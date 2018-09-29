import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/database'
import * as geofirex from 'geofirex'

firebase.initializeApp({
  apiKey: 'AIzaSyDgPNnncRq9d3KylyRDUdZqzIf-aCh0694',
  authDomain: 'locary-0.firebaseapp.com',
  databaseURL: 'https://locary-0.firebaseio.com',
  projectId: 'locary-0',
  storageBucket: 'locary-0.appspot.com',
  messagingSenderId: '1062407146615'
})
const firestore = firebase.firestore()
const database = firebase.database()
const geo = geofirex.init(firebase)
firestore.settings({ timestampsInSnapshots: true })
export { firestore, firebase, database, geo }
