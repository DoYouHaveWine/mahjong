<template>
	<view>
		<!-- 搜索 -->
		<view class="search-box">
			<u-search
				placeholder="搜索医生或医疗机构"
				@search="onSearch"
				v-model="opt.name"
				placeholderColor="#adadad"
				searchIconColor="#adadad"
				:show-action="false"
				margin="0 20rpx 0 20rpx"
			/>
		</view>

		<view
			class="hos-content"
			:class="[
				!(dataList.hospitals && dataList.hospitals.length) &&
				!(dataList.doctors && dataList.doctors.length) &&
				!(dataList.departments && dataList.departments.length)
					? 'tx_center'
					: ''
			]"
		>
			<load-data
				v-if="
					!(dataList.hospitals && dataList.hospitals.length) &&
						!(dataList.doctors && dataList.doctors.length) &&
						!(dataList.departments && dataList.departments.length)
				"
				:loading="loading"
			/>
			<view class="hos-list-wrap" v-else>
				<view>
					<view v-if="dataList.hospitals && dataList.hospitals.length">
						<view class="title">医院 约{{ dataList.hospitals && dataList.hospitals.length }}个结果</view>
						<u-cell-group>
							<template v-for="(item, index) in dataList.hospitals">
								<u-cell @click="onItemClick(item, 'hospital')" center :key="index" v-if="index < hospitalsLength">
									<view slot="icon" class="ico">
										<u-image shape="circle" width="50px" height="50px" :src="serverUrl + item.logo" v-if="item.logo" />
										<image v-else src="/static/social/ic_hospital.svg" />
									</view>
									<view slot="title">{{ item.name }}</view>
									<view slot="label">
										<text>{{ item.levelName }}</text>
										<text>\n</text>
										<text>{{ item.address }}</text>
									</view>
									<view slot="value">{{ item.distanceText }}</view>
								</u-cell>
							</template>
						</u-cell-group>
						<view @click="moreHospitals" class="more" v-if="dataList.hospitals && hospitalsLength <= dataList.hospitals.length">
							加载更多>
						</view>
					</view>

					<view v-if="dataList.doctors && dataList.doctors.length">
						<view class="title">医生 约{{ dataList.doctors && dataList.doctors.length }}个结果</view>
						<u-cell-group>
							<template v-for="(item, index) in dataList.doctors">
								<u-cell
									@click="onItemClick(item, 'doctor')"
									use-label-slot
									center
									:key="index"
									v-if="index < doctorsLength"
								>
									<view slot="icon" class="ico">
										<u-image
											shape="circle"
											width="50px"
											height="50px"
											:src="serverUrl + item.avatar"
											v-if="item.avatar"
										/>
										<image v-else src="../static/hospital/ic_doctor.svg" />
									</view>
									<view slot="title">{{ item.name }}</view>
									<view slot="label">
										<view>{{ item.hospitalName }}</view>
										<view>{{ item.deptName }}</view>
										<view>{{ item.intro }}</view>
									</view>
								</u-cell>
							</template>
						</u-cell-group>
						<view @click="moreDoctors" class="more" v-if="dataList.doctors && doctorsLength <= dataList.doctors.length">
							加载更多>
						</view>
					</view>

					<view v-if="dataList.departments && dataList.departments.length">
						<view class="title">科室 约{{ dataList.departments && dataList.departments.length }}个结果</view>
						<u-cell-group>
							<template v-for="(item, index) in dataList.departments">
								<u-cell @click="onItemClick(item, 'dept')" center :key="index" v-if="index < departmentsLength">
									<view slot="icon" class="ico">
										<u-image
											shape="circle"
											width="50px"
											height="50px"
											:src="serverUrl + item.image"
											v-if="item.image"
										/>
										<image src="../static/hospital/ic_dept.svg" v-else />
									</view>
									<view slot="title">{{ item.name || '' }}</view>
									<view slot="label">
										<text>{{ item.hospitalName || '' }}</text>
										<text>\n</text>
										<text>{{ item.address || '' }}</text>
									</view>
									<view slot="value">{{ item.distanceText || '' }}</view>
								</u-cell>
							</template>
						</u-cell-group>
					</view>
					<view
						@click="moreDepartments"
						class="more"
						v-if="dataList.departments && departmentsLength <= dataList.departments.length"
					>
						加载更多>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getSearchHos } from '@/common/http/api.js';
import dayjs from 'dayjs';
export default {
	data() {
		return {
			hospitalsLength: 10,
			doctorsLength: 10,
			departmentsLength: 10,
			opt: {
				name: '',
				// 所属地区
				districtName: '',
				district: '',
				// 纬度
				lat: '',
				// 经度
				lng: '',
				// 是否按距离排序
				nearest: 1,
				// 医院等级
				level: [],
				// 行政级别
				adminLevel: [],
				// 医院类型
				type: []
			},
			loading: true,

			dataList: {
				departments: [],
				doctors: [],
				hospitals: []
			}
		};
	},

	onLoad(option) {
		this.opt.name = option.searchValue;
		this.getLoc();
	},

	methods: {
		moreHospitals() {
			if (this.hospitalsLength <= this.dataList.hospitals.length) {
				this.hospitalsLength = this.hospitalsLength + 10;
			}
		},

		moreDoctors() {
			if (this.doctorsLength <= this.dataList.doctors.length) {
				this.doctorsLength = this.doctorsLength + 10;
			}
		},

		moreDepartments() {
			if (this.departmentsLength <= this.dataList.departments.length) {
				this.departmentsLength = this.departmentsLength + 10;
			}
		},

		getLoc() {
			uni.getLocation({
				type: 'wgs84',
				success: res => {
					this.opt.lng = res.longitude;
					this.opt.lat = res.latitude;
					this.getList();
				},
				fail: () => {
					uni.showModal({
						title: '获取定位失败',
						content: '计算医院距离需要获取定位，请打开GPS开关后重试！',
						showCancel: false
					});
				}
			});
		},

		async getList() {
			this.loading = true;
			let { data } = await getSearchHos(this.opt);
			this.dataList = data;
			this.loading = false;
		},

		onSearch() {
			this.getList();
		},

		/** 医院/科室/医生item项点击 */
		onItemClick(item, type) {
			switch (type) {
				case 'hospital':
					uni.navigateTo({
						url: `../hospital/deptList?hospitalId=${item.id}`
					});
					break;
				case 'dept':
					uni.navigateTo({
						url: `../hospital/doctorList?hospitalId=${item.hospitalId}&deptId=${item.id}`
					});
					break;
				case 'doctor':
					uni.navigateTo({
						url: `../hospital/doctorList?hospitalId=${item.hospitalId}&deptId=${item.deptId}&doctorName=${item.name}`
					});
					break;
			}
		}
	}
};
</script>

<style lang="scss">
.search-box {
	width: 100%;
	background-color: $uni-color-primary;
	padding: 20rpx 0;
}

.title {
	font-size: 16px;
	margin: 20rpx 0;
}

.hos-list-wrap {
	margin: 20rpx;

	.ico {
		margin-right: 20rpx;

		image {
			width: 110rpx;
			height: 110rpx;
		}
	}
}

.more {
	text-align: center;
	color: #5383f9;
	padding: 12rpx 0;
}
</style>
