<template>
	<view>
		<u-notify ref="uNotify" />

		<view class="search-box">
			<u-search
				height="80rpx"
				v-model="form.name"
				@search="reloadData"
				placeholder="搜索医生"
				:inputStyle="{ fontSize: '26rpx' }"
				:showAction="false"
				placeholderColor="#adadad"
				bgColor="#fff"
			/>
		</view>

		<view class="time-box">
			<view class="time-top">
				<view class="sel-box"><uni-data-select v-model="selDeptId" :localdata="deptList" /></view>
				<text class="dividing-line">｜</text>
				<view class="checked-box">
					<text :class="{ 'is-check': form.hasNum }" @click="form.hasNum = !form.hasNum">只看有号</text>
					<u-switch v-model="form.hasNum" size="12" activeColor="#4298ff" inactiveColor="#e5e7eb"></u-switch>
				</view>
			</view>
			<view class="mt5 f-14 c-99 plr-20" v-if="clickedItem.intro">
				<u-text 
				:lines="2" 
				@click="showHosIntroduce"
				size="14"
				color="#999999"
				:text="'科室简介:'+clickedItem.intro"></u-text>
			</view>
			<view class="time-bottom mt5">
				<u-scroll-list :indicator="false">
					<view
						@click="changeDate(i, item.date)"
						:class="['time-item', { 'active-item': activeIndex === i }]"
						v-for="(item, i) in dateList"
						:key="item.date"
					>
						<view class="date">{{ item.date.substring(5, 10) }}</view>
						<view class="week">{{ item.week }}</view>
						<view :class="['source', { 'has-source': item.hasSource === 1 }]">
							{{ item.hasSource === 1 ? '有号' : '无号' }}
						</view>
					</view>
				</u-scroll-list>
			</view>
		</view>

		<view class="doctor-list">
			<template v-if="doctorList.length">
				<view class="doctor-item" @click="chooseDoctor(item)" v-for="item in doctorList" :key="item.id">
					<view class="collect-box" @click.stop="collectDoctor(item)">
						<template v-if="!item.favoriteFlg">
							<u-icon name="heart" color="rgba(15, 20, 25, 0.5)" size="32rpx"></u-icon>
							<text>未关注</text>
						</template>
						<template v-else>
							<u-icon name="heart-fill" color="#ff6262" size="32rpx"></u-icon>
							<text class="has-collect">已关注</text>
						</template>
					</view>
					<view class="doctor-image">
						<image v-if="item.avatar" :src="serverUrl + item.avatar"></image>
						<image v-else src="../static/hospital/ic_doctor.svg"></image>
					</view>
					<view class="doctor-content">
						<view class="doctor-info">
							<view class="doctor-level">
								<text class="name">{{ item.name }}</text>
								<text class="level" v-if="item.title">{{ item.title }}</text>
							</view>
							<view class="doctor-job">
								<text class="tiny-text">擅长：</text>
								<text>{{ item.special || '' }}</text>
							</view>
						</view>
						<view class="doctor-pay">
							<text class="money">¥{{ item.unitPrice || 0 }}</text>
							<text class="num">{{ item.availableCount > 0 ? '余' + item.availableCount : '已约满' }}</text>
						</view>
					</view>
				</view>
			</template>
			<!-- 使用弹窗Dialog是避免请求时切换tab，数据会混乱 -->
			<load-data v-else :loading="loading" emptyText="暂无排班" isLoadingDialog />
		</view>

		<!-- popup -->
		<u-popup :show="modelShow" :round="10" mode="bottom" @close="close" @open="open">
			<view class="sel-source-box plr-10 ptb-10">
				<view class="just-between align-center">
					<text></text>
					<text class="f-20 fb">选择预约时间段</text>
					<text @click="close" class="f-20 fb c-99">×</text>
				</view>
				<template
					v-if="
						!sourceLoading && (morningSourceList.length != 0 || afternoonSourceList.length != 0 || allDaySourceList.length != 0)
					"
				>
					<view class="max-h">
						<view class="mt20" v-if="morningSourceList.length !== 0">
							<text class="title">上午号源</text>
							<view class="source-box">
								<template v-for="(item, index) in morningSourceList">
									<view
										:key="item.id"
										:class="[
											'source-item mt15',
											{ 'active-source-item': `${item.id}${item.beginTime}${item.endTime}` == activeSourceIndex },
											{ 'disabled-item': item.availableCount == 0 }
										]"
										@click="chooseTime(item)"
									>
										<view class="">{{ item.beginTime }}-{{ item.endTime }}</view>
										<view class="">剩余{{ item.availableCount }}</view>
									</view>
								</template>
							</view>
						</view>
						<view class="mt20" v-if="afternoonSourceList.length !== 0">
							<text class="title">下午号源</text>
							<view class="source-box">
								<template v-for="(item, index) in afternoonSourceList">
									<view
										:key="item.id"
										:class="[
											'source-item mt15',
											{ 'active-source-item': `${item.id}${item.beginTime}${item.endTime}` == activeSourceIndex },
											{ 'disabled-item': item.availableCount == 0 }
										]"
										@click="chooseTime(item)"
									>
										<view class="">{{ item.beginTime }}-{{ item.endTime }}</view>
										<view class="">剩余{{ item.availableCount }}</view>
									</view>
								</template>
							</view>
						</view>
						<view class="mt20" v-if="allDaySourceList.length !== 0">
							<view class="source-box">
								<template v-for="(item, index) in allDaySourceList">
									<!-- item.id(号源id)可能会有重复（全天包含上午下午，可能上午与下午的id重复） -->
									<view
										:key="index"
										:class="[
											'source-item mt15',
											{ 'active-source-item': `${item.id}${item.beginTime}${item.endTime}` == activeSourceIndex },
											{ 'disabled-item': item.availableCount == 0 }
										]"
										@click="chooseTime(item)"
									>
										<view class="">{{ item.beginTime }}-{{ item.endTime }}</view>
										<view class="">剩余{{ item.availableCount }}</view>
									</view>
								</template>
							</view>
						</view>
					</view>
					<view class="mt20">
						<u-button type="primary" shape="circle" @click="payTo(orderNum)" throttleTime="1000" block>
							确认预约
						</u-button>
					</view>
				</template>
				<load-data v-else :loading="sourceLoading" emptyText="暂无号源" />
			</view>
		</u-popup>
		<!-- 科室简介 -->
		<u-popup :show="showIntroduce" @close="close" closeable closeOnClickOverlay :round="10">
			<view class="tc f-18 fb ptb-10">{{clickedItem.text}}</view>
			<view class="plr-20 f-14 intro-box">
				<view>{{clickedItem.intro}}</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import dayjs from 'dayjs';
import { getDoctorList, getDeptListByhosId, getNumberList, getDayhaveSource, submitFavorite, cancelFavorite } from '@/common/http/api';
import uniDataSelect from '@/pagesA/components/uni-data-select.vue';
export default {
	components: { uniDataSelect	},
	data() {
		return {
			activeIndex: 0,
			activeSourceIndex: '',
			form: {
				name: '',
				hasNum: false,
				activeDate: ''
			},
			dateList: [],
			selDeptId: 0,
			deptList: [],
			maxDate: '',
			showCalendar: false,
			doctorList: [],
			loading: true,
			modelShow: false,
			morningSourceList: [],
			afternoonSourceList: [],
			allDaySourceList: [],
			sourceLoading: false,
			registerMsgObj: {},
			user: uni.getStorageSync('sysUser'),
			clickedItem:undefined,
			showIntroduce:false
		};
	},

	computed: {
		cardList() {
			return this.$store.state.cardList;
		}
	},

	watch: {
		selDeptId(newVal, oldVal) {
			this.reloadData();
			this.refreshClickedItem(newVal)
		},
		'form.hasNum': function(newVal, oldVal) {
			this.reloadData();
		}
	},

	onLoad(options) {
		this.registerMsgObj = options;
		const { deptId, doctorName, hospitalId } = options;
		this.form.name = doctorName || '';
		getDeptListByhosId({ hospitalId })
			.then(({ data = [] }) => {
				const arr = data || [];
				arr.forEach(({ name, id, intro }) => {
					this.deptList.push({ text: name, value: id, intro:intro });
					if(deptId==id){
						this.clickedItem = { text: name, value: id, intro:intro }
					}
				});
			})
			.catch(() => (this.loading = false));
		this.selDeptId = Number(deptId);
	},

	methods: {
		reloadData() {
			this.initDate();
		},
		
		refreshClickedItem(val){
			this.clickedItem = this.deptList.filter(item=>{
				return item.value==val
			})[0]
			console.log(this.clickedItem)
		},
		getData() {
			this.doctorList = [];
			const { selDeptId, form } = this;
			const { activeDate, name, hasNum } = form;
			const params = {
				day: activeDate,
				deptId: selDeptId,
				name,
				onlyHasNumber: hasNum ? 1 : 0
			};
			this.loading = true;
			getDoctorList(params)
				.then(({ data = [] }) => (this.doctorList = data))
				.finally(() => (this.loading = false));
		},

		initDate() {
			this.doctorList = [];
			this.dateList = [];
			const params = {
				beginDay: dayjs().format('YYYY-MM-DD'),
				endDay: dayjs()
					.add(6, 'day')
					.format('YYYY-MM-DD'),
				deptId: this.selDeptId,
				name: this.form.name
			};

			getDayhaveSource(params)
				.then(({ data = [] }) => {
					const weekArr = ['日', '一', '二', '三', '四', '五', '六'];
					for (let i = 0; i < 7; i++) {
						let obj = {
							week: `周${
								weekArr[
									dayjs()
										.add(i, 'day')
										.day()
								]
							}`,
							date: dayjs()
								.add(i, 'day')
								.format('YYYY-MM-DD'),
							hasSource: data[i].flag
						};
						if (i === 0) {
							obj.week = '今天';
						} else if (i === 1) {
							obj.week = '明天';
						}
						// 如果只看有号则只展示有号的日期，如果不是只看有号则展示7天内的所有日期
						if ((this.form.hasNum && data[i].flag === 1) || !this.form.hasNum) {
							this.dateList.push(obj);
						}
					}
					this.activeIndex = 0;
					if (this.dateList.length) {
						this.form.activeDate = this.dateList[0].date;
					}
					this.maxDate = dayjs()
						.add(6, 'day')
						.format('YYYY-MM-DD');
					this.getData();
				})
				.catch(() => (this.loading = false));
		},

		changeDate(i, date) {
			this.activeIndex = i;
			this.form.activeDate = date;
			this.getData();
		},

		chooseDoctor(item) {
			this.registerMsgObj.doctorId = item.id;
			this.registerMsgObj.doctorName = item.name;
			this.registerMsgObj.unitPrice = item.unitPrice;
			const params = {
				day: this.form.activeDate,
				doctorId: item.id
			};
			this.modelShow = true;
			this.sourceLoading = true;
			getNumberList(params)
				.then(({ data = {} }) => {
					const { afternoonScheduleList = [], morningScheduleList = [], allDayScheduleList = [] } = data || {};
					this.morningSourceList = morningScheduleList || [];
					this.afternoonSourceList = afternoonScheduleList || [];
					this.allDaySourceList = allDayScheduleList || [];
				})
				.finally(() => (this.sourceLoading = false));
		},

		close() {
			this.modelShow = false;
			this.showIntroduce = false
			this.activeSourceIndex = '';
			this.registerMsgObj.sourceId = '';
			this.registerMsgObj.timeText = '';
		},
		showHosIntroduce(){
			if(this.clickedItem.intro){
				this.showIntroduce = true
			}
		},
		open() {
			this.modelShow = true;
		},

		collectDoctor(item) {
			item.favoriteFlg = !item.favoriteFlg;
			let str = '';
			const params = {
				memberId: this.user.id,
				objectId: item.id,
				objectType: 3
			};
			if (item.favoriteFlg) {
				str = '收藏成功';
				submitFavorite(params);
			} else {
				str = '取消收藏成功';
				cancelFavorite(params);
			}
			this.$refs.uNotify.show({
				message: str,
				type: 'success',
				duration: '1000'
			});
		},

		chooseTime(item) {
			if (item.availableCount === 0) return;
			// 号源id可能会有重复，使用三个字段来对比
			this.activeSourceIndex = `${item.id}${item.beginTime}${item.endTime}`;
			this.registerMsgObj.sourceId = item.id;
			this.registerMsgObj.scheduleId = item.scheduleId;
			this.registerMsgObj.timeText = `${this.form.activeDate} ${item.beginTime}-${item.endTime}`;
		},

		payTo() {
			if (!this.registerMsgObj.sourceId) {
				this.$refs.uNotify.show({
					message: `请选择就诊时间`,
					type: 'error',
					duration: '2000'
				});
				return;
			}
			this.deptList.forEach(({ text, value }) => {
				if (value === this.selDeptId) {
					this.registerMsgObj.deptName = text;
					this.registerMsgObj.deptId = value;
					return;
				}
			});
			if (this.checkBindCard()) {
				uni.navigateTo({
					url: `./payConfirm?id=${this.registerMsgObj.sourceId}&scheduleId=${this.registerMsgObj.scheduleId}&doctorId=${this.registerMsgObj.doctorId}`
				});
			}
		},

		/** 检查是否绑定了电子健康卡 */
		checkBindCard() {
			if (this.cardList.length === 0) {
				uni.showModal({
					title: '提示',
					content: '请先绑定电子健康卡再进行相应操作！',
					success: res => {
						if (res.confirm) {
							uni.navigateTo({ url: '/pagesA/card/list' });
						}
					}
				});
				return false;
			}
			return true;
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;

	/deep/.u-scroll-list {
		padding-bottom: 0;
	}

	/deep/.u-scroll-list__indicator {
		margin-top: 14rpx;
	}

	.search-box {
		padding: 24rpx;
	}

	.time-box {
		background: #fff;

		.time-top {
			display: flex;
			font-size: 26rpx;
			align-items: center;
			border-bottom: 2rpx solid rgba(229, 231, 235, 0.5);
			padding: 5rpx 20rpx;

			.sel-box {
				width: 50%;
			}

			.dividing-line {
				color: #d9d9d9;
				transform: scale(0.8);
			}

			.checked-box {
				align-items: center;
				display: flex;
				color: #adadad;
				width: calc(50% - 4rpx);
				justify-content: center;

				> text {
					margin-right: 12rpx;
					transition: color 0.5s;
				}

				.is-check {
					color: #4298ff;
				}
			}
		}

		.time-bottom {
			padding: 29rpx 4rpx 18rpx 42rpx;
			position: relative;

			.time-item {
				border-radius: 16rpx;
				padding: 10rpx 18rpx;
				font-size: 24rpx;
				display: flex;
				flex-direction: column;
				text-align: center;

				> view {
					width: 78rpx;
				}

				.date {
					color: #0f1419;
				}

				.week {
					color: rgba(15, 20, 25, 0.5);
				}

				.source {
					font-size: 20rpx;
				}

				.has-source {
					color: #4298ff;
				}
			}

			.active-item {
				background: #4298ff;
				transition: all 0.4s;

				.date,
				.week,
				.source,
				.has-source {
					color: #fff;
					transition: all 0.2s;
				}
			}
		}
	}

	.doctor-list {
		padding: 0 34rpx;
		margin-top: 32rpx;

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
				> text {
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
					padding-bottom: 24rpx;
					border-bottom: 2rpx solid rgba(229, 231, 235, 0.5);
					margin-bottom: 16rpx;

					.doctor-level {
						margin-bottom: 16rpx;
						max-width: calc(100% - 132rpx);

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

				.doctor-pay {
					text-align: right;

					.money {
						color: #ed8c53;
						font-size: 24rpx;
						margin-right: 14rpx;
					}

					.num {
						padding: 4rpx 20rpx;
						color: #fff;
						font-size: 26rpx;
						background: #4298ff;
						border-radius: 64rpx;
					}
				}
			}
		}
	}

	.max-h {
		max-height: 60vh;
		overflow: auto;
	}

	.source-title {
		position: relative;

		&::after {
			width: 50%;
			height: 16rpx;
			opacity: 0.2;
			content: '';
			border-radius: 30rpx;
			background: #4298ff;
			position: absolute;
			bottom: -5rpx;
			left: 0;
		}
	}

	.source-box {
		flex-wrap: wrap;
		display: flex;

		.source-item {
			width: 30%;
			margin-right: 5%;
			border: 2rpx solid #e5e7eb;
			font-size: 24rpx;
			padding: 16rpx 29rpx;
			padding: 10rpx 18rpx;
			box-sizing: border-box;
			text-align: center;
			border-radius: 12rpx;

			&:nth-child(3n) {
				margin-right: 0;
			}
		}

		.active-source-item {
			border: 2rpx solid #4298ff;
			background: #4298ff;
			color: #fff;
			font-weight: bold;
		}

		.disabled-item {
			background: #d7dade;
			color: #909399;
		}
	}

	.title {
		position: relative;

		&::after {
			width: 50%;
			height: 16rpx;
			opacity: 0.2;
			content: '';
			border-radius: 30rpx;
			background: #4298ff;
			position: absolute;
			bottom: -5rpx;
			left: 0;
		}
	}
	.intro-box{
		height: 65vh;
		overflow-y: scroll;
	}
}
</style>
