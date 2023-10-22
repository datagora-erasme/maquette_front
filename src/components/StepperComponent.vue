<template>
  <div class="steps-container w-100 d-flex flex-row pa-0 justify-space-between align-center">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step d-flex flex-column pa-0 justify-center align-center"
    >
      <div 
        class="bullet d-flex flex-row justify-center align-center" 
        :style="{'background-color': index < currentStep ? '#414288': '#1976D3'}"
      >
        <v-icon v-if="index < currentStep || currentStep === steps.length" class="check-icon" icon="mdi-check" />
        <div v-else>
          {{ index + 1 }}
        </div>
      </div>
      <div class="title">
        <span :class="index === currentStep ? 'font-weight-bold fs-15':''">{{ step }}</span>
      </div>
      <div
        v-if="index < steps.length -1"
        class="line"
        :style="{'background-color': index < currentStep -1 ? '#414288': '#1976D3'}"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepperComponent',
  props: {
      steps: {
        type: Array,
        required: true,
      },
      currentStep: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
      }
  },
}
</script>

<style>
.step {
  position: relative;
}
.bullet {
  border-radius: 50%;
  background-color: #414288;
  color: white;
  font-weight: bold;
  width: 3rem;
  height: 3rem;
}
.title {
  font-size: small;
  color: #414288;
  text-align: center;
  margin-top: 0.3rem;
}
.fs-15 {
  font-size: 15px;
}

.line {
  width: 150px;
  height: 2px;
  background-color: #414288;
  position: absolute;
  top: 30%;
  left: 50%;
  z-index: -1;
}
</style>