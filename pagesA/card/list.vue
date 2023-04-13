<template>
	<view>
		<view class="card-list" v-if="cardList.length">
			<view class="card-item" v-for="item in cardList" :key="item.id" @click="toCardDetail(item)">
				<view class="card-left">
					<view class="base-info">
						<text class="name">{{ item.name | $nameSecret }}</text>
						<image class="sex-icon" v-if="item.sex === 1" src="/static/card/ic_male.svg" />
						<image class="sex-icon" v-if="item.sex === 2" src="/static/card/ic_female.svg" />
						<text class="age">{{ item.age || 0 }}岁</text>
					</view>
					<view class="id-card">{{ item.idCard | $idCardSecret }}</view>
					<view class="tip-box">
						<checked
							label="默认"
							@onChecked="checked => onChecked(item, checked)"
							:checked="item.defaultFlg == 1"
							:disabled="checkedDisabled"
						/>
						<text class="sm-tips">{{ relationShipObj[item.relationShip] }}</text>
					</view>
				</view>
				<view class="card-right"><image src="/static/card/qrCode.png" /></view>
			</view>
		</view>
		<load-data v-else :loading="false" emptyText="暂未绑卡" />

		<view class="btn-box">
			<u-button :disabled="lastLength === 0" @click="$navTo('./bindCard')" shape="circle" type="primary" text="新增家庭成员" />
		</view>
		<view class="tips-text">您还可以办理{{ lastLength }}张卡</view>
	</view>
</template>

<script>
import { refreshCardList, changeDefaultCard } from '@/common/http/api.js';
import checked from '@/pagesA/components/checked.vue';
export default {
	components: { checked },

	data() {
		return {
			checkedDisabled: false,
			defaultCardId: '',
			relationShipObj: {}
		};
	},

	computed: {
		cardList() {
			return this.$store.state.cardList;
		},

		lastLength() {
			const { length = 0 } = this.cardList || [];
			return 5 - length;
		}
	},

	onLoad() {
		this.relationShipObj = this.constantMap.get('relationShipType');
	},

	onShow() {
		this.getDefaultCard();
	},

	methods: {
		getDefaultCard() {
			this.cardList.forEach(({ id, defaultFlg }) => {
				if (defaultFlg) {
					this.defaultCardId = id;
					return;
				}
			});
		},

		toCardDetail(item) {
			uni.navigateTo({
				url: `./qrCode?recordId=${item.id}`
			});
		},

		onChecked(item, checked) {
			// 已经是默认时不能取消默认
			if (checked) return;

			this.checkedDisabled = true;
			changeDefaultCard(item.id).then(res => {
				this.checkedDisabled = false;
				refreshCardList();
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f5f7fa;

	.card-list {
		padding: 36rpx;

		.card-item {
			background: #fff;
			border-radius: 28rpx;
			padding: 30rpx 26rpx;
			margin-bottom: 32rpx;
			display: flex;
			justify-content: space-between;
			align-content: flex-end;
			border: 2rpx solid #f2f2f2;
			&:last-child {
				margin-bottom: 0;
			}
			.card-left {
				flex: 1;
			}
			.card-right {
				display: flex;
				justify-content: end;
				align-items: center;
				> image {
					width: 80rpx;
					height: 80rpx;
				}
			}
			.base-info {
				display: flex;
				align-items: center;
				.sex-icon {
					width: 36rpx;
					height: 36rpx;
					margin: 0 8rpx 0 16rpx;
				}
				.name {
					font-size: 28rpx;
				}
				.age {
					font-size: 24rpx;
				}
			}
			.id-card {
				color: #999999;
				font-size: 28rpx;
				margin: 8rpx 0 16rpx 0;
			}

			.tip-box {
				display: flex;
				align-items: center;

				.sm-tips {
					color: #fff;
					background: #4298ff;
					font-size: 22rpx;
					border-radius: 60rpx;
					padding: 4rpx 14rpx;
				}
			}
		}
	}
	.btn-box {
		margin: 64rpx 36rpx 28rpx 36rpx;
	}
	.tips-text {
		text-align: center;
		color: #999999;
		font-size: 28rpx;
	}
}
</style>
