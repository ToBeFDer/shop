<template>
  <div>
    <!--    面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图区-->
    <el-card>
      <el-row>
        <el-col>
        <el-button type="primary" @click="addRoleVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="roleList">
        <el-table-column type="expand">
          <template slot-scope="scope">
<!--            scope是整个角色，其children是第一级权限-->
<!--            item1是循环中的每一个项目，i1是其索引-->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter' ]" v-for="(item1, i1) in scope.row.children" :key="item1.id">
<!--              渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
<!--              渲染二级和三级权限-->
              <el-col :span="19">
<!--                通过for循环嵌套渲染二级权限-->
                <el-row :class="[i2 === 0 ? '':'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable @close="removeRightById(scope.row, item3.id)" v-for="(item3) in item2.children" :key="item3.id" type="warning">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" align="center"></el-table-column>
        <el-table-column label="角色名称" prop="roleName" align="center"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc" align="center"></el-table-column>
        <el-table-column label="操作" align="center" width="300">
          <template slot-scope="scope">
<!--            角色id和权限id不一样，二者不能够混淆，通过行的id获取行数据信息-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
<!--    添加角色对话框-->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleVisible"
      width="50%"
      @close="addRoleDialogClosed">
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="80px"
        class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--        底部按钮区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addRoleVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
    </el-dialog>
<!--    编辑角色对话框-->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleVisible"
      width="50%"
      @close="editRoleDialogClosed">
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="80px"
        class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--        底部按钮区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editRoleVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRole">确 定</el-button>
  </span>
    </el-dialog>
<!--    分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
<!--      树形控件-->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        ref="treeRef"
        :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      roleList: [],
      addRoleVisible: false,
      editRoleVisible: false,
      setRightDialogVisible: false,
      // 所有权限的数据，默认为空，但也是一个数组
      rightsList: [],
      // 添加角色信息
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色信息，应该是单击之后加载当前信息到对话框
      editRoleForm: {},
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名的长度在3-10个字符之间', trigger: 'blur' }
        ]
      },
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名的长度在3-10个字符之间', trigger: 'blur' }
        ]
      },
      // 树形控件属性绑定对象
      treeProps: {
        // 在一棵树中可能有多个属性，这里的label是要被展示在页面上的属性
        label: 'authName',
        // 令父子嵌套得以实现的属性
        children: 'children'
      },
      // 在树中默认选中的结点Id值数组
      defKeys: [],
      // 当前即将分配权限的role的Id
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表请求函数
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取信息失败！')
      } else {
        this.roleList = res.data
        // console.log(this.roleList)
      }
    },
    // 添加用户对话框关闭单击响应函数
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    //  添加角色按钮单击响应函数
    addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('信息输入不合规，添加失败')
        } else {
          const { data: res } = await this.$http.post('roles', this.addRoleForm)
          console.log(res)
          if (res.meta.status !== 201) {
            this.$message.error('角色添加失败')
          } else {
            this.$message.success('角色添加成功')
            this.addRoleVisible = false
            this.getRoleList()
          }
        }
      })
    },
    // 修改角色按钮单击响应函数
    async showEditRoleDialog(id) {
      // 因为这里接口给出来的返回数据的Id是roleId，所以，从editRoleForm这里获取角色id的方式应该是使用关键字roleId
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      } else {
        console.log(res)
        this.editRoleForm = res.data
        this.editRoleVisible = true
      }
    },
    // 修改用户对话框关闭单击响应函数
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 修改用户对话框确定按钮单击响应函数
    editRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (valid) {
          console.log(this.editRoleForm.roleId)
          // 这里数据的Id一定要使用roleId，不能是id，id是行号，接口中并没有
          const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          })
          // console.log(res)
          if (res.meta.status !== 200) {
            this.$message.error('信息更新失败！')
          } else {
            this.editRoleVisible = false
            this.$message.success('信息更新成功~')
            this.getRoleList()
          }
        } else {
          this.$message.error('输入信息不合规，请重新输入')
        }
      })
    },
    // 根据行id删除所在的行数据
    async removeRoleById(id) {
      const result = await this.$confirm('此操作将永久删除该角色信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('roles/' + id)

      if (res.meta.status !== 200) {
        this.$message.error('删除角色失败')
      } else {
        this.$message.success('删除角色成功')
        this.getRoleList()
      }
    },
    // 根据Id删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将会从该角色中永久删除该权限，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.error('删除已经取消')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        this.$message.error('权限删除失败')
      } else {
        this.$message.success('权限删除成功！')
        role.children = res.data
      }
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // console.log(role)
      // 获取所有权限的数据，并将其以树形结构展现
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      } else {
        // 获取到的权限数据保存到data中
        this.rightsList = res.data
        // console.log(this.rightsList)
      }
      // role是整个树的根也就是整个角色，其下面的children是三个一级节点，
      // 正好在递归函数中使用的就是children来进行判断
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归函数的形式获取角色下叶子节点权限的ID，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是叶子节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 分配权限对话框关闭事件处理函数
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 为角色分配权限
    async allotRights() {
      const keys = [
        // ...是ES6语法，展开运算符，将一个数组展开了
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      } else {
        this.getRoleList()
        this.$message.success('成功更新权限')
        this.setRightDialogVisible = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
