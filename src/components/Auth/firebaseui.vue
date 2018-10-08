<template>
  <div class="loginui">
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<script>
import { firebase } from '../../store/firestore'
import firebaseui from 'firebaseui'
import 'firebase/auth'
export default {
  created () {
    var store = this.$store
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(function () {
        const ui = new firebaseui.auth.AuthUI(firebase.auth())
        const uiConfig = {
          callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
              store.dispatch('getUserRef', { authUser: authResult.user })
              return false
            }
          },
          signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
          ]
        }
        ui.start('#firebaseui-auth-container', uiConfig)
      })
  }
}
</script>
<style src="firebaseui/dist/firebaseui.css"></style>
<style scoped>
.loginui {
  text-align: center;
  overflow: hidden;
  width: 100%;
  height: 65px;
}
</style>
