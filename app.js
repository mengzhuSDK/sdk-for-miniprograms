//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
  },
  globalData: {
    userInfo: {
      avatarUrl: '',  //存放全局登录用户头像地址
      nickName: '',  //存放全局登录用户昵称
      uniqueId: ''  //存放全局登录用户唯一标识
    },  
  }
})