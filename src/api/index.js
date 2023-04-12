import {FastjsAjax} from "fastjs-next";
import {message} from "ant-design-vue";
import store from "@/store";
import cookie from "js-cookie";

export function request(url, data, method = 'GET', config = {}) {
  return new Promise((resolve, reject) => {
    new FastjsAjax(url, data, {
      headers: {
        "Authorization": cookie.get("token") || ""
      },
      ...config
    }).send(method).then((res) => {
      if (res.msg) message.success(res.msg)
      if (res.newWord) store.commit("setWord", res.newWord)
      resolve(res)
    }).catch((err) => {
      switch (true) {
        case err instanceof Error:
          message.error(err.message)
          break
        case !!err?.msg:
          message.error(err.msg)
          break
        default:
          message.error(String(err))
      }
      reject(err)
    })
  })
}

import {
  register,
  login,
  data as userdata,
  logout,
  redeem,
  word as dashboardWord,
  wordCount as dashboardWordCount,
  activate as dashboardActivate,
  activateCount as dashboardActivateCount
} from "@/api/user";

import {
  generate as generateParagraph,
  history as paragraphHistory,
  edit as updateParagraph
} from "@/api/paragraph";

import {
  count as dictionaryCount,
  get as dictionary,
  add as dictionaryAdd,
  del as dictionaryDelete
} from "@/api/dictionary";


export {
  register, login, userdata, logout, redeem, dashboardWord, dashboardWordCount, dashboardActivate, dashboardActivateCount,
  generateParagraph, paragraphHistory, updateParagraph,
  dictionaryCount, dictionary, dictionaryAdd, dictionaryDelete
}

