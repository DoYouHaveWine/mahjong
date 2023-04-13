<template>
	<view>
		<u-notify ref="uNotify" />

		<view class="friends">
			<view class="friend">
				<view class="query">{{ article.title || '' }}</view>
				<view class="circle">
					<view class="photo">
						<image v-if="article.avatar" :src="getImageFullUrl(article.avatar)" mode="aspectFill" />
						<image v-else src="/pagesA/static/patientCircle/ic_man.png" mode="aspectFill" />
					</view>
					<view class="information">
						<view class="lable name">{{ article.nickName || '' }}</view>
						<view class="row txcz_center">
							<view class="lable">加入圈子：</view>
							<template v-if="article.groupType">
								<view class="tab" v-for="(tag, index) in article.groupType.split(',')" :key="index">{{ tag }}</view>
							</template>
						</view>
					</view>
				</view>
				<view class="news">
					<view class="ta">
						<view>{{ article.content || '' }}</view>
						<view class="imgs">
							<view style="width: 100%;" v-if="article.img">
								<img-box :imgList="article.img.split(',')" :num="article.img.split(',').length" />
							</view>
						</view>
						<view class="tx_scenter" style="color: #666666;padding: 20rpx 0;">
							<view class="article-header-info">{{ article.createTime || '' }}</view>
							<view v-if="isMyself" class="article-header-info" @click="editArticle(article.id)">编辑</view>
						</view>
					</view>
				</view>
				<view class="reply">
					<view class="reply_header txsp_between">
						<view class="num">全部回复{{ article.commentNum !== '' ? article.commentNum : '' }}</view>
						<view @click="open" class="btn">回复他</view>
					</view>
					<view class="uni-article__comment">
						<view class="uni-article__comment-box" v-for="comment in comments" :key="comment.id">
							<view class="article-meta">
								<view class="article-header-image">
									<image class="image" :src="getImageFullUrl(comment.avatar)" mode="widthFix" />
								</view>
								<view class="article-header-content">
									<view class="article-header-title">
										<text>{{ comment.nicckName || '' }}</text>
										<image v-if="comment.sex == 1" src="/pagesA/static/patientCircle/ic_man.png" mode="aspectFill" />
										<image v-if="comment.sex == 2" src="/pagesA/static/patientCircle/ic_woman.png" mode="aspectFill" />
									</view>
									<view style="display: flex;" class="article-header-info" v-if="comment.groupType">
										<span>加入圈子：</span>
										<view class="tab" v-for="(tag, index) in comment.groupType.split(',')" :key="index">{{ tag }}</view>
									</view>
									<view class="txsp_between">
										<view class="article-header-info">{{ comment.createTime || '' }}</view>
										<view
											v-if="sysUser.id == comment.memberId"
											class="article-header-info"
											@click="editReply(comment.id)"
										>
											编辑
										</view>
									</view>
								</view>
							</view>
							<view class="uni-article__comment-centent">
								{{ comment.content }}
								<view style="width: 100%;" v-if="comment.imgs">
									<img-box :imgList="comment.imgs.split(',')" :num="comment.imgs.split(',').length" />
								</view>
								<view class="txsp_between">
									<view>
										<view
											@click="seeReply(comment)"
											v-if="comment.levelFlag == 1"
											style="font-size: 24rpx;color: #666666;"
										>
											查看回复>
										</view>
									</view>
									<view
										v-if="sysUser.id != comment.memberId"
										@click="replyOpen(comment)"
										style="font-size: 24rpx;color: #666666;"
									>
										回复
									</view>
								</view>
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

			<u-popup @close="popClose" :show="show" closeable :closeOnClickOverlay="false">
				<view style="margin: 80rpx 20rpx 20rpx 20rpx">
					<u-textarea v-model="content" placeholder="请输入话题内容(0/500)" maxlength="500" count />
					<view style="margin-top: 20rpx">
						<u-upload
							maxSize="10485760"
							:fileList="imageFileList"
							@afterRead="handleAfterRead"
							@delete="handleDelete"
							@oversize="onUploadImageOversize"
							:maxCount="4"
						/>
					</view>
					<button :disabled="disabled" @click="reply" class="replyBtn" type="default">确定</button>
				</view>
			</u-popup>

			<u-popup @close="pop1Close" :show="showOther" closeable :closeOnClickOverlay="false">
				<view style="margin: 80rpx 20rpx 20rpx 20rpx">
					<u-textarea v-model="content" placeholder="回复内容(0/500)" maxlength="500" count />
					<button :disabled="disabled" @click="replyParent" class="replyBtn" type="default">确定</button>
				</view>
			</u-popup>

			<load-data :loading="loading.isLoading" :loadingText="loading.loadingText" onlyShowLoading isLoadingDialog />
		</view>
	</view>
</template>

<script>
import { serverUrl } from '@/common/http/baseRequest.js';
import {
	getPatientGroupArticleDetail,
	getPatientGroupCommentList,
	getPatientGroupArticleViewNum,
	replyPatientGroupCommentSave,
	getPatientGroupCommentById,
	editPatientGroupCommentById
} from '@/common/http/api.js';
import imgBox from './components/image-box.vue';
export default {
	components: {
		imgBox
	},
	data() {
		return {
			content: '',
			sysUser: uni.getStorageSync('sysUser'),
			isMyself: true,
			id: '',
			article: {},
			comments: [],
			replyList: [],
			comment: {},
			imageFileList: [],
			disabled: false,
			parentId: '',
			currPage: 0,
			totalPage: 0,
			first: false,
			up: false,
			next: false,
			last: false,
			opt: {
				pageNum: 1,
				pageSize: 10
			},
			editReplyId: null,
			replyLoding: false,
			replyListLoding: true,
			show: false,
			showOther: false,
			imgs: '',
			loading: {
				isLoading: false,
				loadingText: '加载中...'
			}
		};
	},

	onLoad(options) {
		uni.setNavigationBarTitle({ title: options.title });
		this.id = options.id;
		uni.startPullDownRefresh();
	},

	onPullDownRefresh() {
		this.getComments();
	},

	onShow() {
		this.getComments();
		this.init();
	},

	methods: {
		/** 获取图片的完整地址 */
		getImageFullUrl(imageSrc) {
			if (!imageSrc) return;

			if (imageSrc.indexOf('http') != -1) {
				return imageSrc;
			} else {
				return `${serverUrl}${imageSrc}`;
			}
		},

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
						this.imageFileList.push({ url: this.getImageFullUrl(imageUrl) });
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
			this.imageFileList.splice(e.index, 1);
		},

		/** 图片超出允许大小回调 */
		onUploadImageOversize() {
			uni.showToast({
				title: '上传图片应小于10M',
				icon: 'none',
				duration: 3000
			});
		},

		//编辑回复
		async editReply(id) {
			this.editReplyId = id;
			this.replyLoding = true;
			this.show = true;
			var res = await getPatientGroupCommentById({
				id,
				memberId: this.sysUser.id
			});
			this.replyLoding = false;
			var detail = res.data;
			this.content = detail.content;
			if (detail.imgs) {
				this.imgs = detail.imgs;
				this.fileList = detail.imgs.split(',').map(item => {
					return {
						url: serverUrl + item
					};
				});
			}
		},

		//关闭弹窗
		popClose(e) {
			if (!e) {
				this.content = '';
				this.fileList = [];
				this.editReplyId = null;
			}
			this.show = false;
		},
		pop1Close(e) {
			if (!e) {
				this.content = '';
			}
			this.showOther = false;
		},
		//编辑话题
		editArticle(id) {
			uni.navigateTo({
				url: './publishArticle?id=' + id
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
			this.comments = [];
			this.getComments();
		},
		replyOpen(comment) {
			this.comment = comment;
			this.showOther = true;
		},
		async replyParent() {
			this.disabled = true;
			var obj = {};
			obj.memberId = this.sysUser.id;
			obj.parentId = this.comment.id;
			obj.articleId = this.comment.articleId;
			obj.content = this.content;
			if (!this.content) {
				this.$refs.uNotify.show({
					message: '回复内容不能为空',
					type: 'error',
					duration: '2000'
				});
				this.disabled = false;
				return;
			}
			var add = await replyPatientGroupCommentSave(obj);
			if (add.code == 200) {
				this.$refs.uNotify.show({
					message: '回复成功',
					type: 'success',
					duration: '2000'
				});
				this.getComments();
				this.showOther = false;
			}
			this.disabled = false;
		},
		async seeReply(comment) {
			uni.navigateTo({
				url: './reply?parentId=' + comment.id
			});
		},
		async reply() {
			var obj = {};
			obj.memberId = this.sysUser.id;
			obj.articleId = this.id;
			obj.content = this.content;
			if (!this.content) {
				this.$refs.uNotify.show({
					message: '回复内容不能为空',
					type: 'error',
					duration: '2000'
				});
				return;
			}
			if (this.imageFileList.length) {
				(obj.imgs = ''),
					this.imageFileList.forEach(item => {
						obj.imgs += `${item.url.split(this.serverUrl)[1]},`;
					});
				obj.imgs = obj.imgs.substring(0, obj.imgs.length - 1);
			}

			var add;
			this.disabled = true;
			if (this.editReplyId) {
				obj.id = this.editReplyId;
				add = await editPatientGroupCommentById(obj);
			} else {
				add = await replyPatientGroupCommentSave(obj);
			}
			this.disabled = false;
			if (add.code == 200) {
				this.$refs.uNotify.show({
					message: '回复成功',
					type: 'success',
					duration: '2000'
				});
				this.getComments();
				this.show = false;
			}
		},

		open(e) {
			//打开弹窗
			this.show = true;
		},

		async init() {
			var res = await getPatientGroupArticleDetail(this.id);
			getPatientGroupArticleViewNum(this.id); //话题浏览记录
			this.article = res.data;
			if (this.article.img) {
				this.article.img = this.article.img
					.split(',')
					.map(itemImg => serverUrl + itemImg)
					.toString();
			}
			this.isMyself = this.sysUser.id == this.article.memberId;
		},

		async getComments() {
			this.replyListLoding = true;
			var opt = this.opt;
			opt.articleId = this.id;
			opt.memberId = this.sysUser.id;
			var res = await getPatientGroupCommentList(opt);
			this.comments = res.data.list; //回复列表
			this.comments = this.comments.map(item => {
				if (item.imgs) {
					item.imgs = item.imgs
						.split(',')
						.map(itemImg => serverUrl + itemImg)
						.toString();
				}
				return item;
			});
			this.currPage = res.data.currPage;
			this.totalPage = res.data.totalPage;
			this.replyListLoding = false;
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
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f2f5f9;

	.friends {
		padding-top: 21rpx;
		padding-left: 36rpx;
		padding-right: 36rpx;

		.friend {
			padding: 0 18rpx 21rpx 18rpx;
			margin: 21rpx auto;
			background: #ffffff;
			box-shadow: 0rpx 3rpx 13rpx 0rpx rgba(69, 157, 247, 0.19);
			border-radius: 20rpx;

			.query {
				font-size: 32rpx;
				font-family: Source Han Sans CN;
				font-weight: bold;
				color: #5483f9;
				padding-top: 11rpx;
			}

			.circle {
				display: flex;
				padding-top: 15rpx;

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

					// 垂直居中
					.txcz_center {
						display: flex;
						align-items: center;
					}
				}
			}

			.news {
				border-bottom: 1px solid #d5d5d5;

				.ta {
					font-size: 28rpx;
					font-family: Source Han Sans CN;
					font-weight: 400;
					color: #333333;
					line-height: 40rpx;
					margin-top: 11rpx;

					view {
						font-size: 28rpx;
					}

					.imgs {
						display: flex;
						flex-wrap: wrap;

						image {
							width: calc(100% / 3);
							// margin-right: ;
						}
					}
				}

				.time {
					font-size: 26rpx;
					font-family: Source Han Sans CN;
					font-weight: 400;
					color: #666666;
					line-height: 1;
					margin-top: 12rpx;
					margin-bottom: 26rpx;
				}
			}

			.reply {
				.reply_header {
					margin-top: 26rpx;

					.num {
						font-size: 32rpx;
						color: #333333;
						line-height: 1;
					}

					.btn {
						width: 108rpx;
						height: 38rpx;
						border: 2rpx solid #666666;
						border-radius: 10rpx;
						font-size: 21rpx;
						color: #666666;
						line-height: 38rpx;
						text-align: center;
					}
				}

				.content {
					font-size: 26rpx;
					color: #333333;
					line-height: 36rpx;
					margin-top: 13rpx;
					margin-bottom: 6rpx;
				}
			}
		}

		.pages {
			padding-bottom: 20rpx;
			button {
				height: 50rpx;
				background: #5483f9;
				border-radius: 25rpx;
				font-size: 25rpx;
				color: #ffffff;
				line-height: 1;
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

	.replyBtn {
		width: 200rpx;
		height: 50rpx;
		background: #5483f9;
		color: #fff;
		line-height: 50rpx;
		margin-top: 32rpx;
	}

	button::after {
		border: none;
	}

	.uni-article__comment {
		.article-meta {
			padding: 20rpx 20rpx;
			display: flex;
			align-items: center;
			flex-direction: row;
			justify-content: flex-start;
			color: gray;
		}

		.article-header-image {
			width: 60rpx;
			height: 60rpx;
			flex-shrink: 0;
			/* border-radius: 50%; */
			overflow: hidden;
		}

		.article-header-image .image {
			width: 100%;
			height: 100%;
			border-radius: 100%;
		}

		.article-header-content {
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding-left: 10px;
			font-size: 24rpx;
			line-height: 1;
			width: 100%;
			/* height: 60rpx; */
		}

		.article-header-title {
			display: flex;
			align-items: center;
			font-size: 26rpx;
			line-height: 2;
			color: #000;
			padding: 10rpx 0;

			image {
				margin-left: 6rpx;
				width: 22rpx;
				height: 23rpx;
			}
		}

		.article-header-info {
			font-size: 24rpx;
			line-height: 1;
			align-items: center;

			.tab {
				padding: 8rpx 12rpx;
				border: 2rpx solid #5483f9;
				border-radius: 10px;
				line-height: 1;
				font-size: 21rpx;
				font-family: Source Han Sans CN;
				font-weight: 400;
				color: #5483f9;
			}
		}

		.article-top {
			display: flex;
			align-items: flex-end;
			font-size: 26rpx;
			line-height: 1;
			color: #999;
		}

		.article-top .image {
			width: 30rpx;
			margin-left: 5rpx;
		}

		.uni-article__comment-title {
			width: 100%;
			line-height: 3;
			font-size: 28rpx;
			color: #666;
			background: #f5f5f5;
			padding-left: 20rpx;
		}

		.uni-article__comment-centent {
			border-bottom: 1px #eee solid;
			padding: 0 20rpx;
			padding-left: 95rpx;
			padding-bottom: 20rpx;
			font-size: 14px;
			color: #333;
		}
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

.mb20 {
	margin-bottom: 20px;
}
.u-top-tips {
	margin-bottom: 10rpx;
}
</style>
