import {createStore} from 'vuex'
import {message} from "ant-design-vue";

const cfg = JSON.parse(localStorage.getItem("word-finder-cfg") || "{}")

export default createStore({
  state: {
    userdata: {
      login: false,
      userid: null
    },
    config: {
      "translate-lang": cfg["translate-lang"] || "ru"
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
      // compare config with default config
      if (JSON.stringify(config) === JSON.stringify(state.config)) return
      state.config = JSON.parse(JSON.stringify(config))
      localStorage.setItem("word-finder-cfg", JSON.stringify(state.config))
      message.success("Save config success")
    }
  },
  actions: {},
  modules: {}
})
