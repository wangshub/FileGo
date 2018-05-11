<template>
  <div id="gitlab-view">
    <el-row :gutter="16">
      <el-col :span="16" :offset="4">
        <div class="view-title">
          GitLab设置
        </div>
        <el-form 
          ref="gitlab"
          label-position="right"
          label-width="120px"
          :model="form"
          size="mini">
          <el-form-item
            label="Gitlab 地址"
            prop="addr"
            :rules="{
              required: true, message: '地址不能为空', trigger: 'blur'
            }">
            <el-input v-model="form.addr" @keyup.native.enter="confirm" placeholder="username"></el-input>
          </el-form-item>
          <el-form-item
            label="仓库 ID"
            prop="repoId"
            :rules="{
              required: true, message: '仓库 ID 不能为空', trigger: 'blur'
            }">
            <el-input v-model="form.repoId" @keyup.native.enter="confirm" placeholder="例如：master"></el-input>
          </el-form-item>
          <el-form-item
            label="设定 Token"
            prop="token"
            :rules="{
              required: true, message: 'Token 不能为空', trigger: 'blur'
            }">
            <el-input v-model="form.token" @keyup.native.enter="confirm" placeholder="token"></el-input>
          </el-form-item>
          <el-form-item
            label="存储路径(NA)"
            >
            <el-input v-model="form.path" @keyup.native.enter="confirm" placeholder="例如img/"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" @click="confirm" round>确定</el-button>
              <el-button type="success" @click="setDefaultPicBed('gitlab')" round :disabled="defaultPicBed === 'gitlab'">设为默认图床</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import mixin from '../mixin'
export default {
  name: 'upyun',
  mixins: [mixin],
  data () {
    return {
      form: {
        repo: '',
        token: '',
        path: '',
        branch: ''
      }
    }
  },
  created () {
    const config = this.$db.get('picBed.gitlab').value()
    if (config) {
      for (let i in config) {
        this.form[i] = config[i]
      }
    }
  },
  methods: {
    confirm () {
      this.$refs.gitlab.validate((valid) => {
        if (valid) {
          console.log('set: ', this.$db)
          this.$db.set('picBed.gitlab', this.form).write()
          const successNotification = new window.Notification('设置结果', {
            body: '设置成功'
          })
          successNotification.onclick = () => {
            return true
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style lang='stylus'>
.view-title
  color #eee
  font-size 20px
  text-align center
  margin 20px auto
#gitlab-view
  .el-form
    label  
      line-height 22px
      padding-bottom 0
      color #eee
    .el-input__inner
      border-radius 19px
  .el-radio-group
    width 100%
    label
      width 25%  
    .el-radio-button__inner
      width 100%
  .el-radio-button:first-child
    .el-radio-button__inner
      border-left none
      border-radius 14px 0 0 14px
  .el-radio-button:last-child
    .el-radio-button__inner
      border-left none
      border-radius 0 14px 14px 0
</style>
