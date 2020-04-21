//index.js

const app = getApp();
var mzSDK = require("../../utils/mzlive.js");

Page({
	data: {
		//页面文本信息（便于修改）
		defaultText: {
			leaveInfoOne: "主播暂时离开，",
			leaveInfoTwo: "稍等一下马上回来",
			anchorPopularity: "人气值：",
			anchorFollow: "关注",
			allGoods: "全部商品·",
			toBuy: "去购买",
			placeholderText: "跟主播聊点什么?",
			quitLiveRoomAndFllow: "是否需要关注主播？",
			quitLiveRoom: "退出",
		},
		defaultInfo: {
			anchorName: "",
			anchorPic: "",
			anchorUid: "",
			anchorPopularityNum: "",
			goodsItemPic: "",
			goodsItemName: "",
			goodsItemCurrency: "￥",
			goodsItemPrice: "",
			allGoodsNum: 0,
			buy_url: "",
			channelId: ""
		},
		pageInfo: {
			ticketId: "",
			appId: "0000000000000000000",
			secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
		},
		// 当前登录用户
		currentUser: {
			uniqueId: '',
			nickName: '',
			avatarUrl: 'https://s1.zmengzhu.com/user/images/user-default-image.png'
		},
		visitorType: false,
		// 互动区域高度
		commentAreaHeight: 0,
		menuButton: wx.getMenuButtonBoundingClientRect(),
		livePlayerUrl: true,
		liveShow: false,
		goodsListState: false,
		settingPopupState: false,
		chooseSize: false,
		loopAnimationStart: "",
		loopAnimationEnd: "",
		loopAnimation: "",
		count: 0,
		goodsListData: [],
		goodsListDataReverse: [],
		goodsItemPush: [],
		commentList: [],
		scrollY: true,
		scrollTop: 0,
		inputHeight: "3.2vw",
		classNameKeyboardUp: "user-addcomment",
		liveState: "0",
		videoUrl: "",
		showQuitModelState: false,
		test: "",
		iconList: [],
		overLiveState: false,
		uv: 0,
		duration: "00:00:00",
		chatUid: "",
		AnimationState: "",
		inputShow: false,
		quitPageState: '',
		quitModelState: '',
		disablechat: false,
		userOnlineName: "",
		userOnlineAnimation: "",
		userOnlineDefaule: {
			left: "-29.33vw",
			opacity: "0"
		},
		timerPush: null,
		timeoutTimer: null,
		timerUserOnline: null,
		cmdOverTimer: null,  //断流定时器
		cmdLiveEndTimr: null,  //直播结束定时器
		vioBottom: 26.4 
		
	},

	//事件处理函数
	onLoad: function (option) {
		var _this = this;
		_this.setParam(option);

		//判断用户是否为访客
		if (app.globalData.userInfo.uniqueId == "" && app.globalData.userInfo.nickName == "" && app.globalData.userInfo.avatarUrl == "") {
			_this.setData({
				visitorType: true
			})
		}

		// 从全局复制出来用户信息
		if (app.globalData.userInfo) {
			_this.setData({
				'currentUser.uniqueId': app.globalData.userInfo.uniqueId,
				'currentUser.nickName': app.globalData.userInfo.nickName,
				'currentUser.avatarUrl': app.globalData.userInfo.avatarUrl || "https://s1.zmengzhu.com/user/images/user-default-image.png",
			})
			wx.getSystemInfo({
				success: function (res) {
					// success
					_this.setData({
						screenHeight: res.windowHeight,
					})
				}
			})

			_this.getLiveRoomInfo();
			_this.getGoodsListData();
			_this.getAchorInfo();

			//挂载事件
			mzSDK.mzee.on("msg", _this.getMsg);
			mzSDK.mzee.on("online", _this.getOnline);
			mzSDK.mzee.on("offline", _this.getOffline);
			mzSDK.mzee.on("complete", _this.getComplete);
			mzSDK.mzee.on("cmd", _this.getCmd);
			mzSDK.mzee.on("channel", _this.getChannel);
		}


	},
	onReady: function () {
		var _this = this;

		this.setCommentAreaHeight();
		this.getHistoryInfo();
	},
	onUnload: function () {
		//卸载事件
		mzSDK.disconnect();
		mzSDK.mzee.removeListener("msg", this.getMsg);
		mzSDK.mzee.removeListener("online", this.getOnline);
		mzSDK.mzee.removeListener("offline", this.getOffline);
		mzSDK.mzee.removeListener("complete", this.changeGoodsItemPush);
		mzSDK.mzee.removeListener("cmd", this.getCmd); //挂载推送商品
		mzSDK.mzee.removeListener("channel", this.getChannel);

	},

	getRoomIcons: function () {
		var _this = this;
		var data = {
			ticketId: _this.data.pageInfo.ticketId,
		}
		mzSDK.getOnlines(data).then(function (res) {
			_this.newHeader(res)
		})
	},

	getMsg: function (res) {
		var _this = this;
		console.log(res)
		console.log(res.user_id)
		if(_this.data.chatUid == res.user_id){
			return;
		} else {
			_this.setData({
				commentList: _this.data.commentList.concat([{
					text: {
						avatar: res.avatar,
						user_name: res.user_name,
						data: {
							text: res.data.text
						}
					}
				}])
			}, () => {
				_this.setData({
					scrollTop: _this.data.commentList.length * 1000,
				})
	
			})
		}
		
	},

	getChannel: function (res) {
		var _this = this;
		if (res.data.type == "uv") {
			_this.uv(res)
		}
	},
	//用户上线
	getOnline: function (res) {
		console.log('用户上线', res, arr);
		var _this = this;
		var arr = _this.data.iconList;

		//用户上线提示

		_this.setData({
			userOnlineName: res.user_name
		}, () => {
			_this.createUserOnlineAnimation()
		})


		if (!res.avatar) {
			return;
		}

		if (res.user_id > 5000000000) {
			return;
		}

		arr.push(res.avatar);
		_this.unique(arr);
		if (arr.length > 3) {
			arr.shift();
		}
		_this.setData({
			iconList: [].concat(arr)
		})

	},

	//用户下线
	getOffline: function (res) {
		console.log("用户下线")
	},

	getComplete: function (res) {
		var _this = this;
		if (res.data.type == "goods_spread") {
			console.log("推送商品")
			_this.addGoodsItemPush(res)
		}
	},

	getCmd: function (res) {
		var _this = this;
		if (res.data.type == "*over") {
			console.log("*确认：直播推流暂停");
			_this.channelPause();
		} else if (res.data.type == "*channelStart") {
			console.log("*确认：直播推流恢复");
			_this.channelStart();
		} else if (res.data.type == "*liveEnd") {
			console.log("*确认：直播结束")
			_this.overLive(res);
		} else if (res.data.type == "*disablechat") {
			console.log("*确认：禁言")
			_this.disablechat(res);
		} else if (res.data.type == "*permitchat") {
			console.log("*确认：解禁")
			_this.permitchat(res);
		}
	},

	disablechat: function (res) {
		var _this = this;
		if (res.data.user_id == _this.data.chatUid) {
			console.log('已被禁言');
			_this.setData({
				disablechat: true
			})
		}
	},
	permitchat: function (res) {
		var _this = this;
		if (res.data.user_id == _this.data.chatUid) {
			console.log('已被解禁')
			_this.setData({
				disablechat: false
			})
		}
	},
	uv: function () {
		var _this = this;
		var uv_temp = "";
		if (res.data.uv > 10000) {
			uv_temp = Math.floor(res.data.uv / 1000) / 10 + "万"
		} else {
			uv_temp = res.data.uv;
		}
		_this.setData({
			uv: uv_temp
		})
	},

	formateSeconds: function (endTime) {
		let secondTime = parseInt(endTime)
		let min = 0
		let h = 0
		let result = ''
		if (secondTime > 60) {
			min = parseInt(secondTime / 60)
			secondTime = parseInt(secondTime % 60)
			if (min > 60) {
				h = parseInt(min / 60)
				min = parseInt(min % 60)
			}
		}
		result =
			`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${secondTime.toString().padStart(2, '0')}`
		return result
	},

	overLive: function (res) {
		var _this = this;
		var time_temp = _this.formateSeconds(res.data.duration)
		_this.setData({
			cmdLiveEndTimr: setTimeout(function(){
				_this.setData({
					overLiveState: true,
					uv: res.data.uv,
					duration: time_temp
				})
			},15000)
			
		})
	},

	channelPause: function () {
		var _this = this;
		console.log("直播推流暂停，等待15秒后提示暂离")
		_this.setData({
			cmdOverTimer: setTimeout(function(){
				console.log("提示暂离")
				_this.setData({
					liveState: "3"
				})
			}, 15000)
		})
	},

	channelStart: function () {
		console.log("直播断流恢复，初始化页面，并修改断流状态")
		clearTimeout(this.data.cmdOverTimer)
		mzSDK.disconnect();
		this.getLiveRoomInfo();
		// this.setData({
		// 	liveShow: false,
		// })
	},

	//获取历史信息
	getHistoryInfo: function () {
		var _this = this;
		var data = {
			ticketId: _this.data.pageInfo.ticketId,
			permision: {
				id: _this.data.pageInfo.appId,
				key: _this.data.pageInfo.secret
			}
		}
		mzSDK.getHistory(data).then(function (res) {
			_this.setData({
				commentList: _this.data.commentList.concat(res).concat({
					type: "vioTips",
					info: "盟主直播依法对直播内容进行24小时巡查，禁止传播暴力血腥、低俗色情、招嫖诈骗、非法政治活动等违法信息，坚决维护社会文明健康环境"
				}),
			}, () => {
				console.log(_this.data.commentList)
				_this.scrollToBottom();
			})
		});
	},

	//获取直播间信息
	getLiveRoomInfo: function () {
		var _this = this;
		var data = {
			ticketId: _this.data.pageInfo.ticketId,
			uniqueId: encodeURIComponent(_this.data.currentUser.uniqueId),
			name: encodeURIComponent(_this.data.currentUser.nickName),
			avatar: encodeURIComponent(_this.data.currentUser.avatarUrl),
			permision: {
				id: _this.data.pageInfo.appId,
				key: _this.data.pageInfo.secret
			},
			extendObject: {
				accountNo: _this.data.currentUser.uniqueId,
			}
		}
		
		mzSDK.init(data).then(function (res) {
			
			mzSDK.connect();
			var temp_popular;
			if (res.popular > 10000) {
				temp_popular = Math.floor(res.popular / 1000) / 10 + "万"
			} else {
				temp_popular = res.popular;
			}
			_this.data.currentUser.uniqueId = res.unique_id;
			_this.setData({
				'defaultInfo.channelId': res.channel_id,
				'defaultInfo.anchorPopularityNum': temp_popular,
				liveState: res.status,
				videoUrl: res.video.http_url, //视频流
				chatUid: res.chat_uid
			}, () => {
				if (res.user_status == 3) {

					_this.setData({
						disablechat: true
					})
				}
				_this.getRoomIcons();
			})
		})
	},

	//商品切换动画
	goodsAnimation: function (list, nextEvent) {
		var _this = this;
		clearTimeout(_this.timerDefault)
		clearTimeout(_this.timerPush)
		var animation = wx.createAnimation({
			duration: 300,
			timingFunction: "linear",
			delay: 0,
			transformOrigin: "50% 50% 0",
		});
		animation.left("-24.665vw").bottom("8vw").scale(0).step();

		animation.left("0vw").bottom("16vw").scale(1).step();

		//操作变更默认数据
		_this.setData({
			'defaultInfo.goodsItemPic': list.pic,
			'defaultInfo.goodsItemName': list.name,
			'defaultInfo.goodsItemCurrency': "¥",
			'defaultInfo.goodsItemPrice': list.price,
			'defaultInfo.buy_url': list.buy_url,
			loopAnimationStart: animation.export(),
		});

		if (nextEvent == "default") {
			_this.startDefaultAnimation()
		}
	},

	startDefaultAnimation: function () {
		var _this = this;
		_this.setData({
			AnimationState: "default"
		});
		_this.numDefault = _this.numDefault || 0;
		if (_this.data.defaultInfo.name == "") {
			_this.goodsAnimation(_this.data.goodsListDataReverse[_this.numDefault % _this.data.goodsListDataReverse.length],
				"default");
		} else if (_this.data.goodsListDataReverse.length > 0) {
			if (_this.numDefault == 0) {
				_this.numDefault++;
				_this.goodsAnimation(_this.data.goodsListDataReverse[0], "default");
			} else {
				_this.timerDefault = setTimeout(function () {
					_this.numDefault++;
					_this.goodsAnimation(_this.data.goodsListDataReverse[_this.numDefault % _this.data.goodsListDataReverse
						.length], "default");
				}, 6000);
			}
		}
	},

	startPushAnimation: function () {
		
		var _this = this;
		
		var goodsItemPush = _this.data.goodsItemPush || [];
		if (_this.numPush) {
			return;
		}
		_this.numPush = true;
		
		if (goodsItemPush.length > 0) {

			let temp_item = goodsItemPush[0];
			_this.goodsAnimation(temp_item);
			_this.setData({
				loopAnimationStart: ""
			})

			_this.timerPush = setTimeout(() => {
				_this.numPush = false;
				let temp_arr = [].concat(goodsItemPush);
				temp_arr.shift();
				_this.setData({
					goodsItemPush : temp_arr
				})
				_this.startPushAnimation();
			}, 11000)
		} else {
			_this.numPush = false;
			_this.startDefaultAnimation();
		}
	},

	//获取主播信息
	getAchorInfo: function () {
		
	},

	//获取商品列表数据
	getGoodsListData: function () {
		var _this = this;
		var data = {
			ticketId: _this.data.pageInfo.ticketId,
			type: 5,
			offset: 0,
			limit: 50,
			permision: {
				id: _this.data.pageInfo.appId,
				key: _this.data.pageInfo.secret
			}
		}
		mzSDK.getGoods(data).then(function (res) {
			_this.setData({
				goodsListData: _this.data.goodsListData.concat(res.list.reverse()),
			}, () => {
				if (_this.data.goodsListData.length > 0) {
					_this.renderGoodsListData();
				}
			});
		})
	},

	//渲染商品列表数据
	renderGoodsListData: function () {
		var _this = this;
		_this.setData({
			goodsListDataReverse: _this.data.goodsListData.reverse(),
		}, () => {
			_this.setData({
				'defaultInfo.allGoodsNum': _this.data.goodsListData.length,
			})

		});

		_this.startDefaultAnimation()
	},

	//根据URL中的参数设置当前页面接下来连接数据的相关参数
	setParam: function (param) {
		this.setData({
			'pageInfo.ticketId': param.ticket_id
		});
	},

	//聊天框高度
	setCommentAreaHeight: function () {
		if (this.data.commentAreaHeight > 0) {
			return;
		}

		let _this = this
		console.log("setCommentAreaHeight start");
		setTimeout(() => {
			wx.createSelectorQuery().select('.comment-info').boundingClientRect(function (rect) {
				if (rect === null) {
					console.log("setCommentAreaHeight rect is null");
					return;
				}
				_this.data.commentAreaHeight = parseInt(rect.height);
			}).exec();
		}, 100);
	},

	//聊天框滚动到最下
	scrollToBottom: function () {
		console.log("scrollToBottom start");
		this.setCommentAreaHeight();
		setTimeout(() => {
			let _this = this;
			wx.createSelectorQuery().select('.comment-items').boundingClientRect(function (rect) {
				if (rect === null) {
					console.log("scrollToBottom rect is null");
					return;
				}
				_this.setData({
					scrollTop: parseInt(rect.height) - _this.data.commentAreaHeight,
				})
				console.log("scrollTo: " + (parseInt(rect.height) - _this.data.commentAreaHeight));
			}).exec();
		}, 300);
	},

	//点击完成按钮时触发
	userAddComment: function (e) {
		var _this = this;
		var data = e.detail.value;
		var commentList_temp = [].concat(_this.data.commentList)
		console.log("唯一标识符：",_this.data)
		commentList_temp.push({
			text: {
				user_name: _this.data.currentUser.nickName,
				avatar: _this.data.currentUser.avatarUrl,
				data: {
					text: data
				}
			}
		})
		_this.setData({
			test: "",
			inputShow: false,
			commentList: commentList_temp,
			scrollTop: _this.data.commentList.length * 1000,
		});
		mzSDK.push(data);
	},

	//文本框获取焦点-处理键盘高度
	userAddCommentfocus: function (e) {
		console.log("点击了文本框")
		var _this = this;
		var height = e.detail.height
		_this.setData({
			inputHeight: height + "px",
			classNameKeyboardUp: "user-addcomment-up"
		});
	},

	//文本框失去焦点-处理键盘高度
	userAddCommentblur: function (e) {
		var _this = this;
		_this.setData({
			inputHeight: '3.2vw',
			classNameKeyboardUp: "user-addcomment",
			inputShow: false
		});
	},

	//轮播商品清单中的商品
	changeGoodsItemName: function (i) {
		this.setData({
			'defaultInfo.goodsItemPic': this.data.goodsListDataReverse[i].pic,
			'defaultInfo.goodsItemName': this.data.goodsListDataReverse[i].name,
			'defaultInfo.goodsItemCurrency': "¥",
			'defaultInfo.goodsItemPrice': this.data.goodsListDataReverse[i].price,
			'defaultInfo.buy_url': this.data.goodsListDataReverse[i].buy_url
		})
	},

	//增加推送商品队列
	addGoodsItemPush: function (res) {
		var _this = this;
		var goodsItemPush = _this.data.goodsItemPush || [];
		goodsItemPush.push({
			name: res.data.name,
			pic: res.data.pic,
			price: res.data.price,
			url: res.data.url,
		});
		_this.setData({
			goodsItemPush: goodsItemPush
		},()=>{
			_this.startPushAnimation()
		})
		
	},

	//轮播推送的商品
	changePushGoodsItemPush: function (i) {
		this.setData({
			'defaultInfo.goodsItemPic': this.data.goodsItemPush[i].pic,
			'defaultInfo.goodsItemName': this.data.goodsItemPush[i].name,
			'defaultInfo.goodsItemCurrency': "¥",
			'defaultInfo.goodsItemPrice': this.data.goodsItemPush[i].price,
			'defaultInfo.buy_url': this.data.goodsItemPush[i].url
		})
	},

	clearGoodsItemPush: function () {
		var _this = this;
		_this.setData({
			goodsItemPush: [],
		})
	},

	bindViewTap: function () {
		wx.navigateTo({
			url: '../logs/logs'
		})
	},

	//关注主播
	followAnchor: function () {
		console.log("关注主播")
	},

	unique: function (arr) {
		for (var i = 0; i < arr.length; i++) {
			for (var j = i + 1; j < arr.length; j++) {
				if (arr[i] == arr[j]) { //第一个等同于第二个，splice方法删除第二个
					arr.splice(j, 1);
					j--;
				}
			}
		}
		return arr;
	},

	//设置新的用户头像
	newHeader: function (res) {
		var _this = this;
		var arr = []; //用来存放user_id不同的最后三个用户的头像
		for (var i = 0; i < res.length; i++) {
			if (res[i].uid < 5000000000) {
				arr.push(res[i].avatar)
			}
		}
		arr = this.unique(arr);

		if (arr.length > 3) {
			arr = arr.slice(-3)
		}
		_this.setData({
			iconList: [].concat(arr)
		})
	},

	//商品信息
	showGoodsInfo: function () {
		this.setData({
			goodsListState: true
		})
	},

	//打开设置弹层
	openSettingPopup: function () {
		this.setData({
			settingPopupState: true
		})
	},

	//关闭设置弹层
	closeSettingPopup: function () {
		this.setData({
			settingPopupState: false
		})
	},

	//显示全部商品弹层
	openShopping: function (e) {
		var _this = this;
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: 'linear'
		})
		_this.animation = animation
		animation.translateY(1000).step()
		_this.setData({
			animationData: animation.export(),
			chooseSize: true
		})
		setTimeout(function () {
			animation.translateY(0).step()
			_this.setData({
				animationData: animation.export(),
				clearcart: false
			})
		}, 30)
	},

	closeShopping: function (e) {
		var _this = this;
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: 'linear'
		})
		_this.animation = animation
		animation.translateY(700).step()
		_this.setData({
			animationData: animation.export()
		})
		setTimeout(function () {
			animation.translateY(0).step()
			_this.setData({
				animationData: animation.export(),
				chooseSize: false
			})
		}, 200)
	},
	closeShoppingPic: function (e) {
		var _this = this;
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: 'linear'
		})
		_this.animation = animation
		animation.translateY(700).step()
		_this.setData({
			animationData: animation.export()
		})
		setTimeout(function () {
			animation.translateY(0).step()
			_this.setData({
				animationData: animation.export(),
				chooseSize: false
			})
		}, 200)
	},

	toBuyGoods: function (e) {
		console.log("商品购买连接是：" + e.currentTarget.dataset.url)
	},

	toLogin: function () {
		console.log("您是访客，请登录后再发表言论。")
	},

	activeInput: function () {
		this.setData({
			inputShow: true
		})
	},
	ComponentsQuitPageTap: function (e) {
		this.setData({
			showQuitModelState: e.detail.quitPageState
		})
	},
	ComponentsShowPopup: function (e) {
		this.setData({
			chooseSize: e.detail.chooseSize
		})
	},

	// 创建用户上线提示动画
	createUserOnlineAnimation: function () {
		var _this = this;
		clearTimeout(_this.data.timerUserOnline)
		_this.setData({
			"userOnlineDefaule.left": "-29.33vw",
			"userOnlineDefaule.opacity": "0",
			userOnlineAnimation: ""
		}, ()=> {
			var UserAnimation = wx.createAnimation({
				duration: 300,
				timingFunction: "linear",
				delay: 0,
				transformOrigin: "50% 50% 0",
			});
			UserAnimation.left("3.2vw").opacity(1).step();
			
	
			_this.setData({
				userOnlineAnimation: UserAnimation.export(),
				timerUserOnline: setTimeout(function () {
					UserAnimation.left("-29.33vw").opacity(0).step();
					_this.setData({
						userOnlineAnimation: UserAnimation.export(),
					})
				}, 2600)
			})
		})
		
	}
})
