<template>
  <topbar/>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component"/>
    </transition>
  </router-view>
  <BottomView/>
</template>

<script>
import topbar from "@/components/topbar.vue";
import BottomView from "@/components/bottomView.vue";
import {userdata} from "@/api";

import {FastjsDate} from "fastjs-next";
console.log(`${new FastjsDate("Y-M-D h:m:s")}`)

export default {
  name: 'app',
  components: {
    BottomView,
    topbar
  },
  data() {
    userdata().then(res => {
      // if at /login or /register
      if (res.login) {
        if (this.$route.path === "/login" || this.$route.path === "/register")
          this.$router.push("/")
        // router hook
        this.$router.beforeEach((to, from, next) => {
          if (to.path !== "/login" && to.path !== "/register")
            next()
        })
      }
      this.$store.commit('setUserData', res)
    })
    return {}
  },
}
</script>

<style lang="less">
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave {
  opacity: 1;
}
</style>
