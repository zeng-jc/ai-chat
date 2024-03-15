const formRules = {
  usernameRule: [
    { required: true, message: '请填写账号' },
    { minLength: 3, message: '账号错误' }
  ],
  passwordRule: [
    { required: true, message: '请填写密码' },
    { minLength: 3, message: '密码错误' }
  ]
}

// 解构导出，并对属性重命名
export const { usernameRule, passwordRule } = formRules
