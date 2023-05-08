<!-- 集成加载框和空列表的组件 -->
<!-- 项目中使用加载框尽量不要使用uni.showLoading,因为uni.hideLoading会导致toast也消失 -->
<template>
	<view class="box">
		<u-empty icon="/static/ic_empty.png" :text="emptyText" :show="!loading && !onlyShowLoading" :marginTop="emptyViewMarginTop" />

		<template v-if="isLoadingDialog">
			<u-modal :show="loading" width="250rpx" :showConfirmButton="false" :zoom="false">
				<view class="loading-modal"><u-loading-icon :show="loading" vertical :text="loadingText" textSize="13" /></view>
			</u-modal>
		</template>

		<template v-else>
			<view class="loading"><u-loading-icon :show="loading" vertical :text="loadingText" /></view>
		</template>
	</view>
</template>

<script>
export default {
	props: {
		loading: {
			type: [Boolean, String],
			default: true
		},
		loadingText: {
			type: [String],
			default: '加载中...'
		},
		emptyText: {
			type: [String],
			default: '暂无数据'
		},
		emptyViewMarginTop: {
			type: [String, Number],
			default: '150rpx'
		},
		// 是否是弹窗类型的dialog,弹窗类型的在请求时用户不能操作
		// 由于用户弹窗时不能交互，切记处理请求出错时记得关闭弹窗
		isLoadingDialog: {
			type: [Boolean],
			default: false
		},
		// 仅仅展示加载框，不展示空布局，常用来展示loading
		onlyShowLoading: {
			type: [Boolean],
			default: false
		}
	}
};
</script>

<style lang="scss">
.box {
	display: flex;
	flex-direction: column;
	align-items: center;

	.loading-modal {
		height: 100rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.loading {
		margin-top: 100rpx;
	}
}
</style>
