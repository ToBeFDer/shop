<template>
    <div class="login_container">
      <div class="login_box">
        <!-- 头像区域 -->
        <div class="avatar_box">
          <img src="~assets/img/logo.png" alt=" ">
        </div>
        <!-- 登录表单区 -->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
<!--          用户名-->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
<!--          密码-->
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" placeholder="密码" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
          </el-form-item>
<!--          按钮区-->
          <el-form-item class="btns">
            <el-button type="primary" @click="login">
              登录
            </el-button>
            <el-button type="info" @click="resetLoginForm">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
// import axios from 'axios'
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
export default {
  name: 'Login',
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10位之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6-15位之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(valid => {
        if (valid) {
          this.$http.post('login', this.loginForm)
            .then((result) => {
              const { data: res } = result
              if (res.meta.status !== 200) {
                return this.$message.error('登陆失败')
              }
              this.$message.success('登录成功')
              console.log(res)
              window.sessionStorage.setItem('token', res.data.token)
              this.$router.push('/home')
            })
        }
      })
    }
  }
}
</script>

<!--scope表示只在当前组件中生效，否则是全局生效-->
<!--支持less文件的样式-->
<style lang='less' scoped>
  .login_container{
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top:50%;
    transform: translate(-50%,-50%);
  }
  .avatar_box{
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 20px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    /*样式嵌套，给img添加了一个盒子，且img占比是100%*/
    img{
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .btns{
    display: flex;
    justify-content: flex-end;
  }
  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
</style>
