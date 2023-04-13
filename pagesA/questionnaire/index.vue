<template>
	<view class="content">
		<u-notify ref="uNotify" />

		<view v-if="vote">
			<view class="title">{{ vote.name }}</view>
			<u-form :model="form" ref="uForm">
				<u-form-item
					v-for="(item, index) in vote.questionResps"
					labelPosition="top"
					labelWidth="100%"
					:key="item.id"
					:label="index + 1 + '.' + item.title"
				>
					<view>
						<u-radio-group v-if="item.subjectType == 1" placement="column">
							<view v-for="(child, childIndex) in item.questionItemResp" :key="childIndex" class="answer-item">
								<u-radio :name="child.id" :label="child.text" @change="onRadioChange(item.id, child.id)" />
							</view>
						</u-radio-group>
						<u-checkbox-group v-if="item.subjectType == 2" placement="column" @change="onCheckGroupChange($event, item.id)">
							<view v-for="(child, childIndex) in item.questionItemResp" :key="childIndex" class="answer-item">
								<u-checkbox
									v-model="child.checked"
									style="display: flex;align-items: flex-start;"
									:label="child.text"
									:name="child.id"
								/>
							</view>
						</u-checkbox-group>
						<!-- <u-input v-model="form[item.id]"  v-if="item.subjectType==3" maxlength="256" placeholder="请输入内容" type="textarea" /> -->
						<!-- <input type="text" v-if="item.subjectType==3" placeholder="未用组件"> -->
						<textarea
							v-model="form[item.id]"
							name
							id
							v-if="item.subjectType == 3"
							cols="10"
							rows="15"
							maxlength="256"
							placeholder="请输入内容"
						/>
					</view>
				</u-form-item>
			</u-form>
			<u-button @click="submit" type="primary" text="提交" />
		</view>

		<load-data
			v-if="loadData.isLoading"
			:loading="loadData.isLoading"
			:isLoadingDialog="loadData.isLoadingDialog"
			:loadingText="loadData.loadingText"
		/>
	</view>
</template>

<script>
import { refreshCardList, getVote, saveVoteSubmit, checkHasSubmit, saveSatisfactionVoteSubmit, saveVoteItem } from '@/common/http/api.js';
export default {
	data() {
		return {
			form: {},
			radio: '',
			switchVal: false,
			vote: undefined,
			loadData: { isLoading: true, isLoadingDialog: false, loadingText: '加载中...' },

			voteId: undefined,
			hospitalId: undefined,
			fromList: true // 从列表进入
		};
	},

	async onLoad(options) {
		if (options.hospitalId) {
			// 从列表进入
			this.fromList = true;
			this.voteId = options.voteId;
			this.hospitalId = options.hospitalId;
			this.fetchVoteDetails();
		} else {
			// 扫码方式进入
			this.fromList = false;
			let formUrl = decodeURIComponent(options.q);
			this.hospitalId = this.getUrlParams(formUrl, 'hospitalId');
			this.voteId = this.getUrlParams(formUrl, 'voteId') || '14';

			// 判断是否有登录
			if (!uni.getStorageSync('token')) {
				// 去授权
				uni.redirectTo({ url: `/pagesA/auth/auth?fromPage=myddc&hospitalId=${this.hospitalId}&voteId=${this.voteId}` });
				return;
			}

			const { data } = await refreshCardList();
			if (data.length) {
				this.checkHasSubmit();
				this.fetchVoteDetails();
			} else {
				uni.showModal({
					title: '提示',
					content: '请先绑定电子健康卡再进行相应操作！',
					showCancel: false,
					success: res => {
						if (res.confirm) {
							uni.redirectTo({ url: '/pagesA/card/bindCard?fromPage=myddc' });
						}
					}
				});
			}
		}
	},

	methods: {
		async fetchVoteDetails() {
			this.loadData = { isLoading: true, isLoadingDialog: false, loadingText: '加载中...' };
			const res = await getVote(this.voteId);
			this.loadData.isLoading = false;
			if (res.code == 200) {
				this.vote = res.data;
				this.vote.questionResps.forEach(item => {
					this.form[item.id] = '';
				});
			} else {
				this.vote = undefined;
			}
		},

		onRadioChange(id, childId) {
			this.form[id] = childId;
		},

		async submit() {
			let title;
			console.log(this.form);
			for (let i in this.form) {
				if (!this.form[i]) {
					this.vote.questionResps.forEach(item => {
						if (item.id == i) {
							title = item.title;
							return;
						}
					});
				}
				if (title) {
					this.$refs.uNotify.show({
						message: title + '未填',
						type: 'error',
						duration: '1500'
					});
					return;
				}
			}

			this.loadData = { isLoading: true, isLoadingDialog: true, loadingText: '提交中...' };
			let sysUserId = uni.getStorageSync('sysUser').id;
			let res;
			if (this.fromList) {
				res = await saveVoteSubmit({
					voteId: this.voteId,
					memberId: sysUserId,
					hospitalId: this.hospitalId
				});
			} else {
				// 满意度调查提交接口后台单独处理了
				res = await saveSatisfactionVoteSubmit({
					voteId: this.voteId,
					memberId: sysUserId,
					hospitalId: this.hospitalId
				});
			}

			let obj = {};
			if (res.code == 200) {
				obj.submitId = res.data.id;
				obj.itemId = this.vote.id;
				obj.form = this.form;
				const step2 = await saveVoteItem(obj);
				this.loadData.isLoading = false;
				if (step2.code == 200) {
					this.$refs.uNotify.show({
						message: '提交成功',
						type: 'success',
						duration: '1500'
					});

					let pages = getCurrentPages();
					let beforePage = pages[pages.length - 2];
					setTimeout(() => {
						if (this.fromList) {
							uni.navigateBack({
								success: function() {
									beforePage.$vm.loadData();
								}
							});
						} else {
							uni.switchTab({ url: '/pages/index/index' });
						}
					}, 1500);
				}
			} else {
				this.loadData.isLoading = false;
			}
		},

		onCheckGroupChange(e, id) {
			this.form[id] = e.toString();
		},

		/** 解析Url中的参数
		 * @param {Object} url url
		 * @param {Object} query 参数名
		 */
		getUrlParams(url, query) {
			// str为?之后的参数部分字符串
			const str = url.substr(url.indexOf('?') + 1);
			// arr每个元素都是完整的参数键值
			const arr = str.split('&');
			// result为存储参数键值的集合
			const result = {};
			for (let i = 0; i < arr.length; i++) {
				// item的两个元素分别为参数名和参数值
				const item = arr[i].split('=');
				result[item[0]] = item[1];
			}
			return result[query];
		},

		/**	检查当日是否已填写 */
		async checkHasSubmit() {
			const { data } = await checkHasSubmit({ hospitalId: this.hospitalId, queryToday: true, voteId: this.voteId });
			if (data) {
				uni.showModal({
					title: '您今日已经填写过了，每日最多填写一次！',
					showCancel: false,
					success: res => {
						if (res.confirm) {
							uni.switchTab({
								url: '/pages/index/index'
							});
						}
					}
				});
			}
		}
	}
};
</script>

<style lang="scss">
.content {
	padding: 24rpx 32rpx;

	.title {
		font-size: 36rpx;
		font-weight: 500;
		text-align: center;
	}

	.answer-item {
		margin: 8rpx 0;
	}

	/deep/.u-input {
		width: 700rpx;
		// width: 100%;
		height: 200rpx;
	}
}

textarea {
	width: 700rpx;
	height: 80rpx;
	line-height: 140%;
}
</style>
