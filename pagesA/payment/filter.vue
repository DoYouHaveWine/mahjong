<template>
	<view class="outpatient-page">
		<view class="top-box">
			<view class="top-tip">选择医院、就诊人、查询记录</view>

			<u-cell-group customStyle="background-color:#fff" :border="false">
				<u-cell title="机构名称" :isLink="!hospitalId" @click="hospitalId?'':$navTo(`./chooseHos?hosType=${fromPage}`)">
					<view slot="value" :style="{ color: selHos ? '#000' : '#999' }">{{ selHos ? selHos.name : '请选择' }}</view>
				</u-cell>
				<card-sel @currentCard="onCurrentCard" customContent v-if="loginTip">
					<u-cell slot="content" title="就诊人" :value="choosePatient.name | $nameSecret" isLink />
				</card-sel>
				<u-cell title="证件号码" :value="choosePatient.idCard | $idCardSecret" />
			</u-cell-group>
			<view class="plr-20">
				<u-button
					shape="circle"
					text="查询"
					color="#4298ff"
					size="large"
					customStyle="margin-top:60rpx;width:100%;height:112rpx"
					@click="toQuery"
				/>
			</view>
			<view class="pay-tip">
				<view>{{ tip.title }}</view>
				<view class="mt5">
					<view v-if="tip.isDefault" style="white-space:pre-line;">{{ tip.content }}</view>
					<u-parse v-else :content="tip.content"></u-parse>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getDefaultClinicHos, getDefaultRechargeHos, getDefaultRechargeHosed, getNoticeInfo,getPaymentHosList,refreshCardList } from '@/common/http/api.js';
import cardSel from '@/pagesA/components/cardSel.vue';
export default {
	components: { cardSel },

	data() {
		return {
			choosePatient: {},
			fromPage: 'mzjf',
			hosList:[],
			hospitalId:undefined,
			loginTip:false,
			tip: {
				title: '',
				content: '',
				isDefault: false
			}
		};
	},

	computed: {
		selHos() {
			let hospital;
			switch (this.fromPage) {
				case 'mzjf': // 门诊缴费类型的医院
				if(this.hospitalId){//如果有传入医院id
					hospital = this.hosList.filter(it => it.id == this.hospitalId)[0]
				}else{
					hospital = this.$store.state.selHosInHosCardSel.mzjfType;
				}
					break;
				case 'zycz': // 住院充值类型的医院
					hospital = this.$store.state.selHosInHosCardSel.zyczType;
					break;

				default:
					// 默认所有医院
					hospital = this.$store.state.selHosInHosCardSel.allType;
					break;
			}

			if (hospital) {
				this.getNotice(hospital.id);
			}
			console.log(hospital);
			return hospital;
		}
	},

	async onLoad(options) {
		if (!uni.getStorageSync('token')) {
			// 去授权
			uni.redirectTo({ url: `/pagesA/auth/auth?fromPage=filter&fromPages=${options.fromPage}&hospitalId=${options.hospitalId}` });
			return;
		}else{
			this.hospitalId = options.hospitalId;
			this.fromPage = options.fromPage;
			this.loginTip = true
			const { data } = await refreshCardList();
			if (!data.length) {
				uni.showModal({
					title: '提示',
					content: '请先绑定电子健康卡再进行相应操作！',
					success: res => {
						if (res.confirm) {
							uni.redirectTo({ url: `/pagesA/card/bindCard?fromPage=filter&fromPages=${this.fromPage}&hospitalId=${this.hospitalId}` });
						}
					}
				});
			}
			this.handlePage();
			if(!options.hospitalId){
				this.getDefaultHos();
			}else{
				this.getHosList();
			}
		}
	},

	methods: {
		/** 获取门诊缴费医院列表 */
		async getHosList() {
			let res = await getPaymentHosList();
			this.hosList = res.data || [];
		},
		/** 根据页面类型处理页面展示、请求等 */
		handlePage() {
			switch (this.fromPage) {
				case 'mzjf': // 门诊缴费
					uni.setNavigationBarTitle({ title: '门诊缴费' });
					break;

				case 'zycz': // 住院充值
					uni.setNavigationBarTitle({ title: '住院充值' });
					break;
			}
		},

		/** 获取医院的门诊缴费须知/门诊充值须知/住院充值须知 */
		async getNotice(hosId) {
			const { data } = await getNoticeInfo(hosId);
			switch (this.fromPage) {
				case 'mzjf': // 门诊缴费
					this.tip.title = '门诊缴费须知';
					this.tip.content =
						data.feePaymentInfo ||
						`1、微信线上门诊诊间缴费功能，暂不支持医保患者诊间缴费，医保患者需持医保卡或医保电子凭证到自助机或激费窗口办理业务
						 2、缴费成功后，如需退费，请到窗口办理退费业务，线上不办理退费业务`;
					this.tip.isDefault = data.feePaymentInfo ? false : true;
					break;

				case 'zycz': // 住院充值
					this.tip.title = '住院充值须知';
					this.tip.content =
						data.inHospRechargeInfo ||
						`1、请核对就诊人和余额信息；
					2、可选择常用金额快捷充值，或者输入自定义金额进行充值；
					3、门诊充值仅用于门诊缴费，住院充值仅用户住院缴费，如需办理退费请到人工窗口办理；
					4、我院暂不支持线上医保缴费，如需医保缴费请到人工窗口办理。`;
					this.tip.isDefault = data.inHospRechargeInfo ? false : true;
					break;
			}
		},

		/** 首次进入时获取用户默认选择的医院 */
		async getDefaultHos() {
			let res;
			switch (this.fromPage) {
				case 'mzjf': // 门诊缴费类型的医院
					res = await getDefaultClinicHos();
					break;

				case 'zycz': // 住院充值类型的医院
					res = await getDefaultRechargeHosed();
					break;
			}

			this.$store.commit('setSelHos', { type: this.fromPage, hospital: res.data });
		},

		onCurrentCard(card) {
			this.choosePatient = card;
		},

		/** 查询 */
		toQuery() {
			if (!this.selHos) {
				uni.showToast({
					duration: 2500,
					icon: 'none',
					title: '请选择机构'
				});
				return;
			}

			switch (this.fromPage) {
				case 'mzjf': // 门诊缴费
					uni.navigateTo({
						url: `./payList?hospitalId=${this.selHos.id}&recordId=${this.choosePatient.id}`
					});
					break;

				case 'zycz': // 住院充值
					uni.navigateTo({
						url: `/pagesA/hospitalized/recharge?hospitalId=${this.selHos.id}&cardId=${this.choosePatient.id}&hospitalName=${
							this.selHos.name
						}`
					});
					break;
			}
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #fafafa;

	.top-box {
		padding-bottom: 30rpx;
		/* #ifdef MP-WEIXIN */
		min-height: calc(100vh - 220rpx);
		/* #endif */
		/* #ifndef MP-WEIXIN */
		min-height: calc(100vh - 300rpx);
		/* #endif */

		.top-tip {
			padding: 24rpx;
			font-size: 26rpx;
			font-weight: 500;
			color: rgba(15, 20, 25, 0.5);
		}

		.u-cell__value {
			color: #000 !important;
		}

		.pay-tip {
			font-size: 26rpx;
			font-family: PingFang SC-Regular, PingFang SC;
			font-weight: 400;
			color: rgba(15, 20, 25, 0.5);
			margin: 32rpx 40rpx 32rpx 40rpx;
			line-height: 1.6;
		}
	}
}
</style>
