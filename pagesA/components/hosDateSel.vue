<!-- 这是一个公共组件hosCardSel用于选择医院和健康卡号，
<hos-card-sel @currentHosAndCard="onCurrentHosAndCard" />即可，
onCurrentHosAndCard方法参数来接收当前的医院ID（hospitalId）和健康卡ID（recordId） -->
<template>
	<view class="menu-box" :style="{ 'background-color': backgroudColor }">
		<!-- 主要用来占位并监听点击时间进入医院列表页面 -->
		<view class="sel-hos-box" v-if="selHosInList" @tap.stop="onHosItemClick" />
		<dropdown inactive-color="#000" active-color="#4298ff" ref="uDropdown">
			<dropdown-item :title="selHos | hosNameFilter" :disabled="ifDisabled">
				<!-- 防止医院数量太多加入scroll-view可滑动 -->
				<scroll-view scroll-y="true" style="height: 870rpx">
					<view :class="['hos-item', { 'sel-item': selHos && item.id === selHos.id }]" v-for="item in hosList"
						:key="item.id" @click="selItem(item, 'hos')">
						<text>{{ item.name }}</text>
						<u-icon name="checkbox-mark" v-if="selHos && item.id === selHos.id" />
					</view>
				</scroll-view>
			</dropdown-item>
			<dropdown-item :title="thisYear+'年'">
				<view :class="['record-item', { 'sel-item': item === thisYear }]" v-for="item in yearList" :key="item"
					@click="selItem(item, 'year')">
					<view class="flex-item"></view>
					<view class="tc flex-item">
						<text>{{ item }}</text>
						<text>年</text>
					</view>
				</view>
			</dropdown-item>
		</dropdown>
	</view>
</template>

<script>
	import {
		getBaseHosList,
		refreshCardList,
		getDefaultHos,
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
			// 选择医院是否需要跳转到医院列表
			selHosInList: {
				type: Boolean,
				default: true
			},
			// 传入医院的id
			hospitalId: {
				type: String,
				default: ''
			},
			ifDisabled: {
				type: Boolean || Number,
				default: false
			},
			//若传入10，则获取近十年数组。
			yearFilter: {
				type: Number,
				default: 10
			}
		},
		data() {
			return {
				// 医院选择相关
				hosList: [],
				thisYear: new Date().getFullYear()
			};
		},

		async mounted() {
			await this.getHosList();
			this.getDefaultHos();
		},

		computed: {
			yearList() {
				const _this = this
				let myDate = new Date()
				let thisYear = myDate.getFullYear()
				let arrYear = []
				for (let i = 0; i < _this.yearFilter; i++) {
					arrYear.push(thisYear--)
				}
				return arrYear
			},
			selHos() {
				if (this.hospitalId) {
					let item = this.hosList.filter(it => it.id == this.hospitalId)[0]
					return item
				}
				return this.$store.state.selHosInHosCardSel.allType
			}
		},

		watch: {
			selHos() {
				// 当为医院搜索列表时监听selHos,手动emit下
				if ((this.selHosInList || this.ifDisabled)) {
					this.$emit('currentHosAndCard', {
						hospitalId: this.selHos ? this.selHos.id : undefined,
						year: this.thisYear
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
			/** 获取医院列表 */
			async getHosList() {
				let res = await getBaseHosList();
				this.hosList = res.data || [];
			},
			/** 获取用户选择医院的习惯 */
			async getDefaultHos() {
				let res = await getDefaultHos();
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
					this.$store.commit('setSelHos', { hospital: selHos });
				} else {
					// 手动emit下
					this.$emit('currentHosAndCard', {
						hospitalId: undefined,
						year: this.thisYear
					});
				}
			},
			/** dropdownItem点击事件 */
			selItem(item, type) {
				if (type === 'hos') {
					this.$store.commit('setSelHos', { hospital: item });
				} else if (type === 'year') {
					this.thisYear = item;
				}
				this.$refs.uDropdown.close();

				this.$emit('currentHosAndCard', {
					hospitalId: this.selHos.id,
					year: this.thisYear
				});
			},
			/** 医院item点击 */
			onHosItemClick() {
				if (!this.hosList.length) {
					return;
				}
				if (this.ifDisabled) {
					return
				}
				this.$navTo('/pagesA/hospital/hosList?fromPage=xzyy');
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

		.hos-item {
			background-color: #fff;
			padding: 20rpx;
			display: flex;
			justify-content: space-between;
			color: $uni-666666;
		}

		.record-item {
			background-color: #fff;
			padding: 20rpx;
			display: flex;
			color: $uni-666666;
		}

		.sel-item {
			color: $uni-color-primary;
		}
	}
</style>
