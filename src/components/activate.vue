<template>
  <a-modal
      title="Activate your code"
      :width="500" v-model:visible="show"
      @ok="submit" ok-text="Activate"
  >
    <a-form
        :form="form" :model="form"
        label-align="left" ref="form"
    >
      <a-form-item
          label="Activation code"
          name="code" has-feedback
          :rules="form.rules"
      >
        <a-input v-model:value="form.code"/>
      </a-form-item>
    </a-form>
    <a-alert type="success" show-icon v-if="success"
      :message="success + ' words have been added to your account.'"
    ></a-alert>
  </a-modal>
</template>

<script>
import {message} from "ant-design-vue";
import {redeem} from "@/api";

export default {
  name: "activate",
  data() {
    const rules = [
      {
        required: true,
        message: "Please input your activation code!"
      },
      {
        pattern: /^([A-Z\d]{5}-){3}[A-Z\d]{5}$/,
        message: "Invalid activation code!"
      }
    ]

    return {
      show: false,
      form: {
        rules,
        code: "",
      },
      success: false
    }
  },
  methods: {
    open() {
      this.show = true
    },
    submit() {
      this.$refs.form.validate().then(() => {
        let load = message.loading("Connecting to server...")
        redeem(this.form.code).then((res) => {
          load()
          this.success = res.word;
        }).catch((e) => {
          load()
        })
      }).catch((e) => {
        message.error(e.errorFields[0].errors[0]);
      });
    },
  }
}
</script>

<style scoped>

</style>