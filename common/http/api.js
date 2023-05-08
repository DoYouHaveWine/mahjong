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
export async function isLease(data) {
	return await baseRequest({
		url: `/api/order/v2/query.mt`,
		method: 'POST',
		data: {
			curPage: 1,
			status: 1
		},
		interceptError: true
	});
};

export async function auth(data) {
	return await baseRequest({
		url: `/api/mp/user/base/auth.mt`,
		method: 'POST',
		data
	});
};

export async function wallet1() {
	return await baseRequest({
		url: `/api/user/wallet/get.mt`,
		method: 'POST'
	});
};

export async function wallet2(data) {
	return await baseRequest({
		url: `/api/merchant/v5/wallet/get.mt`,
		method: 'POST',
		data
	});
};

export async function binding(data) {
	return await baseRequest({
		url: `/api/mp/cellphone/binding.mt`,
		method: 'POST',
		data
	});
};

/**************** 个人中心end******************/


/**************** 商家******************/
export async function queryMerchant(data) {
	return await baseRequest({
		url: `/api/home/merchant/query.mt`,
		method: 'POST',
		data
	});
};

export async function getMerchant(data) {
	return await baseRequest({
		url: `/api/home/v5/merchant/get.mt`,
		method: 'POST',
		data
	});
};

export async function queryRecharge(data) {
	return await baseRequest({
		url: `/api/merchant/v5/recharge/query.mt`,
		method: 'POST',
		data
	});
};

export async function payRecharge(data) {
	return await baseRequest({
		url: `/api/merchant/v5/money/recharge.mt`,
		method: 'POST',
		data
	});
};

export async function qrcode(data) {
	return await baseRequest({
		url: `/api/home/v5/qrcode/scan.mt`,
		method: 'POST',
		data
	});
};

export async function getRoom(data) {
	return await baseRequest({
		url: `/api/home/v3/barcode/scan.mt`,
		method: 'POST',
		data
	});
};

/**************** 商家End******************/


export async function ambition(data) {
	return await baseRequest({
		url: `/api/sub/message.mt`,
		method: 'POST',
		data
	});
};

/**************** 预约******************/
export async function goV3book2(data) {
	return await baseRequest({
		url: `/api/home/v3/room/book2.mt`,
		method: 'POST',
		data
	});
};

export async function goV3book(data) {
	return await baseRequest({
		url: `/api/home/v3/room/book.mt`,
		method: 'POST',
		data
	});
};

export async function goV5book2(data) {
	return await baseRequest({
		url: `/api/home/v5/room/book2.mt`,
		method: 'POST',
		data
	});
};

export async function goV5book(data) {
	return await baseRequest({
		url: `/api/home/v5/room/book.mt`,
		method: 'POST',
		data
	});
};

export async function goV6book1(data) {
	return await baseRequest({
		url: `/api/home/v6/room/meal/book1.mt`,
		method: 'POST',
		data
	});
};

export async function goV6book2(data) {
	return await baseRequest({
		url: `/api/home/v6/room/meal/book2.mt`,
		method: 'POST',
		data
	});
};

export async function goV6book3(data) {
	return await baseRequest({
		url: `/api/home/v6/room/meal/book3.mt`,
		method: 'POST',
		data
	});
};

export async function goV6book4(data) {
	return await baseRequest({
		url: `/api/home/v6/room/meal/book4.mt`,
		method: 'POST',
		data
	});
};

export async function goV3dui2(data) {
	return await baseRequest({
		url: `/api/home/v3/room/duihuan2.mt`,
		method: 'POST',
		data
	});
};

export async function goV3dui(data) {
	return await baseRequest({
		url: `/api/home/v3/room/duihuan.mt`,
		method: 'POST',
		data
	});
};

export async function goV5dui2(data) {
	return await baseRequest({
		url: `/api/home/v5/room/douyin/duihuan2.mt`,
		method: 'POST',
		data
	});
};

export async function goV5dui(data) {
	return await baseRequest({
		url: `/api/home/v5/room/douyin/duihuan.mt`,
		method: 'POST',
		data
	});
};

export async function goCancel(data) {
	return await baseRequest({
		url: `/api/home/v2/room/cancel.mt`,
		method: 'POST',
		data
	});
};

export async function queryCoupon1(data) {
	return await baseRequest({
		url: `/api/home/v4/user/coupon/query.mt`,
		method: 'POST',
		data
	});
};

export async function queryCoupon2(data) {
	return await baseRequest({
		url: `/api/home/v4/merchant/coupon/query.mt`,
		method: 'POST',
		data
	});
};

export async function useCoupon2(data) {
	return await baseRequest({
		url: `/api/home/v4/room/useCoupon2.mt`,
		method: 'POST',
		data
	});
};

export async function useCoupon(data) {
	return await baseRequest({
		url: `/api/home/v4/room/useCoupon.mt`,
		method: 'POST',
		data
	});
};

export async function buyCoupon2(data) {
	return await baseRequest({
		url: `/api/home/v4/room/buyCoupon2.mt`,
		method: 'POST',
		data
	});
};

export async function buyCoupon(data) {
	return await baseRequest({
		url: `/api/home/v4/room/buyCoupon.mt`,
		method: 'POST',
		data
	});
};

export async function validCode(data) {
	return await baseRequest({
		url: `/api/home/v5/qrcode/scan.mt`,
		method: 'POST',
		data
	});
};

/**************** 预约End******************/


export async function order1() {
	return await baseRequest({
		url: `/api/order/v2/query.mt`,
		method: 'POST',
		data: {
			curPage: 1,
			status: 1
		}
	});
};

export async function order2(data) {
	return await baseRequest({
		url: `/api/order/v2/query.mt`,
		method: 'POST',
		data
	});
};

export async function operate1(data) {
	return await baseRequest({
		url: `/api/order/v3/room/operate.mt`,
		method: 'POST',
		data
	});
};

export async function operate2(data) {
	return await baseRequest({
		url: `/api/order/v3/merchant/operate.mt`,
		method: 'POST',
		data
	});
};