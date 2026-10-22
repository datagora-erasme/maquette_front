<template>
  <!-- Import / Edit User Layer Dialog -->
  <v-dialog
    :model-value="modelValue"
    width="450px"
    @update:modelValue="closeDialog()"
  >
    <v-card>
      <v-card-title>
        {{ dialogTitle }}
      </v-card-title>
      <v-card-text>
        <v-form ref="formImportLayer" on-submit="return false;">
          <v-text-field
            v-model="layerName"
            label="Nom de la couche *"
            width="100%"
            variant="outlined"
            :rules="[rules.required, rules.max30]"
            maxlength="30"
            counter
            clearable
          />
          <v-file-input
            v-model="geojsonFiles"
            label="Fichier GeoJSON *"
            accept=".geojson,.json"
            variant="outlined"
            prepend-icon="mdi-map-marker-path"
            :rules="[rules.requiredFile]"
            class="mt-2"
            show-size
          />
          <v-file-input
            v-model="sldFiles"
            label="Fichier de style SLD (optionnel)"
            accept=".sld,.xml"
            variant="outlined"
            prepend-icon="mdi-palette"
            hint="Sans fichier de style, la couche est affichée en bleu"
            persistent-hint
            class="mt-2"
            show-size
          />
        </v-form>
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-4"
          :text="errorMessage"
        />
      </v-card-text>
      <v-card-actions class="d-flex">
        <!-- Edit only: delete the layer (left) -->
        <v-btn
          v-if="isEditMode"
          color="red-darken-3"
          variant="outlined"
          size="small"
          @click="deleteLayer()"
        >
          Supprimer
        </v-btn>
        <v-spacer />
        <v-btn
          color="#37474F"
          variant="outlined"
          size="small"
          @click="closeDialog()"
        >
          Annuler
        </v-btn>
        <v-btn
          color="green-darken-2"
          variant="flat"
          size="small"
          :loading="isImporting"
          @click="importLayer()"
        >
          {{ isEditMode ? 'Sauvegarder' : 'Importer' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { createUserLayer, isUserLayerError } from '../utils/userLayer'

export default {
  name: 'ImportLayerDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    // User layer to edit (null: import of a new layer)
    userLayer: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:modelValue', 'onLayerImported', 'onLayerUpdated', 'onLayerDeleted'],
  data() {
    return {
      layerName: '',
      geojsonFiles: [],
      sldFiles: [],
      errorMessage: null,
      isImporting: false,
      rules: {
        required: value => !!(value && value.trim()) || 'Champs obligatoire',
        max30: value => !value || value.length <= 30 || 'Max 30 caractères',
        requiredFile: value => (value && value.length > 0) || 'Fichier obligatoire',
      },
    }
  },
  computed: {
    isEditMode() {
      return !!this.userLayer
    },
    dialogTitle() {
      return this.isEditMode ? "Modification d'une couche" : 'Importer une couche'
    },
  },
  watch: {
    modelValue(isOpen) {
      // Edit: fill the form with the current name & files of the layer
      if (isOpen && this.userLayer) {
        this.layerName = this.userLayer.name
        this.geojsonFiles = [this.userLayer.geojsonFile]
        this.sldFiles = this.userLayer.sldFile ? [this.userLayer.sldFile] : []
      }
    },
  },
  methods: {
    closeDialog() {
      // Clear form and close
      this.layerName = ''
      this.geojsonFiles = []
      this.sldFiles = []
      this.errorMessage = null
      this.$emit('update:modelValue', false)
    },
    deleteLayer() {
      const deletedLayerName = this.userLayer.name
      this.$emit('onLayerDeleted', this.userLayer.id)
      // Notify
      this.$notify({
        title: 'Couche supprimée',
        text: `La couche « ${deletedLayerName} » a été supprimée`,
        type: 'success'
      });
      this.closeDialog()
    },
    importLayer() {
      this.$refs.formImportLayer.validate().then((response) => {
        if (!response.valid) {
          return
        }
        this.errorMessage = null
        this.isImporting = true

        // Read & check files, then give the new (or updated, with the same id) layer to the Aside
        const editedLayerId = this.isEditMode ? this.userLayer.id : null
        createUserLayer(this.layerName.trim(), this.geojsonFiles[0], this.sldFiles.length ? this.sldFiles[0] : null, editedLayerId)
          .then((userLayer) => {
            this.$emit(this.isEditMode ? 'onLayerUpdated' : 'onLayerImported', userLayer)
            // Notify
            this.$notify({
              title: this.isEditMode ? 'Couche modifiée' : 'Couche importée',
              text: this.isEditMode
                ? `La couche « ${userLayer.name} » a été mise à jour`
                : `La couche « ${userLayer.name} » a été ajoutée dans « Mes données »`,
              type: 'success'
            });
            this.closeDialog()
          })
          .catch((e) => {
            // Error shown in the dialog (the user can change the files)
            this.errorMessage = isUserLayerError(e) ? e.message : "Une erreur s'est produite lors de la lecture des fichiers"
            if (!isUserLayerError(e)) {
              console.error(e)
            }
          })
          .finally(() => {
            this.isImporting = false
          })
      })
    },
  },
}
</script>
