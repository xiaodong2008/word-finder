<template>
  <div id="home">
    <div class="main-app">
      <div class="section-select">
        Select Level:
        <a-select v-model:value="nowLevel" class="select" defaultValue="low">
          <a-select-option v-for="item in levelSelect" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
        Select Subject:
        <a-select v-model:value="nowSubject" class="select" defaultValue="any">
          <a-select-option v-for="item in subjectSelect" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
        Words:
        <a-select v-model:value="nowWord" class="select" defaultValue="50">
          <a-select-option v-for="item in wordSelect" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
        <a-button type="primary" class="select" @click="generate" :disabled="noLogin">Start</a-button>
        <a-button class="select right" @click="historyVisible = !0" :disabled="noLogin">History</a-button>
        <History :visible="historyVisible" @close="historyVisible = !1" @show="showParagraph"/>
      </div>
      <div class="paragraph" v-html="paragraph">
      </div>
      <div class="wordCard" v-if="wordCard.visible" :style="{left: `${wordCard.x}px`, top: `${wordCard.y}px`}">
        <div class="flex">
          <h3>{{ wordCard.word }}</h3>
          <div class="toolbar">
            <plus-circle-outlined @click="addWord(wordCard.word)"/>
          </div>
        </div>
        <a-skeleton :loading="!wordCard.visible">
          <div class="define" v-for="item of wordCard.define">
            <h4 class="spc">{{ item.partOfSpeech }}</h4>
            <span class="mean" v-for="(item, key) of item.definitions">({{ key + 1 }}) {{ item.definition }}<br/></span>
          </div>
        </a-skeleton>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import {dictionaryAdd, generateParagraph} from "@/api";
import {message} from "ant-design-vue";
import History from "@/views/home/history.vue";
import {selector} from "fastjs-next";
import {FastjsAjax} from "fastjs-next";
import {PlusCircleOutlined} from "@ant-design/icons-vue";

export default {
  name: "home-index",
  components: {
    History,
    PlusCircleOutlined
  },
  data() {
    return {
      levelSelect: ["low", "medium", "high"],
      nowLevel: "low",
      subjectSelect: ["any", "car", "news", "food", "movie", "music", "sport", "travel", "game", "science", "history", "politics", "art", "fashion", "literature", "technology", "finance", "education", "medical", "environment", "religion", "law"],
      nowSubject: "any",
      wordSelect: ["50", "100", "200", "300", "400", "500"],
      nowWord: "50",
      paragraph: "",
      historyVisible: false,
      wordCard: {
        word: "",
        x: 0,
        y: 0,
        visible: false,
        loading: true,
        define: []
      }
    };
  },
  mounted() {
    selector("#home .paragraph").on("click", (d, e) => {
      if (e.target.classList.contains("word")) {
        // get word
        const word = e.target.innerText;
        // show word card
        this.wordCard.word = word;
        this.wordCard.x = e.clientX;
        this.wordCard.y = e.clientY;
        this.wordCard.define = [];
        setTimeout(() => this.wordCard.visible = true, 100);
        this.wordCard.loading = true;
        const hideWordCard = (ev) => {
          // if click on word card or element in word card, return
          if (ev.target.classList.contains("word") || ev.target.closest(".wordCard")) return;
          this.wordCard.visible = false;
          document.removeEventListener("click", hideWordCard);
        }
        setTimeout(() => document.addEventListener("click", hideWordCard), 5)
        // get word define
        const load = message.loading("Getting word define", 0);
        new FastjsAjax("https://api.dictionaryapi.dev/api/v2/entries/en/" + word).get().then(res => {
          this.wordCard.loading = false;
          this.wordCard.define = res[0].meanings;
          load();
        }).catch(() => {
          load()
          this.wordCard.loading = false;
          message.error("Oops, there are no defining of " + word);
        })
      }
    })
  },
  computed: {
    ...mapState({
      noLogin: state => !state.userdata.userid
    })
  },
  methods: {
    generate() {
      const load = message.loading("Generating Paragraph...", 0);
      generateParagraph(this.nowWord, this.nowLevel, this.nowSubject).then(res => {
        this.showParagraph(res.paragraph)
        load();
      }).catch(() => {
        load();
      })
    },
    showParagraph(words) {
      let paragraph = "";
      this.paragraph = "";
      // add word slowly
      const nextWord = (key) => {
        if (this.paragraph.replace(/<span class='word'>([a-zA-Z]+)<\/span>/g, "$1") !== paragraph) return;
        paragraph += words[key];
        this.paragraph = paragraph.replace(/[A-Za-z]+/g, "<span class='word'>$&</span>");
        if (key < words.length - 1) {
          setTimeout(() => {
            nextWord(key + 1);
          }, [",", ".", "?"].includes(words[key]) ? 500 : 20);
        }
      }
      nextWord(0);
    },
    addWord(word) {
      dictionaryAdd(word).then(() => {
        message.success("Add word " + word + " successfully");
      })
    }
  }
}
</script>

<style lang="less">
#home {
  .main-app {
    padding: 20px 50px;

    .section-select {
      height: 30px;
      line-height: 30px;
      display: flex;
      // content left
      justify-content: left;
      align-content: center;

      .select {
        margin: 0 20px;
        width: 140px;
      }

      .right {
        margin-left: auto;
      }
    }

    .paragraph {
      margin-top: 20px;
      font-size: 18px;
      font-weight: 500;
      line-height: 30px;
      user-select: none;

      .word {
        cursor: pointer;

        &:hover {
          background-color: #48b4a0;
        }
      }
    }

    .wordCard {
      position: absolute;
      background-color: #ffffff;
      border: 1px solid #8c938d;
      padding: 10px 20px;
      max-width: 450px;
      min-width: 150px;
      z-index: 9;

      > span, h3 {
        color: black !important;
      }

      .flex {
        display: flex;
        border-bottom: 1px solid #dcdcdc;

        h3 {
          margin-bottom: 0;
          margin-top: 4px;
        }

        > .toolbar {
          cursor: pointer;
          font-size: 14px;
          transition: 0.2s all;
          padding: 5px 0;
          margin-left: 5px;

          > .toolbar {
            cursor: pointer;
            font-size: 14px;
            border-bottom: 1px solid #dcdcdc;
            transition: 0.2s all;
            padding: 5px 0;

            > * {
              padding: 5px;
            }

            > *:hover {
              background-color: #e8e8e8;
            }

            * {
              color: #19a7ff !important;
            }
          }

          > * {
            padding: 5px;
          }

          > *:hover {
            background-color: #e8e8e8;
          }

          * {
            color: #19a7ff !important;
          }
        }
      }

      .define {
        .spc {
          font-weight: 600;
          margin: 5px 0;
          color: black;
        }

        .mean {
          font-size: 12px;
          font-weight: 400;
          color: #5e5e5e;
        }
      }
    }
  }
}
</style>