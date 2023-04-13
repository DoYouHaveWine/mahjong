<template>
	<view>
		<view class="top">
			<template v-if="msgCount && !isEdit">
				<text class="all-read" @click="remarkAllMsgRead">全部标记已读</text>
				<text class="s-line">|</text>
			</template>
			<text v-if="list.length" class="edit-text" @click="onEdit">{{ isEdit ? '完成' : '编辑' }}</text>
		</view>

		<view :class="['list', { 'pd-110': isEdit }]" v-if="list.length">
			<u-swipe-action ref="swipeAction">
				<u-swipe-action-item
					:disabled="isEdit"
					@click="delOneItem(item)"
					:options="options"
					v-for="(item, index) in list"
					:key="item.id"
				>
					<view class="item" @click="navToDetails(item)">
						<view class="icon">
							<image style="width: 100%;height: 100%;" :src="item.bizType | bizTypeIcon" />
							<view class="point" v-if="!item.isRead" />
						</view>
						<view class="text-box">
							<text>{{ item.title || 'sfsdfsfsadfad' }}</text>
							<text class="content">{{ item.content || '' }}</text>
							<text class="createTime">{{ item.createTime || '' }}</text>
						</view>
						<view class="del-box" v-if="isEdit">
							<checked :checked="chooseArr.indexOf(item.id) !== -1" />
						</view>
					</view>
				</u-swipe-action-item>
			</u-swipe-action>
		</view>

		<load-data v-else :loading="loading" />

		<view class="fix-btn-bottom" v-if="isEdit">
			<checked :label="checkedLabel" @onChecked="onCheckedAll" :checked="checkedAll" />
			<view class="btn-box"><u-button text="删除" @click="delModel = true" shape="circle" type="error" /></view>
		</view>

		<u-modal
			:show="delModel"
			title="提示"
			@confirm="delFunc"
			@cancel="delModel = false"
			content="是否删除选中的消息"
			:showCancelButton="true"
		/>

		<u-notify ref="uNotify" />
	</view>
</template>

<script>
import { getMsgList, remarkMsgRead, remarkAllMsgRead, delMsg } from '@/common/http/api.js';
import checked from '@/pagesA/components/checked.vue';
export default {
	components: {
		checked
	},

	data() {
		return {
			list: [],
			loading: true,
			isEdit: false,
			delModel: false,
			chooseArr: [],
			options: [
				{
					icon: 'trash',
					text: '',
					style: {
						color: '#FF5656',
						fontSize: '48rpx',
						backgroundColor: 'rgba(255, 98, 98, 0.1)'
					}
				}
			],
			checkedAll: false,
			checkedLabel: '全选'
		};
	},

	filters: {
		/**
		 * 根据消息类型获取默认图标
		 * @param {Object} bizType
		 */
		bizTypeIcon(bizType) {
			const bizTypeMap = {
				1: '/pagesA/static/message/ic_yygh.svg',
				8: '/pagesA/static/message/ic_yytx.svg',
				2: '/pagesA/static/message/ic_zxjf.svg',
				3: '/pagesA/static/message/ic_hzcx.svg',
				4: '/pagesA/static/message/ic_bgcx.svg',
				5: '/pagesA/static/message/ic_zyxx.svg',
				6: '/pagesA/static/message/ic_tjxx.svg',
				7: '/pagesA/static/message/ic_jkxj.svg',
				10:'/pagesA/static/message/ic_zyxx.svg',
				99: '/pagesA/static/message/ic_qt.svg'
			};
			return bizTypeMap[bizType];
		}
	},

	computed: {
		msgCount() {
			return this.list ? this.list.reduce((n, c) => (!c.isRead ? ++n : n), 0) : this.list;
		}
	},

	watch: {
		chooseArr(newVal) {
			if (newVal.length == this.list.length) {
				this.checkedAll = true;
				this.checkedLabel = '取消全选';
			} else {
				this.checkedAll = false;
				this.checkedLabel = '全选';
			}
		}
	},

	onShow() {
		this.getMsgList();
	},

	methods: {
		/** 获取消息列表 */
		async getMsgList() {
			this.loading = true;
			const { data } = await getMsgList();
			this.list = data || [];
			this.loading = false;
		},

		/**
		 * 跳转到详情界面
		 * @param {Object} item
		 */
		navToDetails(item) {
			if (this.isEdit) {
				this.checkItem(item);
				return;
			}
			let url;
			switch (item.bizType) {
				case 1: // 挂号消息
					url = `/pagesA/hospital/recordInfo?id=${item.bizId}&fromPage=msg`;
					break;

				case 8: // 用药提醒消息（需要手动调消息已阅读的接口）
					url = `/pagesA/healthManage/drug/remind?id=${item.recordId}`;
					break;

				case 2: // 在线缴费
					url = `/pagesA/order/details?orderId=${item.bizId}`;
					break;

				case 3: // 候诊查询
					url = '/pagesA/hospital/waitSearch';
					break;

				case 4: // 报告查询
					const { reportType, checkType } = JSON.parse(item.bizContent) || {};
					let urlObj = {
						1: '/pagesA/report/examineInfo', // 检查报告
						2: '/pagesA/report/testInfo', // 检验报告 checkType:1(一般)、2(细菌)、3(核酸检测)、4(药敏)
						3: '/pagesA/report/phyExamineInfo' //体检
					};
					url = urlObj[reportType] || '';
					if (checkType == 2) {
						url = '/pagesA/report/germInfo';
					} else if (checkType == 4) {
						url = '/pagesA/report/drugSensitiveInfo';
					}
					if (url) {
						url += `?hosId=${item.hospitalId}&id=${item.bizId}`;
					}
					break;

				case 5: // 住院消息
					url = `/pagesA/hospitalized/recharge?hospitalId=${item.hospitalId}&cardId=${item.recordId}&cardNo=${item.cardNo}`;
					break;

				case 7: // 健康宣教消息
					url = `/pagesA/healthEducation/details?id=${item.bizId}&pageType=msg`;
					break;
					
				case 10: // 住院预交金
					url = `/pagesA/hospitalized/rechargeDetails?orderId=${item.bizId}&pageType=msg`;
					break;
					
				default: // 门诊支付单据提醒、其它
					url = `/pagesA/message/msgDetails?id=${item.id}&pageType=msg`;
					break;
			}

			if (url) {
				uni.navigateTo({ url });
				remarkMsgRead(item.id);
			}
		},

		/** 标记所有消息已读*/
		async remarkAllMsgRead() {
			const { code } = await remarkAllMsgRead();
			if (code == 200) {
				this.getMsgList();
			}
		},

		onEdit() {
			this.chooseArr = [];
			this.isEdit = !this.isEdit;
		},

		checkItem({ id }) {
			const index = this.chooseArr.indexOf(id);
			if (index === -1) {
				this.chooseArr.push(id);
			} else {
				this.chooseArr.splice(index, 1);
			}
		},

		onCheckedAll(checked) {
			this.checkedAll = !checked;

			if (this.chooseArr.length === this.list.length) {
				this.chooseArr = [];
			} else {
				this.chooseArr = [];
				this.list.forEach(({ id }) => {
					this.chooseArr.push(id);
				});
			}
		},

		delOneItem({ id }) {
			this.chooseArr.push(id);
			this.delModel = true;
		},

		async delFunc() {
			const { chooseArr } = this;
			const { code } = await delMsg({ idList: chooseArr });
			this.$refs.swipeAction.closeOther();
			this.delModel = false;
			if (code == 200) {
				this.getMsgList();
				this.$refs.uNotify.show({
					message: `删除成功`,
					type: 'success',
					duration: '2000'
				});
			}
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;

	.top {
		display: flex;
		justify-content: flex-end;

		.all-read {
			padding: 20rpx 0 0 0;
			margin-bottom: -10rpx;
			color: #4298ff;
			font-size: 26rpx;
		}

		.s-line {
			color: #0f1419;
			padding: 20rpx 16rpx 0 16rpx;
			margin-bottom: -10rpx;
			font-size: 26rpx;
			opacity: 0.2;
		}

		.edit-text {
			color: #4298ff;
			font-size: 26rpx;
			padding: 20rpx 40rpx 0 0;
			margin-bottom: -10rpx;
		}
	}

	.list {
		margin-top: 30rpx;

		.u-swipe-action-item {
			margin: 20rpx 30rpx;
			border-radius: 20rpx;
			background: rgba(255, 98, 98, 0.1);
		}

		.u-swipe-action-item__content {
			border-radius: 0 20rpx 20rpx 0;
		}

		.item {
			display: flex;
			align-items: center;
			position: relative;
			padding: 20rpx;

			.icon {
				width: 100rpx;
				height: 100rpx;
				position: relative;

				.point {
					position: absolute;
					background: red;
					width: 26rpx;
					height: 26rpx;
					border-radius: 50%;
					top: -4rpx;
					right: -4rpx;
				}
			}

			.text-box {
				margin-left: 20rpx;
				display: flex;
				flex-direction: column;
				max-width: calc(100% - 120rpx);

				.content {
					margin-top: 6rpx;
					font-size: 26rpx;
					color: #666;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}

				.createTime {
					margin-top: 4rpx;
					color: #999;
					font-size: 24rpx;
				}
			}

			.del-box {
				position: absolute;
				top: 20rpx;
				right: 20rpx;
			}
		}
	}

	.shape-circle {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		border: 2rpx solid #d9d8db;
		box-sizing: border-box;
	}

	.pd-110 {
		padding-bottom: 110rpx;
	}

	.fix-btn-bottom {
		background-color: #fff;
		padding: 16rpx 40rpx;
		box-sizing: border-box;
		position: fixed;
		bottom: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		z-index: 10;

		.btn-box {
			width: 220rpx;
		}
	}
}
</style>
