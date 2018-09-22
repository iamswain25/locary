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
    mounted () {
    },
    created () {
      var vm = this
      const ui = new firebaseui.auth.AuthUI(firebase.auth())
      const uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            vm.$store.commit('setUser', authResult.user)
            vm.$store.commit('setUserId', authResult.user.uid)
            console.log(authResult)
            return false
          }
        },
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ]
      }
      ui.start('#firebaseui-auth-container', uiConfig)
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
