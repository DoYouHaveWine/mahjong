<template>
	<view>
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

		<view v-if="fromPage == 'yygh'" class="plr-20 nav-box just-between align-center mt10 c-white">
			<view class="nav-item item-1 flex-box align-center" @click="navToGuide">
				<view class="plr-10">
					<view class="f-16 fb">智能导诊</view>
					<view class="f-12 mt5">快速帮你找对科室</view>
					<image src="../static/hospital/icon_nav.png"></image>
				</view>
			</view>
			<view class="nav-item item-2 flex-box align-center" @click="navToRecordList">
				<view class="plr-10">
					<view class="f-16 fb">挂号记录</view>
					<view class="f-12 mt5">轻松找到挂号订单</view>
					<image src="../static/hospital/icon_order.png"></image>
				</view>
			</view>
		</view>

		<!-- 筛选 -->
		<view :class="{ 'dropdown-box': fromPage != 'yygh' }">
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
					@change="value => checkboxGroupChange(value, 'level')"
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
		<view class="list-box plr-20 flex-item border-box">
			<view v-if="hosList.length" custom-class="card-item">
				<view
					class="item mt10"
					v-for="item in hosList"
					:key="item.id"
					:class="{ 'dev-func-style': item.state === '2' }"
					@click="onHosClick(item)"
				>
					<view class="hos-info">
						<view class="left">
							<image v-if="item.logo" class="icon" :src="serverUrl + item.logo" />
							<image v-else class="icon" src="/static/social/ic_hospital.svg" />
						</view>
						<view class="right">
							<view class="just-between align-center">
								<text class="name">{{ item.name }}</text>
								<image
									src="../../static/social/ic_location.svg"
									style="height: 40rpx;width: 40rpx;"
									@click.stop="goLocation(item)"
								/>
							</view>
							<view class="level-type-name just-between mt5">
								<view>
									<text class="levelName">{{ item.levelName }}</text>
									<text class="typeNames c-99">{{ item.typeNames }}</text>
								</view>
								<text class="cc">{{ item.distanceText }}</text>
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
							<view class="tr f-12"><text class="tip-introduce mt5" @click.stop="showHosIntroduce(item)">简介></text></view>
						</view>
					</view>
					<template v-if="item.departmentListResps">
						<view
							class="dept-info"
							v-for="deptItem in item.departmentListResps"
							:key="deptItem.id"
							@click.stop="$navTo(`./doctorList?hospitalId=${deptItem.hospitalId}&deptId=${deptItem.id}`)"
						>
							<text class="dept-name">{{ deptItem.name }}</text>
							<u-icon name="arrow-right" />
						</view>
					</template>
					<template v-else>
						<view v-if="illnessTypeName" class="dept-info" @click="onHosClick(item)">
							<text class="no-dept">暂无{{ illnessTypeName }}相关门诊</text>
							<u-icon name="arrow-right" />
						</view>
					</template>
				</view>
			</view>
			<load-data v-else :loading="loading" />
		</view>

		<u-popup :show="show" @close="close" closeable closeOnClickOverlay :round="10">
			<view class="tc f-18 fb ptb-10">请选择要去的分院</view>
			<view class="list-box">
				<view v-for="item in childList" class="item" :key="item.id" @click="goLocation(item)">
					<view class="hos-info plr-10">
						<view class="right">
							<view class="just-between align-center">
								<text class="name">{{ item.name }}</text>
								<image src="../../static/social/ic_location.svg" style="height: 40rpx;width: 40rpx;" />
							</view>
							<view class="level-type-name just-between mt5">
								<view>
									<text class="levelName">{{ item.address }}</text>
									<text class="typeNames c-99">{{ item.typeNames }}</text>
								</view>
								<text class="cc">{{ item.distanceText }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</u-popup>

		<u-popup :show="showIntroduce" @close="close" closeable closeOnClickOverlay :round="10">
			<view class="tc f-18 fb ptb-10">{{clickedItem.name}}</view>
			<view class="list-box intro-box plr-20 f-14">
				<view class="mt10" v-if="clickedItem.tel">电话：<text class="intro-tel" @click="call(clickedItem.tel)">{{clickedItem.tel}}</text></view>
				<view class="mt10">简介：{{clickedItem.intro}}</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { getDictList, getHosList, getRegionListv1, setDefaultHos } from '@/common/http/api.js';

const defaultDistrictOption = {
	label: '全部地区',
	value: 0,
	code: ''
};
const defaultHosOption = {
	label: '全部医院',
	value: 0,
	code: ''
};

export default {
	data() {
		return {
			fromPage: undefined,
			illnessTypeName: undefined,
			districtSelValue: 0, // 默认选中的Options中的value值（注意并非index）
			hosSelValue: 0,
			distanceSelValue: 1, // 默认选中的Options中的value值（注意并非index）
			// 地区筛选
			districtOptions: [defaultDistrictOption],
			// 医院筛选
			hosOptions: [defaultHosOption],
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
				level: '', // 医院等级
				name: '',
				sortType: 1, //排序方式(1:综合排序,2:距离优先,3:等级优先)
				adminLevel: '1,2', //行政级别(1:市级;2:县级;3:社区)
				illnessType: ''
			},
			hosList: [],
			loading: true,
			zndzUrl: undefined,
			childList: [],
			show: false,
			showIntroduce: false,
			clickedItem: {}
		};
	},

	onLoad(options) {
		this.fromPage = options.fromPage;
		this.handlePageType();
		this.getLoc();
		this.getConfigData();
		this.init();
	},

	computed: {
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
		},

		cardList() {
			return this.$store.state.cardList;
		}
	},

	methods: {
		/** 根据页面类型处理页面数据 */
		handlePageType() {
			let title = '医院列表';
			let illnessType = '';
			let illnessTypeName = '';
			switch (this.fromPage) {
				case 'yygh':
					title = '医院列表';
					break;
				case 'lydh':
					title = '来院导航';
					break;
				case 'xzyy':
					title = '选择医院';
					break;
				case 'gxygh':
					title = '高血压挂号';
					illnessType = 1;
					illnessTypeName = '高血压';
					break;
				case 'gxtgh':
					title = '高血糖挂号';
					illnessType = 2;
					illnessTypeName = '糖尿病';
					break;
				case 'gxbgh':
					title = '冠心病挂号';
					illnessType = 3;
					illnessTypeName = '冠心病';
					break;
				case 'mzfgh':
					title = '慢阻肺挂号';
					illnessType = 4;
					illnessTypeName = '慢阻肺';
					break;
			}
			uni.setNavigationBarTitle({ title });
			this.opt.illnessType = illnessType;
			this.illnessTypeName = illnessTypeName;
		},

		/** 检查是否绑定电子健康卡,并做未绑卡提示 */
		checkBindCard() {
			if (this.cardList.length === 0) {
				uni.showModal({
					title: '提示',
					content: '请先绑定电子健康卡再进行相应操作！',
					success: res => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pagesA/card/list'
							});
						}
					}
				});
				return false;
			}
			return true;
		},

		/**
		 * 初始化导医导诊项目
		 * @param url 前端url
		 * @param secKey 密钥
		 * @param channel 渠道
		 * @param entrance 入口  001:菜单栏   002:功能模块
		 * @param terminaltag 终端标识  wechat-officialacc:微信公众号 wechat-minipro:微信小程序  app:App  alipay:支付宝  web:WEB
		 * @param userid  患者id
		 * @param sex 性别  男 or 女
		 * @param age 年龄
		 * @param extend 当有额外的参数需要传输时，使用这个字段，格式为JSON ，eg: {"token":"1212"}
		 */
		init() {
			this.cardList.forEach(item => {
				if (item.defaultFlg === 1) {
					iFlyGuide.init({
						url: 'https://zlwyl.iflyhealth.com',
						// https://zlwyl.iflyhealth.com
						// https://devmir.iflytek.com/robotMobile
						secKey: 'cd25f4ed9ecaf8eeb9c75a83c307cb50',
						channel: 'jkbd214',
						entrance: '001',
						terminaltag: 'wechat-minipro',
						userid: item.id + '',
						sex: item.sex == 1 ? '男' : '女',
						age: item.age
					});
				}
			});
		},

		navToGuide() {
			//智能导诊暂时隐藏
			if (!this.checkBindCard()) {
				return;
			}
			// #ifdef MP-WEIXIN
			const encodeURIComponentStr = encodeURIComponent(iFlyGuide.jumptoGuide());
			uni.navigateTo({
				url: `../../pagesA/webview/webview?encodeURIComponentStr=${encodeURIComponentStr}&title=zndz`
			});
			// #endif
		},

		navToRecordList() {
			if (!this.checkBindCard()) {
				return;
			}
			uni.navigateTo({
				url: './recordList'
			});
		},

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
			let { data: hosOptions } = await getDictList('HOSP_LEVEL');
			let { data: areaOptions } = await getRegionListv1('130600000000');
			hosOptions = hosOptions.map((value, index) => {
				return {
					...value,
					label: value.text
				};
			});
			areaOptions = areaOptions.map((value, index) => {
				return {
					...value,
					label: value.name,
					value: value.code
				};
			});
			this.hosOptions = [...this.hosOptions, ...hosOptions];
			this.districtOptions = [...this.districtOptions, ...areaOptions];
		},

		/**
		 * 筛选框点击事件
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
		async getHosList(page) {
			this.loading = true;
			this.hosList = [];
			let { data } = await getHosList(this.opt);
			this.hosList = data;
			this.loading = false;
		},

		/** 搜索医院 */
		onSearch() {
			this.getHosList();
		},

		/** 导航 */
		goLocation(item) {
			if (item.childHospital && item.childHospital.length) {
				this.show = true;
				this.childList = item.childHospital;
			} else {
				this.close();
				uni.openLocation({
					latitude: item.lat,
					longitude: item.lng,
					name: item.name
				});
			}
		},
		showHosIntroduce(item) {
			this.clickedItem = item;
			this.showIntroduce = true;
		},
		close() {
			this.show = false;
			this.showIntroduce = false;
		},
		/**
		 * 医院点击
		 * @param {Object} item 医院Item
		 */
		async onHosClick(item) {
			const { data } = await setDefaultHos(item.id);
			switch (this.fromPage) {
				case 'lydh':
					this.goLocation(item);
					break;

				case 'xzyy':
					this.$store.commit('setSelHos', { hospital: item });
					uni.navigateBack();
					break;

				default:
					if (item.name.includes('保定市第一中医院')) {
						uni.navigateToMiniProgram({
							appId: 'wx0c7701d052bf4be2',
							path: '/pages/index/main/index'
						});
						return;
					}

					// if (item.name.includes('保定市妇幼保健院')) {
					// 	const encodeURIComponentStr = encodeURIComponent(
					// 		`https://wxs.daxiang91.com/personalCenter/getHosp?app_id=wxdd69b85bfdad0bbc`
					// 	);
					// 	uni.navigateTo({
					// 		url: `/pagesA/webview/webview?encodeURIComponentStr=${encodeURIComponentStr}`
					// 	});
					// 	return;
					// }

					if (item.state === '2') {
						uni.showModal({
							title: '温馨提示',
							content: item.warmPrompt,
							showCancel: false
						});
						return;
					}

					const hasChild = item.childHospital && item.childHospital.length ? 1 : 0;
					uni.navigateTo({
						url: `./deptList?hospitalId=${item.id}&hasChild=${hasChild}`
					});
					break;
			}
		},
		call(phoneNum){
			uni.makePhoneCall({
				phoneNumber: phoneNum
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background: $uni-f9f9f9;

	.search-box {
		padding: 20rpx;
		background-color: #4298ff;
	}

	.nav-box {
		.nav-item {
			width: 320rpx;
			height: 158rpx;
			border-radius: 20rpx;
			box-shadow: 0rpx 2rpx 8rpx #4298ff66;
			position: relative;

			image {
				position: absolute;
				right: -20rpx;
				bottom: -20rpx;
			}
		}

		.item-1 {
			background: #53a1ff;

			image {
				width: 133rpx;
				height: 131rpx;
			}
		}

		.item-2 {
			background: #00c8a0;

			image {
				width: 160rpx;
				height: 142rpx;
			}
		}
	}

	.dropdown-box {
		background-color: #fff;
	}

	.list-box {
		padding-bottom: 20rpx;

		.item {
			background: $uni-ffffff;
			padding: 20rpx 20rpx 0 20rpx;
			border-radius: 10px;

			.hos-info {
				display: flex;
				padding-bottom: 10rpx;
				align-items: center;

				.left {
					.icon {
						width: 160rpx;
						height: 160rpx;
						border-radius: 10px;
					}
				}

				.right {
					flex: 1;
					margin: 0 20rpx;
					font-family: PingFang SC;
					display: flex;
					flex-direction: column;
					justify-content: space-around;

					.name {
						color: #000000;
						font-size: 30rpx;
						margin-bottom: 20rpx;
					}

					.level-type-name {
						font-size: 24rpx;
						margin: 6rpx 0;

						.levelName {
							padding: 0 8rpx;
							border-radius: 6rpx;
							color: $uni-e74948;
							text-align: center;
						}

						.typeNames {
							margin-left: 6rpx;
						}

						.nucleicAcidTestFlg {
							padding: 4rpx 8rpx;
							margin-left: 20rpx;
							border-radius: 6rpx;
							color: $uni-ffffff;
							text-align: center;
							background-color: $uni-56c01e;
						}
					}

					.tip-box {
						font-size: 22rpx;
						display: flex;
						flex-wrap: wrap;
						justify-content: space-between;

						.tip-items {
							width: 30%;
							border-radius: 6rpx;
							text-align: center;
							background-color: #e6f1ff;
						}
					}
					.tip-introduce {
						color: #f59a23;
					}
				}
			}

			.dept-info {
				border-top: 2rpx solid #e5e7ebaa;
				display: flex;
				align-items: center;
				height: 80rpx;

				.dept-name,
				.no-dept {
					flex: 1;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					color: #0f1419;
					font-size: 26rpx;
				}

				.no-dept {
					color: #999;
				}
			}
		}
	}
	.intro-box {
		height: 65vh;
		overflow-y: scroll;
		.intro-tel{
			text-decoration: underline;
			color: #4298ff;
		}
	}
}
</style>
