<template>
	<view class="my-docotr-page">
		<view class="doctor-list">
			<template v-if="!loading && doctorList.length !== 0">
				<view class="doctor-item" @click="chooseDoctor(item)" v-for="(item, i) in doctorList" :key="i">
					<view class="collect-box" @click.stop="cancelDoctor(item)">
						<u-icon name="heart-fill" color="#ff6262" size="32rpx"></u-icon>
						<span class="has-collect">已关注</span>
					</view>
					<view class="doctor-image">
						<image v-if="item.avatar" :src="serverUrl + item.avatar"></image>
						<image v-else src="../static/hospital/ic_doctor.svg"></image>
					</view>
					<view class="doctor-content">
						<view class="doctor-info">
							<view class="doctor-level">
								<span class="name">{{ item.doctorName }}</span>
								<span class="level" v-if="item.doctorLevel">{{ item.doctorLevel }}</span>
							</view>
							<view class="doctor-job">
								<view class="tiny-text">{{ item.hospitalName || '' }}</view>
								<view class="tiny-text">{{ item.deptName || '' }}</view>
							</view>
						</view>
					</view>
				</view>
			</template>

			<load-data v-else :loading="loading" />
		</view>
		<u-notify ref="uNotify" />
	</view>
</template>

<script>
import { getMyDoctor, cancelFavorite } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: false,
			doctorList: [],
			user: uni.getStorageSync('sysUser')
		};
	},
	onLoad() {
		this.getData();
	},
	methods: {
		getData() {
			const params = {
				memberId: this.user.id || ''
			};
			this.loading = true;
			getMyDoctor(params)
				.then(({ data = [] }) => {
					this.doctorList = data || [];
				})
				.finally(() => (this.loading = false));
		},
		chooseDoctor(item) {
			const { deptId, doctorName, hospitalId } = item;
			uni.navigateTo({
				url: `./doctorList?hospitalId=${hospitalId}&deptId=${deptId}&doctorName=${doctorName}`
			});
		},
		cancelDoctor(item) {
			const params = {
				memberId: this.user.id,
				objectId: item.doctorId,
				objectType: 3
			};
			cancelFavorite(params).then(() => {
				this.$refs.uNotify.show({
					message: '取消收藏成功',
					type: 'success',
					duration: '1000'
				});
				this.getData();
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;

	.doctor-list {
		padding: 32rpx 34rpx;

		.doctor-item {
			display: flex;
			background: #fff;
			border-radius: 20rpx;
			padding: 24rpx;
			margin-bottom: 28rpx;
			position: relative;
			.collect-box {
				position: absolute;
				top: 28rpx;
				right: 24rpx;
				font-size: 26rpx;
				color: rgba(15, 20, 25, 0.5);
				display: flex;
				> span {
					margin-left: 4rpx;
				}
				.has-collect {
					color: #ff6262;
				}
			}
			&:last-child {
				margin-bottom: 0;
			}

			.doctor-image {
				image {
					width: 132rpx;
					height: 132rpx;
					border-radius: 50%;
				}
			}

			.doctor-content {
				flex: 1;
				margin-left: 26rpx;

				.doctor-info {
					.doctor-level {
						margin-bottom: 16rpx;

						.name {
							font-size: 30rpx;
							color: #000000;
							margin-right: 12rpx;
						}

						.level {
							font-size: 20rpx;
							border-radius: 8rpx;
							color: #ed8c53;
							border: 2rpx solid #ed8c53;
							padding: 3rpx 4rpx;
						}
					}

					.doctor-job {
						color: #0f1419;
						font-size: 26rpx;

						.tiny-text {
							color: #adadad;
						}
					}
				}
			}
		}
	}
}
</style>
