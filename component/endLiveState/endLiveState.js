// component/overLiveState/over-live-state.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    'overLiveState': {
      type: Number,
      value: 3
    },
    'defaultText': {
      type: Object,
      value: {}
    },
    'duration': {
      type: String,
      value: ''
    },
    'uv': {
      type: Number,
      value: 0
    },
    'defaultInfo': {
      type: Object,
      value: {}
    },


    
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    backHome: function(){
      wx.navigateBack()
    }
  }
})
