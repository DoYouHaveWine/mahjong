<!-- 封装的选卡的组件，使用<card-sel @currentCard="onCurrentCard" />即可，onCurrentCard方法参数为当前选择的卡 -->
<template>
	<view>
		<view @click="openPopup">
			<slot name="content">
				<view v-if="!customContent" class="card-sel-item" :style="{ 'background-color': backgroudColor }">
					<view class="card-info">
						<view class="top">
							<text class="name" v-if="selCard.name">{{ selCard.name | $nameSecret }}</text>
							<image v-if="selCard.sex === 1" src="/static/card/ic_male.svg" />
							<image v-if="selCard.sex === 2" src="/static/card/ic_female.svg" />
							<text class="age" v-if="selCard.age">{{ selCard.age }}岁</text>
						</view>
						<text class="id-card" v-if="selCard.idCard">{{ selCard.idCard | $idCardSecret }}</text>
					</view>
					<view class="switch-card" v-if="!onlyShow">
						<image src="/pagesA/static/hospital/ic_switch.svg" />
						<text>切换就诊人</text>
					</view>
				</view>
			</slot>
		</view>

		<u-popup :show="showCardSelPopup" :round="10" @open="openPopup" @close="showCardSelPopup = false">
			<scroll-view class="card-manager" scroll-y>
				<view class="card-list">
					<view
						:class="['card-item', { 'active-item': selCardIndex === i }]"
						v-for="(item, i) in cardList"
						:key="i"
						@click="clickCard(i)"
					>
						<view class="left">
							<view class="base-info">
								<text class="name">{{ item.name | $nameSecret }}</text>
								<image class="sex-icon" v-if="item.sex === 1" src="/static/card/ic_male.svg" />
								<image class="sex-icon" v-if="item.sex === 2" src="/static/card/ic_female.svg" />
								<text class="age">{{ item.age || 0 }}岁</text>
							</view>
							<view class="id-card">{{ item.idCard | $idCardSecret }}</view>
							<text class="relation-ship">{{ relationShipList[item.relationShip] }}</text>
						</view>

						<image class="scan-code" src="/static/card/qrCode.png" />
					</view>
				</view>
				<u-button
					customStyle="width:90%;margin-top:20rpx"
					@click="onSure"
					shape="circle"
					type="primary"
					text="确认"
					:disabled="selCardIndex === undefined"
				/>
			</scroll-view>
		</u-popup>
	</view>
</template>

<script>
import constantMap from '@/common/constantMap.js';
import { refreshCardList } from '@/common/http/api.js';
export default {
	props: {
		// 是否自定义视图，使用slot="content"自定义
		customContent: {
			type: Boolean,
			default: false
		},
		// 背景色
		backgroudColor: {
			type: String,
			default: '#fff'
		},
		// 默认选择的就诊卡Id，不设置的话则为默认就诊卡
		defultSelCardId: {
			type: [String, Number],
			default: ''
		},
		// 仅作展示不可切换就诊人
		onlyShow: {
			type: Boolean,
			default: false
		}
	},

	data() {
		return {
			selCard: {},
			selCardIndex: undefined,
			showCardSelPopup: false,
			relationShipList: constantMap.get('relationShipType')
		};
	},

	computed: {
		cardList() {
			return this.$store.state.cardList;
		}
	},

	mounted() {
		this.getCardList();
	},

	methods: {
		/** 获取绑定的健康卡列表 */
		async getCardList() {
			if (this.cardList.length == 0) {
				// 这里请求一下是在调试带有cardSel组件的单个页面时也能有数据方便调试，不是单个页面时没影响
				await refreshCardList();
			}
			if (this.cardList.length > 0) {
				if (this.defultSelCardId) {
					this.selCard = this.cardList.filter(it => it.id == this.defultSelCardId)[0];
				} else {
					this.selCard = this.cardList.filter(it => it.defaultFlg == 1)[0] || this.cardList[0];
				}
			}
			this.$emit('currentCard', this.selCard);
		},

		/** 打开popup弹窗 */
		openPopup() {
			if (this.onlyShow) return;

			this.showCardSelPopup = true;
		},

		/** 健康卡点击选择 */
		clickCard(index) {
			this.selCardIndex = index;
		},

		/** 确认 */
		onSure() {
			this.showCardSelPopup = false;
			this.selCard = this.cardList[this.selCardIndex];
			this.$emit('currentCard', this.selCard);
		}
	}
};
</script>

<style lang="scss" scoped>
page {
	.card-sel-item {
		height: 140rpx;
		display: flex;
		justify-content: space-between;
		padding: 24rpx 48rpx;
		box-sizing: border-box;
		align-items: center;
		font-family: PingFang SC;
		font-weight: 500;
		background: rgba(230, 241, 255, 0.6);
		.card-info {
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-around;

			.top {
				display: flex;
				align-items: center;
				color: #333;

				.name {
					font-size: 28rpx;
				}

				image {
					margin: 0 10rpx;
					width: 36rpx;
					height: 36rpx;
				}

				.age {
					font-size: 24rpx;
				}
			}

			.id-card {
				color: #999;
				font-size: 28rpx;
			}
		}

		.switch-card {
			display: flex;
			flex-direction: column;
			align-items: center;

			image {
				width: 50rpx;
				height: 50rpx;
			}

			text {
				color: #536471;
				font-family: PingFang SC;
				font-size: 26rpx;
				line-height: 32rpx;
				margin-top: 6rpx;
			}
		}
	}

	.card-manager {
		max-height: 80vh;
		background: #f5f7fa;
		padding: 30rpx 0;

		.card-list {
			.card-item {
				background: #fff;
				border-radius: 28rpx;
				padding: 30rpx 26rpx;
				margin: 10rpx 32rpx;
				display: flex;
				align-items: center;
				border: 2rpx solid #f2f2f2;

				.left {
					flex: 1;

					.base-info {
						display: flex;
						align-items: center;

						.sex-icon {
							width: 36rpx;
							height: 36rpx;
							margin: 0 13rpx;
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

					.relation-ship {
						color: #fff;
						background: #4298ff;
						font-size: 22rpx;
						border-radius: 60rpx;
						padding: 4rpx 14rpx;
					}
				}

				.scan-code {
					width: 80rpx;
					height: 80rpx;
				}
			}

			.active-item {
				border: 4rpx solid #4298ff;
				transition: all 0.1s;
			}
		}
	}
}
</style>
