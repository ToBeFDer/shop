<template>
  <div>
    <!--    面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图区-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
        </el-col>
      </el-row>
<!--      表格区-->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border>
<!--        是否有有效-->
<!--        slot的名字应该和columns中template的名字一一对应-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else  style="color: red"></i>
        </template>
<!--        排序列模板-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
<!--        操作列模板-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialogVisible(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

<!--      分页区-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>
<!--    添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px">
        <el-form-item label="分类名称: " prop="cat_name">
        <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item>
        <el-form-item label="父级分类: ">
<!--          options指定数据源-->
<!--          props用来指定配置对象-->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            clearable
            @change="parentCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取消</el-button>
        <el-button @click="addCate">确定</el-button>
      </span>
    </el-dialog>
<!--    编辑分类对话框-->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed">
      <el-form
        :model="editCateForm"
        :rules="editCateRules"
        ref="editCateFormRef"
        label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input  v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取消</el-button>
        <el-button @click="editCate">确认</el-button>
      </span>
    </el-dialog>
<!--    删除分类对话框-->

  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列，模板名称使用template进行指定
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 默认当前分类等级是一级分类
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 分级分类的列表
      parentCateList: [],
      // cascader级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 父子节点不互相关联，也就是可以单独选中父节点
        // 不再使用以前的属性change-on-select
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 编辑分类的数据对象
      editCateForm: {},
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 为了修改分类数据时，记录当前节点的子节点
      scope_children: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      } else {
        // console.log(res.data)
        // 把数据列表赋值给cateList
        this.cateList = res.data.result
        this.total = res.data.total
      }
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getCateList()
    },
    // 点击按钮展示添加分类的对话框
    showAddCatDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 在展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      } else {
        // console.log(res.data)
        this.parentCateList = res.data
      }
    },
    // 选择项发生变化时触发这个函数
    parentCateChange() {
      // console.log(this.selectedKeys)
      // 选中了 那么selectedKeys必将发生变化
      // 如果数组长度大于0，表示选中了父级分类，否则没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id是数组中的最后一项
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 没有选中，将父级id设置为0，等级也设置为0
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
    },
    // 点击按钮添加新的分类
    addCate() {
      // 先进行预验证，通过了再发送请求
      // 验证是表单的数据进行的操作，所以应该调用表单的引用进行预验证。
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请输入分类名')
        } else {
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类信息失败')
          } else {
            this.$message.success('添加分类信息成功')
            this.getCateList()
            this.addCateDialogVisible = false
          }
        }
      })
    },
    // 添加分类对话框关闭响应函数，监听关闭事件，重置表单和级联选择器
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      // 因为selectedKeys是被双向绑定到级联选择器的
      // 也就是选中数据会被自动添加到selectedKeys中，那么要清除选中的数据，就只需要重置这个数组就行
      // 这就是双向绑定的特点
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 单击修改按钮执行的操作
    async showEditCateDialogVisible(role) {
      this.role = role
      const { data: res } = await this.$http.get(`categories/${role.cat_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      } else {
        this.editCateForm = res.data
        this.editCateDialogVisible = true
      }
    },
    // 提交确认修改按钮之后的响应函数
    async editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('类名不能为空，请重新输入')
        } else {
          const { data: res } = await this.$http.put(
            `categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
          if (res.meta.status !== 200) {
            return this.$message.error('信息更新失败，请稍后重试')
          } else {
            this.getCateList()
            this.editCateDialogVisible = false
            this.$message.success('信息更新成功')
          }
        }
      })
    },
    // 修改分类数据对话框关闭响应函数
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
      // 设置当前所在区域为空
    },
    // 根据Id移除分类标签
    async removeCateById(id) {
      const result = await this.$confirm('此操作将永久删除该分类信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除分类失败')
      } else {
        this.$message.success('删除分类成功')
        this.getCateList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .tree-table {
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>
