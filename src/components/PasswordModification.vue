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
    <div>Veuillez saisir votre nouveau mot de passe</div>
    <br>
    <!-- Form -->
    <v-form ref="formLogin" class="form-login" on-submit="return false;">
      <v-text-field
        v-model="passwordFirstTry"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        name="password"
        variant="underlined"
        clearable
        required
        class="input-required"
        @click:append="showPassword = !showPassword"
        @keyup.enter="submitPasswordForm()"
      >
        <template #label>
          <span> Mot de passe* </span>
        </template>
      </v-text-field>

      <v-text-field
        v-model="passwordSecondTry"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        name="password"
        variant="underlined"
        clearable
        required
        class="input-required"
        @click:append="showPassword = !showPassword"
        @keyup.enter="submitPasswordForm()"
      >
        <template #label>
          <span> Confirmation du mot de passe* </span>
        </template>
      </v-text-field>
      <div class="d-flex justify-end">
        <v-btn
          :disabled="!passwordFirstTry || !passwordSecondTry || passwordFirstTry !== passwordSecondTry"
          :loading="formLoading"
          color="#A18276"
          style="color: white"
          @click="submitPasswordForm()"
        >
          MODIFIER
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PasswordModification',
  data() {
    return {
      formLoading: false,
      showPassword: false,
      passwordFirstTry: null,
      passwordSecondTry: null,
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
      patchChangePasswordWithToken: 'authentication/patchChangePasswordWithToken',
      getAuth: 'authentication/getAuth',
      setLoggedUser: 'authentication/setLoggedUser',
      setOngoingPasswordModification: 'authentication/setOngoingPasswordModification'
    }),
    submitPasswordForm() {
      // Enable loading
      this.formLoading = true
      this.patchChangePasswordWithToken({
        token: window.location.href.split('reset?token=')[1],
        password: this.passwordFirstTry,
      })
        .then((response) => {
          this.$notify({
            title: 'Mot de passe modifié avec succès',
            text: 'Vous pouvez dès à présent vous connecter avec votre nouveau mot de passe !',
            type: 'success'
          });
          this.formLoading = false
          this.setOngoingPasswordModification(false);
        })
        .catch((e) => {
          console.log(e.message)
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
  color: #414288;
}
</style>
