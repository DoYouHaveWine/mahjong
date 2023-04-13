<template>
	<view>
		<u-notify ref="uNotify" />

		<view class="uni-article__comment">
			<view class="uni-article__comment-box">
				<view class="article-meta">
					<view class="article-header-image">
						<image v-if="comment.img" class="image" :src="serverUrl + comment.img" mode="widthFix" />
						<image v-else class="image" src="/pagesA/static/patientCircle/ic_man.png" mode="widthFix" />
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
						<view class="article-header-info">{{ comment.createTime || '' }}</view>
					</view>
				</view>
				<view class="uni-article__comment-centent">{{ comment.content || '' }}</view>
			</view>
			<load-data v-if="!comments.length" :loading="loding" />
			<template v-else>
				<view class="uni-article__comment-box" v-for="comment in comments" :key="comment.id">
					<view class="article-meta">
						<view class="article-header-image">
							<image v-if="comment.img" class="image" :src="serverUrl + comment.img" mode="widthFix" />
							<image v-else class="image" src="/pagesA/static/patientCircle/ic_man.png" mode="widthFix" />
						</view>
						<view class="article-header-content">
							<view class="article-header-title">
								<text>{{ comment.nicckName || '' }}</text>
								<image v-if="comment.sex == 1" src="/pagesA/static/patientCircle/ic_man.png" mode="aspectFill" />
								<image v-if="comment.sex == 2" src="/pagesA/static/patientCircle/ic_woman.png" mode="aspectFill" />
								<template v-if="whoReply(comment.pid)">
									<span>
										<span style="color: #666;margin: 0 10rpx;">回复</span>
										{{ whoReply(comment.pid).nicckName }}
									</span>
									<image
										v-if="whoReply(comment.pid).sex == 1"
										src="/pagesA/static/patientCircle/ic_man.png"
										mode="aspectFill"
									/>
									<image
										v-if="whoReply(comment.pid).sex == 2"
										src="/pagesA/static/patientCircle/ic_woman.png"
										mode="aspectFill"
									/>
								</template>
							</view>
							<view style="display: flex;" class="article-header-info" v-if="comment.groupType">
								<span>加入圈子：</span>
								<view class="tab" v-for="(tag, index) in comment.groupType.split(',')" :key="index">{{ tag }}</view>
							</view>
							<view class="article-header-info">{{ comment.createTime || '' }}</view>
						</view>
					</view>
					<view class="uni-article__comment-centent">
						{{ comment.content }}
						<view class="txsp_between">
							<view></view>
							<view v-if="sysUser.id != comment.memberId" @click="open(comment.id)" style="font-size: 24rpx;color: #666666;">
								回复
							</view>
						</view>
					</view>
				</view>
			</template>
		</view>

		<u-popup @close="popClose" :show="show">
			<view>
				<u-textarea v-model="content" placeholder="回复内容(0/500)" maxlength="500" count />
				<button :disabled="disabled" @click="reply" class="replyBtn" type="default">确定</button>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { serverUrl } from '@/common/http/baseRequest.js';
import { replyPatientGroupCommentSave, getPatientGroupCommentListByParentid, getPatientGroupCommentById } from '@/common/http/api.js';
export default {
	data() {
		return {
			serverUrl,
			comment: {},
			comments: [],
			sysUser: uni.getStorageSync('sysUser'),
			content: '',
			disabled: false,
			replyId: '',
			loding: true,
			show: false
		};
	},
	onLoad(options) {
		this.parentId = options.parentId;
		this.getComent();
		this.seeReply();
	},

	methods: {
		whoReply(pid) {
			var obj;
			this.comments.forEach(item => {
				if (item.id == pid) {
					obj = item;
				}
			});
			console.log('obj=====', obj);
			return obj;
		},
		//关闭弹窗
		popClose(e) {
			if (!e) {
				this.content = '';
			}
		},
		async getComent() {
			var opt = {};
			opt.id = this.parentId;
			opt.memberId = this.sysUser.id;
			var res = await getPatientGroupCommentById(opt);
			this.comment = res.data;
		},
		open(e) {
			this.replyId = e;
			//打开弹窗
			this.show = true;
		},
		async seeReply() {
			this.comments = [];
			this.loding = true;
			var opt = {};
			opt.pId = this.parentId;
			opt.memberId = this.sysUser.id;
			var res = await getPatientGroupCommentListByParentid(opt);
			this.comments = res.data;
			this.loding = false;
		},
		async reply() {
			this.disabled = true;
			var obj = {};
			obj.memberId = this.sysUser.id;
			obj.parentId = this.replyId;
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
				this.seeReply();
				this.show = false;
			}
			this.disabled = false;
		}
	}
};
</script>

<style lang="scss">
.replyBtn {
	width: 200rpx;
	height: 50rpx;
	background: #5483f9 !important;
	color: #fff !important;
	line-height: 50rpx;
	margin-top: 32rpx;
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

		.txsp_between {
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;
		}
	}
}
</style>
