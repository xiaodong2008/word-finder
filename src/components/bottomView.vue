<template>
  <div class="bottom">
    <a-space class="line" size="small">
      <a href="https://github.com/dy-xiaodong2022" target="_blank">dy-xiaodong2022</a>
      <a-divider type="vertical"/>
      <a href="https://openai.com" target="_blank">Using <span class="gold">ChatGPT-3.5</span></a>
      <a-divider type="vertical"/>
      <a href="https://github.com/dy-xiaodong2022/word-finder" target="_blank" class="gray">Version {{ version }}</a>
    </a-space>
  </div>
</template>

<script>
import {version} from "@/../package.json"

export default {
  name: "bottom-view",
  data() {
    return {
      version
    }
  }
}
</script>

<style scoped lang="less">
.bottom {
  border-top: 1px solid #ccc;
  padding: 10px;
  margin: 20px;
  font-size: 14px;
  text-align: center;
  color: #999;

  .line {
    display: flex;
    justify-content: center;
    align-items: center;

    .ant-divider {
      background-color: #999;
    }

    .gold {
      color: transparent !important;
      background-image: linear-gradient(30deg, #a5e741 0%, #a48e13 20%, #f9d71c 40%, rgba(211, 0, 120, 0.97) 60%, #f9d71c 80%, #a48e13 100%);
      background-clip: text;
      background-size: 200% 100%;
      -webkit-background-clip: text;
      font-weight: 700;
    }

    .gray {
      color: #999 !important;
    }
  }
}
</style>