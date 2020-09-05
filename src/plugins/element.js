import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 这里是一个全局弹框提示消息的挂载，全局可以使用
Vue.prototype.$message = Message
