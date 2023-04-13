<!-- 这是一个公共组件hosCardSel用于选择医院和健康卡号，
<hos-card-sel @currentHosAndCard="onCurrentHosAndCard" />即可，
onCurrentHosAndCard方法参数来接收当前的医院ID（hospitalId）和健康卡ID（recordId） -->
<template>
	<view class="menu-box" :style="{ 'background-color': backgroudColor }">
		<view class="menu-tip" v-if="showTip">查询前请选择医院及就诊人</view>

		<!-- 主要用来占位并监听点击时间进入医院列表页面 -->
		<view class="sel-hos-box" v-if="selHosInList" @tap.stop="onHosItemClick" />

		<dropdown inactive-color="#000" active-color="#4298ff" ref="uDropdown" :ifDisabled="ifDisabled">
			<dropdown-item :title="selHos | hosNameFilter" :disabled="checkHosDisabled()">
				<!-- 防止医院数量太多加入scroll-view可滑动 -->
				<scroll-view scroll-y="true" style="height: 870rpx">
					<view
						:class="['hos-item', { 'sel-item': selHos && item.id === selHos.id }]"
						v-for="item in hosList"
						:key="item.id"
						@click="selItem(item, 'hos')"
					>
						<text>{{ item.name }}</text>
						<u-icon name="checkbox-mark" v-if="selHos && item.id === selHos.id" />
					</view>
				</scroll-view>
			</dropdown-item>
			<dropdown-item :title="selCard.name | $nameSecret" :disabled="!selCard.name">
				<view
					:class="['record-item', { 'sel-item': item.id === selCard.id }]"
					v-for="item in cardList"
					:key="item.id"
					@click="selItem(item, 'card')"
				>
					<text>{{ item.idCard | $idCardSecret }}</text>
					<text>{{ item.name | $nameSecret }}</text>
				</view>
			</dropdown-item>
		</dropdown>
	</view>
</template>

<script>
import {
	getBaseHosList,
	getPaymentHosList,
	getRechargeHosList,
	getRechargeHosedList,
	refreshCardList,
	getDefaultHos,
	setDefaultHos,
	getDefaultClinicHos,
	getDefaultRechargeHos,
	getDefaultRechargeHosed
} from '@/common/http/api.js';

export default {
	props: {
		// 背景色
		backgroudColor: {
			type: String,
			default: '#fff'
		},
		// 是否展示选择提示
		showTip: {
			type: Boolean,
			default: false
		},
		// 选择医院是否需要跳转到医院列表
		selHosInList: {
			type: Boolean,
			default: true
		},
		// 医院的类型，包括所有医院、门诊缴费医院、门诊充值医院、住院充值医院
		hosType: {
			type: String,
			default: ''
		},
		// 如果有当前值传入则展示传入的就诊人，如果没有则展示默认就诊人
		recordId: {
			type: String,
			default: ''
		},
		ifDisabled: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			// 医院选择相关
			hosList: [],
			selCard: {}
		};
	},

	async mounted() {
		await this.getCardList();
		await this.getHosList();
		this.getDefaultHos();
	},

	computed: {
		cardList() {
			return this.$store.state.cardList;
		},

		selHos() {
			switch (this.hosType) {
				case 'mzjf': // 门诊缴费类型的医院
					return this.$store.state.selHosInHosCardSel.mzjfType;

				case 'mzcz': // 门诊充值类型的医院
					return this.$store.state.selHosInHosCardSel.mzczType;

				case 'zycz': // 住院充值类型的医院
					return this.$store.state.selHosInHosCardSel.zyczType;

				default:
					// 默认所有医院
					return this.$store.state.selHosInHosCardSel.allType;
			}
		}
	},

	watch: {
		selHos() {
			// 当为医院搜索列表时监听selHos,手动emit下
			if ((this.selHosInList || this.ifDisabled) && this.selCard) {
				this.$emit('currentHosAndCard', {
					hospitalId: this.selHos ? this.selHos.id : undefined,
					recordId: this.selCard.id
				});
			}
		}
	},

	filters: {
		hosNameFilter(hospital) {
			if (!hospital) return '暂无该类型机构';

			let name = hospital.name;
			if (name) {
				if (name.length > 10) {
					return name.substr(0, 10) + '...';
				} else {
					return name;
				}
			} else {
				return '';
			}
		}
	},

	methods: {
		/** 检查医院item是否disabled */
		checkHosDisabled() {
			// 不直接使用!this.selHos是由于computed有缓存
			return !this.selHos;
		},

		/** 获取绑定的健康卡列表 */
		async getCardList() {
			if (this.cardList.length == 0) {
				// 这里请求一下是在调试带有cardSel组件的单个页面时也能有数据方便调试，不是单个页面时没影响
				await refreshCardList();
			}

			if (this.cardList.length > 0) {
				if (this.recordId) {
					this.selCard = this.cardList.filter(it => it.id == this.recordId)[0];
				} else {
					this.selCard = this.cardList.filter(it => it.defaultFlg == 1)[0] || this.cardList[0];
				}
			} else {
				uni.showModal({
					title: '提示',
					content: '请先绑定电子健康卡再进行相应操作！',
					showCancel: false,
					success: res => {
						if (res.confirm) {
							uni.redirectTo({ url: '/pagesA/card/list' });
						}
					}
				});
			}
		},

		/** 获取医院列表 */
		async getHosList() {
			let res;
			switch (this.hosType) {
				case 'mzjf': // 门诊缴费类型的医院
					res = await getPaymentHosList();
					break;

				case 'mzcz': // 门诊充值类型的医院
					res = await getRechargeHosList();
					break;

				case 'zycz': // 住院充值类型的医院
					res = await getRechargeHosedList();
					break;

				default:
					// 默认所有医院
					res = await getBaseHosList();
					break;
			}
			this.hosList = res.data || [];
		},

		/** 获取用户选择医院的习惯 */
		async getDefaultHos() {
			let res;
			switch (this.hosType) {
				case 'mzjf': // 门诊缴费类型的医院
					res = await getDefaultClinicHos();
					break;

				case 'mzcz': // 门诊充值类型的医院
					res = await getDefaultRechargeHos();
					break;

				case 'zycz': // 住院充值类型的医院
					res = await getDefaultRechargeHosed();
					break;

				default:
					// 默认所有医院
					res = await getDefaultHos();
					break;
			}

			// 可能会存在无门诊缴费/住院缴费医院...的情况
			if (this.hosList.length) {
				let hosArr = [];
				if (res.data) {
					hosArr = this.hosList.filter(it => it.id == res.data.id);
				}
				let selHos;
				if (hosArr.length > 0) {
					selHos = hosArr[0];
				} else {
					selHos = this.hosList[0];
				}
				this.$store.commit('setSelHos', { hospital: selHos, type: this.hosType });
			} else {
				// 手动emit下
				this.$emit('currentHosAndCard', {
					hospitalId: undefined,
					recordId: this.selCard.id
				});
			}
		},

		/** dropdownItem点击事件 */
		selItem(item, type) {
			if (type === 'hos') {
				this.$store.commit('setSelHos', { hospital: item });
				this.setDefaultHos(this.selHos.id);
			} else if (type === 'card') {
				this.selCard = item;
			}
			this.$refs.uDropdown.close();

			this.$emit('currentHosAndCard', {
				hospitalId: this.selHos.id,
				recordId: this.selCard.id
			});
		},

		/** 保存用户选择的医院 */
		setDefaultHos(hospitalId) {
			setDefaultHos(hospitalId);
		},

		/** 医院item点击 */
		onHosItemClick() {
			if (!this.hosList.length) {
				return;
			}

			switch (this.hosType) {
				case 'mzjf': // 门诊缴费类型的医院
					this.$navTo('/pagesA/payment/chooseHos?hosType=mzjf');
					break;

				case 'mzcz': // 门诊充值类型的医院
					this.$navTo('/pagesA/payment/chooseHos?hosType=mzcz');
					break;

				case 'zycz': // 住院充值类型的医院
					this.$navTo('/pagesA/payment/chooseHos?hosType=zycz');
					break;

				default:
					// 默认所有医院
					this.$navTo('/pagesA/hospital/hosList?fromPage=xzyy');
					break;
			}
		}
	}
};
</script>

<style lang="scss">
.menu-box {
	position: relative;

	.menu-tip {
		padding: 20rpx 30rpx;
		font-size: 28rpx;
	}

	.sel-hos-box {
		width: 50%;
		opacity: 0;
		height: 100%;
		position: absolute;
		z-index: 99;
	}

	.hos-item,
	.record-item {
		background-color: #fff;
		padding: 20rpx;
		display: flex;
		justify-content: space-between;
		color: $uni-666666;
	}

	.sel-item {
		color: $uni-color-primary;
	}
}
</style>
