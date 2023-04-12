<template>
  <nav id="topbar">
    <a-space size="middle">
      <span class="block"></span>
      <router-link to="/">WordFinder - Easy, Powerful, Open Source</router-link>
<!--      <div class="wd-icon blue" style="margin-top: 2px">Beta</div>-->
      <router-link to="/">Home</router-link>
    </a-space>
    <a-space class="right" size="middle">
      <router-link to="/login" v-if="!isLogin">Login</router-link>
      <router-link to="/register" style="color: aqua" v-if="!isLogin">Register</router-link>
      <router-link to="/dashboard" v-if="isLogin">Dashboard</router-link>
      <span v-if="isLogin" @click="$refs.activate.open()">Activate</span><activate ref="activate"/>
      <router-link class="color-light" to="/dictionary" v-if="isLogin">Dictionary</router-link>
      <span @click="logout" v-if="isLogin">Logout</span>
      <span class="block"></span>
    </a-space>
  </nav>
</template>

<script>
import {mapState} from "vuex";
import {logout} from "@/api";
import cookie from "js-cookie";
import Activate from "@/components/activate.vue";

export default {
  name: 'topbar',
  components: {Activate},
  computed: {
    ...mapState({
      isLogin: state => state.userdata.login
    })
  },
  methods: {
    logout() {
      logout().then(() => {
        cookie.remove("token")
        location.reload()
      })
    }
  }
}
</script>

<style scoped lang="less">
#topbar {
  display: flex;
  width: 100%;
  padding: 10px;
  user-select: none;

  span {
    cursor: pointer;
  }

  > .right {
    margin-left: auto;
  }

  .block {
    width: 10px;
  }
}
</style>
