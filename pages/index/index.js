// pages/index/index.js
const app = getApp();

Page({
  data: {
    ticketId: "",
    ticketIdDefault: "00000000",
    userInfo: {
      avatarUrl: '',
      nickName: '',
      uniqueId: ''
    }
  },

  onLoad: function () {
    wx.getUserInfo({
      success: function(res) {
        console.log(res)
      }
    })
    wx.getSetting({
      success: function(res) {
        console.log(res)
      }
    })
  },

  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  },

  ticketId: function(e){
    this.setData({
      ticketId: e.detail.value
   }) 
  },
  uniqueId: function(e){
    this.setData({
      'userInfo.uniqueId': e.detail.value
   }) 
  },
  
  nickName: function(e){
    this.setData({
      'userInfo.nickName': e.detail.value
   }) 
  },

  avatarUrl: function(e){
    this.setData({
      'userInfo.avatarUrl': e.detail.value
   }) 
  },

  toLive: function () {
    var _this = this;
    //获取用户信息
    app.globalData.userInfo.uniqueId = this.data.userInfo.uniqueId;
    app.globalData.userInfo.nickName = this.data.userInfo.nickName;
    app.globalData.userInfo.avatarUrl = this.data.userInfo.avatarUrl

    console.log(app.globalData)
    wx.navigateTo({
      url: `/pages/liveroom/liveroom?ticket_id=${this.data.ticketId || this.data.ticketIdDefault}`
    })
  },
})
