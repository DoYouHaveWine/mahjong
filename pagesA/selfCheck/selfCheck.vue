<template>
	<view @click="isLoc">
		<!-- 搜索 -->
		<view class="search-box">
			<u-search
				shape="round"
				placeholder="搜索症状"
				@search="toSearch"
				v-model="searchVal"
				:show-action="false"
				margin="0 20rpx 0 20rpx"
			/>
		</view>

		<!-- Tabs -->
		<u-tabs :list="tabList" :scrollable="false" :current="currentTabIndex" @change="changeTab" lineWidth="100" />

		<!-- 按人体 -->
		<view v-if="currentTabIndex === 0" class="body-box">
			<view class="img-wrap"><image :src="imgSrc" /></view>
			<view class="pos " v-show="personType == 1">
				<view v-show="direction == 1" class="tou" @click="openMenu($event, 1)" />
				<view v-show="direction == 1" class="jin" @click="openMenu($event, 2)" />
				<view v-show="direction == 1" class="shou l" @click="openMenu($event, 3)" />
				<view v-show="direction == 1" class="shou r" @click="openMenu($event, 3)" />
				<view v-show="direction == 1" class="xiong" @click="openMenu($event, 4)" />
				<view v-show="direction == 1" class="fu" @click="openMenu($event, 5)" />
				<view v-show="direction == 1" class="kuan" @click="openMenu($event, 6)" />
				<view v-show="direction == 1" class="xiazhi l" @click="openMenu($event, 7)" />
				<view v-show="direction == 1" class="xiazhi r" @click="openMenu($event, 7)" />
				<view v-show="direction == 2" class="beibu" @click="openMenu($event, 8)" />
				<view v-show="direction == 2" class="yaobu" @click="openMenu($event, 9)" />
				<view v-show="direction == 2" class="tunbu" @click="openMenu($event, 10)" />
			</view>
			<view class="pos " v-show="personType == 2">
				<view v-show="direction == 1" class="tou" @click="openMenu($event, 1)" />
				<view v-show="direction == 1" class="jin" @click="openMenu($event, 2)" />
				<view v-show="direction == 1" class="shou l" @click="openMenu($event, 3)" />
				<view v-show="direction == 1" class="shou r" @click="openMenu($event, 3)" />
				<view v-show="direction == 1" class="xiong" @click="openMenu($event, 4)" />
				<view v-show="direction == 1" class="fu" @click="openMenu($event, 5)" />
				<view v-show="direction == 1" class="kuan" @click="openMenu($event, 6)" />
				<view v-show="direction == 1" class="xiazhi l" @click="openMenu($event, 7)" />
				<view v-show="direction == 1" class="xiazhi r" @click="openMenu($event, 7)" />
				<view v-show="direction == 2" class="beibu" @click="openMenu($event, 8)" />
				<view v-show="direction == 2" class="yaobu" @click="openMenu($event, 9)" />
				<view v-show="direction == 2" class="tunbu" @click="openMenu($event, 10)" />
			</view>
			<view class="pos er" v-show="personType == 3">
				<view v-show="direction == 1" class="tou" @click="openMenu($event, 1)" />
				<view v-show="direction == 1" class="jin" @click="openMenu($event, 2)" />
				<view v-show="direction == 1" class="shou l" @click="openMenu($event, 3)" />
				<view v-show="direction == 1" class="shou r" @click="openMenu($event, 3)" />
				<view v-show="direction == 1" class="xiong" @click="openMenu($event, 4)" />
				<view v-show="direction == 1" class="fu" @click="openMenu($event, 5)" />
				<view v-show="direction == 1" class="kuan" @click="openMenu($event, 6)" />
				<view v-show="direction == 1" class="xiazhi l" @click="openMenu($event, 7)" />
				<view v-show="direction == 1" class="xiazhi r" @click="openMenu($event, 7)" />
				<view v-show="direction == 2" class="beibu" @click="openMenu($event, 8)" />
				<view v-show="direction == 2" class="yaobu" @click="openMenu($event, 9)" />
				<view v-show="direction == 2" class="tunbu" @click="openMenu($event, 10)" />
			</view>

			<view class="before-after crd">
				<text>前</text>
				<u-switch size="20" v-model="febe" />
				<text>后</text>
			</view>
			<view class="man-woman crd">
				<view :class="[index == act ? 'avt' : '']" @click="changeSex(item, index)" :key="index" v-for="(item, index) in sex">
					{{ item.text }}
				</view>
			</view>
		</view>

		<!-- 按部位 -->
		<template v-if="currentTabIndex === 1">
			<u-cell v-for="(item, index) in newsList" :key="index" :title="item.name" isLink @click="chooseBodyList(item)" />
		</template>

		<view class="context-menu" v-show="visible" :style="{ left: left + 'px', top: top + 'px' }">
			<u-cell v-for="item in menusList" :key="item.id" :title="item.name" isLink @click="chooseBody(item)" />
		</view>
	</view>
</template>

<script>
import { getBodyInfo } from '@/common/http/api.js';
export default {
	data() {
		return {
			searchVal: '',
			personType: 1,
			direction: 1,
			febe: false,
			act: 0,
			imgSrc: 'https://app-img.zuoshouyisheng.com/huatuo/man_z.png',

			newsList: [],
			menusList: [],

			tabList: [{ name: '按人体' }, { name: '按部位' }],
			currentTabIndex: 0,

			sex: [
				{
					text: '男',
					id: 1
				},
				{
					text: '女',
					id: 2
				},
				{
					text: '童',
					id: 3
				}
			],

			visible: false,
			top: 0,
			left: 0
		};
	},
	watch: {
		febe(val) {
			this.setImgSrc();
			this.direction = val ? 2 : 1;
			this.getList();
		}
	},
	onLoad() {
		this.getList();
		// #ifdef H5
		this.docclick();
		// #endif
	},
	methods: {
		toSearch() {
			if (this.searchVal) {
				uni.navigateTo({ url: './search?searchValue=' + this.searchVal });
			}
		},

		/**
		 * 切换Tab
		 * @param {Int} index Tab的Index
		 */
		changeTab({ index }) {
			this.currentTabIndex = index;
		},

		isLoc(e) {
			var { x, y } = e.detail;
			console.log('x', x);
			console.log('y', y);
			if (x < 90 || x > 240 || y < 130) {
				this.closeMenu();
			}
		},
		docclick() {
			document.addEventListener('click', e => {
				var x = e.clientX,
					y = e.clientY;
				console.log('点击x', x);
				console.log('点击y', y);
				if (x < 90 || x > 240 || y < 130) {
					this.closeMenu();
				}
			});
		},
		async getList(opt) {
			var data = {
				direction: this.direction,
				personType: this.personType,
				...opt
			};
			var rs = await getBodyInfo(data);
			this.newsList = rs.data;
		},
		changeSex(row, idx) {
			this.act = idx;
			this.personType = row.id;
			this.setImgSrc();
			this.getList();
		},

		async openMenu(e, pid) {
			this.left = e.detail.x;
			this.top = e.detail.y;
			this.visible = true;

			let { data } = await getBodyInfo({ pid });
			this.menusList = data;
		},
		closeMenu() {
			this.visible = false;
		},
		chooseBodyList(row) {
			uni.navigateTo({
				url: './symptomList?personType=' + this.personType + '&partId=' + row.id
			});
		},
		chooseBody(row) {
			this.closeMenu();
			uni.navigateTo({
				url: './symptomList?personType=' + this.personType + '&partId=' + row.id
			});
		},

		setImgSrc() {
			if (this.personType === 1) {
				this.imgSrc = this.febe
					? 'https://app-img.zuoshouyisheng.com/huatuo/man_b.png'
					: 'https://app-img.zuoshouyisheng.com/huatuo/man_z.png';
			}

			if (this.personType === 2) {
				this.imgSrc = this.febe
					? 'https://app-img.zuoshouyisheng.com/huatuo/woman_b.png'
					: 'https://app-img.zuoshouyisheng.com/huatuo/woman_z.png';
			}

			if (this.personType === 3) {
				this.imgSrc = this.febe
					? 'https://app-img.zuoshouyisheng.com/huatuo/kid_b.png'
					: 'https://app-img.zuoshouyisheng.com/huatuo/kid_z.png';
			}
		}
	}
};
</script>

<style lang="scss">
.search-box {
	width: 100%;
	background-color: #4298ff;
	padding: 20rpx 0;
}

.body-box {
	margin-top: -30rpx;
	position: relative;
	.img-wrap {
		height: calc(100vh - 100rpx);
		position: relative;

		image {
			height: 100%;
		}
	}

	.pos {
		height: calc(100vh - 46px);
		position: absolute;
		left: -11%;
		top: 0;
		width: 100%;

		view {
			position: absolute;
		}

		.tou {
			left: 50%;
			top: 7%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			width: 13%;
			height: 68px;
		}

		.jin {
			left: 50%;
			top: 16%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			width: 10%;
			height: 38px;
		}

		.shou {
			top: 23%;
			height: 260px;
		}

		.shou.l {
			left: 32%;
			-webkit-transform: translateX(-32%);
			transform: translateX(-32%);
			width: 8%;
		}

		.shou.r {
			left: 67%;
			-webkit-transform: translateX(-69%);
			transform: translateX(-69%);
			width: 8%;
		}

		.xiong {
			left: 50%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			top: 22%;
			width: 24%;
			height: 78px;
		}

		.beibu {
			left: 50%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			top: 22%;
			width: 24%;
			height: 104px;
		}

		.yaobu {
			left: 50%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			top: 37%;
			width: 20%;
			height: 60px;
		}

		.tunbu {
			left: 50%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			top: 46%;
			width: 22%;
			height: 50px;
		}

		.fu {
			left: 50%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			top: 35%;
			width: 20%;
			height: 82px;
		}

		.kuan {
			left: 50%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			top: 46%;
			width: 24%;
			height: 54px;
		}

		.xiazhi {
			left: 50%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			top: 54%;
			height: 280px;
		}

		.xiazhi.l {
			-webkit-transform: translateX(-42%);
			transform: translateX(-42%);
			left: 42%;
			width: 12%;
		}

		.xiazhi.r {
			-webkit-transform: translateX(-58%);
			transform: translateX(-58%);
			left: 58%;
			width: 12%;
		}
	}

	.er {
		.tou {
			left: 53%;
			-webkit-transform: translateX(-53%);
			transform: translateX(-53%);
			top: 22%;
			width: 38%;
			height: 168px;
		}

		.jin {
			left: 52%;
			-webkit-transform: translateX(-52%);
			transform: translateX(-52%);
			top: 46%;
			width: 14%;
			height: 45px;
		}

		.shou {
			top: 50%;
			height: 70px;
		}

		.shou.l {
			left: 32%;
			-webkit-transform: translateX(-32%);
			transform: translateX(-32%);
			width: 12%;
		}

		.shou.r {
			left: 70%;
			-webkit-transform: translateX(-69%);
			transform: translateX(-69%);
			width: 9%;
			height: 130px;
		}

		.xiong {
			left: 52%;
			-webkit-transform: translateX(-52%);
			transform: translateX(-52%);
			top: 53%;
			width: 17%;
			height: 28px;
		}

		.beibu {
			left: 53%;
			-webkit-transform: translateX(-53%);
			transform: translateX(-53%);
			top: 50%;
			width: 20%;
			height: 60px;
		}

		.yaobu {
			left: 53%;
			-webkit-transform: translateX(-53%);
			transform: translateX(-53%);
			top: 60%;
			width: 22%;
			height: 14px;
		}

		.tunbu {
			left: 53%;
			-webkit-transform: translateX(-53%);
			transform: translateX(-53%);
			top: 63%;
			width: 22%;
			height: 50px;
		}

		.fu {
			left: 52%;
			-webkit-transform: translateX(-52%);
			transform: translateX(-52%);
			top: 58%;
			width: 20%;
			height: 24px;
		}

		.kuan {
			left: 52%;
			-webkit-transform: translateX(-52%);
			transform: translateX(-52%);
			top: 62%;
			width: 24%;
			height: 54px;
		}

		.xiazhi {
			top: 70%;
			height: 80px;
		}

		.xiazhi.l {
			-webkit-transform: translateX(-46%);
			transform: translateX(-46%);
			left: 46%;
			width: 8%;
		}

		.xiazhi.r {
			-webkit-transform: translateX(-58%);
			transform: translateX(-58%);
			left: 58%;
			width: 8%;
		}
	}

	.before-after {
		display: flex;
		align-items: center;
		top: 80rpx;

		.u-switch {
			margin: 0 20rpx;
		}
	}

	.man-woman {
		bottom: 100rpx;
		color: #03a9f4;
		text-align: center;

		view {
			line-height: 26px;
			margin: 10px 0;
			width: 26px;
			height: 26px;
			border-radius: 50%;
		}

		view.avt {
			margin: 10px 0;
			color: #fff;
			background: #03a9f4;
		}
	}

	.crd {
		position: absolute;
		right: 20px;
		font-size: 18px;
	}
}

.context-menu {
	position: absolute;
	width: 200rpx !important;
	background-color: #eee;
}
</style>
