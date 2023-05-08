/** 接口封装 */
import { encrypt, decrypt } from '@/common/utils/cryptUtil.js'
import { authorization } from '@/common/http/api.js'
import { getVertionType } from '@/common/utils/commonUtil.js'

/** 请求地址 */
export const serverUrl = {
	// 开发版
	develop: 'https://h5.base.mayunkeji.co/sh-client-oem',

	// 体验版
	trial: 'https://h5.base.mayunkeji.co/sh-client-oem', // 添加体验版地址便于测试

	// 正式版
	release: 'https://h5.base.mayunkeji.co/sh-client-oem',

} [getVertionType()];

/**
 * 请求封装方法
 * 
 * @param {Object} options 请求基本配置
 * {
 *	 url:请求地址（已带上根地址）
 * 	 contentType：请求头请求类型，默认为application/x-www-form-urlencoded;charset=UTF-8;
 *   crypt：请求参数是否加密
 *   method:请求方式（GET/POST...） 
 * }
 */
export default function baseRequest(options) {
	options.url = `${serverUrl}${options.url}`;
	options.header = { // 配置请求头
		'name': 'maque',
		"channel": "1",
		'content-type': options.contentType || 'application/x-www-form-urlencoded;charset=UTF-8;',
		'accessToken': uni.getStorageSync('token') || '',
	};

	console.log('请求参数：', options)

	return new Promise((resolved, rejected) => {
		options.success = ({ data }) => {
			
			console.log('请求结果：', data)
			switch (data.code) {
				case 200: //请求成功返回200
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
						
						if (data.code === 401) {
							uni.removeStorageSync('cur_mch_uuid')
							uni.reLaunch({ url: '/pages/list/index' })
						}
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
