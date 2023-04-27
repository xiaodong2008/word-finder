import {createStore} from 'vuex'

const cfg = JSON.parse(localStorage.getItem("word-finder-cfg") || "{}")

export default createStore({
  state: {
    userdata: {
      login: false,
      userid: null
    },
    config: {
      "translate-lang": cfg["translate-lang"] || "ru",
      "translate-china-server": cfg["translate-china-server"] || false,
    }
  },
  getters: {},
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
    },
    setWord(state, newWord) {
      state.userdata.word = newWord
    },
    setConfig(state, config) {
      state.config = config
      localStorage.setItem("word-finder-cfg", JSON.stringify(state.config))
    }
  },
  actions: {},
  modules: {}
})
