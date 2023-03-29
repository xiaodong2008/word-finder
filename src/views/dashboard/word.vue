<template>
  <div class="dashboard-word">
    <a-table
        :columns="columns"
        :data-source="show"
        :pagination="false"
        :loading="loading"
        class="dashboard-word-list"
    >
      <template #bodyCell="{ record, index, column }">
        <template v-if="column.dataIndex === 'word'">
        <span :class="record.word[0] === '+' ? 'add' : 'minus'">
          {{ record.word }}
        </span>
        </template>
        <template v-if="column.dataIndex === 'date'">
          <a-tooltip :title="record.date">
            <a>{{ getDate(record.date) }}</a>
          </a-tooltip>
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
  </div>
</template>

<script>
import {dashboardWord, dashboardWordCount} from "@/api";

export default {
  name: "dashboard-word",
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
          title: 'New Word',
          dataIndex: 'newWord',
          key: 'newWord',
        },
        {
          title: 'Date',
          dataIndex: 'date',
          key: 'date',
        },
        {
          title: 'Operate',
          dataIndex: 'operate',
          key: 'operate',
        },
        {
          title: 'Reason',
          dataIndex: 'reason',
          key: 'reason',
        }
      ],
      page: 1,
      total: 0,
      loading: false,
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
      dashboardWordCount().then(res => {
        this.total = res.data
      })
      dashboardWord(this.page).then(res => {
        this.show = res.map(item => {
          item.word = String(item.word)[0] === "-" ? item.word : `+${item.word}`
          item.newWord = item.newWord || "--"
          return item
        })
        this.loading = false
      })
    },
  }
}
</script>

<style lang="less">
.dashboard-word {
  .bottom {
    display: flex;
    margin: 20px 0;

    * {
      margin-left: auto !important;
    }
  }

  .dashboard-word-list {
    .add {
      color: #48b4a0 !important;
    }

    .minus {
      color: #ff4d4f !important;
    }

    * {
      color: #5e5e5e !important;
    }
  }
}
</style>