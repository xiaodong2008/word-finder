<template>
  <div id="home">
    <div class="main-app">
      <div class="section-select">
        <a-space size="large">
          <span>Select Level:</span>
          <a-select v-model:value="nowLevel"
                    defaultValue="low">
            <a-select-option
                v-for="item in levelSelect"
                :key="item"
                :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
          <span>Select Subject:</span>
          <a-select v-model:value="nowSubject"
                    defaultValue="any">
            <a-select-option
                v-for="item in subjectSelect"
                :key="item"
                :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
          <span>Words:</span>
          <a-select v-model:value="nowWord"
                    defaultValue="50">
            <a-select-option
                v-for="item in wordSelect"
                :key="item"
                :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
          <a-button type="primary"
                    @click="generate"
                    :disabled="noLogin">
            Start
          </a-button>
        </a-space>
        <a-space size="large" class="right">
          <a-button @click="newParagraph()"
                    type="primary"
                    :disabled="noLogin">
            <template #icon>
              <form-outlined/>
            </template>
            New Paragraph
          </a-button>
          <a-button @click="historyVisible = !0"
                    :disabled="noLogin">
            <template #icon>
              <menu-fold-outlined/>
            </template>
            History
          </a-button>
          <History :visible="historyVisible" @close="historyVisible = !1" @show="showParagraph"/>
        </a-space>
      </div>
      <div class="section-select" style="margin-top: 10px">
      </div>
      <div class="section-select">
        Speed:&nbsp;
        <car-outlined/>
        <a-slider v-model:value="speed" :min="0" :max="100" :step="1" :disabled="noLogin" class="speed-selector"
                  style="margin: 0 30px !important;"/>
        <rocket-outlined/>
      </div>
      <div class="paragraph">
        <span class="index" ref="paragraph" v-html="paragraph.index" :class="{edit: paragraph.edit}"
              :contenteditable="paragraph.edit"></span>
        <div class="tool" v-if="paragraph.index.length && !paragraph.loading">
          <edit-outlined v-if="!paragraph.edit" class="edit-btn" @click="paragraph.edit = true"/>
          <close-outlined v-if="paragraph.edit"
                          @click="$refs.paragraph.innerHTML = paragraph.index;paragraph.edit = false" class="red"/>
          <check-outlined v-if="paragraph.edit" @click="paragraph.edit = false;saveParagraphChange()" class="green"/>
        </div>
        <div class="info" v-if="paragraph.index.length">
          <a-space class="read-mode" v-if="!paragraph.edit" :size="5">
            <close-circle-filled class="red"/>
            <span>Read Mode</span>
          </a-space>
          <a-space class="edit-mode" v-if="paragraph.edit" :size="5">
            <check-circle-filled class="green"/>
            <span>Edit Mode</span>
          </a-space>
        </div>
      </div>
      <div class="wordCard" v-if="wordCard.visible" :style="{left: `${wordCard.x}px`, top: `${wordCard.y}px`}">
        <div class="flex">
          <h3>{{ wordCard.word }}</h3>
          <div class="toolbar">
            <plus-circle-outlined @click="addWord
            (wordCard.word)"/>
            <sound-outlined @click="playWord(wordCard.audio)" :class="{gray: !wordCard.audio}"/>
          </div>
        </div>
        <a-skeleton :loading="wordCard.loading" size="small" :active="true">
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
import {
  dictionaryAdd,
  generateParagraph,
  updateParagraph,
  createParagraph
} from "@/api";
import {message} from "ant-design-vue";
import History from "@/views/home/history.vue";
import {FastjsDom, selector} from "fastjs-next";
import {FastjsAjax} from "fastjs-next";
import {
  PlusCircleOutlined,
  SoundOutlined,
  CarOutlined,
  RocketOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  CloseCircleFilled,
  CheckCircleFilled,
  MenuFoldOutlined,
  FormOutlined
} from "@ant-design/icons-vue";

export default {
  name: "home-index",
  components: {
    History,
    PlusCircleOutlined,
    SoundOutlined,
    CarOutlined,
    RocketOutlined,
    EditOutlined,
    CloseOutlined,
    CheckOutlined,
    CloseCircleFilled,
    CheckCircleFilled,
    MenuFoldOutlined,
    FormOutlined
  },
  data() {
    return {
      levelSelect: ["low", "medium", "high"],
      nowLevel: "low",
      subjectSelect: ["any", "car", "news", "food", "movie", "music", "sport", "travel", "game", "science", "history", "politics", "art", "fashion", "literature", "technology", "finance", "education", "medical", "environment", "religion", "law"],
      nowSubject: "any",
      wordSelect: ["50", "100", "200", "300", "400", "500"],
      nowWord: "50",
      paragraph: {
        index: "",
        loading: true,
        edit: false,
        id: null,
        listen: 0,
        enterDown: false
      },
      historyVisible: false,
      wordCard: {
        word: "",
        x: 0,
        y: 0,
        visible: false,
        loading: true,
        define: [],
        phonetic: "",
        audio: null
      },
      speed: 20,
    };
  },
  mounted() {
    selector("#home .paragraph").on("click", (d, e) => {
      if (e.target.classList.contains("word")) {
        // if edit mode, return
        if (this.paragraph.edit) return;
        // get word
        const word = e.target.innerText;
        // show word card
        this.wordCard.word = word;
        // if win.width - x < 240, x = win.width - 240
        this.wordCard.x = e.clientX + 240 > window.innerWidth ? window.innerWidth - 240 : e.clientX;
        this.wordCard.y = e.clientY;
        this.wordCard.define = [];
        setTimeout(() => this.wordCard.visible = true, 100);
        this.wordCard.loading = true;
        this.wordCard.audio = null;
        const hideWordCard = (ev) => {
          // if click on word card or element in word card, return
          if (ev.target.classList.contains("word") || ev.target.closest(".wordCard")) return;
          this.wordCard.visible = false;
          document.removeEventListener("click", hideWordCard);
        }
        setTimeout(() => document.addEventListener("click", hideWordCard), 5)
        // get word define
        const load = message.loading("Getting word define", 0);
        const req = () => new FastjsAjax("https://api.dictionaryapi.dev/api/v2/entries/en/" + word).get().then(res => {
          this.wordCard.loading = false;
          this.wordCard.define = res[0].meanings;
          this.wordCard.phonetic = res[0].phonetic;
          let audios = res[0].phonetics, audio;
          // try if any .audio.length
          for (let i of audios) {
            if (i.audio.length) {
              audio = i.audio;
              break;
            }
          }

          this.wordCard.audio = audio ? new Audio(audio) : false;
          load();
        }).catch(err => {
          load()
          // if type is Error
          if (err instanceof Error) {
            req()
          } else {
            this.wordCard.loading = false;
            message.error("Oops, there are no defining of " + word);
          }
        })
        req()
      }
    })
  },
  computed: {
    ...mapState({
      noLogin: state => !state.userdata.userid
    })
  },
  watch: {
    "paragraph.edit"(val) {
      if (val) {
        this.paragraph.listen = (d, e) => {
          if (e.key === "Enter") {
            if (!this.paragraph.enterDown) {
              this.paragraph.enterDown = true;
              message.info("Press Enter again to insert a new line");
              e.preventDefault();
              document.execCommand("insertHTML", false, " ");
            } else {
              e.preventDefault();
              if (this.$refs.paragraph.innerHTML.match(/\[Place letter after this, it will be auto remove after you type]/g))
                return message.warn("Type some words first");
              // do backspace to remove space
              document.execCommand("delete");
              this.$nextTick(() =>
                  document.execCommand("insertHTML", false, "<br/>[Place letter after this, it will be auto remove after you type]")
              )
            }
          } else {
            this.paragraph.enterDown = false;
            if (this.$refs.paragraph.innerHTML.match(/\[Place letter after this, it will be auto remove after you type]/g))
              this.$refs.paragraph.innerHTML = this.$refs.paragraph.innerHTML.replace(/\[Place letter after this, it will be auto remove after you type]/g, "");
            this.$nextTick(() => {
              // remove space after a line
              console.debug(this.$refs.paragraph.innerHTML)
              if (this.$refs.paragraph.innerHTML.match(/([^ ]+) +\n/g))
                this.$refs.paragraph.innerHTML = this.$refs.paragraph.innerHTML.replace(/([^ ]+) +\n/g, "$1\n");
            })
          }
        }
        new FastjsDom(this.$refs.paragraph).on("keydown", this.paragraph.listen)
      } else {
        new FastjsDom(this.$refs.paragraph).off("keydown", this.paragraph.listen)
        this.$nextTick(() => {
          this.$refs.paragraph.focus();
        })
      }
    }
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
    saveParagraphChange() {
      const load = message.loading("Saving change...", 0);
      console.log(this.$refs.paragraph.innerHTML)
      console.log(this.$refs.paragraph.innerHTML.replace(/<span class=['"]word['"]>([a-zA-Z]+)<\/span>/g, "$1"))
      this.paragraph.index = this.$refs.paragraph.innerHTML
          .replace(/<span class=['"]word['"]>([a-zA-Z]+)<\/span>/g, "$1")
          .replaceAll("<br>", "[*&]")
          .replace(/[a-zA-Z]+/g, "<span class='word'>$&</span>")
          .replaceAll("[*&]", "<br>");
      this.paragraph.index = this.paragraph.index.replace(/&nbsp;/g, " ");
      console.log(this.paragraph.index)
      let newParagraph = this.paragraph.index.replace(/<span class='word'>([a-zA-Z]+)<\/span>/g, "$1");
      if (this.paragraph.id) {
        updateParagraph(this.paragraph.id, newParagraph).then(() => {
          load();
        }).catch(() => {
          load();
        })
      } else {
        createParagraph(newParagraph).then(() => {
          load();
        }).catch(() => {
          load();
        })
      }
    },
    showParagraph(config) {
      console.log(config)
      let paragraph = "", words = config.paragraph;
      this.paragraph.id = config.id;
      this.paragraph.index = "";
      this.paragraph.loading = true;
      // add word slowly
      const nextWord = (key) => {
        if (this.paragraph.id !== config.id) return;
        paragraph += words[key];
        this.paragraph.index = paragraph
            .replaceAll("\n", "<br>")
            .replace(
                /(^|[^<])\b([A-Za-z]+)\b/g,
                (match, p1, p2) =>
                    p1 + "<span class='word'>" + p2 + "</span>");
        if (key < words.length - 1) {
          setTimeout(() => {
            nextWord(key + 1);
          }, [",", ".", "?"].includes(words[key]) ? 500 - this.speed * 3 : (100 - this.speed) / 5);
        } else {
          this.paragraph.loading = false;
        }
      }
      nextWord(0);
    },
    playWord(audio) {
      if (!audio) return message.error("There are no audio for this word.");
      let wait = message.loading("Loading audio...", 0);
      audio.play().then(() => {
        wait();
      }).catch(() => {
        wait();
        message.error("Your network is not good, you can try again.");
      })
    },
    addWord(word) {
      let load = message.loading("Adding word " + word + " to dictionary...", 0);
      dictionaryAdd(word).then(() => {
        load();
        message.success("Add word " + word + " successfully");
      }).catch(() => {
        load();
        message.error("Add word " + word + " failed");
      })
    },
    newParagraph() {
      this.paragraph.index = "[Place letter after this, it will be auto remove after you type]";
      this.paragraph.loading = false;
      this.paragraph.edit = true;
    },
  },
  beforeUnmount() {
    this.paragraph.id = null;
  }
}
</script>

<style lang="less">
#home {
  .main-app {
    padding: 20px 50px;

    .section-select {
      line-height: 30px;

      .speed-selector {
        width: calc(60% - 40px);
        display: inline-block;
        margin: 0 10px 0 10px;
      }

      .right {
        float: right;
      }
    }

    .paragraph {
      margin-top: 20px;
      font-size: 18px;
      font-weight: 500;
      line-height: 30px;
      user-select: none;

      .index {
        margin-right: 8px;

        &:not(.edit) .word {
          cursor: pointer;

          &:hover {
            background-color: #48b4a0;
          }
        }
      }

      .tool, .info {
        .green svg {
          color: #48b4a0 !important;
        }

        .red svg {
          color: #e74c3c !important;
        }
      }

      .tool {
        display: inline;

        > * {
          margin-left: 4px;
        }
      }

      .info {
        cursor: not-allowed;
        font-size: 13px;
        font-weight: 400;
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

          > * {
            padding: 5px;
          }

          > *:hover {
            background-color: #e8e8e8;
          }

          *:not(.gray) {
            color: #19a7ff !important;
          }

          .gray, .gray * {
            color: #5d5d5d !important;
          }

          .gray {
            background-color: rgba(150, 150, 150, 0.39);
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