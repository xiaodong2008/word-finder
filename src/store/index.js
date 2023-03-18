import { createStore } from 'vuex'

export default createStore({
  state: {
    userdata: {
      login: false,
      userid: null
    }
  },
  getters: {
  },
  mutations: {
    setUserData(state, data) {
      for (const key in data) {
        state.userdata[key] = data[key]
      }
      console.log(state.userdata)
    },
    logout(state) {
      state.userdata = {
        login: false,
        userid: null
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
