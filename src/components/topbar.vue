<template>
  <nav id="topbar">
    <div>
      <router-link to="/">WordFinder - Easy, Powerful, Open Source</router-link>
      <div class="wd-icon blue" style="margin-top: 2px">Beta</div>
      <router-link to="/">Home</router-link>
    </div>
    <div class="right">
      <router-link to="/login" v-if="!isLogin">Login</router-link>
      <router-link to="/register" style="color: aqua" v-if="!isLogin">Register</router-link>
<!--      <router-link to="/dashboard" v-if="isLogin">Dashboard</router-link>-->
      <router-link class="color-light" to="/dictionary" v-if="isLogin">Dictionary</router-link>
      <span @click="logout" v-if="isLogin">Logout</span>
    </div>
  </nav>
</template>

<script>
import {mapState} from "vuex";
import {logout} from "@/api";
import cookie from "js-cookie";

export default {
  name: 'topbar',
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

  > div {
    display: flex;

    > * {
      margin: 0 7px;
      cursor: pointer;
    }
  }

  > .right {
    margin-left: auto;
  }
}
</style>
