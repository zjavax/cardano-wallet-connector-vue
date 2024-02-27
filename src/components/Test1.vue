<template>
  <div></div>
  <!-- Your template code goes here -->
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { createStore } from "vuex";

// Define the state
const state = reactive({
  whichWalletSelected: undefined,
});

// Create a local store instance
const store = createStore({
  state() {
    return state;
  },
  mutations: {
    setWhichWalletSelected(state, value) {
      state.whichWalletSelected = value;
    },
  },
});

// return { store };
</script>

<style>
/* Your CSS styles go here */
</style>
