import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import "./style.less"

import {FastjsDate} from "fastjs-next";

function getDate(utcDate) {
  // give a utc date, change it to local date
  const localTimestamp = new Date(utcDate).getTime()
  return new FastjsDate("Y-M-D h:m:s", localTimestamp).toString()
}

const app = createApp(App)
  .use(store)
  .use(router)
  .use(Antd)

app.config.globalProperties.getDate = getDate

app.mount('#app')