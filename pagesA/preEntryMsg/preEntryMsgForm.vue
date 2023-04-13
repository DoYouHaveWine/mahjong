<template>
	<view class="pre-entry-msg-form">
		<view class="dropdown-box">
			<view class="menu-info">查询前请选择就诊人：</view>
			<dropdown inactive-color="#fff" active-color="#ddd" ref="uDropdown">
				<dropdown-item :title="selRecord.name || ''">
					<view
						:class="['record-item', { 'sel-item': item.idCard === selRecord.idCard }]"
						v-for="item in bindRecordArr"
						:key="item.idCard"
						@click="chooseRecord(item)"
					>
						<text>{{ item.idCard || '' }}</text>
						<text>{{ item.name || '' }}</text>
					</view>
				</dropdown-item>
			</dropdown>
		</view>

		<view class="flex-right-box">
			<view class="light-box" @click="$navTo(`./historyList?hospitalId=${hospitalId}&recordId=${selRecord.id}&voteId=${id}`)">
				<text class="tips">历史记录</text>
				<u-icon color="#fff" name="arrow-right-double" />
			</view>
			<view class="to-bind-card" @click="toBindCard">
				<u-icon name="plus" color="#2979ff" />
				<text>新建电子健康卡</text>
			</view>
		</view>

		<view class="content">
			<u-notify ref="uNotify" />

			<view v-if="vote && !loading">
				<view class="title">{{ vote.name }}</view>
				<u-form label-position="top" :model="form" ref="uForm" labelWidth="auto">
					<u-form-item v-for="(item, index) in vote.questionResps" :key="item.id" :label="index + 1 + '.' + item.title">
						<view>
							<u-radio-group v-if="item.subjectType == 1" :value="form[item.id]" placement="column">
								<view v-for="(child, childIndex) in item.questionItemResp" class="answer-item">
									<u-radio
										@change="changeValue($event, item.id)"
										:key="childIndex"
										:ref="'radio' + item.id + child.id"
										:disabled="disabled && [72, 73, 74, 75].indexOf(item.id) !== -1"
										:name="child.id"
										:label="child.text"
									/>
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
								:disabled="['姓名', '身份证号'].indexOf(item.title) !== -1"
								v-if="item.subjectType == 3"
								cols="10"
								rows="15"
								maxlength="256"
								placeholder="请输入内容"
							/>
						</view>
					</u-form-item>
				</u-form>
				<u-button :loading="submitLoading" :disabled="submitLoading" @click="submit" type="primary" text="提交" />
			</view>

			<load-data v-else :loading="loading" />
		</view>
	</view>
</template>

<script>
import {
	getVote,
	checkTodayPreMsg,
	savePreVoteSubmit,
	saveVoteItem,
	refreshCardList,
	savePreMsg,
	getVoteDetil,
	updatePreMsg
} from '@/common/http/api.js';
export default {
	data() {
		return {
			form: {},
			vote: undefined,
			sysUserId: uni.getStorageSync('sysUser').id,
			id: 12,
			loading: true,
			submitLoading: false,
			bindRecordArr: [],
			selRecord: {
				id: '',
				name: '',
				idCard: '',
				phone: ''
			},
			hospitalId: '',
			// 查询当天是否提交记录id
			preId: '',
			preSubmitId: '',
			nameKey: '',
			idCardKey: '',
			phoneKey: '',
			disabled: false
		};
	},

	onLoad(options) {
		let formUrl = decodeURIComponent(options.q);
		let temHosId = this.getHospitalId(formUrl);
		if (temHosId) {
			uni.setStorageSync('preMsgHosId', temHosId);
		}
		this.hospitalId = uni.getStorageSync('preMsgHosId') || 75;

		// 判断是否有登录
		if (!uni.getStorageSync('token')) {
			this.isAuth();
		} else {
			// 获取电子健康卡
			this.getBindRecordList();
		}
	},

	methods: {
		// 判断当天是否有提交过信息
		getTodayMsg() {
			const { hospitalId } = this;
			if (!hospitalId) return;
			const params = {
				hospitalId,
				recordId: this.selRecord.id
			};
			checkTodayPreMsg(params).then(({ data }) => {
				const { submitId, id } = data;
				this.preSubmitId = submitId;
				this.preId = id;
				if (id) {
					this.getDetail(submitId);
				} else {
					this.loading = false;
				}
			});
		},

		//查询填写详情
		getDetail(id) {
			this.loading = true;
			getVoteDetil({ id, itemId: this.id })
				.then(({ data = '{}' }) => {
					let form = JSON.parse(data).form || {};
					for (let key in form) {
						let value = isNaN(+form[key]) ? form[key] : +form[key];
						this.$set(this.form, key, value);
						this.loading = false;
						if (key == 71 && value == 321) {
							this.$nextTick(() => {
								this.changeValue(value, key);
							});
						}
					}
				})
				.finally(() => (this.loading = false));
		},

		getHospitalId(url) {
			let tempArr = url.split('?');
			if (tempArr.length === 1) {
				return '';
			}
			let id = tempArr[1].split('=')[1];
			return id;
		},

		/** 获取当前登录用户已绑电子健康卡 */
		getBindRecordList() {
			refreshCardList().then(({ data = [], code = 100 }) => {
				this.bindRecordArr = data;
				if (code === 100) {
					return;
				}
				if (data.length === 0) {
					uni.showModal({
						title: '提示',
						content: '请先绑定电子健康卡再进行相应操作！',
						showCancel: false,
						success: res => {
							if (res.confirm) {
								this.toBindCard();
							}
						}
					});
				} else {
					this.selRecord.id = data[0].id;
					this.selRecord.name = data[0].name;
					this.selRecord.idCard = data[0].idCard;
					this.selRecord.phone = data[0].mobile;
					this.init();
				}
			});
		},

		/** 验证是否获取微信用户信息 */
		isAuth() {
			uni.redirectTo({
				url: '/pagesA/auth/auth?fromPage=zqwj'
			});
		},

		/** 绑卡 */
		toBindCard() {
			uni.redirectTo({
				url: '/pagesA/card/bindCard?fromPage=zqwj'
			});
		},

		/**
		 * 选择就诊卡
		 * @param {Object} record 就诊卡
		 */
		chooseRecord(record) {
			const { phoneKey, nameKey, idCardKey } = this;
			const { id = '', name = '', idCard = '', mobile = '' } = record;
			this.loading = true;
			this.disabled = false;
			for (let key in this.form) {
				this.form[key] = '';
			}
			this.selRecord.id = id;
			this.selRecord.name = name;
			this.selRecord.idCard = idCard;
			this.selRecord.phone = mobile;
			this.$refs.uDropdown.close();
			this.form[phoneKey] = mobile;
			this.form[nameKey] = name;
			this.form[idCardKey] = idCard;
			this.getTodayMsg();
		},

		changeValue(childId, id) {
			this.form[id] = childId;
			if (id == 71 && childId == 321) {
				// 是否有下列症状选择的是否
				this.form[72] = 323;
				this.form[73] = 325;
				this.form[74] = 327;
				this.form[75] = 329;
				this.disabled = true;
			} else if (id == 71 && childId == 320) {
				this.form[72] = undefined;
				this.form[73] = undefined;
				this.form[74] = undefined;
				this.form[75] = undefined;
				this.disabled = false;
			}
		},

		// 保存诊前就诊表
		async savePreMsg(submitId) {
			/***** 诊前录入消息保存 start */
			let preObj = {
				hospitalId: this.hospitalId,
				recordId: this.selRecord.id,
				submitId
			};
			if (this.preId) {
				preObj.id = this.preId;
			}
			await savePreMsg(preObj);
			/***** 诊前录入消息保存 end */
		},

		// 更新诊前就诊表
		async updatePreMsg() {
			/***** 诊前录入消息保存 start */
			let updateObj = {
				submitId: this.preSubmitId,
				itemId: this.vote.id,
				form: this.form
			};
			await updatePreMsg(updateObj);
			/***** 诊前录入消息保存 end */
		},

		// 提交
		async submit() {
			let title;
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

			// 判断是否当天填写过该表，填写过则直接更新，不新增
			if (this.preId) {
				this.submitLoading = true;
				await this.savePreMsg(this.preSubmitId);
				await this.updatePreMsg();
				this.submitCallback();
				return;
			}

			this.submitLoading = true;
			const res = await savePreVoteSubmit({
				voteId: this.vote.id,
				memberId: this.sysUserId
			});
			let obj = {};
			if (res.code == 200) {
				/***** 诊前录入消息保存 start */
				await this.savePreMsg(res.data.id);
				/***** 诊前录入消息保存 end */
				obj.submitId = res.data.id;
				obj.itemId = this.vote.id;
				obj.form = this.form;
				const step2 = await saveVoteItem(obj);
				if (step2.code == 200) {
					this.submitCallback();
				}
			}
		},

		submitCallback() {
			this.$refs.uNotify.show({
				message: '提交成功',
				type: 'success',
				duration: '1500'
			});
			this.submitLoading = false;
			setTimeout(() => {
				uni.navigateTo({
					url: `./successPage?recordId=${this.selRecord.id}`
				});
			}, 1500);
		},

		onCheckGroupChange(e, id) {
			this.form[id] = e.toString();
		},

		async init() {
			this.loading = true;
			const res = await getVote(this.id);
			if (res.code == 200) {
				this.vote = res.data;
				this.vote.questionResps.forEach(item => {
					this.form[item.id] = '';
					// 记录姓名、身份证号、手机号的key值，以便切换就诊卡时自动赋值
					const { name = '', idCard = '', phone = '' } = this.selRecord;
					if (item.title === '姓名') {
						this.nameKey = item.id;
						this.form[item.id] = name;
					} else if (item.title === '身份证号') {
						this.idCardKey = item.id;
						this.form[item.id] = idCard;
					} else if (item.title === '手机') {
						this.phoneKey = item.id;
						this.form[item.id] = phone;
					}
				});
				await this.getTodayMsg();
				this.$nextTick(() => {
					this.loading = false;
				});
			} else {
				this.vote = undefined;
			}
		}
	}
};
</script>

<style lang="scss">
.pre-entry-msg-form {
	.dropdown-box {
		background: #4298ff;
		color: #ffffff;
		padding-top: 40rpx;

		.menu-info {
			margin-left: 40rpx;
			margin-bottom: -60rpx;
		}

		.u-dropdown__menu__item {
			justify-content: flex-end !important;
			padding-right: 40rpx;
		}

		.record-item {
			background-color: #ffffff;
			padding: 20rpx;
			display: flex;
			justify-content: space-between;
			color: #666666;
		}

		.sel-item {
			color: $uni-5383f9;
		}
	}
}

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
		height: 100px;
	}
}

.flex-right-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #fff;
	margin: 20rpx 0 10rpx 0;

	.light-box {
		display: flex;
		background-color: #4298ff;
		padding: 6rpx 12rpx;
		border-radius: 0 50rpx 50rpx 0;
	}

	.to-bind-card {
		color: #2979ff;
		display: flex;
		padding: 8rpx 14rpx;
		margin-right: 12rpx;
		font-size: 24rpx;
		border: 2rpx solid #2979ff;
		border-radius: 36rpx;

		text {
			margin-left: 10rpx;
		}
	}
}

textarea {
	width: 700rpx;
	height: 80rpx;
	line-height: 140%;
}
</style>
