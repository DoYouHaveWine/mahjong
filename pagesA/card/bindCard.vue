<template>
	<view>
		<health-card-users type="auth" hospitalId="100001" @select="selectCallback" @addCard="addCard" @switchType="switchTypeCallback" />
		<load-data :loading="loading" loadingText="绑卡中..." isLoadingDialog onlyShowLoading />
	</view>
</template>

<script>
import { fetchUserInfo, refreshCardList, fastAuth } from '@/common/http/api.js';
export default {
	data() {
		return {
			fromPage: undefined,
			loading: false
		};
	},

	onLoad(options) {
		this.fromPage = options.fromPage;
		this.opts = options
	},

	methods: {
		// 选卡回调
		selectCallback(result) {
			let { healthCode = '' } = result.detail;
			// 获取healthCode后处理业务逻辑
			this.loading = true;
			fastAuth({ healthCode })
				.then(async ({ code }) => {
					if (code == 200) {
						await fetchUserInfo();
						await refreshCardList();
						switch (this.fromPage) {
							case 'zqwj': // 诊前问卷
								uni.reLaunch({
									url: '/pagesA/preEntryMsg/preEntryMsgForm'
								});
								break;

							case 'myddc': // 满意度调查
								uni.reLaunch({
									url: '/pagesA/questionnaire/index'
								});
								break;
							case 'filter': // 门诊缴费
								uni.reLaunch({ url: `/pagesA/payment/filter?fromPage=${this.opts.fromPages}&hospitalId=${this.opts.hospitalId}` });
								break;
							default:
								uni.navigateBack();
								break;
						}
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},

		// 点击添加用卡人
		addCard(event) {
			uni.navigateTo({
				url: `./addFamily?wechatCode=${event.detail.wechatCode}&fromPage=${this.fromPage}`
			});
		},

		// 点击管理健康卡or完成管理
		switchTypeCallback(data) {
			console.log('切换type到：', data.detail.type);
		}
	}
};
</script>

<style lang="scss">
.selectUser--header {
	font-size: 28rpx !important;
	padding: 30rpx 40rpx !important;
}

.selectUser--footer {
	bottom: 40rpx !important;
}
</style>
