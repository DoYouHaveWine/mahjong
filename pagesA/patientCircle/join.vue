<template>
	<view>
		<u-notify ref="uNotify" />

		<view class="matter">
			<view class="demo">
				<view v-if="examineType != 2" @click="addGroup" class="add">+加入圈子</view>
				<view v-else @click="delGroup" class="add">退出圈子</view>
				<view class="circle">
					<view class="photo"><image :src="serverUrl + group.img" mode="aspectFill"></image></view>
					<view class="information">
						<view class="lable">{{ group.tagName }}</view>
						<view class="row">
							<view class="lable">
								话题：
								<text>{{ group.articleNum !== '' ? group.articleNum : '' }}</text>
							</view>
							<view class="lable">
								患友：
								<text>{{ group.patientNum !== '' ? group.patientNum : '' }}</text>
							</view>
						</view>
						<view class="lable">
							所属科室：
							<text style="color:#666 ;">{{ group.deptName || '' }}</text>
						</view>
					</view>
				</view>
				<view class="detail">{{ group.intro || '' }}</view>
				<button @click="publish" class="join" type="default">发表话题</button>
			</view>
			<view class="topic">
				<view class="topic_header tx_scenter">
					<view class="hot">热门话题</view>
					<easy-select size="mini" ref="easySelect" :value="selecValue" @selectOne="selectOne"></easy-select>
				</view>
				<view @click="goArticle(item.id)" class="topic_demo" v-for="item in articles" :key="item.id">
					<view class="top">{{ item.title }}</view>
					<view class="bottom">{{ item.content }}</view>
				</view>
			</view>
			<view class="pages tx_scenter">
				<button class="tx_center" :disabled="first" @click="changePage('first')" type="default">首页</button>
				<button class="tx_center" :disabled="up" @click="changePage('up')" type="default">上一页</button>
				<button class="tx_center" :disabled="next" @click="changePage('next')" type="default">下一页</button>
				<button class="tx_center" :disabled="last" @click="changePage('last')" type="default">尾页</button>
				<view class="total">第{{ currPage }}/{{ totalPage }}页</view>
			</view>
		</view>
	</view>
</template>

<script>
import { serverUrl } from '@/common/http/baseRequest.js';
import easySelect from './components/easy-select.vue';
import {
	getPatientGroupDoctor,
	getPatientGroupMemberBindPatient,
	getPatientGroupArticleList,
	getPatientGroupMemberIsBind,
	getMemberDetails,
	getPatientGroupMemberPatientNoBind
} from '@/common/http/api.js';
export default {
	components: {
		easySelect
	},
	data() {
		return {
			selecValue: '按热度',
			groupId: '',
			group: {},
			sysUser: uni.getStorageSync('sysUser'),
			opt: {
				groupId: '',
				pageNum: 1,
				pageSize: 10,
				queryType: '1'
			},
			articles: [],
			currPage: 0,
			totalPage: 0,
			first: false,
			up: false,
			next: false,
			last: false,
			examineType: null,
			relation: null,
			serverUrl
		};
	},
	onLoad(options) {
		this.groupId = options.groupId;
		this.opt.groupId = options.groupId;
		uni.startPullDownRefresh();
	},
	onPullDownRefresh() {
		this.queryBind();
		this.getPatientGroupDoctor();
		this.getPatientGroupArticleList();
	},
	onShow() {
		this.getPatientGroupDoctor();
		this.getPatientGroupArticleList();
		this.queryBind();
		this.getMember();
	},

	methods: {
		publish() {
			if (!this.examineType) {
				this.$refs.uNotify.show({
					message: '未加入病友圈',
					type: 'error',
					duration: '2000'
				});
				return;
			}
			if (this.examineType == 1 || this.examineType == 3) {
				this.$refs.uNotify.show({
					message:
						this.examineType == 1 ? '您的加入圈子申请已发送，审核通过成功加入圈子后，可以在圈子里查看话题。' : '入圈审核未通过',
					type: 'error',
					duration: '2000'
				});
				return;
			}
			if (this.examineType == 2) {
				uni.navigateTo({
					url: './publishArticle?groupId=' + this.group.id + '&type=' + this.examineType
				});
			} else {
				this.$refs.uNotify.show({
					message: '异常情况，请联系管理员',
					type: 'error',
					duration: '2000'
				});
			}
		},
		// 退出圈子
		async delGroup() {
			var opt = {
				groupId: this.groupId,
				memberId: this.sysUser.id
			};
			var res = await getPatientGroupMemberPatientNoBind(opt);
			console.log('退出圈子======', res);
			if (res.code == 200) {
				this.$refs.uNotify.show({
					message: '退出成功',
					type: 'success',
					duration: '2000'
				});
				this.queryBind();
				this.getPatientGroupDoctor();
			} else {
				this.$refs.uNotify.show({
					message: res.message,
					type: 'error',
					duration: '2000'
				});
			}
		},
		//是否绑定本人健康卡
		async getMember() {
			var res = await getMemberDetails(this.sysUser.id);
			this.relation = res.data.selfRecordId;
		},
		goArticle(id) {
			if (!this.examineType) {
				this.$refs.uNotify.show({
					message: '未加入病友圈',
					type: 'error',
					duration: '2000'
				});
			}
			if (this.examineType == 1) {
				this.$refs.uNotify.show({
					message: '您的加入圈子申请已发送，审核通过成功加入圈子后，可以在圈子里查看话题。',
					type: 'error',
					duration: '2000'
				});
			}
			if (this.examineType == 2 && id) {
				this.toPage('./circleDetail?id=' + id + '&title=' + (this.group.tagName || ''));
			}
			if (this.examineType == 3) {
				this.$refs.uNotify.show({
					message: '入圈审核未通过',
					type: 'error',
					duration: '2000'
				});
			}
		},
		toPage(url) {
			uni.navigateTo({
				url
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
			this.getPatientGroupArticleList();
		},
		// 是否加入圈子
		async queryBind(showMessage = false) {
			var opt = {
				groupId: this.groupId,
				memberId: this.sysUser.id
			};
			var res = await getPatientGroupMemberIsBind(opt);

			// examineType
			// 审核状态 1 审核中 2 审核通过 3 拒绝
			if (res.code == 200) {
				this.examineType = res.data.examineType;
				if (showMessage) {
					if (this.examineType == 1 || this.examineType == 3) {
						this.$refs.uNotify.show({
							message:
								this.examineType == 1
									? '您的加入圈子申请已发送，审核通过成功加入圈子后，可以在圈子里查看话题。'
									: '入圈审核未通过',
							type: 'error',
							duration: '2000'
						});
						return;
					}
				}
			}
		},
		async addGroup() {
			if (this.examineType == 1) {
				this.$refs.uNotify.show({
					message: '您的加入圈子申请已发送，审核通过成功加入圈子后，可以在圈子里发表话题。',
					type: 'success',
					duration: '2000'
				});
				return;
			}
			if (this.examineType == 3 || !this.examineType) {
				var opt = {
					groupId: this.groupId,
					memberId: this.sysUser.id
				};
				var res = await getPatientGroupMemberBindPatient(opt);
				if (res.code == 200) {
					this.queryBind(true);
					this.getPatientGroupDoctor();
				}
			}
		},
		async getPatientGroupArticleList() {
			var res = await getPatientGroupArticleList(this.opt);
			this.articles = res.data.list;
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
			uni.stopPullDownRefresh();
		},
		async getPatientGroupDoctor() {
			var res = await getPatientGroupDoctor(this.groupId);
			console.log('res======', res);
			this.group = res.data;
			uni.setNavigationBarTitle({
				title: this.group.tagName || ''
			});
		},
		selectOne(options) {
			this.opt.queryType = options.groupId;
			this.opt.pageNum = 1;
			this.selecValue = options.label;
			this.getPatientGroupArticleList();
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f2f5f9;

	.matter {
		// padding-top: 21rpx;
		padding-left: 36rpx;
		padding-right: 36rpx;

		.demo {
			position: relative;
			padding: 0 17rpx 32rpx 17rpx;
			margin: 25rpx auto;
			background: #ffffff;
			box-shadow: 0rpx 3rpx 13rpx 0rpx rgba(69, 157, 247, 0.19);
			border-radius: 20rpx;

			.add {
				width: 151rpx;
				height: 56rpx;
				background: #459df7;
				border-radius: 10rpx;
				font-size: 28rpx;
				font-family: Source Han Sans CN;
				font-weight: 400;
				color: #ffffff;
				line-height: 56rpx;
				text-align: center;
				position: absolute;
				right: 28rpx;
				top: 15rpx;
			}

			.circle {
				display: flex;
				padding-top: 27rpx;
				border-bottom: 1px solid #d5d5d5;
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

						text {
							color: #ff8400;
						}
					}
				}
			}

			.detail {
				line-height: 1.5;
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

		.topic {
			padding: 0 17rpx 0 17rpx;
			margin: 0 auto;
			background: #ffffff;
			box-shadow: 0rpx 3rpx 13rpx 0rpx rgba(69, 157, 247, 0.19);
			border-radius: 20rpx;

			.topic_header {
				padding-top: 28rpx;
				padding-bottom: 18rpx;

				.hot {
					font-size: 32rpx;
					font-family: Source Han Sans CN;
					font-weight: 400;
					color: #5483f9;
					line-height: 1;
				}

				/deep/.easy-select {
					width: 200rpx !important;
				}

				/deep/.easy-select-options {
					width: 204rpx !important;
				}
			}

			.topic_demo {
				padding-top: 8rpx;
				padding-bottom: 10rpx;
				border-top: 1px solid #d5d5d5;

				.top {
					font-size: 28rpx;
					font-family: Source Han Sans CN;
					font-weight: 400;
					color: #333333;
					line-height: 40rpx;
				}

				.bottom {
					max-width: 595rpx;
					display: -webkit-box;
					line-height: 34rpx;
					overflow: hidden;
					word-break: break-all;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2; //多行请改这里，2表示最多2行，然后超出自显示省略号
					font-size: 26rpx;
					font-family: Source Han Sans CN;
					font-weight: 400;
					color: #999999;
				}
			}
		}
	}

	button::after {
		border: none;
	}

	.pages {
		margin-top: 20rpx;
		margin-bottom: 20rpx;
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

	// 垂直水平居中
	.tx_center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.tx_scenter {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
	}
}
</style>
