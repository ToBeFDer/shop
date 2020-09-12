<template>
  <div>
    <!--    面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图区-->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
<!--      选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
<!--          选择商品分类的级联选择框-->
<!--          v-model用来双向绑定已经被选中的部分-->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
<!--      tab页签区-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
<!--        label显示页签上面的名称，标签里面内容显示在页面下方-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
<!--          动态参数表格-->
          <el-table :data="manyTableData" border stripe>
<!--            展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
<!--                循环渲染tag标签-->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i, scope.row)">
                  {{item}}
                </el-tag>
<!--                输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  clearable
                >
                </el-input>
<!--                添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!--        静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!--                循环渲染tag标签-->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i, scope.row)">
                    {{item}}
                  </el-tag>
                  <!--                输入文本框-->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    clearable
                  >
                  </el-input>
                  <!--                添加按钮-->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
<!--      添加对话框-->
      <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addParams">确定</el-button>
        </span>
      </el-dialog>
      <!--      修改参数对话框-->
      <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editParams">确定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'params',
  data() {
    return {
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      // 修改表单数据对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      return this.selectedCateKeys.length !== 3
    },
    // 当前选中的三级分类的ID
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      } else {
        this.cateList = res.data
        // console.log(res.data)
      }
    },
    // 级联选择器选中框发生变化会触发该函数
    async handleChange() {
      // 选中级联选择器中的数据的时候要根据当前页面获取数据
      await this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData() {
      // console.log(this.selectedCateKeys)
      if (this.selectedCateKeys.length !== 3) {
        // 选中的不是三级分类
        this.selectedCateKeys = []
        // 那么应该及时清除动态数据表格和静态数据表格中的数据
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        // 是三级分类则可以选中
        // 根据所选分类的Id和当前所处的面板获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: this.activeName } })

        if (res.meta.status !== 200) {
          this.$message.error('获取参数列表失败')
        } else {
          res.data.forEach(item => {
            // 在对一个空字符串使用split函数之时，会得到一个空字符串，这时候会渲染出一个空标签
            // 我们需要人为去掉这种情况
            item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
            // 为每一个项目添加一个bool值控制文本框的显示与隐藏
            item.inputVisible = false
            // 标签文本框中输入的值
            item.inputValue = ''
          })
          console.log(res.data)
          if (this.activeName === 'many') {
            this.manyTableData = res.data
          } else {
            this.onlyTableData = res.data
          }
        }
      }
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      // 在切换tab页的时候需要根据当前选中的数据获取参数
      this.getParamsData()
      console.log(this.activeName)
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
        } else {
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败')
          } else {
            this.$message.success('添加参数成功')
            this.addDialogVisible = false
            await this.getParamsData()
          }
        }
      })
    },
    // 显示编辑对话框
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭编辑对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败')
          } else {
            this.$message.success('修改数据成功')
            await this.getParamsData()
            this.editDialogVisible = false
          }
        }
      })
    },
    // 根据id删除对应的参数项目
    async removeParams(attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败，请重试')
        } else {
          this.$message.success('删除参数成功！')
          await this.getParamsData()
        }
      }
    },
    // 文本框失去了焦点或按下了enter
    handleInputConfirm(role) {
      // 将输入的数据删除两端的空格字符，再判断长度是否为0
      if (role.inputValue.trim().length === 0) {
        role.inputValue = ''
        role.inputVisible = false
      } else {
        // 没有进入上一步则需要做后续处理
        // 始终记住双向绑定的含义
        // 这里只是有前端的保存 但是还缺乏后端的保存
        // 因此后面再添加后端提交功能
        role.attr_vals.push(role.inputValue.trim())
        role.inputValue = ''
        role.inputVisible = false
        this.saveAttrVals(role)
      }
    },
    // 将对attr_vals的操作保存到数据库
    async saveAttrVals(role) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${role.attr_id}`, {
        attr_name: role.attr_name,
        attr_sel: role.attr_sel,
        attr_vals: role.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      } else {
        this.$message.success('修改参数项成功')
      }
    },
    // 点击按钮，展示文本输入框
    showInput(role) {
      role.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick方法的作用是当页面上的元素被重新渲染之后，才会执行函数中的回调
      // 也就是必须先出现页面的元素再获得焦点
      this.$nextTick(_ => {
        // 这里最后的input是原生的DOM中的input
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    handleClosed(i, role) {
      role.attr_vals.splice(i, 1)
      // 修改是在role.attr_vale中进行的，因此只需要将该参数传递进去即可
      this.saveAttrVals(role)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin: 15px 0;
}
.el-tag{
  margin: 10px;
}
.input-new-tag{
  width: 125px;
}
</style>
