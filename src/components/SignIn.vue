<template>
  <div id="signin">
    <div class="signin-logo-container">
      <img
        :src="require('../assets/logo_metropole.png')"
        class="logo-connection-step"
        alt="Logo Métropole"
      >
    </div>

    <h3 class="signin-title">
      Connexion
    </h3>
    <br>
    <!-- Form -->
    <v-form ref="formLogin" class="form-login" on-submit="return false;">
      <v-text-field
        v-model="currLogin.login"
        autocomplete="username"
        name="login"
        type="text"
        variant="underlined"
        clearable
        required
        class="input-required"
        @keyup.enter="submitLoginForm()"
      >
        <template #label>
          <span> Email* </span>
        </template>
      </v-text-field>

      <v-text-field
        v-model="currLogin.password"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        name="password"
        variant="underlined"
        clearable
        required
        class="input-required"
        @click:append="showPassword = !showPassword"
        @keyup.enter="submitLoginForm()"
      >
        <template #label>
          <span> Mot de passe* </span>
        </template>
      </v-text-field>
      <div class="d-flex justify-end">
        <v-btn
          :disabled="!(currLogin.password && currLogin.login)"
          :loading="formLoading"
          color="#A18276"
          style="color: white"
          @click="submitLoginForm()"
        >
          Connecter
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Cookies from 'universal-cookie';
const cookies = new Cookies();

export default {
  name: 'SignIn',
  data() {
    return {
      formLoading: false,
      authOK: false,
      errorConnect: false,
      errorContent: '',
      showPassword: false,
      currLogin: {
        login: '',
        password: '',
      },
    }
  },
  computed: {
    ...mapGetters({
      getAuthToken: 'authentications/getAuthToken',
      getLoggedUser: 'authentications/getLoggedUser',
    }),
    authToken() {
      return this.getAuthToken
    },
    loggedUser() {
      return this.getLoggedUser
    },
  },
  mounted() {
    // if (this.$config.loginUser && this.$config.pwdUser) {
    //   this.currLogin.login = this.$config.loginUser
    //   this.currLogin.password = this.$config.pwdUser
    // }
  },
  methods: {
    ...mapActions({
      postLogin: 'authentications/postLogin',
      getAuth: 'authentications/getAuth',
    }),
    submitLoginForm() {
      // Enable loading
      this.formLoading = true

      this.$store.dispatch('postLogin', {
        login: this.currLogin.login,
        password: this.currLogin.password,
      })
        .then((response) => {
          // Show result
          this.authOK = true
          cookies.set('token', response.data.token, { path: '/' });
          this.$store.dispatch('setLoggedUser', {
            firstname: response.data.firstname,
            lastname: response.data.lastname
          })
          // Set Token in $axios in global
          // this.$axios.setToken(this.authToken, 'Bearer')
          // this.$cookies.set(
          //   'token',
          //   this.$encryptWithFernet(this.authToken, this.$config.fernetK).crypt
          // )

          // Fetch LoggedUser
          this.getAuth()
            .then((response) => {
              this.errorConnect = false
              this.errorContent = ''
              this.$router.push('/dashboard')
              // Disable Loading
              this.formLoading = false
            })
            .catch((e) => {
              this.errorContent = e
              this.errorConnect = true
              this.formLoading = false
            })
        })
        .catch((e) => {
          console.log(e.message)
          this.errorContent = e
          this.errorConnect = true
          this.formLoading = false
        })
    },
  },
}
</script>

<style>

.signin-title {
  text-transform: uppercase;
  color: #A18276;
}
.signin-logo-container {
  display: flex;
  justify-content: space-around;
}

.logo-connection-step {
  height: 78px;
  align-content: center;
  margin-bottom: 3.5rem;
}

</style>
