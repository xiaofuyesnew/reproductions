<template>
  <div>{{ test }}</div>
  <Hello />
</template>

<script setup>
// import { ref } from 'vue'
import Hello from '../components/Hello.vue'

const test = ref(0)

</script>