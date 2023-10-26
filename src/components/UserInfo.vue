<template>
  <v-card v-if="editUserInfos" id="user-info" class="user-info-card d-flex flex-column justify-space-between px-5 py-2 ma-auto">
    <v-card-title class="d-flex flex-row justify-space-between align-center">
      <h4 style="color: #414288">
        MON PROFIL
      </h4>
      <div>
        <v-btn
          class="user-info-close-icon"
          icon="mdi-logout"
          elevation="0"
          style="transform: translate(-1)"
          @click="handleLogout"
        />
        <v-btn
          class="user-info-close-icon"
          icon="mdi-close"
          elevation="0"
          @click="handleCloseUserInfo"
        />
      </div>
    </v-card-title>


    <v-card-text class="d-flex flex-column px-3 mt-3">
      <v-row class="user-info-my-info d-flex flex-row justify-space-between" style="max-height: 40px;">
        <h4 class="user-info-section-title" style="color: #37474F">
          Mes informations
        </h4>
        <div class="user-info-buttons-container pr-3">
          <v-btn
            v-if="!isInfoUpdateActive"
            class=""
            size="small"
            color="#37474F"
            style="color: white;"
            @click="isInfoUpdateActive = true"
          >
            Modifier mes informations
          </v-btn>
          <v-btn
            v-if="isInfoUpdateActive"
            size="small"
            variant="outlined"
            color="#37474F"
            @click="cancelNewInfos()"
          >
            Annuler
          </v-btn>
          <v-btn
            v-if="isInfoUpdateActive"
            size="small"
            class="ml-1"
            color="#1B5E20"
            style="color: white;"
            @click="submitNewInfos()"
          >
            Sauvegarder
          </v-btn>
        </div>
      </v-row>
      <v-row class="text-fields-container px-3">
        <v-text-field
          v-model="editUserInfos.email"
          variant="outlined"
          hide-details="auto"
          label="Adresse e-mail"
          placeholder="jeandupont@gmail.com"
          type="email"
          density="compact"
          disabled
        />
      </v-row>
      <v-form ref="formEditUserInfos" class="mt-5" on-submit="return false;">
        <v-row class="text-fields-container">
          <v-col>
            <v-text-field
              v-model="editUserInfos.lastname"
              variant="outlined"
              hide-details="auto"
              label="Nom"
              placeholder="Dupont"
              density="compact"
              :rules="[rules.required]"
              :disabled="!isInfoUpdateActive"
            />
          </v-col>
          <v-col>
            <v-text-field
              v-model="editUserInfos.firstname"
              variant="outlined"
              small
              hide-details="auto"
              label="Prénom"
              placeholder="Jean"
              density="compact"
              :rules="[rules.required]"
              :disabled="!isInfoUpdateActive"
            />
          </v-col>
        </v-row>
      </v-form>
      <v-row class="user-info-my-info d-flex flex-row justify-space-between mt-10" style="max-height: 40px;">
        <h4 class="user-info-section-title" style="color: #37474F">
          Mot de passe
        </h4>
        <div class="user-info-buttons-container pr-3">
          <v-btn
            v-if="!isPasswordUpdateActive"
            small
            class=""
            size="small"
            color="#37474F"
            style="color: white;"
            disabled
            @click="isPasswordUpdateActive = true"
          >
            Modifier mon mot de passe
          </v-btn>
          <v-btn
            v-if="isPasswordUpdateActive"
            size="small"
            variant="text"
            color="#3F0D12"
            @click="isPasswordUpdateActive = false"
          >
            Annuler
          </v-btn>
          <v-btn
            v-if="isPasswordUpdateActive"
            size="small"
            class="ml-1"
            color="#37474F"
            style="color: white;"
            @click="submitNewPassword"
          >
            Enregistrer
          </v-btn>
        </div>
      </v-row>
      <v-row class="px-3 d-flex flex-column justify-space-between" style="max-height: 170px;">
        <v-form>
          <v-text-field
            variant="outlined"
            hide-details="auto"
            density="compact" 
            label="Mot de passe actuel*"
            type="password"
            :disabled="!isPasswordUpdateActive"
            class="pb-3"
          />
          <v-text-field
            variant="outlined"
            hide-details="auto"
            density="compact" 
            label="Nouveau mot de passe*"
            type="password"
            :disabled="!isPasswordUpdateActive"
            class="pb-3"
          />
          <v-text-field
            variant="outlined"
            hide-details="auto"
            density="compact" 
            label="Confirmation du nouveau mot de passe*"
            type="password"
            :disabled="!isPasswordUpdateActive"
            class="pb-3"
          />
        </v-form>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'UserInfo',
  props: {},
  data() {
    return {
      isInfoUpdateActive: false,
      isPasswordUpdateActive: false,
      editUserInfos: null,
      rules: {
        required: value => !!value || 'Champs obligatoire',
      },
    }
  },
  computed: {
    ...mapGetters({
      getUserInfo: 'authentication/getLoggedUser'
    }),
    currentUserInfo() {
      return this.getUserInfo
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions({
      logout: 'authentication/logout',
      fetchUserInfo: 'authentication/fetchUserInfo',
      patchUserInfo: 'authentication/patchUserInfo',
    }),
    init() {
      this.fetchUserInfo().then((response) => {
        this.editUserInfos = this.currentUserInfo
        console.log(this.editUserInfos)
      })
    },
    handleLogout() {
      this.logout();
    },
    handleCloseUserInfo() {
      this.$emit('onCloseUserInfo')
    },
    submitNewInfos() {
      this.$refs.formEditUserInfos.validate().then((response) => {
        if (response.valid) {
          // PATCH User Infos
          this.patchUserInfo(this.editUserInfos).then((response) => {
            // Notify
            this.$notify({
              title: 'Informations mise à jour',
              text: 'Votre compte à bien été mise à jour',
              type: 'success'
            });
            // Clear and close
            this.cancelNewInfos()
          }).catch((e) => {
            // Notify
            this.$notify({
              title: 'Erreur lors de la sauvegarde',
              text: "Une erreur s'est produite lors de l'enregistrement des données",
              type: 'error'
            });
            // Clear and close
            this.cancelNewInfos()
          })
        }
      })
    },
    cancelNewInfos() {
      this.isInfoUpdateActive = false
      this.init()
    },
    submitNewPassword() {
      // console.log('Password changed')
      this.isPasswordUpdateActive = false;
    },
  },
}
</script>

<style>
.user-info-card {
  width: 600px;
  height: 485px;
}

.user-info-close-icon {
  cursor: pointer;
}

.user-info-section-title {
  color: #414288;
  padding-left: 12px;
  padding-right: 12px;
}

.text-fields-container {
  max-height: 50px;
}

.user-info-buttons-container {

}

</style>