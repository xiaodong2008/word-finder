<template>
  <div class="setting">
    <h2>Setting</h2>
    <a-table
        :columns="columns"
        :pagination="false"
        :data-source="show"
        class="setting-list"
    >
      <template #bodyCell="{ record, index, column }">
        <template v-if="column.dataIndex === 'name'">
          <span>{{ record.name }}</span>
        </template>
        <template v-if="column.dataIndex === 'description'">
          <span>{{ record.description }}</span>
        </template>
        <template v-if="column.dataIndex === 'value'">
          <a-select
              v-if="record.type === 'select'"
              v-model:value="config[record.key]"
              @change="config[record.key] = $event"
              :dropdownMatchSelectWidth="false"
              :options="record.options"
          ></a-select>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
export default {
  name: "setting-index",
  data() {
    return {
      show: [
        {
          name: "translate language",
          key: "translate-lang",
          description: "The language that you want to translate",
          type: "select",
          options: [
            {
              label: "Chinese",
              value: "zh"
            },
            {
              label: "Russian",
              value: "ru"
            },
            {
              label: "German",
              value: "de"
            }
          ]
        }
      ],
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
        },
        {
          title: 'Value',
          dataIndex: 'value',
          key: 'value',
        }
      ],
      config: {}
    }
  },
  mounted() {
    this.config = JSON.parse(JSON.stringify(this.$store.state.config));
  },
  watch: {
    config: {
      handler(val) {
        console.log(val)
        this.$store.commit("setConfig", val);
      },
      deep: true
    }

  },
}
</script>

<style scoped lang="less">
.setting {
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

  > .setting-list .define {
    color: #48b4a0 !important;
    cursor: pointer;
  }

  > .setting-list .delete {
    color: #ff4d4f !important;
    cursor: pointer;
    margin-left: 20px;
  }

  > .setting-list * {
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