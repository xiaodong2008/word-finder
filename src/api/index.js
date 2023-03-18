import {FastjsAjax} from "fastjs-next";
import {message} from "ant-design-vue";
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

import {register, login, data as userdata, logout} from "@/api/user";
import {generate as generateParagraph, history as paragraphHistory} from "@/api/paragraph";
import {count as dictionaryCount, get as dictionary, add as dictionaryAdd, del as dictionaryDelete} from "@/api/dictionary";

export {
  register, login, userdata, logout,
  generateParagraph, paragraphHistory,
  dictionaryCount, dictionary, dictionaryAdd, dictionaryDelete
}

