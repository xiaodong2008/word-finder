<template>
  <div class="dictionary">
    <h2>Dictionary</h2>
    <a-table
        :columns="columns"
        :data-source="show"
        :pagination="false"
        :loading="loading"
        class="dictionary-list"
    >
      <template #bodyCell="{ record, index, column }">
        <template v-if="column.dataIndex === 'word'">
          <span>{{ record.word }}</span>
        </template>
        <template v-if="column.dataIndex === 'date'">
          <a-tooltip :title="record.date">
            <a>{{ getDate(record.date) }}</a>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <span class="define" @click="getDefine(record.word)">Look Define</span>
          <span class="delete" @click="deleteWord(record.word)">Delete</span>
        </template>
      </template>
    </a-table>
    <div class="bottom">
      <a-pagination
          :current="page"
          :total="total"
          :pageSize="10"
          @change="pageChange"
          class="pagination"
      />
    </div>
    <a-drawer
        :visible="lookDefine.visible"
        :title="lookDefine.word"
        :width="500"
        @close="lookDefine.visible = false"
        placement="right"
    >
      <a-skeleton :loading="lookDefine.loading" :active="true">
        <div class="define-drawer" v-for="item of lookDefine.define">
          <h4 class="spc">{{ item.partOfSpeech }}</h4>
          <span class="mean" v-for="(item, key) of item.definitions">({{ key + 1 }}) {{ item.definition }}<br/></span>
        </div>
      </a-skeleton>
    </a-drawer>
  </div>
</template>

<script>
import {dictionary, dictionaryCount, dictionaryDelete} from "@/api";
import {FastjsAjax} from "fastjs-next";

export default {
  name: "dictionary",
  data() {
    return {
      show: [],
      columns: [
        {
          title: 'Word',
          dataIndex: 'word',
          key: 'word',
        },
        {
          title: 'Date',
          dataIndex: 'date',
          key: 'date',
        },
        {
          title: 'Action',
          dataIndex: 'action',
          key: 'action',
        },
      ],
      page: 1,
      total: 0,
      loading: false,
      lookDefine: {
        visible: false,
        word: "",
        define: [],
        loading: false
      }
    }
  },
  created() {
    this.load()
  },
  methods: {
    pageChange(page) {
      this.page = page
      this.load()
    },
    load() {
      this.loading = true
      dictionaryCount().then(res => {
        this.total = res.count
      })
      dictionary(this.page).then(res => {
        this.show = res
        this.loading = false
      })
    },
    getDefine(word) {
      // send request
      const loading = this.$message.loading("Getting define of " + word, 0)
      this.lookDefine.visible = true
      this.lookDefine.word = word
      this.lookDefine.loading = true
      new FastjsAjax("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
          .get()
          .then(res => {
            loading()
            this.lookDefine.loading = false
            this.lookDefine.define = res[0].meanings
          })
          .catch(() => {
            loading()
            this.$message.error("Get define failed")
          })
    },
    deleteWord(word) {
      dictionaryDelete(word).then(() => {
        this.$message.success("Delete Success")
        this.load()
      })
    }
  }
}
</script>

<style scoped lang="less">
.dictionary {
  margin: 20px 60px;
  h2 {
    border-bottom: 1px solid #ccc;
  }
  .bottom {
    display: flex;
    margin: 20px 0;
    * {
      margin-left: auto;
    }
  }
  > .dictionary-list .define {
    color: #48b4a0 !important;
    cursor: pointer;
  }
  > .dictionary-list .delete {
    color: #ff4d4f !important;
    cursor: pointer;
    margin-left: 20px;
  }

  > .dictionary-list * {
    color: #5e5e5e !important;
  }
}


.define-drawer {
  > span, h3 {
    color: black !important;
  }
  .spc {
    font-weight: 600;
    margin: 5px 0;
    font-size: 16px;
    color: black;
  }
  .mean {
    font-size: 12px;
    font-weight: 400;
    color: #5e5e5e;
  }
}
</style>