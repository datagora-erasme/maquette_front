<template>
  <v-card loading class="CSVLoadingScreen ma-auto">
    <v-card-title class="loading-screen-title d-flex justify-center">
      Téléchargement du CSV en cours
    </v-card-title>
    <v-card-item class="w-max px-5">
      Le modèle de construction CSV de la maquette est en cours de téléchargement. 
      <br>
      Cette opération peut prendre quelques minutes.
      <br><br>
      <b>Cette fenêtre se fermera automatiquement à la fin du téléchargement.</b>
    </v-card-item>
  </v-card>
</template>

<script>
export default {
  name: 'CSVLoadingScreen',
  data() {
    return {
    }
  },
}
</script>

<style>
.CSVLoadingScreen {
  width: 600px;
  height: 200px;
}

.loading-screen-title {
  color: #37474F;
}
</style>