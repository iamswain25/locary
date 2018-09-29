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
  data: () => ({ position: null }),
  created () {
    var vm = this
    const ui = new firebaseui.auth.AuthUI(firebase.auth())
    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
          const position = vm.position
          vm.$store.dispatch('getUserRef', { authUser: authResult.user, position })
          // console.log(authResult)
          return false
        }
      },
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    }
    ui.start('#firebaseui-auth-container', uiConfig)
  },
  mounted () {
    const that = this
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        that.position = position.coords
      })
    }
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
