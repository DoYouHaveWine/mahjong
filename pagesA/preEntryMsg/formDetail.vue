<template>
	<view class="pre-entry-msg-form">
		<view class="content">
			<view v-if="vote">
				<view class="title">{{ vote.name }}</view>
				<u-form label-position="top" :model="form" ref="uForm" labelWidth="auto">
					<u-form-item v-for="(item, index) in vote.questionResps" :key="item.id" :label="index + 1 + '.' + item.title">
						<view>
							<u-radio-group v-if="item.subjectType == 1" v-model="form[item.id]" placement="column">
								<view v-for="(child, childIndex) in item.questionItemResp" :key="childIndex" class="answer-item">
									<u-radio disabled :name="child.id" :label="child.text" />
								</view>
							</u-radio-group>
							<u-checkbox-group v-if="item.subjectType == 2" placement="column">
								<view
									v-for="(child, childIndex) in item.questionItemResp"
									:key="childIndex"
									:name="child.id"
									class="answer-item"
								>
									<u-checkbox
										disabled
										v-model="child.checked"
										style="display: flex;align-items: flex-start;"
										:label="child.text"
									/>
								</view>
							</u-checkbox-group>

							<textarea disabled v-model="form[item.id]" v-if="item.subjectType == 3" cols="10" rows="15" maxlength="256" />
						</view>
					</u-form-item>
				</u-form>
			</view>

			<load-data v-else :loading="loading" />
		</view>
	</view>
</template>

<script>
import { getVoteDetil, getVote } from '@/common/http/api.js';
export default {
	data() {
		return {
			form: {},
			vote: undefined,
			id: null,
			loading: true
		};
	},

	onLoad(options) {
		this.id = options.voteId;
		this.sumbitId = options.submitId;
		this.init();
	},

	methods: {
		getDetail(id) {
			getVoteDetil({ id, itemId: this.id }).then(({ data = '{}' }) => {
				let form = JSON.parse(data).form || {};
				for (let key in form) {
					let value = isNaN(+form[key]) ? form[key] : +form[key];
					this.$set(this.form, key, value);
				}
			});
		},

		async init() {
			this.loading = true;
			const res = await getVote(this.id);
			if (res.code == 200) {
				this.vote = res.data;
				this.getDetail(this.sumbitId);
			} else {
				this.vote = undefined;
			}
			this.loading = false;
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
		height: 100px;
	}
}

textarea {
	width: 700rpx;
	height: 80rpx;
	line-height: 140%;
}
</style>
