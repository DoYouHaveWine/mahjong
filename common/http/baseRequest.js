/** 接口封装 */
import { encrypt, decrypt } from '@/common/utils/cryptUtil.js'
import { authorization } from '@/common/http/api.js'
import { getVertionType } from '@/common/utils/commonUtil.js'

/** 请求地址 */
export const serverUrl = {
	// 开发版
	// develop: uni.getStorageSync('devIp') || 'https://jiankangbaoding.cn/test',
	// develop: 'https://jiankangbaoding.cn/test', // 测试
	// develop: 'https://jiankangbaoding.cn', // 正式
	// develop: 'http://172.168.11.40:8700',// 志浩
	// develop: 'http://192.168.25.206:8700',//王涛
	// develop: 'http://172.168.11.39:8700', // 涛平

	// 体验版
	trial: uni.getStorageSync('devIp') || 'https://jiankangbaoding.cn/test', // 添加体验版地址便于测试

	// 正式版
	release: uni.getStorageSync('devIp') || 'https://jiankangbaoding.cn',

} [getVertionType()];

/**
 * 请求封装方法
 * 
 * @param {Object} options 请求基本配置
 * {
 *	 url:请求地址（已带上根地址）
 * 	 contentType：请求头请求类型，默认为application/json
 *   crypt：请求参数是否加密
 *   method:请求方式（GET/POST...） 
 * }
 */
export default function baseRequest(options) {
	options.url = `${serverUrl}${options.url}`;
	options.header = { // 配置请求头
		'content-type': options.contentType || 'application/json',
		'token': uni.getStorageSync('token') || ''
	};
	// 有的接口不能传递token,加个属性，譬如login接口
	if (options.removeToken) {
		delete options.header.token
	}

	console.log('请求参数：', options)

	// aesk传true表示加密
	let aesk;
	if (options.crypt == true) {
		aesk = uni.getStorageInfoSync('sysUser').aesKey
		if ((options.method == 'POST' || options.method == 'PUT') && aesk) {
			options.data = encrypt(JSON.stringify(options.opt), aesk.slice(0, 16), aesk.slice(16));
		}
	}

	return new Promise((resolved, rejected) => {
		options.success = ({ data }) => {
			//  解密操作
			if (aesk && data.data && typeof data.data != 'object') {
				data.data = decrypt(data.data, aesk.slice(0, 16), aesk.slice(16));
				if (data.data.indexOf('{') == 0 || data.data.indexOf('[') == 0) {
					data.data = JSON.parse(data.data);
				}
			}

			console.log('请求结果：', data)
			switch (data.code) {
				case 200: //请求成功返回200
					resolved(data);
					break;
				case 100: // 请求成功返回100
					uni.showModal({
						content: "登录已过期，请重新登录",
						success: async res => {
							if (res.confirm) {
								// #ifdef MP-WEIXIN
								if (await authorization()) {
									uni.reLaunch({ url: '/pages/index/index' })
								}
								// #endif
								// #ifdef H5||APP-PLUS
								uni.reLaunch({ url: '/pagesA/login/login' });
								// #endif
							}
						}
					})
					resolved(data);
					break;
				default: // 请求成功返回其他错误码
					// 定义一个interceptError属性,对于错误自己拦截处理
					if (!options.interceptError) {
						uni.showToast({
							title: data.message,
							icon: 'none',
							duration: 3000
						});
					}
					resolved(data);
					break;
			}
		};

		// 请求失败
		options.fail = (error) => {
			uni.showToast({
				title: '请求接口出错',
				icon: 'none'
			});
			rejected(error); //错误
		};
		uni.request(options);
	})
}
