<template>
  <div id="signin">
    <div class="signin-logo-container">
      <img
        :src="require('../assets/logo_metropole.png')"
        class="logo-connection-step"
        alt="Logo Métropole de Lyon"
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
        @keydown.enter="submitLoginForm()"
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
        @keydown.enter="submitLoginForm()"
      >
        <template #label>
          <span> Mot de passe* </span>
        </template>
      </v-text-field>
    </v-form>
    <div class="d-flex justify-space-between">
      <button class="forgotten-password-button" @click="handleChangePassword()">
        Mot de passe oublié ?
      </button>
      <v-btn
        :disabled="!(currLogin.password && currLogin.login)"
        :loading="formLoading"
        color="#414288"
        style="color: white"
        @click="submitLoginForm()"
      >
        Connexion
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SignIn',
  data() {
    return {
      formLoading: false,
      showPassword: false,
      currLogin: {
        login: '',
        password: '',
      },
    }
  },
  computed: {
    ...mapGetters({
      authToken: 'authentications/getAuthToken',
      loggedUser: 'authentications/getLoggedUser',
    }),
  },
  mounted() {
  },
  methods: {
    ...mapActions({
      postLogin: 'authentication/postLogin',
      getAuth: 'authentication/getAuth',
      setLoggedUser: 'authentication/setLoggedUser',
      setOngoingPasswordRecuperation: 'authentication/setOngoingPasswordRecuperation',
    }),
    handleChangePassword() {
      this.setOngoingPasswordRecuperation(true);
    },
    submitLoginForm() {
      // Enable loading
      this.formLoading = true
      this.postLogin({
        login: this.currLogin.login,
        password: this.currLogin.password,
      })
        .then((response) => {
          this.setLoggedUser({
            firstname: response.data.firstname,
            lastname: response.data.lastname,
            token: response.data.token,
          })
        })
        .catch((e) => {
          console.log('e.message')
          console.log(e.message)
          this.formLoading = false

          this.$notify({
            title: 'Erreur lors de la connexion',
            text: "L'identifiant ou le mot de passe est incorrect",
            type: 'error'
          })
        })
    },
  },
}
</script>

<style>

.signin-title {
  text-transform: uppercase;
  color: #37474F;
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

.forgotten-password-button {
  color: #414288;
}
</style>
