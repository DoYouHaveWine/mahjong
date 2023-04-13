<template>
	<view style="padding: 20rpx 35rpx;">
		<u-notify ref="uNotify" />

		<u-form ref="uForm" labelPosition="top" :rules="rules" :model="form">
			<u-form-item label="话题标题" labelWidth="150rpx" prop="title" required>
				<u-input v-model="form.title" maxlength="20" placeholder="请输入话题标题(0/20)" />
			</u-form-item>
			<u-form-item label="话题内容" labelWidth="150rpx" prop="content" required>
				<u-textarea v-model="form.content" placeholder="请输入话题内容(0/500)" maxlength="500" count />
			</u-form-item>
		</u-form>
		<view style="margin-top: 20rpx;">
			<u-upload
				maxSize="10485760"
				:fileList="imageFileList"
				@afterRead="handleAfterRead"
				@delete="handleDelete"
				@oversize="onUploadImageOversize"
				:maxCount="1"
			/>
		</view>
		<view>
			<u-button @click="publishArticle" type="primary" text="发表话题" customStyle="margin:30rpx 0" />
			<view class="rule">
				*请遵守
				<text @click="$navTo('./circleRules')">《健康宿州病友圈咨询/交流规则》</text>
				，不得违反国家法律规定
			</view>
		</view>

		<load-data :loading="loadData.isLoading" :loadingText="loadData.loadingText" onlyShowLoading isLoadingDialog />
	</view>
</template>

<script>
import { serverUrl } from '@/common/http/baseRequest.js';
import { addPatientGroupArticleSave, getPatientGroupArticleDetail, editPatientGroupArticleById } from '@/common/http/api.js';
export default {
	data() {
		return {
			imageFileList: [],
			loadData: {
				isLoading: false,
				loadingText: '加载中...'
			},
			form: {
				id: undefined, // 话题id，修改时用
				memberId: uni.getStorageSync('sysUser').id,
				groupId: undefined,
				title: '',
				content: '',
				img: '',
				articleType: '3'
			},
			rules: {
				title: {
					type: 'string',
					required: true,
					message: '请输入话题标题',
					trigger: ['blur', 'change']
				},
				content: {
					type: 'string',
					required: true,
					message: '请输入话题内容',
					trigger: ['blur', 'change']
				}
			}
		};
	},

	onReady() {
		//如果需要兼容微信小程序，并且校验规则中含有方法等，只能通过setRules方法设置规则。
		this.$refs.uForm.setRules(this.rules);
	},

	onLoad(options) {
		console.log(options);
		this.form.groupId = options.groupId;
		this.form.id = options.id;
		if (this.form.id) {
			this.getDetails();
		}
	},

	methods: {
		/** 图片选择后回调 */
		handleAfterRead(e) {
			this.loading = {
				isLoading: true,
				loadingText: '图片上传中...'
			};
			uni.uploadFile({
				header: {
					token: uni.getStorageSync('token')
				},
				url: `${serverUrl}/api/file/upload`, // 需传后台图片上传接口
				filePath: e.file.url,
				name: 'file',
				formData: {
					type: '1'
				},
				success: res => {
					this.loading.isLoading = false;
					if (res.statusCode != 200) {
						uni.showToast({
							title: '图片上传失败',
							icon: 'none',
							duration: 2000
						});
					} else {
						const imageUrl = JSON.parse(res.data).data;
						console.log(imageUrl);
						this.imageFileList = [{ url: this.getImageFullUrl(imageUrl) }];
						this.form.img = imageUrl;
					}
				},
				fail: error => {
					this.loading.isLoading = false;
					uni.showToast({
						title: error,
						icon: 'none',
						duration: 2000
					});
				}
			});
		},

		handleDelete(e) {
			this.form.img = '';
			this.imageFileList = [];
		},
		
		/** 图片超出允许大小回调 */
		onUploadImageOversize() {
			uni.showToast({
				title: '上传图片应小于10M',
				icon: 'none',
				duration: 3000
			});
		},

		/** 获取图片的完整地址 */
		getImageFullUrl(imageSrc) {
			if (!imageSrc) return;

			if (imageSrc.indexOf('http') != -1) {
				return imageSrc;
			} else {
				return `${serverUrl}${imageSrc}`;
			}
		},

		async getDetails() {
			var res = await getPatientGroupArticleDetail(this.form.id);
			var article = res.data;
			if (article.img) {
				this.fileList = article.img.split(',').map(item => {
					return {
						url: this.serverUrl + item
					};
				});
			}
			this.title = article.title;
			this.content = article.content;
		},

		publishArticle() {
			console.log(this.form);
			this.$refs.uForm.validate().then(async res => {
				this.loading = {
					isLoading: true,
					loadingText: '话题发表中...'
				};
				let response;
				if (this.form.id) {
					response = await editPatientGroupArticleById(this.form);
				} else {
					response = await addPatientGroupArticleSave(this.form);
				}

				this.loadData.isLoading = false;

				if (response.code == 200) {
					this.$refs.uNotify.show({
						message: '话题已提交，审核通过后将会在病友圈显示',
						type: 'success',
						duration: '2000'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 2000);
				} else {
					this.$refs.uNotify.show({
						message: response.message,
						type: 'error',
						duration: '2000'
					});
				}
			});
		}
	}
};
</script>

<style lang="scss">
.rule {
	font-size: 24rpx;
	font-family: Source Han Sans CN;
	font-weight: 400;
	color: #3e4a59;
	line-height: 32rpx;
	opacity: 0.7;
	color: #3e4a59;

	text {
		color: #6078ea;
	}
}
</style>
