import { createStore } from 'vuex'

export default createStore({
  state: {
    whichWalletSelected: undefined,
    // Define other variables in your state here
  },
  mutations: {
    setWhichWalletSelected(state, value) {
      state.whichWalletSelected = value
    },
    // Define mutations for other variables here
  },
  actions: {
    updateWhichWalletSelected({ commit }, value) {
      commit('setWhichWalletSelected', value)
    },
    // Define actions for other variables here
  },
  getters: {
    getWhichWalletSelected(state) {
      return state.whichWalletSelected
    },
    // Define getters for other variables here
  },
})
