<template>
	<view class="page">
		<u-notify ref="uNotify" />

		<view style="padding: 60rpx 20rpx">
			<input v-if="fieldType == 'name'" maxlength="10" type="text" v-model="form.name" placeholder="请输入账号名" />
			<input v-if="fieldType == 'email'" type="text" v-model="form.email" placeholder="请输入用户邮箱" />
		</view>

		<u-button
			type="primary"
			:loading="loading"
			@click="editMember"
			text="确认修改"
			:disabled="fieldType == 'name' ? form.name.trim().length == 0 : form.email.trim().length == 0"
		/>
	</view>
</template>

<script>
import { editMember } from '@/common/http/api.js';

export default {
	data() {
		return {
			fieldType: '',
			form: {
				id: uni.getStorageSync('sysUser').id,
				name: '',
				email: ''
			},
			loading: false
		};
	},
	onLoad(options) {
		this.fieldType = options.fieldType;
		const fieldValue = options.fieldValue;
		switch (this.fieldType) {
			case 'name':
				uni.setNavigationBarTitle({ title: '修改账号名' });
				this.form.name = fieldValue;
				this.form.email = undefined;
				break;
			case 'email':
				uni.setNavigationBarTitle({ title: '修改邮箱' });
				this.form.name = undefined;
				this.form.email = fieldValue;
				break;
		}
	},

	methods: {
		/** 修改用户信息 */
		async editMember() {
			if (this.fieldType == 'email' && !uni.$u.test.email(this.form.email)) {
				this.$refs.uNotify.show({
					message: '邮箱号格式不正确',
					type: 'error',
					duration: '1500'
				});
				return;
			}

			this.loading = true;
			const { code } = await editMember(this.form);
			this.loading = false;
			if (code == 200) {
				this.$refs.uNotify.show({
					message: '更新成功',
					type: 'success',
					duration: '2300'
				});
				setTimeout(() => {
					uni.$emit('refreshMember'); // 通知我的页面刷新
					uni.navigateBack();
				}, 1000);
			}
		}
	}
};
</script>

<style lang="scss">
.page {
	margin: 20rpx;

	input {
		padding: 20rpx;
		border-bottom: 1px solid #d5d5d5;
	}
}
</style>
