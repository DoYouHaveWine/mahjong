<script>
import { getOpenId } from '@/common/http/api.js';

export default {
	onLaunch: function() {

	},

	methods: {
		/**
		 * 微信小程序自动即时检测更新
		 * https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/update-mechanism.html
		 */
		checkMPWxUpdate() {
			const updateManager = wx.getUpdateManager();

			updateManager.onCheckForUpdate(res => {
				// 请求完新版本信息的回调
				console.log('微信小程序是否有更新：', res.hasUpdate);
			});

			updateManager.onUpdateReady(() => {
				uni.showModal({
					title: '更新提示',
					content: '新版本已经准备好，重启立即更新！',
					showCancel: false,
					success: res => {
						if (res.confirm) {
							// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
							updateManager.applyUpdate();
						}
					}
				});
			});

			updateManager.onUpdateFailed(() => {
				// 新版本下载失败
				console.error('小程序更新失败');
			});
		},


		/** 微信登录获取openId */
		getWxOpenId() {
			uni.login({
				provider: 'weixin',
				success: async res => {
					let { data } = await getOpenId(res.code);
					uni.setStorageSync('openId', JSON.parse(data).openid);
				}
			});
		}
	}
};
</script>

<style lang="scss">
/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
@import 'uview-ui/index.scss';
@import 'common/css/base.scss';
</style>
