<template>
  <v-slide-x-transition>
    <v-card v-show="asidePosStatus" id="aside-card">
      <v-card-title class="aside-card-title">
        <v-row>
          <v-col class="d-flex align-center">
            Position de la carte
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn icon size="small" variant="text">
              <v-icon class="close-icon" icon="mdi-close" @click="closeAsidePos()" />
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="pa-0 mt-5 mx-5">
        <v-text-field
          v-model="newOlCenterX"
          label="Position X"
          type="number"
          variant="underlined"
          density="compact"
          prepend-icon="mdi-arrow-left-right"
          @click:append-inner="changeOlCenter"
          @keydown.enter="changeOlCenter"
          @blur="changeOlCenter"
        />
        <v-text-field
          v-model="newOlCenterY"
          label="Position Y"
          type="number"
          variant="underlined"
          density="compact"
          prepend-icon="mdi-arrow-up-down"
          @click:append-inner="changeOlCenter"
          @keydown.enter="changeOlCenter"
          @blur="changeOlCenter"
        />
        <v-text-field
          v-model="newOlZoom"
          label="Zoom (3,00 à 20,00)"
          type="number"
          min="0"
          max="20"
          variant="underlined"
          density="compact"
          prepend-icon="mdi-magnify-plus-outline"
          @click:append-inner="changeOlZoom"
          @keydown.enter="changeOlZoom"
          @blur="changeOlZoom"
        />
        <v-row>
          <v-col>
            <v-btn
              density="comfortable"
              color="#414288"
              min-height="40"
              style="color: white"
              block
              :disabled="!isPosDifferent"
              @click="resetPos()"
            >
              Réinitialiser
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              density="comfortable"
              color="#1B5E20"
              min-height="40"
              style="color: white"
              block
              :disabled="!isPosDifferent"
              @click="updatePos()"
            >
              Sauvegarder
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-slide-x-transition>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'AsidePositionComp',
  data() {
    return {
      newOlCenterX: null,
      newOlCenterY: null,
      newOlZoom: null,
    }
  },
  computed: {
    ...mapGetters({
      getAsidePosStatus: 'aside/getAsidePosStatus',
      getOlCenterX: 'map/getOlCenterX',
      getOlCenterY: 'map/getOlCenterY',
      getOlZoom: 'map/getOlZoom',
      getOpenedMockup: 'map/getOpenedMockup',
    }),
    asidePosStatus() {
      return this.getAsidePosStatus
    },
    currOlZoom() {
      return this.getOlZoom
    },
    currOlCenterX() {
      return this.getOlCenterX
    },
    currOlCenterY() {
      return this.getOlCenterY
    },
    currOpenedMockup() {
      return this.getOpenedMockup
    },
    currOpenedMockupPos() {
      var returnPos = null
      if (this.currOpenedMockup && this.currOpenedMockup.pos) {
        returnPos = JSON.parse(this.currOpenedMockup.pos)
      }
      return returnPos
    },
    isPosDifferent() {
      var diff = false

      // Compare OMPos & local var
      if (this.currOpenedMockupPos) {
        if (this.currOpenedMockupPos.centerX !== this.newOlCenterX) {
          diff = true
        }
        if (this.currOpenedMockupPos.centerY !== this.newOlCenterY) {
          diff = true
        }
        if (this.currOpenedMockupPos.zoom !== this.newOlZoom) {
          diff = true
        }
      }

      return diff
    }
  },
  watch: {
    currOlCenterX() {
      this.newOlCenterX = this.currOlCenterX
    },
    currOlCenterY() {
      this.newOlCenterY = this.currOlCenterY
    },
    currOlZoom() {
      this.newOlZoom = this.currOlZoom
    },
  },
  mounted() {
    // ===== Bind Events =====
    this.$evtBus.on('onUpdatePos', this.updatePos)

    // Init for setExtent
    this.initPos()
  },
  methods: {
    ...mapActions({
      setAsidePosStatus: 'aside/setAsidePosStatus',
      setOlCenterX: 'map/setOlCenterX',
      setOlCenterY: 'map/setOlCenterY',
      setOlZoom: 'map/setOlZoom',
      updateProject: 'project/updateProject',
      updateOpenedMockupPos: 'map/updateOpenedMockupPos'
    }),
    closeAsidePos() {
      this.setAsidePosStatus(false)
    },
    initPos() {
      // Set initial OL Center X & Y
      this.newOlCenterX = this.currOlCenterX
      this.newOlCenterY = this.currOlCenterY
      // Set initial OL Zoom
      this.newOlZoom = this.currOlZoom
    },
    updatePos() {
      // ===== Save in DB =====
      // (Set Map & Store do in moveEnd event)

      // Build new Pos Obj
      var newPosJson = {
        centerX: this.newOlCenterX,
        centerY: this.newOlCenterY,
        zoom: this.newOlZoom,
      }
      var newPosStr = JSON.stringify(newPosJson)

      // Build Mockup Obj
      const updatedMockup = {
        id: this.currOpenedMockup.id,
        pos: newPosStr,
      }
      // PATCH Mockup
      this.updateProject(updatedMockup)
      .then((response) => {
        // Re-set pos in Store Mockup
        this.updateOpenedMockupPos(newPosStr)

        // Notify
        this.$notify({
          title: 'Position mise à jour',
          text: 'La position de projection été mise à jour',
          type: 'success'
        });
      }).catch((e) => {
        // Notify
        this.$notify({
          title: 'Erreur lors de la sauvegarde',
          text: "Une erreur s'est produite lors de l'enregistrement des données",
          type: 'error'
        });
      })
    },
    resetPos() {
      // Re-Set Pos in local with BD value
      this.newOlCenterX = this.currOpenedMockupPos.centerX
      this.newOlCenterY = this.currOpenedMockupPos.centerY
      this.newOlZoom = this.currOpenedMockupPos.zoom

      // Set in Map (store with moveEnd event)
      this.changeOlCenter()
      this.changeOlZoom()
    },
    verifyOlZoom() {
      // Min or null value
      if (!this.newOlZoom || this.newOlZoom < 3) {
        this.newOlZoom = 3
      }

      // Max value
      if (this.newOlZoom > 20) {
        this.newOlZoom = 20
      }
    },
    changeOlZoom() {
      // Verify values
      this.verifyOlZoom()

      // Set Zoom in view (with EvtBus)
      this.$evtBus.emit('onChangeZoom', parseFloat(this.newOlZoom))
    },
    verifyOlCenter() {
      // Min or null value CenterX
      if (!this.newOlCenterX || this.newOlCenterX < -22000000) {
        this.newOlCenterX = -22000000
      }
      // Max value CenterX
      if (this.newOlCenterX > 18500000) {
        this.newOlCenterX = 18500000
      }

      // Min or null value CenterY
      if (!this.newOlCenterY || this.newOlCenterY < -19600000) {
        this.newOlCenterY = -19600000
      }
      // Max value CenterY
      if (this.newOlCenterY > 19600000) {
        this.newOlCenterY = 19600000
      }
    },
    changeOlCenter() {
      // Verify values
      this.verifyOlCenter()

      // Compile Center in obj
      var newCenter = [parseFloat(this.newOlCenterX), parseFloat(this.newOlCenterY)]

      // Set Zoom in view (with EvtBus)
      this.$evtBus.emit('onChangeCenter', newCenter)
    },
  },
}
</script>

<style lang="scss">
#aside-card {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  border-radius: 0;
  z-index: 10;

  .aside-card-title {
    background: #1976D3; 
    color: white;
  }
}
.close-icon {
  font-size: 25px;
}
</style>