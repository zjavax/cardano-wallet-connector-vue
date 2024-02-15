import { createStore } from 'vuex'

export default createStore({
  state: {
    whichWalletSelected: undefined,
    walletFound: false,
    // Define other variables in your state here
  },
  mutations: {
    setWhichWalletSelected(state, value) {
      state.whichWalletSelected = value
    },
    // Define mutations for other variables here
    setWalletFound(state, value) {
      state.walletFound = value
    },
  },
  actions: {
    updateWhichWalletSelected({ commit }, value) {
      commit('setWhichWalletSelected', value)
    },
    // Define actions for other variables here
    updateWalletFound({ commit }, value) {
      commit('setWalletFound', value)
    },
  },
  getters: {
    getWhichWalletSelected(state) {
      return state.whichWalletSelected
    },
    // Define getters for other variables here
    getWalletFound(state) {
      return state.walletFound
    },
  },
})
