<template>
	<view>
		<view class="header">
			<view class="content">
				<view :class="[{ active: tabIndex == 0 }, 'left', 'common']" @click="tabChange(0)">找疾病圈子</view>
				<view :class="[{ active: tabIndex == 1 }, 'left', 'common']" @click="tabChange(1)">找患友</view>
			</view>
		</view>
		<block v-if="list && list.length > 0">
			<view class="matter" v-if="tabIndex == 0">
				<view class="title">
					<view class="left"></view>
					<view class="right">热门圈子</view>
				</view>
				<view class="demo" v-for="item in list" :key="item.id">
					<view class="circle">
						<view class="photo"><image :src="serverUrl + item.img" /></view>
						<view class="information">
							<view class="lable">{{ item.tagName || '' }}</view>
							<view class="row">
								<view class="lable">
									话题：
									<span>{{ item.articleNum !== '' ? item.articleNum : '' }}</span>
								</view>
								<view class="lable">
									患友：
									<span>{{ item.patientNum !== '' ? item.patientNum : '' }}</span>
								</view>
							</view>
							<view class="lable">
								所属科室：
								<span style="color:#666;">{{ item.deptName || '' }}</span>
							</view>
						</view>
					</view>
					<view class="detail">{{ item.intro || '' }}</view>
					<button class="join" type="default" @click="join(item.id)">进入圈子</button>
				</view>
			</view>
			<view class="friends" v-if="tabIndex == 1">
				<view class="friend" v-for="item in list" :key="item.id">
					<view class="circle">
						<view class="photo">
							<image v-if="item.avatar" :src="item.avatar" mode="aspectFill" />
							<image v-else src="../static/ic_man.png" mode="aspectFill" />
						</view>
						<view class="information">
							<view class="lable name">
								{{ item.name }}
								<!-- <text>{{ item.sex == 1 ? '男' : '女' }}</text>
								<image v-if="item.sex == 1" src="../static/ic_man.png" />
								<image v-if="item.sex == 2" src="../static/ic_woman.png" /> -->
							</view>
							<view class="row txcz_center">
								<view class="lable">加入圈子：</view>
								<template v-if="item.groupType">
									<view class="tab" v-for="(tag, index) in item.groupType.split(',')" :key="index">{{ tag }}</view>
								</template>
							</view>
						</view>
					</view>
					<view class="news">
						<view class="ta">Ta参与的最新话题</view>
						<view v-if="item.articleId" @click="goArticle(item.articleId, item.tags)" class="new tx_scenter">
							<view class="left">{{ item.articleName || '' }}</view>
							<view class="right tx_center">
								<u-icon color="#D2D2D2" name="chat" size="30rpx" />
								<text style="margin-left: 6rpx;">{{ item.articleCount || 0 }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="pages tx_scenter">
				<button class="tx_center" :disabled="first" @click="changePage('first')" type="default">首页</button>
				<button class="tx_center" :disabled="up" @click="changePage('up')" type="default">上一页</button>
				<button class="tx_center" :disabled="next" @click="changePage('next')" type="default">下一页</button>
				<button class="tx_center" :disabled="last" @click="changePage('last')" type="default">尾页</button>
				<view class="total">第{{ currPage }}/{{ totalPage }}页</view>
			</view>
		</block>
		<view style="padding-top: 72rpx;" v-else><load-data background="#f9f9f9" :loading="loading" /></view>
	</view>
</template>

<script>
import { getPatientGroupList, getPatientList } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: false,
			tabIndex: 0,
			opt: {
				pageNum: 1,
				pageSize: 10
			},
			list: [],
			currPage: 0,
			totalPage: 0,
			first: false,
			up: false,
			next: false,
			last: false,
			examineType: null
		};
	},
	onShow() {
		if (this.tabIndex == 1) {
			this.getPatientList();
		} else {
			this.getPatientGroupList();
		}
	},
	onLoad(options) {
		this.tabIndex = options.tabIndex || 0;
		if (this.tabIndex == 1) {
			this.getPatientList();
		} else {
			this.getPatientGroupList();
		}
	},

	methods: {
		goArticle(id, title) {
			uni.navigateTo({
				url: './circleDetail?id=' + id + '&title=' + (title || '圈子详情')
			});
		},
		changePage(str) {
			if (str == 'first') {
				this.opt.pageNum = 1;
			}
			if (str == 'up') {
				this.opt.pageNum = this.opt.pageNum - 1;
			}
			if (str == 'next') {
				this.opt.pageNum = this.opt.pageNum + 1;
			}
			if (str == 'last') {
				this.opt.pageNum = this.totalPage;
			}
			if (this.tabIndex == 1) {
				this.getPatientList();
			} else {
				this.getPatientGroupList();
			}
		},
		async getPatientGroupList() {
			this.loading = true;
			this.list = [];
			console.log(this.opt);
			var res = await getPatientGroupList(this.opt);
			console.log('res===', res);
			this.list = res.data.list;
			this.loading = false;
			this.currPage = res.data.currPage;
			this.totalPage = res.data.totalPage;
			if (this.currPage >= this.totalPage) {
				this.next = true;
			} else {
				this.next = false;
			}
			if (this.currPage <= 1) {
				this.up = true;
			} else {
				this.up = false;
			}
		},
		async getPatientList() {
			this.loading = true;
			this.list = [];
			var res = await getPatientList(this.opt);
			console.log('res===', res);
			this.list = res.data.list;
			this.loading = false;
			this.currPage = res.data.currPage;
			this.totalPage = res.data.totalPage;
			if (this.currPage >= this.totalPage) {
				this.next = true;
			} else {
				this.next = false;
			}
			if (this.currPage <= 1) {
				this.up = true;
			} else {
				this.up = false;
			}
		},
		tabChange(index) {
			this.tabIndex = index;
			this.opt.pageNum = 1;
			this.opt.pageSize = 10;
			if (index == 1) {
				this.getPatientList();
			} else {
				this.getPatientGroupList();
			}
		},
		join(groupId) {
			uni.navigateTo({
				url: './join?groupId=' + groupId
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f2f5f9;

	.header {
		background: #4298ff;
		padding-bottom: 15rpx;
		height: 72rpx;
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;

		.content {
			margin: 0 auto;
			display: flex;
			width: 396rpx;
			height: 67rpx;
			background: #85a8ff;
			border-radius: 30px;
			overflow: hidden;

			.active {
				font-size: 30rpx;
				font-family: Source Han Sans CN;
				font-weight: 400;
				background: #3066ed;
			}

			.common {
				width: 198rpx;
				height: 67rpx;
				text-align: center;
				line-height: 67rpx;
				color: #fefefe;
				font-size: 30rpx;
			}
		}
	}

	.matter {
		padding-top: 98rpx;
		padding-left: 36rpx;
		padding-right: 36rpx;

		.title {
			display: flex;

			.left {
				width: 9rpx;
				height: 42rpx;
				background: #258eff;
				border-radius: 5rpx;
				margin-right: 21rpx;
			}

			.right {
				font-size: 34rpx;
				font-family: Source Han Sans CN;
				font-weight: bold;
				color: #333333;
				line-height: 42rpx;
			}
		}

		.demo {
			padding: 0 17rpx 32rpx 17rpx;
			margin: 25rpx auto;
			background: #ffffff;
			box-shadow: 0rpx 3rpx 13rpx 0rpx rgba(69, 157, 247, 0.19);
			border-radius: 20rpx;

			.circle {
				display: flex;
				padding-top: 27rpx;
				border-bottom: 1rpx solid #d5d5d5;
				padding-bottom: 30rpx;

				.photo {
					width: 144rpx;
					height: 144rpx;
					border-radius: 50%;
					border: 1px solid #5483f9;
					overflow: hidden;

					image {
						width: 100%;
						height: 100%;
					}
				}

				.information {
					margin-left: 37rpx;

					.lable {
						font-size: 34rpx;
						font-family: Source Han Sans CN;
						font-weight: 400;
						color: #333333;
						line-height: 1.5;
					}

					.row {
						display: flex;

						.lable {
							width: 170rpx;
						}

						span {
							color: #ff8400;
						}
					}
				}
			}

			.detail {
				max-width: 585rpx;
				display: -webkit-box;
				line-height: 1.5;
				overflow: hidden;
				word-break: break-all;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2; //多行请改这里，2表示最多2行，然后超出自显示省略号
				font-size: 28rpx;
				font-family: Source Han Sans CN;
				font-weight: 400;
				color: #999999;
				margin-top: 14rpx;
				margin-bottom: 35rpx;
			}

			.join {
				width: 533rpx;
				height: 71rpx;
				background: #5483f9;
				border-radius: 14rpx;
				margin: 0 auto;
				font-size: 30rpx;
				font-family: Source Han Sans CN;
				font-weight: 400;
				color: #ffffff;
				line-height: 71rpx;
				text-align: center;
				border: none;
			}
		}
	}

	.friends {
		padding-top: 98rpx;
		padding-left: 36rpx;
		padding-right: 36rpx;

		.friend {
			padding: 0 18rpx 21rpx 18rpx;
			margin: 21rpx auto;
			background: #ffffff;
			box-shadow: 0rpx 3rpx 13rpx 0rpx rgba(69, 157, 247, 0.19);
			border-radius: 20rpx;

			.circle {
				display: flex;
				border-bottom: 1rpx solid #d5d5d5;
				padding-top: 24rpx;
				padding-bottom: 30rpx;

				.photo {
					width: 108rpx;
					height: 108rpx;
					border-radius: 50%;
					border: 1px solid #5483f9;
					overflow: hidden;

					image {
						width: 100%;
						height: 100%;
					}
				}

				.information {
					margin-left: 25rpx;

					.lable {
						font-size: 34rpx;
						font-family: Source Han Sans CN;
						font-weight: 400;
						color: #333333;
						line-height: 1.5;
					}

					.name {
						display: flex;
						align-items: center;

						span {
							font-size: 30rpx;
							font-weight: 400;
							color: #666666;
							margin-left: 41rpx;
						}

						image {
							margin-left: 6rpx;
							width: 22rpx;
							height: 23rpx;
						}
					}

					.row {
						.lable {
							color: #666666;
						}

						.tab {
							padding: 8rpx 12rpx;
							border: 2rpx solid #5483f9;
							border-radius: 10px;
							line-height: 1;
							font-size: 21rpx;
							font-family: Source Han Sans CN;
							font-weight: 400;
							color: #5483f9;
							margin-right: 8rpx;
						}
					}
				}
			}

			.news {
				.ta {
					font-size: 28rpx;
					font-family: Source Han Sans CN;
					font-weight: 400;
					color: #333333;
					line-height: 40px;
					margin-top: 11rpx;
					margin-bottom: 14rpx;
				}

				.new {
					.left {
						font-size: 28rpx;
						font-family: Source Han Sans CN;
						font-weight: 400;
						color: #333333;
					}

					.right {
						font-size: 26rpx;
						font-family: Source Han Sans CN;
						font-weight: 400;
						color: #d2d2d2;
					}
				}
			}
		}
	}

	button::after {
		border: none;
	}

	.pages {
		padding: 36rpx;
		button {
			height: 50rpx;
			background: #5483f9;
			border-radius: 25rpx;
			font-size: 25rpx;
			color: #ffffff;
			line-height: 1;
			margin: 0;
		}

		button:nth-child(2),
		button:nth-child(3) {
			background: #f7f7f7;
			border: 1rpx solid #d0d0d0;
			color: #666666;
		}

		.total {
			font-size: 27rpx;
			color: #666666;
		}
	}
}
</style>
