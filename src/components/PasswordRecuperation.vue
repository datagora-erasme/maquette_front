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
      RÉINITIALISER MON MOT DE PASSE
    </h3>
    <br>
    <div>
      Pour réinitialiser votre mot de passe, veuillez saisir votre adresse email :
    </div>
    <br>
    <!-- Form -->
    <v-form ref="formReset" class="form-login" on-submit="return false;">
      <v-text-field
        v-model="email"
        autocomplete="username"
        name="login"
        type="text"
        variant="underlined"
        clearable
        required
        class="input-required"
        @keyup.enter="sendRecuperationEmail()"
      >
        <template #label>
          <span> Email* </span>
        </template>
      </v-text-field>

      <div class="d-flex justify-space-between">
        <v-btn
          :loading="formLoading"
          color="#A18276"
          style="color: #414288"
          variant="outlined"
          @click="setOngoingPasswordRecuperation(false)"
        >
          Retour
        </v-btn>
        <v-btn
          :disabled="!email"
          :loading="formLoading"
          color="#A18276"
          style="color: white"
          @click="sendRecuperationEmail()"
        >
          Envoyer
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PasswordRecuperation',
  data() {
    return {
      formLoading: false,
      email: null,
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
      postResetPassword: 'authentication/postResetPassword',
      getAuth: 'authentication/getAuth',
      setLoggedUser: 'authentication/setLoggedUser',
      setOngoingPasswordRecuperation: 'authentication/setOngoingPasswordRecuperation',
    }),
    sendRecuperationEmail() {
      // Enable loading
      this.formLoading = true
      this.postResetPassword({
        email: this.email,
      })
        .then((response) => {
          this.$notify({
            title: 'Email de récupération envoyé',
            text: 'Un email de récupération a été envoyé à votre adresse email.',
            type: 'success'
          });
          this.formLoading = false
          this.setOngoingPasswordRecuperation(false);
        })
        .catch((e) => {
          console.log(e.message)
          this.$notify({
            title: "Erreur lors de l'envoi de l'email de récupération",
            text: "Une erreur s'est produite lors de l'envoi de l'email de récupération",
            type: 'error'
          });
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

.forgotten-password-button {
  color: rgb(82, 82, 255);
}
</style>
