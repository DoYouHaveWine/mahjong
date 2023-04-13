<template>
	<view class="page">
		<view class="pages">
			<!-- 搜索 -->
			<view class="search-box" slot="center">
				<u-search
					placeholder="请输入您想要搜索的医疗机构"
					v-model="opt.name"
					placeholder-color="#cccccc"
					color="#0F1419"
					bg-color="#ffffff"
					:showAction="false"
					:input-style="{ 'font-size': '24rpx' }"
					:action-style="{ color: 'white', 'font-size': '24rpx' }"
					@search="onSearch"
					@custom="onSearch"
					@clear="onSearch"
				/>
			</view>
			<!-- 常用工具 -->
			<view class="commom-tools mt10">
				<view class="banner plr-20">
					<image src="/static/social/social_banner.png" style="width: 100%;border-radius: 5px;height: 240rpx;" />
				</view>
				<view class="func-grid mt10">
					<view
						v-if="!item.hidden"
						class="item"
						:class="{ 'dev-func-style': item.dev }"
						v-for="(item, index) in commonToolList"
						:key="index"
						@click="onFuncItemClick(item)"
					>
						<view class="image-box"><image :src="item.src" /></view>
						<text>{{ item.text }}</text>
					</view>
				</view>
			</view>
			<!-- 筛选 -->
			<view class="dropdown-box">
				<dropdown :close-on-click-mask="false" ref="uDropdown">
					<dropdown-item
						:title="districtSelLabel"
						:options="districtOptions"
						height="800"
						v-model="districtSelValue"
						@change="value => checkboxGroupChange(value, 'district')"
					/>
					<dropdown-item
						:title="hosSelLabel"
						:options="hosOptions"
						v-model="hosSelValue"
						height="800"
						@change="value => checkboxGroupChange(value, 'hospitalType')"
					/>
					<dropdown-item
						:title="distanceSelLabel"
						:options="distanceOptions"
						v-model="distanceSelValue"
						height="800"
						@change="value => checkboxGroupChange(value, 'sortType')"
					/>
				</dropdown>
			</view>

			<!-- 列表 -->
			<view class="list-box plr-20 border-box">
				<view v-if="dataList.length" custom-class="card-item">
					<view class="item mt10" v-for="(item, index) in dataList" :key="index" @click="toPage(item)">
						<view class="left">
							<image v-if="item.logo" class="icon" :src="serverUrl + item.logo" />
							<image v-else class="icon" src="/static/social/ic_hospital.svg" />
						</view>
						<view class="center">
							<view class="just-between align-center">
								<text class="name">{{ item.name }}</text>
								<!-- 基层不显示定位 -->
								<!-- <image
									src="/static/social/ic_location.svg"
									style="height: 40rpx;width: 40rpx;"
									@click.stop="goLocation(item)"
								/> -->
							</view>
							<view class="level-type-name just-between mt5">
								<view>
									<!-- <text class="levelName">{{ item.levelName }}</text> -->
									<text class="typeNames c-99">{{ item.typeNames }}</text>
								</view>
								<text class="cc">{{ item.distanceText }}</text>
								<!-- <text class="nucleicAcidTestFlg" v-if="item.nucleicAcidTestFlg === 1">核酸检测</text> -->
							</view>
							<u-text v-if="item.specialDept" :lines="1" :text="'重点科室：' + item.specialDept" color="#999999" :size="13" />
							<view class="tip-box c-99">
								<template v-if="item.tagNames">
									<text class="tip-items mt5" v-for="(child, key) in item.tagNames.split(',')" :key="key">
										{{ child }}
									</text>
								</template>
								<text v-if="item.nucleicAcidTestFlg === 1" class="tip-items mt5">核酸检测</text>
							</view>
							<view v-if="item.cardType == 1" class="card-type">注：该院只支持就诊卡在线就诊</view>
						</view>
					</view>
				</view>
				<load-data v-else :loading="loading" />
			</view>
		</view>

		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
import { getDictList, getHosList, getRegionListv1, setDefaultHos } from '@/common/http/api.js';
import { getVertionType } from '@/common/utils/commonUtil.js';

const defaultDistrictOption = { label: '全部地区', value: 0, code: '' };

export default {
	data() {
		return {
			districtSelValue: 0, // 默认选中的Options中的value值（注意并非index）
			hosSelValue: 0,
			distanceSelValue: 1, // 默认选中的Options中的value值（注意并非index）
			// 地区筛选
			districtOptions: [defaultDistrictOption],
			// 医院筛选
			hosOptions: [{ label: '全部医院', value: 0 }, { label: '社区服务中心', value: 7 }, { label: '乡镇卫生院', value: 8 }],
			// 综合筛选（这里暂时没接数据）
			distanceOptions: [
				{
					label: '综合排序',
					value: 1
				},
				{
					label: '距离优先',
					value: 2
				},
				{
					label: '等级优先',
					value: 3
				}
			],
			opt: {
				district: '', // 所属地区
				lat: '', // 纬度
				lng: '', // 经度
				hospitalType: '', // 医院类型
				name: '',
				sortType: 1, //排序方式(1:综合排序,2:距离优先,3:等级优先)
				adminLevel: '3' //行政级别(1:市级;2:县级;3:社区)
			},
			dataList: [],
			loading: true,
			commonToolList: [
				// {
				// 	text: '家庭医生',
				// 	src: '/static/mine/ic_mine_wdys.svg',
				// 	url: '',
				// 	needCard: true,
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				// {
				// 	text: '在线签约',
				// 	src: '/static/social/ic_social_zxqy.svg',
				// 	url: '',
				// 	needCard: true,
				// 	dev: true
				// },
				{
					text: '健康体检',
					src: '/static/social/ic_jktj.svg',
					url: '',
					needCard: true
				},
				// {
				// 	text: '慢病续方',
				// 	src: '/static/social/ic_social_mbxf.svg',
				// 	url: '',
				// 	needCard: true,
				// 	dev: true
				// },
				{
					text: '健康档案',
					src: '/static/social/ic_social_jkda.svg',
					url: '',
					needCard: true
				},
				{
					text: '健康资讯',
					src: '/static/social/ic_social_mbxf.svg',
					url: '../../pagesA/info/list',
					needCard: true
				}
			]
		};
	},

	onLoad(options) {
		this.getLoc();
		this.getConfigData();
	},

	computed: {
		tabbarList() {
			return this.$store.state.vuex_tabbar;
		},

		cardList() {
			return this.$store.state.cardList;
		},

		/** 选择的区域条件Label */
		districtSelLabel() {
			let label = this.districtOptions.find(it => it.value === this.districtSelValue).label;
			return label.length > 5 ? `${label.substr(0, 5)}...` : label;
		},

		/** 选择的距离条件Label */
		distanceSelLabel() {
			return this.distanceOptions.find(it => it.value === this.distanceSelValue).label;
		},
		hosSelLabel() {
			return this.hosOptions.find(it => it.value === this.hosSelValue).label;
		}
	},

	methods: {
		/** 小程序获取位置 */
		getLoc() {
			uni.getLocation({
				type: 'wgs84',
				success: res => {
					this.opt.lng = res.longitude;
					this.opt.lat = res.latitude;
				},
				fail: () => {
					console.error('获取定位失败，请打开GPS开关!');
				},
				complete: () => {
					this.getHosList();
				}
			});
		},

		/** 获取医院字典以及区域数据 */
		async getConfigData() {
			let { data: areaOptions } = await getRegionListv1('130600000000');
			areaOptions = areaOptions.map((value, index) => {
				return {
					...value,
					label: value.name,
					value: value.code
				};
			});
			this.districtOptions = [...this.districtOptions, ...areaOptions];
		},

		/**
		 * 筛选多选框点击事件
		 *
		 * @param {Object} e 点击选择的值
		 * @param {Object} category 点击的按键类型
		 */
		checkboxGroupChange(e, category) {
			if (category == 'sortType' && this.distanceSelValue == 2 && !this.opt.lng) {
				// 这里重新定位是避免选择距离排序后再开启定位又回到页面重新选择距离排序
				uni.getLocation({
					type: 'wgs84',
					success: res => {
						this.opt.lng = res.longitude;
						this.opt.lat = res.latitude;
						this.opt[category] = e == 0 ? '' : e;
						this.getHosList();
					},
					fail: () => {
						uni.showModal({
							title: '获取定位失败',
							content: '无法获取当前定位，故不能按距离排序，请打开GPS开关!',
							showCancel: false
						});
						this.distanceSelValue = this.opt.sortType;
					}
				});
			} else {
				this.opt[category] = e == 0 ? '' : e;
				this.getHosList();
			}
		},

		/** 获取医院列表 */
		async getHosList() {
			this.loading = true;
			this.dataList = [];
			// APP 只能用院内卡
			// #ifdef APP-PLUS
			this.opt.cardType = 1;
			// #endif

			let { data } = await getHosList(this.opt);
			this.dataList = data;
			this.loading = false;
		},

		/** 搜索医院 */
		onSearch() {
			this.getHosList();
		},
		goLocation(item) {
			uni.openLocation({
				latitude: item.lat,
				longitude: item.lng,
				name: item.name
			});
		},

		async toPage(item) {
			//const { data } = await setDefaultHos(item.id);
			uni.navigateTo({
				url: `../../pagesA/publicHealth/hosInfo?hospitalId=${item.id}`
			});
		},

		/**
		 * 功能项点击
		 * @param {String} item 功能项
		 */
		async onFuncItemClick(item) {
			if (item.dev) {
				// 建设中...
				this.$devFuncClick();
				return;
			}

			if (!uni.getStorageSync('token')) {
				// 未授权
				this.navToAuth();
				return;
			}

			if (item.needCard && !this.checkBindCard()) {
				// 需要绑卡但未绑卡
				return;
			}

			if (item.url) {
				uni.navigateTo({ url: item.url });
			} else {
				switch (item.text) {
					case '健康体检':
						this.checkAndNavToHealthRecord(false);
						break;
					case '健康档案':
						this.checkAndNavToHealthRecord(true);
						break;
				}
			}
		},

		/** 检查是否绑定本人的卡并跳转到健康档案 */
		checkAndNavToHealthRecord(isHealthRecords) {
			if (!this.checkBindCard()) {
				// 需要绑卡但未绑卡
				return;
			}

			let bindOwnCard = false;
			this.cardList.forEach(({ relationShip, idCard }) => {
				if (relationShip === 0) {
					bindOwnCard = true;
					uni.navigateTo({
						url: isHealthRecords ? '/pagesA/healthRecords/healthRecords' : '/pagesA/healthRecords/healthRecords?fromPage=tjbg'
					});
					return;
				}
			});

			if (!bindOwnCard) {
				uni.showModal({
					title: '提示',
					content: isHealthRecords
						? '为保障个人隐私安全，目前仅支持查看【本人】健康档案，请先绑定本人的健康卡！'
						: '为保障个人隐私安全，目前仅支持查看【本人】健康体检信息，请先绑定本人的健康卡！',
					showCancel: false
				});
				return;
			}
		},

		/** 检查是否绑定电子健康卡,并做未绑卡提示 */
		checkBindCard() {
			if (this.cardList.length === 0) {
				uni.showModal({
					title: '提示',
					content: '请先绑定电子健康卡再进行相应操作！',
					success: res => {
						if (res.confirm) {
							uni.navigateTo({ url: '/pagesA/card/list' });
						}
					}
				});
				return false;
			}
			return true;
		},

		/** 跳转到去授权的页面
		 * @param {Object} fromPage 跳到auth授权的页面来源，例如social
		 */
		navToAuth(fromPage = 'social') {
			// #ifdef MP-WEIXIN
			uni.reLaunch({ url: `/pagesA/auth/auth?fromPage=${fromPage}` });
			// #endif
			
			// #ifndef MP-WEIXIN
			uni.reLaunch({ url: `/pagesA/login/login?fromPage=${fromPage}` });
			// #endif
		}
	}
};
</script>

<style lang="scss">
page {
	background: $uni-f9f9f9;
	.pages {
		// flex-direction: column;
		// height: 100vh;
		.search-box {
			padding: 20rpx;
			background-color: #4298ff;
		}
		.commom-tools {
			.func-grid {
				overflow: hidden;
				width: 100%;
				display: flex;
				flex-wrap: wrap;

				.item {
					display: flex;
					width: 25%;
					height: 180rpx;
					text-align: center;
					align-items: center;
					flex-direction: column;
					justify-content: center;

					.image-box {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 120rpx;
						height: 104rpx;
						border-radius: 20rpx;
						background: #fff;
						box-shadow: 0rpx 2rpx 20rpx 2rpx #0000000d;

						image {
							width: 46rpx;
							height: 50rpx;
						}
					}

					text {
						color: #333;
						font-family: SF Pro Display;
						font-weight: 500;
						font-size: 28rpx;
						margin-top: 8rpx;
					}
				}
			}
		}

		.list-box {
			padding-bottom: 20rpx;
			.item {
				background: $uni-ffffff;
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx;
				border-radius: 10px;

				.left {
					.icon {
						width: 160rpx;
						height: 160rpx;
						border-radius: 10px;
					}
				}

				.right {
					.intro {
						text-align: center;
						color: #fff;
						background-color: #92c9ff;
						margin-bottom: 30rpx;
						font-size: 24rpx;
						padding: 6rpx 0;
						border-radius: 4rpx;
					}

					.distanceText {
						font-size: 24rpx;
					}
				}

				.center {
					flex: 1;
					margin: 0 20rpx;

					.name {
						color: #000;
						font-size: 30rpx;
						margin-bottom: 20rpx;
					}

					.level-type-name {
						font-size: 24rpx;
						margin: 6rpx 0;
						.levelName {
							padding: 0px 5px;
							border-radius: 4px;
							color: $uni-e74948;
							text-align: center;
						}

						.typeNames {
							margin-left: 6rpx;
						}

						.nucleicAcidTestFlg {
							padding: 2px 5px;
							margin-left: 20rpx;
							border-radius: 4px;
							color: $uni-ffffff;
							text-align: center;
							background-color: $uni-56c01e;
						}
					}
					.tip-box {
						font-size: 24rpx;
						display: flex;
						flex-wrap: wrap;
						justify-content: space-between;
						.tip-items {
							width: 30%;
							border-radius: 4px;
							text-align: center;
							background-color: #e6f1ff;
						}
					}
					.address,
					.card-type {
						font-size: 24rpx;
					}

					.card-type {
						margin-top: 6rpx;
						font-weight: bold;
						color: #dd524d;
					}
				}
			}
		}

		.slot-content {
			.modal-content {
				font-size: 28rpx;
				border-bottom: 2rpx solid #c0c0c0;
				padding: 20rpx;
				line-height: 45rpx;
				min-height: 180rpx;
			}

			.modal-buttons {
				display: flex;
				view {
					padding: 14rpx 0;
					flex: 1;
					text-align: center;

					&:nth-child(1) {
						color: #606266;
					}

					&:nth-child(2) {
						color: #2979ff;
					}

					&:nth-child(3) {
						color: #5383f9;
					}

					&:active {
						background-color: #f1f1f1;
					}
				}
			}
		}
	}
}
</style>
