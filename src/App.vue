<template>
  <v-app>
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <map1/>
    </v-navigation-drawer>
    <v-toolbar app :clipped-left="clipped">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer/>
      <v-dialog v-model="dialog" v-if="userRef !== null">
        <v-btn slot="activator" dark :color="userRef !== null ? 'secondary' : 'blue-grey'">
          <v-icon dark>person_outline</v-icon>
          <span>{{userRef === null ? 'logged out' : 'log out'}}</span>
        </v-btn>
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>Log out</v-card-title>
          <v-card-text>Are you sure to log out?</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="dialog = false">Cancel</v-btn>
            <v-btn color="red" flat @click="logout">Log out</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-btn v-else dark color="blue-grey" @click="signIn">
        <v-icon dark>person_outline</v-icon>
        <span>Log In</span>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-navigation-drawer temporary :right="right" v-model="rightDrawer" fixed app width="320">
      <threads v-if="threadMessage" :threadMessage="threadMessage"/>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
import map1 from './components/map'
import threads from './components/threads'
import { firebase } from './store/firestore'
import firebaseui from 'firebaseui'
import 'firebase/auth'
export default {
  components: {
    map1,
    threads
  },
  created () {
    const store = this.$store
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        store.dispatch('getUserRef', { authUser: user })
      } else {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then(function () {
            const ui = new firebaseui.auth.AuthUI(firebase.auth())
            const uiConfig = {
              callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                  ui.delete()
                  // unsubscribe()
                  // store.dispatch('getUserRef', { authUser: authResult.user })
                  return false
                }
              },
              signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID
                // firebase.auth.EmailAuthProvider.PROVIDER_ID
                // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                // firebase.auth.GithubAuthProvider.PROVIDER_ID,
                // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                // firebase.auth.TwitterAuthProvider.PROVIDER_ID
              ],
              signInFlow: 'popup'
            }
            ui.start('#firebaseui-auth-container', uiConfig)
          })
      }
    })
    // console.log(unsubscribe)
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      miniVariant: false,
      right: true,
      title: 'Locary',
      dialog: false
    }
  },
  computed: {
    rightDrawer: {
      get () {
        return this.$store.getters.rightDrawer
      },
      set (newVal) {
        this.$store.commit('setRightDrawer', newVal)
      }
    },
    threadMessage () {
      return this.$store.getters.threadMessage
    },
    userRef () {
      return this.$store.getters.userRef
    }
  },
  methods: {
    logout () {
      this.$store.commit('setUserRef', null)
      firebase.auth().signOut()
      this.dialog = false
    },
    signIn () {
      document.querySelector('.firebaseui-idp-google').click()
    }
  },
  name: 'App'
}
</script>
