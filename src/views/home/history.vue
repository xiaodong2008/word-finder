<template>
  <a-drawer
    title="Paragraph History"
    :visible="visible"
    :closable="true"
    :width="500"
    placement="right"
    @close="close"
    @afterVisibleChange="!history.length && loadMore()"
    class="history-drawer"
  >
    <div class="block" v-for="item in history" @click="$emit('show', item.paragraph), close()">
      <div class="index" v-text="item.paragraph"></div>
      <div class="info">
        <span class="word">
          {{item.word}} words
        </span>
        <span class="date right">
          {{getDate(item.date)}}
        </span>
      </div>
    </div>
    <a-skeleton active :loading="loading" />
    <a-button class="button" v-if="!waiting" @click="loadMore">Load More</a-button>
  </a-drawer>
</template>

<script>
import {paragraphHistory} from "@/api";
import {message} from "ant-design-vue";

export default {
  name: "history",
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      history: [],
      loading: true,
      waiting: true
    }
  },
  methods: {
    close() {
      this.$emit("close")
    },
    loadMore() {
      this.loading = true
      const load = message.loading("Loading History...", 0)
      paragraphHistory(this.history.length).then(res => {
        load()
        this.history = this.history.concat(res)
        console.log(res)
        this.loading = false
        this.waiting = false
      })
    }
  }
}
</script>

<style scoped lang="less">
.history-drawer {
  .block {
    cursor: pointer;
    padding: 10px 20px;
    &:hover {
      background-color: #f5f5f5;
    }
    .index {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 18px;
      font-weight: 500;
    }
    .info {
      font-size: 13px;
      color: #999;
      .right {
        float: right;
      }
    }
  }
  .button {
    width: 100%;
    margin-top: 20px;
  }
}
</style>