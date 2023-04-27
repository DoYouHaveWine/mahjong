/** 接口请求 */
import baseRequest from '@/common/http/baseRequest.js'
import { decrypt, getRandomAesKey } from '@/common/utils/cryptUtil.js'
import store from '@/store/index.js'

/*************** 登录与通用接口相关start***************/
/**
 * 小程序获取openId
 * 
 * @param {String}  code 微信code
 */
export async function getOpenId(code) {
	return await baseRequest({
		url: '/api/smartapp/smartAppGetKey',
		method: 'GET',
		data: {
			code
		}
	})
};

/** 微信授权获取登录token */
export async function authorization() {
	return new Promise((resolve, reject) => {
		// 新版本已经获取不到了，昵称直接返回微信用户，头像返回灰色
		// https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/userProfile.html
		uni.getUserProfile({
			desc: '用户登录小程序',
			success: async (infoRes) => {
				let userInfo = infoRes.userInfo
				let res = await getToken({
					avatar: userInfo.avatarUrl,
					fromType: 1,
					name: userInfo.nickName,
					openId: uni.getStorageSync('openId'),
					sex: userInfo.gender
				});
				if (res.code == 200) {
					uni.setStorageSync('token', res.data);
					await fetchUserInfo();
					resolve(true);
				}
			},
			fail: error => {
				uni.redirectTo({
					url: '/pagesA/auth/auth'
				});
			}
		})
	})
};

/** 小程序登录获取token */
export async function getToken(data) {
	return await baseRequest({
		url: '/api/smartOrWxLogin',
		method: 'POST',
		crypt: true,
		data
	});
};

/**
 * 获取省市区三级联动数据
 * @param {String} type 字典类型
 */
export async function getRegionList() {
	return await baseRequest({
		url: '/api/v2/region/list',
		method: 'GET'
	})
}
 
/************** 登录与通用接口相关end******************/


/**************** 资讯与消息相关start******************/

/** 获取资讯分页列表 */
export async function getInfoArticlePage(data) {
	return await baseRequest({
		url: `/api/article/page`,
		method: 'GET',
		data
	});
};

/**
 * 资讯分类标题列表
 * @param {Object} type 分类
 */
export async function getInformationHeaders(type) {
	return await baseRequest({
		url: `/api/column-info/${type}`,
		method: 'GET'
	});
};



/**************** 支付相关******************/

/**
 * 创建微信支付订单
 */
export async function createWxOrder(data) {
	return await baseRequest({
		url: `/api/order/createWxOrder`,
		method: 'POST',
		crypt: true,
		data
	});
};

/** 获取订单状态 */
export async function getOrderStatus(id) {
	return await baseRequest({
		url: `/api/order/status/${id}`,
		method: 'GET'
	});
};

/**************** 支付相关end******************/

/**************** 订单相关******************/
/**
 * /获取订单状态详情
 * @param {Object} id
 */
export async function getOrdersDetail(id) {
	return await baseRequest({
		url: `/api/order/getOrder/${id}`,
		method: 'GET'
	});
};

/**************** 订单相关end******************/


/**************** 个人中心******************/
 

/**************** 个人中心end******************/
