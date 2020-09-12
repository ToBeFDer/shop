<template>
  <div>
    <!--    面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图区-->
    <el-card>
<!--      提示区域-->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false">
      </el-alert>
<!--      步骤条区-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成" ></el-step>
      </el-steps>
<!--      tab栏区域-->
<!--      只要el-tabs和el-steps共用同一个数据项，那么他们将会同时发生改变-->
<!--      在el-tabs中，绑定的是name-->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               label-position="top"
               class="demo-ruleForm">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!--        ta-pane只能嵌套在tabs内部，不能有中间的嵌套标签-->
          <el-tab-pane label="基本信息" name="0">
<!--            tab-pane页中对应的内容-->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
<!--            这里直接绑定addForm的goods_cat分类即可-->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
<!--            渲染表单的item项-->
<!--            在manyTableData中，含有多个商品参数信息item-->
<!--            每一个商品参数信息item中都有一个attr_vals属性，这个属性是一个数组-->
<!--            我们需要将这个数组中的每个值以checkbox的形式展示到页面上-->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
<!--            每一个attr_name对应着一个动态属性名称-->
<!--            这个属性的值就是attr_vals的值-->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals" ></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Add',
  data() {
    return {
      activeIndex: '0',
      // 添加商品的数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品所属的分类数组
        goods_cat: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器选中的分类列表
      selectedCateKeys: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: []
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  },
  created() {
    // 获取所有商品的分类数据
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取分类数据失败')
      } else {
        this.cateList = res.data
        // console.log(this.cateList)
      }
    },
    // 级联选择器选中项变化触发该函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 在离开当前tab页面之前，检查是否选中了三级分类，不是三级分类则不允许切换
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('进入：' + activeName)
      // console.log('离开：' + oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClicked() {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        // 访问的是动态参数面板
        console.log('动态参数面板')
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        } else {
          // console.log(res.data)
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          })
          this.manyTableData = res.data
        }
      } else if (this.activeIndex === '2') {
      //  访问的是静态属性面板
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败')
        } else {
          // console.log(res.data)
          // res.data.forEach(item => {
          //   item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          // })
          this.onlyTableData = res.data
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 5px 0 0;// 上右下左
}
</style>
