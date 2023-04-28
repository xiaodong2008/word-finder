<template>
  <div id="home">
    <div class="main-app">
      <div class="section-select">
        <a-space size="large">
          <span>Select Level:</span>
          <a-select v-model:value="nowLevel"
                    defaultValue="low"
                    :dropdownMatchSelectWidth="!1">
            <a-select-option
                v-for="item in levelSelect"
                :key="item"
                :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
          <span>Select Subject:</span>
          <a-select v-model:value="nowSubject"
                    defaultValue="any"
                    :dropdownMatchSelectWidth="!1">
            <a-select-option
                v-for="item in subjectSelect"
                :key="item"
                :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
          <span>Words:</span>
          <a-select v-model:value="nowWord"
                    defaultValue="50"
                    :dropdownMatchSelectWidth="!1">
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
        <span v-if="paragraph.edit"
              class="index edit"
              ref="paragraphEdit"
              v-html="paragraph.index"
              contenteditable="true"></span>
        <span v-else
              class="index"
              ref="paragraph"
              v-html="paragraph.indexWord"></span>
        <div class="tool" v-if="paragraph.index.length && !paragraph.loading">
          <edit-outlined v-if="!paragraph.edit" class="edit-btn" @click="paragraph.edit = true"/>
          <close-outlined v-if="paragraph.edit"
                          @click="$refs.paragraphEdit.innerHTML = paragraph.index;paragraph.edit = false" class="red"/>
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
          <h3>
            {{ wordCard.word }}&nbsp;
            <a-skeleton-button
                size="small"
                :active="true"
                v-if="wordCard.translateLoading"/>
            <span class="translate"
                  v-else-if="wordCard.translate">
              {{ wordCard.translate }}
            </span>
          </h3>
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
import {setCORS} from "google-translate-api-browser";

const translate = setCORS("/api/cors/");

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
        indexWord: "",
        loading: true,
        edit: false,
        id: null,
        listen: 0,
        seed: 0,
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
        audio: null,
        translate: "",
        translateLoading: true
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
        this.wordCard.translateLoading = true;
        this.wordCard.audio = null;
        const hideWordCard = (ev) => {
          // if click on word card or element in word card, return
          if (ev.target.classList.contains("word") || ev.target.closest(".wordCard")) return;
          this.wordCard.visible = false;
          document.removeEventListener("click", hideWordCard);
        }
        setTimeout(() => document.addEventListener("click", hideWordCard), 5)
        // get word define
        const load = message.loading("Getting word define", 0)
        const loadTranslate = message.loading("Getting word translate", 0)
        translate(word, {
          to: this.$store.state.config["translate-lang"]
        }).then(res => {
          this.wordCard.translate = res.text;
          this.wordCard.translateLoading = false;
          loadTranslate();
        }).catch(err => {
          loadTranslate();
          console.log(err)
          this.wordCard.translateLoading = false;
          // if type is Error
          if (err instanceof Error) {
            message.error("Network error, please try again later");
          } else {
            message.error("Translate error, please try again later");
          }
        })
        new FastjsAjax("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
            .get().then(res => {
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
          this.wordCard.loading = false;
          // if type is Error
          if (err instanceof Error) {
            message.error("Network error, please try again later");
          } else {
            message.error("Oops, there are no defining of " + word);
          }
        })
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
              if (this.$refs.paragraphEdit.innerHTML.match(/\[Place letter after this, it will be auto remove after you type]/g))
                return message.warn("Type some words first");
              // do backspace to remove space
              document.execCommand("delete");
              this.$nextTick(() =>
                  document.execCommand("insertHTML", false, "<br/>[Place letter after this, it will be auto remove after you type]")
              )
            }
          } else {
            this.paragraph.enterDown = false;
            if (this.$refs.paragraphEdit.innerHTML.match(/\[Place letter after this, it will be auto remove after you type]/g))
              this.$refs.paragraphEdit.innerHTML = this.$refs.paragraphEdit.innerHTML.replace(/\[Place letter after this, it will be auto remove after you type]/g, "");
            this.$nextTick(() => {
              // remove space after a line
              if (this.$refs.paragraphEdit.innerHTML.match(/([^ ]+) +\n/g))
                this.$refs.paragraphEdit.innerHTML = this.$refs.paragraphEdit.innerHTML.replace(/([^ ]+) +\n/g, "$1\n");
            })
          }
        }
        this.$nextTick(() => {
          new FastjsDom(this.$refs.paragraphEdit).on("keydown", this.paragraph.listen)
          // put cursor at the end
          let range = document.createRange();
          range.selectNodeContents(this.$refs.paragraphEdit);
          range.collapse(false);
          let selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range)
        })
      } else {
        new FastjsDom(this.$refs.paragraphEdit).off("keydown", this.paragraph.listen)
      }
    }
  },
  methods: {
    generate() {
      const load = message.loading("Generating Paragraph...", 0);
      generateParagraph(this.nowWord, this.nowLevel, this.nowSubject).then(res => {
        this.showParagraph(res)
        load();
      }).catch(() => {
        load();
      })
    },
    saveParagraphChange() {
      const load = message.loading("Saving change...", 0);
      // clear br at the end
      this.$refs.paragraphEdit.innerHTML = this.$refs.paragraphEdit.innerHTML.replace(/<br>$/g, "");
      this.paragraph.index = this.$refs.paragraphEdit.innerHTML
          .replaceAll("&nbsp;"
              , " ")
          .replaceAll("<br>"
              , "\n")
      this.paragraph.indexWord = this.paragraph.index
          .replace(/[A-za-z]+/g, "<span class='word'>$&</span>")
          .replaceAll("\n", "<br>")
      this.paragraph.index = this.$refs.paragraphEdit.innerHTML
          .replaceAll("\n", "<br>")
      if (this.paragraph.id) {
        updateParagraph(this.paragraph.id, this.paragraph.index)
            .then(load)
            .catch(load)
      } else {
        createParagraph(this.paragraph.index)
            .then(load)
            .catch(load)
      }
    },
    showParagraph(config) {
      let paragraph = "", words = config.paragraph, seed = ++this.paragraph.seed;
      this.paragraph.id = config.id;
      this.paragraph.index = config.paragraph
          .replaceAll("\n", "<br>")
      this.paragraph.indexWord = ""
      this.paragraph.loading = true;
      // add word slowly
      const nextWord = (key) => {
        if (this.paragraph.seed !== seed) return;
        paragraph += words[key];
        this.paragraph.indexWord = paragraph
            .replace(/[A-za-z]+/g, "<span class='word'>$&</span>")
            .replaceAll("\n", "<br>")
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