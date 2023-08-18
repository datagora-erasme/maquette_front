<template>
  <v-card class="CSVLoadingScreen ma-auto">
    Idée : informer l'utilisateur que le CSV est en cours de génération et que l'oprération peut prendre du temps<br><br>
    <div class="red--text">
      LE TELECHARGEMENT DU CSV EST EN COURS CETTE FENETRE SE FERMERA AUTOMATIQUEMENT A LA FIN DE L'OPERATION. 
    </div>
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
  width: 500px;
  height: 300px;
}
</style>