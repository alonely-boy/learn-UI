<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path:'/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 设置角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
              :class="['vcenter','bdbottom',index1 === 0?'bdtop' : '']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                  :class="['vcenter',index2===0 ? '':'bdtop']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3,index3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showSetFormDialog(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scope.row)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRigthDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="setDialogVisible"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="setform" label-width="80px" :rules="setformRules" ref="setformRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="setform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="setform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="addform" label-width="80px" :rules="addformRules" ref="addformRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //分配权限对话框
      setRightDialogVisible: false,
      //添加用户对话框
      addDialogVisible: false,
      //设置用户对话框
      setDialogVisible: false,
      //所有权限的数据
      rightslist: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      //
      defKeys: [],
      roleId: "", //即将分配权限的角色ID,
      setId: "", //即将设置用户的角色ID
      //添加用户表单数据和表单验证
      addform: {
        roleName: "",
        roleDesc: ""
      },
      setform: {
        roleName: "",
        roleDesc: ""
      },
      addformRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            trigger: "blur"
          }
        ]
      },
      setformRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      console.log(res);

      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolelist = res.data;
      // console.log(this.rolelist);
    },
    //根据ID删除对应权限
    async removeRightById(role, rightId) {
      //弹框提示是否确认删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除角色权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败!");
      }

      role.children = res.data;
    },
    //展示分配权限的对话框
    async showSetRigthDialog(role) {
      this.roleId = role.id;
      //先获取所有权限数据，再显示
      const { data: res } = await this.$http.get("rights/tree");
      // console.log(res.data);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败!");
      }

      //递归获取三级节点id
      this.getLeafKyes(role, this.defKeys);

      this.setRightDialogVisible = true;
      
      this.rightslist = res.data;
    },
    ///显示编辑用户对话框
    async showSetFormDialog(role) {
      this.setId = role.id;
      const { data: res } = await this.$http.get(`roles/${role.id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户数据失败!");
      }
      this.setform = res.data;
      this.setDialogVisible = true;
    },
    //删除对应角色
    async removeUser(role) {
      const { data: res } = await this.$http.delete(`roles/${role.id}`);
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //如果用户确认删除，则返回值为字符串confirm
      //如果用户取消删除，则返回值为字符串cancel
      // console.log(confirmResult);
      if (confirmResult !== "confirm") {
        return this.$message.info("已经取消删除");
      }
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色数据失败!");
      }
      this.$message.success("删除角色成功!");
      this.getRolesList();
    },
    //递归获取所有三级权限的id，并保存到defkey中
    getLeafKyes(node, arr) {
      if (!node.children) {
        //如果当前node节点不包含children属性，则是三级节点
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKyes(item, arr));
    },
    //监听权限对话框的关闭
    setRightDialogClosed() {
      this.defKeys = [];
    },
    //点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      // console.log(keys);
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败!");
      }
      this.$message.success("分配权限成功!");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
    addUser() {
      this.$refs.addformRef.validate(async valid => {
        if (!valid) return;
        //校验通过，发起添加用户网络请求
        const { data: res } = await this.$http.post("roles", this.addform);
        if (res.meta.status !== 201) {
          console.log(res);
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    setUser() {
      this.$refs.setformRef.validate(async valid => {
        if (!valid) return;
        //校验通过，发起设置用户网络请求
        const { data: res } = await this.$http.put(
          `roles/${this.setId}`,
          this.setform
        );
        if (res.meta.status !== 200) {
          // console.log(res);
          return this.$message.error("设置用户失败");
        }
        // console.log(res);

        this.$message.success("设置用户成功");
        this.setDialogVisible = false;
        this.getRolesList();
      });
    }
  }
};
</script>

<style scoped>
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