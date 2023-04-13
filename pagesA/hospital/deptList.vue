<template>
	<view class="page">
		<!-- 搜索 -->
		<view class="search-box plr-10 ptb-10 border-box">
			<u-search placeholder="输入医生/科室查询" placeholder-color="#8B8B8B" bg-color="#ffffff" v-model="name"
				margin="0 20rpx 0 20rpx" :input-style="{ 'font-size': '24rpx' }" :showAction="false" @change="onSearch"
				@clear="onSearch" />
		</view>
		<view class="tab-box plr-10"><u-tabs :list="childHosItem" @click="tabClick"></u-tabs></view>
		<!-- 科室列表 -->
		<view class="list-box">
			<load-data v-if="dataList && !dataList.length" :loading="loading" />
			<template v-else>
				<view class="list">
					<view class="list-left">
						<view class="list-cell" v-for="(item, index) in dataList" :key="random(item.id)"
							:class="activeIndex == index ? 'active' : ''" @click="activeIndex = index">
							<view class="flex-box align-center">
								<u-icon name="play-right-fill" color="#4298FF" size="10"
									v-if="activeIndex == index"></u-icon>
								<text>{{ item.name }}</text>
							</view>
						</view>
					</view>
					<view class="list-right">
						<u-cell-group :border="false">
							<u-cell v-for="item in childList" :key="item.id" :title="item.name" :border="false"
								@click="chooseList(item)" />
						</u-cell-group>
					</view>
				</view>
			</template>
		</view>
	</view>
</template>

<script>
	import { getDeptListById } from '@/common/http/api.js';
	export default {
		data() {
			return {
				loading: true,
				childHosItem: [],
				dataList: [],
				activeIndex: 0,
				name: '',
				clinicNoticeShow: false,
				specialClinicNoticeShow: false,
				todayReserveNoticeShow: false,
				hosMsg: {},
				hosId: ''
			};
		},

		computed: {
			childList() {
				if (this.dataList.length > 0) {
					return this.dataList[this.activeIndex].children;
				}
			}
		},
		onLoad(options) {
			//小程序码进入
			if (options.scene) {
				let formUrl = decodeURIComponent(options.scene);
				if (!uni.getStorageSync('token')) {
					// 去授权
					uni.redirectTo({ url: `/pagesA/auth/auth?fromPage=deptList&${formUrl}` });
					return;
				}else{
					this.hosId = this.getUrlParams(formUrl, 'hospitalId')
					this.hasChild = this.getUrlParams(formUrl, 'hasChild')
					this.getDeptListById();
				}
			}else{
				const { hospitalId, hasChild } = options;
				this.hosId = hospitalId;
				this.hasChild = hasChild;
				this.getDeptListById();
			}
		},
		methods: {
			/** 解析Url中的参数
			 * @param {Object} url url
			 * @param {Object} query 参数名
			 */
			getUrlParams(url, query) {
				// str为?之后的参数部分字符串
				const str = url.substr(url.indexOf('?') + 1);
				// arr每个元素都是完整的参数键值
				const arr = str.split('&');
				// result为存储参数键值的集合
				const result = {};
				for (let i = 0; i < arr.length; i++) {
					// item的两个元素分别为参数名和参数值
					const item = arr[i].split('=');
					result[item[0]] = item[1];
				}
				return result[query];
			},
			async getDeptListById(name) {
				this.dataList = [];
				this.loading = true;
				let opts = {
					hospitalId: this.hosId,
					name: name ? name : ''
				};
				let { data } = await getDeptListById(opts);
				if (this.hasChild == 1) {
					this.childHosItem = data;
					this.dataList = data[0].departmentList;
				} else {
					this.dataList = data;
				}
				this.activeIndex = 0;
				this.loading = false;
			},
			chooseList(item) {
				uni.navigateTo({
					url: `./doctorList?hospitalId=${this.hosId}&deptId=${item.id}`
				});
			},
			onSearch() {
				this.getDeptListById(this.name);
			},
			tabClick(item) {
				this.activeIndex = 0;
				this.dataList = item.departmentList;
			},

			random(id) {
				return id + uni.$u.random(1, 100000);
			}
		}
	};
</script>

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;

		.header-box {
			display: flex;
			flex-direction: column;
			align-items: center;
			background-color: $uni-color-primary;

			.top-btn {
				width: 100%;
				display: flex;
				justify-content: space-between;
				color: white;
				font-size: 26rpx;
				height: 70rpx;

				text {
					padding: 20rpx 40rpx;
				}
			}
		}

		.search-box {
			width: 100%;
			background: #f6f7f7;
		}

		.tab-box {
			background: #f6f7f7;
		}

		.list-box {
			flex: 1;
			overflow: hidden;

			.list {
				height: 100%;
				display: flex;
				overflow: hidden;

				.list-left {
					flex: 1;
					height: 100%;
					overflow-y: scroll;

					.list-cell {
						border-bottom: 1px solid #e2e2e280;
						padding: 10px 15px;
						font-size: 24rpx;
						line-height: 22px;
						box-sizing: border-box;
						background: #f6f7f7;
						color: #999999;
					}

					.active {
						background-color: white;
						font-weight: bold;
						color: #0f1419;
					}
				}

				.list-right {
					flex: 2;
					height: 100%;
					overflow-y: scroll;
				}
			}

			.list /deep/ .u-cell__title-text {
				font-size: 24rpx;
			}

			.intro {
				display: inline-block;
				color: #4798ee;
				font-size: 12px;
				padding: 5rpx 15rpx;
			}
		}

		.notice-text {
			width: 100%;
			max-height: 70vh;
			overflow: scroll;
			font-size: 26rpx;
		}
	}
</style>
