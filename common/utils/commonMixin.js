// 存放全局混入数据与方法
import { serverUrl } from '@/common/http/baseRequest.js'
import constantMap from '@/common/constantMap.js'

export default {
	// data不能以$或者_开头命名(虽然Vue.protoType原型上可以，但就是不想用)
	data() {
		return {
			serverUrl, // 服务器地址
			constantMap, // 定义的常量

			// 小程序分享的内容
			share: {
				title: '四个朋友',
				path: '/pages/list/index', // 全局分享的路径，比如 首页
				imageUrl: '/static/ic_logo.jpg', // 全局分享的图片(可本地可网络)
			}
		}
	},

	filters: {
		/**
		 * 姓名脱敏处理filter
		 * @param {Object} name
		 */
		$nameSecret(name) {
			if (!name) return '';

			let length = name.length;
			if (length < 3) {
				return name.substr(0, 1) + '*';
			} else {
				let xing = '';
				for (var i = 1; i < length - 1; i++) {
					xing += '*';
				}
				return name.substr(0, 1) + xing + name.substr(length - 1, length);
			}
		},

		/**
		 * 身份证号脱敏处理filter
		 * @param {Object} idCard
		 */
		$idCardSecret(idCard) {
			if (!idCard) return '';

			let leng = idCard.length;
			let start = '';
			let stop = '';
			let replacepostext = '';
			if (leng == 18) {
				start = 4;
				stop = 14;
				replacepostext = '**********';
			} else if (leng == 15) {
				start = 4;
				stop = 12;
				replacepostext = '********';
			}
			if (idCard.indexOf('L') < 0) {
				return idCard.substr(0, start) + replacepostext + idCard.substr(stop);
			}
		},

		/**
		 * 手机号脱敏处理filter
		 * @param {Object} mobile
		 */
		$mobileSecret(mobile) {
			if (!mobile) return '';

			let leng = mobile.length;
			let start, stop;
			let replacepostext = '';
			if (leng == 11) {
				start = 3;
				stop = 7;
				replacepostext = '****';
				return mobile.substr(0, start) + replacepostext + mobile.substr(stop);
			} else {
				return mobile
			}
		}
	},

	methods: {
		/** 功能建设中... */
		$devFuncClick() {
			uni.showModal({
				title: '功能建设中...',
				content: '敬请期待',
				showCancel: false
			});
		},

		/** 页面跳转 */
		$navTo(url) {
			uni.navigateTo({ url })
		},
		/* url: 要跳转的链接，例如：pages/find/index?id=15 */
		/* callback: 回调方法，做些特殊的事情 */
		$linkJump({ url, callback }) {
			if (!url) { return }
			let newUrl = url
			if (url[0] === '/') {
				/* 过滤首位的/ */
				newUrl = url.substring(1)
			}
			const pathname = newUrl.split('?')[0]
			const tabBarUrl = ['pages/index/index', 'pages/mine/index', 'pages/order/index',
				'pages/preferential/index'] /* Tab页中的路径，请根据自己项目实际情况进行修改 */
			const page = getCurrentPages()
			const index = page.findIndex(item => item.route === pathname)
		 /* 如果是Tab中的链接，直接跳转 */
			if (tabBarUrl.includes(pathname)) {
				uni.switchTab({
					url: url,
					success: () => {
						callback && callback()
					}
				})
				return
			}
			if (index !== -1) {
				/* 在页面栈中找到时 */
				const step = page.length - 1 - index
				if (step === 0) {
					uni.redirectTo({
						url: url,
						success: () => {
							callback && callback()
						}
					})
				} else {
					callback && callback()
					uni.navigateBack({ delta: step })
				}
				return
			}
			/* 否则就直接跳转 */
			uni.navigateTo({
				url: url,
				success: () => {
					callback && callback()
				}
			})
		}
	},

	// 定义全局分享
	// 发送给朋友
	onShareAppMessage() {
		return {
			title: this.share.title,
			path: this.share.path,
			imageUrl: this.share.imageUrl,
		}
	},

	// 分享到朋友圈
	onShareTimeline() {
		return {
			title: this.share.title,
			path: this.share.path,
			imageUrl: this.share.imageUrl,
		}
	},
}
