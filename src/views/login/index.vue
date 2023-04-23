<template>
  <div id="login">
    <a-form :model="form" ref="form" :label-col="labelCol" :rules="validate" label-align="left">
      <a-form-item label="Username" name="username" has-feedback>
        <a-input v-model:value="form.username"/>
      </a-form-item>
      <a-form-item label="Password" name="password" has-feedback>
        <a-input v-model:value="form.password" type="password"/>
      </a-form-item>
      <!-- Submit button -->
      <a-form-item>
        <a-button type="primary" @click="submitForm">Submit</a-button>
        <span style="margin-left: 10px">Do not have a account? <router-link to="/register" class="color-light">Register</router-link></span>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {login} from "@/api";
import {message} from "ant-design-vue";
import cookie from "js-cookie";

export default {
  name: "index",
  methods: {
    submitForm() {
      // Validate form
      this.$refs.form.validate()
          .then(() => {
            let load = message.loading("Connecting to server...", 0)
            login(this.form.username, this.form.password).then((res) => {
              load();
              cookie.set("token", res.token, {expires: 1});
              location.href = "/";
            }).catch((e) => {
              load();
              message.error("Network error");
            });
          })
          .catch((e) => {
            message.error("Please check your input");
          });
    }
  },
  data() {
    const validate = {
      username: [
        {min: 2, message: "Username must be at least 2 characters", trigger: "blur"},
        {required: true, message: "Please input your username", trigger: "blur"},
        {pattern: /^[a-zA-Z0-9_-]+$/, message: "Username must contain only a-z, A-Z, 0-9, _-", trigger: ["blur", "change"]},
        {max: 50, message: "Username must be less than 100 characters", trigger: ["blur", "change"]}
      ],
      password: [
        {required: true, message: "Please input your password", trigger: "blur"},
        {min: 5, message: "Password must be at least 5 characters", trigger: "blur"},
        {max: 50, message: "Password must be less than 50 characters", trigger: ["blur", "change"]},
        // a-z, A-Z, 0-9, _- only
        {pattern: /^[a-zA-Z0-9_-]+$/, message: "Password must contain only a-z, A-Z, 0-9, _-", trigger: ["blur", "change"]}
      ]
    }

    return {
      form: {
        username: "",
        password: ""
      },
      validate,
      labelCol: {span: 8}
    };
  }
}
</script>

<style scoped lang="less">
#login {
  margin: 20px auto 50px;
  width: 500px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #e2dfdf;
}

// dark
@media (prefers-color-scheme: dark) {
  #login {
    background-color: #3a3a4f;
  }
}
</style>