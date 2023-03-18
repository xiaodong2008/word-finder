<template>
  <div id="register">
    <a-form :model="form" ref="form" :label-col="labelCol" :rules="validate" label-align="left">
      <a-form-item label="Username" name="username" has-feedback>
        <a-input v-model:value="form.username"/>
      </a-form-item>
      <a-form-item label="Password" name="password" has-feedback>
        <a-input v-model:value="form.password" type="password"/>
      </a-form-item>
      <a-form-item label="Confirm Password" name="confirm" has-feedback>
        <a-input v-model:value="form.confirm" type="password"/>
      </a-form-item>
      <!-- Submit button -->
      <a-form-item>
        <a-button type="primary" @click="submitForm">Submit</a-button>
        <span style="margin-left: 10px">Already have an account? <router-link to="/login" class="color-light">Login</router-link></span>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {register} from "@/api";
import {message} from "ant-design-vue";

export default {
  name: "index",
  methods: {
    submitForm() {
      // Validate form
      this.$refs.form.validate()
          .then(() => {
            register(this.form.username, this.form.password).then(() => {
              this.$router.push("/login");
            })
          })
          .catch(() => {
            message.error("Please check your input");
          });
    }
  },
  data() {
    const validate = {
      username: [
        {required: true, message: "Please input your username", trigger: ["blur", "change"]},
        {min: 2, message: "Username must be at least 2 characters", trigger: "blur"},
        {max: 50, message: "Username must be less than 50 characters", trigger: ["blur", "change"]},
        // a-z, A-Z, 0-9, _- only
        {pattern: /^[a-zA-Z0-9_-]+$/, message: "Username must contain only a-z, A-Z, 0-9, _-", trigger: ["blur", "change"]}
      ],
      password: [
        {required: true, message: "Please input your password", trigger: ["blur", "change"]},
        {min: 5, message: "Password must be at least 5 characters", trigger: "blur"},
        {max: 50, message: "Password must be less than 50 characters", trigger: ["blur", "change"]},
        // a-z, A-Z, 0-9, _- only
        {pattern: /^[a-zA-Z0-9_-]+$/, message: "Password must contain only a-z, A-Z, 0-9, _-", trigger: ["blur", "change"]}
      ],
      confirm: [
        {required: true, message: "Please confirm your password", trigger: "blur"},
        {
          validator: (rule, value) => {
            if (value !== this.form.password) {
              return Promise.reject("Passwords do not match");
            }
            return Promise.resolve();
          }, trigger: "blur"
        }
      ]
    }

    return {
      form: {
        username: "",
        password: "",
        confirm: ""
      },
      validate,
      labelCol: {span: 8}
    };
  }
}
</script>

<style scoped lang="less">
#register {
  margin: 20px auto 50px;
  width: 500px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #e2dfdf;
}

// dark
@media (prefers-color-scheme: dark) {
  #register {
    background-color: #3a3a4f;
  }
}
</style>