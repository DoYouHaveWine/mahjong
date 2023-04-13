<template>
	<view style="padding: 0 35rpx;">
		<u-notify ref="uNotify" />
		<view class="content">
			<u-cell-group>
				<u-cell @click="changeAvatar" title="头像" size="large">
					<view slot="right-icon">
						<u-avatar
							:src="sysUser.avatar | avatarUrl"
							size="140rpx"
							mode="aspectFill"
							default-url="/static/mine/ic_avatar.svg"
						/>
					</view>
				</u-cell>
				<u-cell
					@click="$navTo(`./editField?fieldType=name&fieldValue=${sysUser.name}`)"
					title="昵称"
					:value="sysUser.name || ''"
					size="large"
					isLink
				/>
				<u-cell @click="$navTo('./editPhone')" title="手机号" :value="sysUser.mobile | $mobileSecret" size="large" isLink />
				<!-- #ifdef APP-PLUS -->
				<u-cell @click="checkUpdate" title="当前版本号" :value="getVersionCode()" size="large" />
				<!-- #endif -->
			</u-cell-group>
		</view>

		<!-- #ifndef MP-WEIXIN -->
		<u-button type="primary" @click="logout" text="退出登录" />
		<!-- #endif -->

		<!-- #ifdef APP-PLUS -->
		<u-button customStyle="marginTop: 40rpx" plain type="error" @click="cancelAccount" text="账号注销" />

		<!-- APP更新弹窗 -->
		<u-modal
			v-model="showUpdateModal"
			title="APP更新"
			:title-style="{ fontSize: '40rpx' }"
			:show-confirm-button="false"
			:show-cancel-button="false"
			@confirm="onUpdateConfirm"
		>
			<view class="update-modal-content">
				<view class="content-box">
					<template v-if="downloadProgress == 0">
						<view class="info">有新版本发布，确认是否下载更新？</view>
						<view class="desc">更新描述：{{ appUpdateInfo.android_cont }}</view>
						<view v-if="appUpdateInfo.android_is_must_update == 'true'" class="tip">
							该版本改动较大，需强制更新，否则无法使用！
						</view>
					</template>
					<u-line-progress v-else height="60" :round="false" active-color="#2979ff" :percent="downloadProgress" />
				</view>

				<view class="btn-box">
					<text v-if="appUpdateInfo.android_is_must_update == 'false'" class="cancel" @click="showUpdateModal = false">取消</text>
					<text class="sure" @click="onUpdateConfirm">确认</text>
				</view>
			</view>
		</u-modal>
		<!-- #endif -->
	</view>
</template>

<script>
import { serverUrl } from '@/common/http/baseRequest.js';
import { getMemberDetails, editMember, getAppUpdate } from '@/common/http/api.js';
export default {
	data() {
		return {
			sysUser: {},

			// app更新相关
			appUpdateInfo: {},
			showUpdateModal: false,
			downloadProgress: 0,
			downloadFile: undefined
		};
	},

	filters: {
		avatarUrl(avatar) {
			if (!avatar) return;

			if (avatar.indexOf('http') != -1) {
				return avatar;
			} else {
				return serverUrl + avatar;
			}
		}
	},

	computed: {
		userAvatar() {
			if (this.sysUser.avatar && this.sysUser.avatar.search('http') != -1) {
				return this.sysUser.avatar;
			} else {
				return serverUrl + this.sysUser.avatar;
			}
		}
	},

	onLoad() {
		this.getMemberDetails();
		// 监听页面刷新
		uni.$on('refreshMember', () => this.getMemberDetails());
	},

	methods: {
		/** 获取用户信息 */
		async getMemberDetails() {
			var sysUser = uni.getStorageSync('sysUser');
			let { data } = await getMemberDetails(sysUser.id);
			this.sysUser = data;
		},

		/** 修改用户头像 */
		changeAvatar() {
			uni.chooseImage({
				count: 1,
				success: async res => {
					console.log('res', res);
					await uni.uploadFile({
						header: { token: uni.getStorageSync('token') },
						url: `${serverUrl}/api/file/upload`, // 需传后台图片上传接口
						filePath: res.tempFilePaths[0],
						name: 'file',
						formData: { type: '1' },
						success: res => {
							if (res.statusCode != 200) {
								uni.showToast({
									title: '图片上传失败',
									icon: 'none',
									duration: 2000
								});
							} else {
								let avatar = JSON.parse(res.data).data;
								console.log(avatar);
								this.editMember(avatar);
							}
						},
						fail: error => {
							uni.showToast({
								title: error,
								icon: 'none',
								duration: 2000
							});
						}
					});
				}
			});
		},

		/** 更新用户头像 */
		async editMember(avatar) {
			const { code } = await editMember({ avatar, id: this.sysUser.id });
			if (code != 200) {
				this.$refs.uNotify.show({
					message: '更新头像失败',
					type: 'error',
					duration: '2000'
				});
			} else {
				this.$refs.uNotify.show({
					message: '更新头像成功',
					type: 'success',
					duration: '2000'
				});
				uni.$emit('refreshMember'); // 通知页面刷新
			}
		},

		/** 获取版本号 */
		getVersionCode() {
			return plus.runtime.version;
		},

		/** 检查更新 */
		async checkUpdate() {
			let { data } = await getAppUpdate();
			this.appUpdateInfo = data;
			console.log(`当前版本${plus.runtime.versionCode}`);
			console.log(`最新版本${data.android_code}`);
			if (data.android_code > plus.runtime.versionCode) {
				this.showUpdateModal = true;
			} else {
				this.$refs.uNotify.show({
					message: '当前版本已经是最新版本',
					duration: 2000,
					type: 'success '
				});
			}
		},

		/** 更新模态框点击确定 */
		onUpdateConfirm() {
			if (this.downloadProgress == 100) {
				plus.runtime.install(plus.io.convertLocalFileSystemURL(this.downloadFile), {}, {}, error => {
					this.$refs.uNotify.show({
						message: '安装失败',
						type: 'error',
						duration: 2000
					});
				});
				return;
			}

			const downloadTask = uni.downloadFile({
				url: this.appUpdateInfo.android_url,
				success: res => {
					if (res.statusCode == 200) {
						// 下载完成
						this.downloadFile = res.tempFilePath;
						plus.runtime.install(plus.io.convertLocalFileSystemURL(this.downloadFile), {}, {}, error => {
							this.$refs.uNotify.show({
								message: '安装失败',
								type: 'error',
								duration: 2000
							});
						});
					} else {
						this.$refs.uNotify.show({
							message: '更新失败',
							type: 'error',
							duration: 2000
						});

						this.showUpdateModal = false;
					}
				},
				fail: error => {
					console.log(`出错${error}`);
				}
			});

			downloadTask.onProgressUpdate(res => {
				this.downloadProgress = res.progress;
			});
		},

		/** 退出登录 */
		logout() {
			uni.showModal({
				title: '温馨提醒',
				content: '是否确认退出登录',
				success: res => {
					if (res.confirm) {
						uni.removeStorageSync('token');
						uni.removeStorageSync('sysUser');
						uni.reLaunch({ url: '/pagesA/login/login' });
					}
				}
			});
		},

		/** 账号注销 */
		cancelAccount() {
			uni.showModal({
				title: '特别提醒',
				content: '点击账号注销后，14天内不再登录该账号，该账号即被自动注销!!!',
				confirmText: '确定注销',
				success: res => {
					if (res.confirm) {
						uni.removeStorageSync('token');
						uni.removeStorageSync('sysUser');
						uni.reLaunch({ url: '/pagesA/login/login' });
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f2f5f9;

	.content {
		margin: 24rpx auto 90rpx auto;
		background: #ffffff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.update-modal-content {
		.content-box {
			padding: 30rpx 20rpx;

			.info {
				font-size: 34rpx;
			}

			.desc {
				font-size: 30rpx;
				margin-top: 40rpx;
			}

			.tip {
				margin-top: 20rpx;
				font-size: 26rpx;
				font-weight: bold;
				color: #dd524d;
			}
		}

		.btn-box {
			display: flex;
			height: 100rpx;
			align-items: center;
			border-top: 2rpx solid #ccc;

			.cancel,
			.sure {
				flex: 1;
				text-align: center;
				font-size: 36rpx;
			}

			.sure {
				border-left: 1rpx solid #ccc;
				color: #258eff;
			}
		}
	}
}
</style>
