<template>
  <div>
<!--    面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图区-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="userList"
        stripe
        border
      >
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="姓名" prop="username" align="center"></el-table-column>
        <el-table-column label="邮箱" prop="email" align="center" width="160px"></el-table-column>
        <el-table-column label="电话" prop="mobile" align="center"></el-table-column>
        <el-table-column label="角色" prop="role_name" align="center"></el-table-column>
        <el-table-column label="状态" align="center" width="70px">
<!--          作用域插槽-->
          <template slot-scope="scope">
<!--            scope.row是当前这一行的数据-->
<!--            {{scope.row}}-->
            <el-switch
              v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180px">
          <template slot-scope="scope">
<!--            修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
<!--            删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById2(scope.row.id)"></el-button>
<!--            分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
<!--      分页-->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
<!--      添加用户会话对话框-->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
<!--        内容主体区-->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
          class="demo-ruleForm">
<!--          用户名-->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
<!--          密码-->
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
<!--          邮箱-->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
<!--          手机-->
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
<!--        底部按钮区-->
        <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
      </el-dialog>
<!--       信息修改对话框-->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
      </el-dialog>
<!--      分配角色对话框-->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="setRoleDialogClosed">
<!--        属性来源于后端返回的数据-->
        <p class="serRole">当前的用户: {{userInfo.username}}</p>
        <p class="setRole">当前的角色: {{userInfo.role_name}}</p>
        <p class="setRole">分配新角色:
<!--          v-model绑定的是选中后的值-->
<!--          我们将label中的数据展示给用户，但是用户实际选择的时候，选中的都是对应的Id-->
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
        <!--        底部按钮区-->
        <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>

      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 验证邮箱的规则
    const checkEmail = (rule, value, cb) => {
      if (value !== '') {
        // 通过正则实现，验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          // 合法的邮箱
          return cb()
        }
        cb(new Error('请输入合法的邮箱'))
      } else {
        return cb()
      }
    }
    // 验证手机号的规则
    const checkMobile = (rule, value, cb) => {
      if (value !== '') {
        // 验证手机号的正则表达式
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        }
        cb(new Error('请输入合法的手机号'))
      } else {
        return cb()
      }
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页码
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 查询到的用户信息对象保存,每次只要单击对应的查询项
      // 就会更新editForm，这样每次都能够是最新的，提交的时候也是在这里提交
      editForm: {},
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3-10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在6-15个字符之间', trigger: 'blur' }
        ],
        email: [
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFormRules: {
        email: [
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据的列表
      rolesList: [],
      // 已经选中的角色Id
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.userList = res.data.users
        // console.log(this.userList)
        this.total = res.data.total
      }
    },
    handleSizeChange(newSize) {
      // 自己会根据点击情况输入页面数据，不需单独输入数据
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch状态的改变
    userStateChanged(userinfo) {
      this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        .then(data => {
          const { data: res } = data
          if (res.meta.status !== 200) {
            // 一旦操作失败,后台的数据没有被修改,那么前端的数据也应该马上修改成原值
            userinfo.mg_state = !userinfo.mg_state
            return this.$message.error(res.meta.msg)
          } else {
            this.$message.success(res.meta.msg)
          }
        })
    },
    addDialogClosed() {
      // 一旦对话框关闭，立即重置对话框
      this.$refs.addFormRef.resetFields()
    },
    // 编辑对话框关闭事件,重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        // 打印valid的值可以发现，满足规则时为true，否则为false
        // 因为这里要发起网络请求了，必须要进行异步处理了
        if (!valid) {
        } else {
          const { data: res } = await this.$http.post('users', this.addForm)
          console.log(res)
          if (res.meta.status !== 201) {
            this.$message.error('用户添加失败！')
          } else {
            this.$message.success('用户添加成功！')
            this.addDialogVisible = false
            this.getUserList()
          }
        }
      })
    },
    // 弹出修改用户对话框
    showEditDialog(id) {
      // console.log(id)
      new Promise((resolve) => {
        resolve(this.$http.get(`users/${id}`))
      })
        .then(result => {
          const { data: res } = result
          if (res.meta.status !== 200) {
            return this.$message.error('查询用户失败')
          } else {
            console.log(res)
            this.editForm = res.data
            this.editDialogVisible = true
          }
        })
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.error('信息更新失败！')
          } else {
            // 这里三个连续的操作是不可缺少的
            // 1.提示用户信息更新成功
            // 2.退出对话框
            // 3.更新外部的用户列表，重新渲染页面
            this.$message.success('信息更新成功')
            this.editDialogVisible = false
            this.getUserList()
          }
        } else {
          this.$message.error('输入信息不合规，请重新输入！')
        }
      })
    },
    // 根据用户ID删除对应用户数据
    // removeUserById(id) {
    //   this.$confirm(
    //     '此操作将永久删除该用户, 是否继续?', '提示',
    //     {
    //       confirmButtonText: '确定',
    //       cancelButtonText: '取消',
    //       type: 'warning'
    //     })
    //     .then(() => {
    //       new Promise((resolve) => {
    //         resolve(this.$http.delete(`users/${id}`))
    //       })
    //         .then((result) => {
    //           const { data: res } = result
    //           if (res.meta.status === 200) {
    //             this.$message.success('删除成功！')
    //             this.getUserList()
    //           } else {
    //             this.$message.error('用户信息删除失败，请重新删除！')
    //           }
    //         })
    //     }).catch(() => {
    //       this.$message({
    //         type: 'info',
    //         message: '已取消删除'
    //       })
    //     })
    // },
    async removeUserById2(id) {
      const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如果用户确认了删除，则返回值为字符串confirm
      // 如果用户取消了删除，则返回值为字符串cancel
      if (result !== 'confirm') {
        return this.$message.info('已取消删除！')
      }

      const { data: res } = await this.$http.delete('user/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      } else {
        this.$message.success('删除用户成功')
        this.getUserList()
      }
    },
    // 分配角色按钮单击响应函数
    async setRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      } else {
        // console.log(res)
        this.rolesList = res.data
      }
      this.setRoleDialogVisible = true
    },
    // 点击按钮保存角色信息
    async saveRoleInfo() {
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('设置用户角色失败')
      } else {
        this.$message.success('设置用户角色成功')
        this.getUserList()
        this.setRoleDialogVisible = false
      }
    },
    // 关闭分配角色对话框的单击响应函数
    setRoleDialogClosed() {
      // 将已经选中的角色信息置为空，因为双向绑定到了select中，因此会将select置为空
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>
