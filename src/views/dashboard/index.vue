<template>
  <div class="dashboard">
    <h2>DashBoard</h2>
    <a-tabs v-model:activeKey="page">
      <a-tab-pane key="1">
        <template #tab>
          <span>
            <read-outlined/>Word
          </span>
        </template>
      </a-tab-pane>
      <a-tab-pane key="2">
        <template #tab>
          <span>
            <barcode-outlined/>Activate
          </span>
        </template>
      </a-tab-pane>
    </a-tabs>
    <WordDashboard v-if="page === '1'"/>
    <ActivateDashboard v-if="page === '2'"/>
  </div>
</template>

<script>
import {ReadOutlined, BarcodeOutlined} from "@ant-design/icons-vue";
import WordDashboard from "./word.vue";
import ActivateDashboard from "./activate.vue";

export default {
  name: "dashboard",
  data() {
    return {
      page: "1"
    }
  },
  methods: {},
  components: {
    ReadOutlined,
    BarcodeOutlined,
    WordDashboard,
    ActivateDashboard
  }
}
</script>

<style scoped lang="less">
.dashboard {
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

  > .dashboard-list .define {
    color: #48b4a0 !important;
    cursor: pointer;
  }

  > .dashboard-list .delete {
    color: #ff4d4f !important;
    cursor: pointer;
    margin-left: 20px;
  }

  > .dashboard-list * {
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

<style lang="less">
.ant-tabs-nav-list {
  padding: 0 15px;

  .ant-tabs-tab {
    margin-left: 0 !important;
    margin-right: 5px;

    div[role="tab"] {
      padding: 0 15px !important;
    }
  }
}
</style>