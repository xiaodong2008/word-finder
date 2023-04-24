<template>
  <div class="dashboard-activate">
    <a-table
        :columns="columns"
        :data-source="show"
        :pagination="false"
        :loading="loading"
        class="dashboard-activate-list"
    >
      <template #bodyCell="{ record, index, column }">
        <template v-if="column.dataIndex === 'word'">
          <span class="add">{{ record.word }}</span>
        </template>
        <template v-if="column.dataIndex === 'time'">
          <a-tooltip :title="record.date">
            <a>{{ getDate(record.time) }}</a>
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
import {dashboardActivate, dashboardActivateCount} from "@/api";

export default {
  name: "dashboard-activate",
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
          title: 'Activate Code',
          dataIndex: 'code',
          key: 'activateCode',
        },
        {
          title: 'Date',
          dataIndex: 'time',
          key: 'date',
        },
        {
          title: 'Activate ID',
          dataIndex: 'redeemId',
          key: 'activateid',
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
      dashboardActivateCount().then(res => {
        this.total = res.data
      })
      dashboardActivate(this.page).then(res => {
        this.show = res.map(item => {
          item.word = "+" + item.word
          return item
        })
        this.loading = false
      })
    },
  }
}
</script>

<style lang="less">
.dashboard-activate {
  .bottom {
    display: flex;
    margin: 20px 0;

    * {
      margin-left: auto !important;
    }
  }

  .dashboard-activate-list {
    .add {
      color: #48b4a0 !important;
    }

    * {
      color: #5e5e5e !important;
    }
  }
}
</style>