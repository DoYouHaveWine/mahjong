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
 * 我们自己系统的登录, 获取登录信息，h5 和小程序都要用到的token 用户标识,
 * 返回后续加解密的key
 */
export async function fetchUserInfo() {
	let key = getRandomAesKey();
	let token = uni.getStorageSync('token')
	let res = await baseRequest({
		url: '/api/info',
		method: 'GET',
		data: {
			key,
			token
		},
	});
	if (res) {
		let data = JSON.parse(decrypt(res.data, key.slice(0, 16), key.slice(16)));
		uni.setStorageSync('sysUser', data)
		console.log('登录用户：', data)
	}
};

/**
 * 首页统计访问量
 * 
 * @param {Object} fromType 来源：1小程序、2公众号、3安卓app
 */
export async function getVisitHome(fromType) {
	return await baseRequest({
		url: '/api/visit/home',
		method: 'GET',
		data: {
			fromType
		},
	});
};

/** 健康档案所需的PId */
export async function getPId() {
	return await baseRequest({
		url: '/api/record/pid',
		method: 'get'
	});
};

/**
 * 根据type 获取字典库
 * 
 * @param {String}  type 字典类型
 */
export async function getDictList(type) {
	return await baseRequest({
		url: '/api/dict',
		method: 'GET',
		data: {
			type
		}
	})
}

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
/**
 * 获取区划列表
 * @param {String} pcode 上级区划码
 */
export async function getRegionListv1(pcode) {
	return await baseRequest({
		url: '/api/region/list',
		method: 'GET',
		data: {
			pcode
		}
	})
}

/** 首页搜索医院科室医生 */
export async function getSearchHos(data) {
	return await baseRequest({
		url: '/api/v2/hospital/search',
		method: 'GET',
		data,
	});
};

/** 获取用户详情 */
export async function getMemberDetails(memberId) {
	return await baseRequest({
		url: '/api/member/get',
		method: 'GET',
		data: {
			memberId
		}
	});
};

/** 修改用户信息 */
export async function editMember(data) {
	return await baseRequest({
		url: '/api/member/edit',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 注册 */
export async function register(data) {
	return await baseRequest({
		url: '/api/register',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 忘记密码 */
export async function forgetPwd(data) {
	return await baseRequest({
		url: '/api/forgetPwd',
		method: 'POST',
		crypt: true,
		data
	});
};

/** APP密码登录 */
export async function loginByPwd(data) {
	return await baseRequest({
		url: '/api/loginPwd',
		method: 'POST',
		crypt: true,
		data
	});
};

/** APP短信验证码登录 */
export async function loginByCode(data) {
	return await baseRequest({
		url: '/api/login',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 校验验证码的正确性 */
export async function verifyCode(data) {
	return await baseRequest({
		url: '/api/code/verify',
		method: 'GET',
		crypt: true,
		data
	});
};
/************** 登录与通用接口相关end******************/


/*************** 电子健康卡相关start******************/
/** 电子健康卡一键授权 */
export async function fastAuth(data) {
	return await baseRequest({
		url: '/api/v2/record/fastAuth',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 获取验证码 */
export async function getCode(phone) {
	return await baseRequest({
		url: `/api/code/${phone}`,
		method: 'get'
	});
};

/** 获取并刷新当前登录用户已绑的电子健康卡 */
export async function refreshCardList() {
	let res = await baseRequest({
		url: `/api/v2/record/list`,
		method: 'GET',
	});
	store.commit('setCardList', res.data || []);
	return res;
};

/** 获取电子健康卡二维码 */
export async function getCardScanCode(recordId) {
	return await baseRequest({
		url: `/api/record/qrCode/${recordId}`,
		method: 'GET',
	});
};

/** 添加电子健康卡 */
export async function addCard(data) {
	return await baseRequest({
		url: `/api/v2/record/add`,
		method: 'POST',
		crypt: true,
		data
	});
};

/** 修改电子健康卡 */
export async function editCard(data) {
	return await baseRequest({
		url: `/api/v2/record/edit`,
		method: 'PUT',
		crypt: true,
		data
	});
};

/** 根据recordId查询电子健康卡详情 */
export async function getCardDetail(recordId) {
	return await baseRequest({
		url: `/api/v2/record/${recordId}`,
		method: 'GET'
	});
};

/** 解绑电子健康卡 */
export async function unbindCard(recordId) {
	return await baseRequest({
		url: `/api/v2/record/delete/${recordId}`,
		method: 'DELETE'
	});
};

/** 更改默认的电子健康卡 */
export async function changeDefaultCard(id) {
	return await baseRequest({
		url: `/api/v2/record/default/${id}`,
		method: 'PUT'
	});
};

/** 获取默认的电子健康卡 */
export async function getDefaultCard(id) {
	return await baseRequest({
		url: `/api/v2/record/default`,
		method: 'GET'
	});
};

/*************** 电子健康卡相关end******************/


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

/**
 * 获取资讯文章详情
 * @param {Object} id 资讯文章ID
 * @param {Object} pageType 资讯文章分类
 */
export async function getInformationDetail(id, pageType) {
	return await baseRequest({
		url: `/api/article/find/${id}`,
		method: 'GET',
		data: {
			pageType
		}
	});
};

/** 获取未阅读消息数 */
export async function getUnreadMsgNum() {
	return await baseRequest({
		url: `/api/v2/messages/unread`,
		method: 'GET'
	});
};

/** 查询消息列表 */
export async function getMsgList() {
	return await baseRequest({
		url: '/api/v2/messages/list',
		method: 'GET'
	});
};

/**
 * 将消息标记为已阅读
 * @param {Object} id
 */
export async function remarkMsgRead(id) {
	return await baseRequest({
		url: '/api/messages/isread',
		method: 'GET',
		data: { id }
	});
};

/** 将所有消息标记为已阅读 */
export async function remarkAllMsgRead() {
	return await baseRequest({
		url: '/api/v2/messages/all-read',
		method: 'PUT'
	});
};

/** 删除消息 */
export async function delMsg(data) {
	return await baseRequest({
		url: '/api/v2/messages/delete',
		method: 'POST',
		data
	});
};

/** 
 * 获取消息详情（其他消息）
 * @param {Object} id 消息id
 */
export async function getOtherMsgDetails(id) {
	return await baseRequest({
		url: `/api/messages/getOtherMsgDetail/${id}`,
		method: 'GET',
	});
};
/**************** 资讯与消息相关end******************/


/**************** 预约挂号相关start******************/

/** 获取医院列表 */
export async function getHosList(data) {
	return await baseRequest({
		url: `/api/v2/hospital`,
		method: 'GET',
		data
	});
};

/** 获取医院列表,只返回基础值 */
export async function getBaseHosList() {
	return await baseRequest({
		url: `/api/v2/hospital/list`,
		method: 'GET'
	});
};

/** 获取门诊缴费的医院列表,只返回基础值 */
export async function getPaymentHosList(data) {
	return await baseRequest({
		url: `/api/v2/hospital/clinic`,
		method: 'GET',
		data
	});
};

/** 
 * 根据医院id获取医院详情
 * @param {Object} id 医院id
 */
export async function getHosInfo(id) {
	return await baseRequest({
		url: `/api/v2/hospital/${id}`,
		method: 'GET'
	});
};

/** 
 * 根据医院id获取挂号须知
 * @param {Object} id 医院id
 */
export async function getResInfo(id) {
	return await baseRequest({
		url: `/api/v2/hospital/reserveInfo/${id}`,
		method: 'GET'
	});
};

/**
 * 根据医院id获取须知,门诊缴费，住院充值
 * 
 */
export async function getNoticeInfo(id) {
	return await baseRequest({
		url: `/api/v2/hospital/notice/${id}`,
		method: 'GET'
	});
};


/** 选择科室 */
export async function getDeptListById(data) {
	return await baseRequest({
		url: `/api/v2/reserve/dept`,
		method: 'GET',
		data
	});
};

/** 根据医院id获取所有二级科室 */
export async function getDeptListByhosId(data) {
	return await baseRequest({
		url: `/api/v2/reserve/hospital/dept`,
		method: 'GET',
		data
	});
};

/**
 * 获取医生列表
 * 
 * @param {String}  day 日期
 * @param {String}  deptId 科室id
 * @param {String}  name 医生姓名
 * @param {String}  onlyHasNumber 只看有号(0:否,1:是)
 */
export async function getDoctorList(data) {
	return await baseRequest({
		url: `/api/v2/reserve/doctor`,
		method: 'GET',
		data
	});
};

/**
 * 根据排班时间和医生id获取号源
 * 
 * @param {String}  day 日期
 * @param {String}  doctorId 医生id
 */
export async function getNumberList(data) {
	return await baseRequest({
		url: `/api/v2/reserve/numberInfo`,
		method: 'GET',
		data
	});
};

/** 根据医院id获取挂号配置 */
export async function getRegisterConfig(id) {
	return await baseRequest({
		url: `/api/register-config-table/byHospId/${id}`,
		method: 'GET'
	});
};

/**
 * 确认预约
 * @param {String}  paymentMethod 支付类型
 * @param {String}  srcId 号源id
 * @param {String}  recordId 就诊卡id
 * 
 */
export async function submitsReserve(data) {
	return await baseRequest({
		url: `/api/v2/reserve/pay`,
		method: 'POST',
		data
	});
};

/**
 * 确认预约
 * @param {String}  memberId 就诊人id
 * @param {String}  numberId 号源id
 * @param {String}  recordId 就诊卡id
 * 
 */
export async function submitReserve(data) {
	return await baseRequest({
		url: `/api/v2/reserve/submit`,
		method: 'POST',
		crypt: true,
		data
	});
};

/**
 * 锁定号源支付订单
 * @param {String}  schId 排班ID
 * @param {String}  srcId 号源ID
 * @param {Integer}  doctorId 医生ID
 * @param {Integer}  recordId 档案ID
 * @param {String}  orderTime 预约时间
 * @param {Integer}  paymentMethod 支付类型
 */
export async function orderPay(data) {
	return await baseRequest({
		url: `/api/order/pay`,
		method: 'POST',
		crypt: true,
		data
	});
};

/**
 * 查询挂号订单
 * @param {String}  hospitalId 医院id
 * @param {String}  memberId 用户id
 * @param {String}  recordId 档案id
 * @param {String}  status 挂号状态 
 */
export async function getRegisterRecordList(data) {
	return await baseRequest({
		url: `/api/v2/reserve/list`,
		method: 'GET',
		data
	});
}

/** 查询挂号详情 */
export async function getRegisterRecordDetials(id) {
	return await baseRequest({
		url: `/api/v2/reserve/${id}`,
		method: 'GET'
	});
}

/** 查询挂号信息数 */
export async function getRegisterRecordMsg(id) {
	return await baseRequest({
		url: `/api/v2/reserve/number/${id}`,
		method: 'GET'
	});
}

/** 查询挂号信息(根据号源hisId) */
export async function getRegisterRecordMsgByHisId(data) {
	return await baseRequest({
		url: `/api/v2/reserve/number/his`,
		method: 'POST',
		crypt: true,
		data
	});
}

/**
 * 获取固定时间内每天是否有号
 * @param {String}  beginDay 开始日期
 * @param {String}  endDay 结束日期
 * @param {String}  deptId 科室id
 */
export async function getDayhaveSource(data) {
	return await baseRequest({
		url: `/api/v2/reserve/doctor/day`,
		method: 'GET',
		data
	});
}

/**
 * 获取患者队列信息
 * @param {String}  hospitalId  医院id
 * @param {String}  recordId  档案id
 */
export async function getQueueList(data) {
	return await baseRequest({
		url: `/api/reserve/queueList`,
		method: 'GET',
		data
	});
}

/**************** 预约挂号相关end******************/

/**************** 支付相关******************/

/**
 * 创建微信支付订单
 * @param {String}  id 订单id
 * @param {String}  payMethod 支付方式(1:微信;2:支付宝;3:银联)
 * @param {String}  pcReq 是否来自pc端的请求（true：是）
 * @param {String}  tradeType 微信支付方式必填，JSAPI–JSAPI支付（或小程序支付）、NATIVE–Native支付、APP–app支付，MWEB–H5支付
 * @param {String}  weixinOpenid 微信openid
 */
export async function createWxOrder(data) {
	return await baseRequest({
		url: `/api/order/createWxOrder`,
		method: 'POST',
		crypt: true,
		data
	});
};

/** 零元订单处理 */
export async function setResult0(data) {
	return await baseRequest({
		url: `/api/pay/result/zero`,
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

/** 取消预约 */
export const cancel = async (id) => {
	return await baseRequest({
		url: '/api/order/cancel/' + id,
		method: 'GET',
	});
};

/** 申请退款 */
export const setRef = async (data) => {
	return await baseRequest({
		url: '/api/order/startRefund',
		method: 'POST',
		crypt: true,
		data
	})
};

/**************** 订单相关end******************/


/**************** 报告相关******************/
/** 根据医院id和recordId和时间查询报告列表 */
export const getReportList = async (data) => {
	return await baseRequest({
		url: '/api/v2/report/list',
		method: 'GET',
		data
	})
};

/**
 * 获取检查报告详情
 * @param {String}  id id
 * @param {String}  hospitalId  医院id
 */
export async function getExaminationDetail(data) {
	return await baseRequest({
		url: `/api/v2/report/examination/detail`,
		method: 'GET',
		data
	});
};

/**
 * 获取体检检查报告详情
 * @param {String}  phyid  报告单id
 * @param {String}  recordId   档案id
 * @param {String}  reportId   报告id
 * @param {String}  hospitalId  医院id
 */
export async function getHealthDetail(data) {
	return await baseRequest({
		url: `/api/v2/report/health/detail`,
		method: 'GET',
		data
	});
};

/**
 * 获取检验报告详情（一般）
 * @param {String}  id id
 * @param {String}  hospitalId  医院id
 */
export async function getInspectionDetail(data) {
	return await baseRequest({
		url: `/api/v2/report/inspection/detail`,
		method: 'GET',
		data
	});
};

/**
 * 获取检验报告详情（细菌）
 * @param {String}  id id
 * @param {String}  hospitalId  医院id
 */
export async function getInspectionXJDetail(data) {
	return await baseRequest({
		url: `/api/report/culture`,
		method: 'GET',
		data
	});
};

/**
 * 获取检验报告详情（药敏）
 * @param {String}  id id
 * @param {String}  hospitalId  医院id
 */
export async function getInspectionYMDetail(data) {
	return await baseRequest({
		url: `/api/report/chemosens`,
		method: 'GET',
		data
	});
};


/**************** 报告相关end******************/


/**************** 影像报告相关start ******************/
/** 获取影像报告列表 */
export async function getImageReportList(data) {
	return await baseRequest({
		url: '/api/eimage/list',
		method: 'GET',
		data
	})
};

/** 获取影像报告地址 */
export async function getImageReportUrl(id) {
	return await baseRequest({
		url: `/api/eimage/view/${id}`,
		method: 'GET',
		data: { id }
	})
};

/**************** 影像报告相关end ******************/


/**************** 用户相关******************/

/** 保存用户默认选择的医院 */
export async function setDefaultHos(id) {
	return await baseRequest({
		url: `/api/v2/member/default/hospital/${id}`,
		method: 'PUT'
	});
};

/** 获取用户默认选择的医院 */
export async function getDefaultHos() {
	return await baseRequest({
		url: `/api/v2/member/default/hospital`,
		method: 'GET'
	});
};

/** 保存用户默认选择的门诊缴费医院 */
export async function getDefaultClinicHos() {
	return await baseRequest({
		url: `/api/v2/member/default/hospital/clinic`,
		method: 'GET'
	});
};

/** 获取用户默认选择的门诊缴费医院 */
export async function setDefaultClinicHos(id) {
	return await baseRequest({
		url: `/api/v2/member/default/hospital/clinic/${id}`,
		method: 'PUT'
	});
};



/**
 * 用户收藏
 * @param {Number}  memberId 用户id
 * @param {Number}  objectId  对象ID
 * @param {Number}  objectType 收藏/关注对象类型(1:医院;2:科室;3:医生;4:资讯;5:pc端疾病展示)
 */
export async function submitFavorite(data) {
	return await baseRequest({
		url: `/api/favorite/submitFavorite`,
		method: 'POST',
		crypt: true,
		data
	});
};

/**
 * 用户取消收藏
 * @param {Number}  memberId 用户id
 * @param {Number}  objectId  对象ID
 * @param {Number}  objectType 收藏/关注对象类型(1:医院;2:科室;3:医生;4:资讯;5:pc端疾病展示)
 */
export async function cancelFavorite(data) {
	return await baseRequest({
		url: `/api/favorite/cancelFavorite`,
		method: 'POST',
		crypt: true,
		data
	});
};

/**
 * 获取我的医生
 * @param {Number}  memberId 用户id
 */
export async function getMyDoctor(data) {
	return await baseRequest({
		url: `/api/v2/favorite/doctors`,
		method: 'GET',
		data
	});
};
/**************** 用户相关end******************/


/**************** 个人中心******************/
/** 获取帮助手册列表 */
export async function getHelpList(id) {
	return await baseRequest({
		url: `/api/help-info/list`,
		method: 'GET'
	});
};

/** 获取帮助手册详情 */
export async function getHelpInfo(id) {
	return await baseRequest({
		url: `/api/help-info/${id}`,
		method: 'GET'
	});
};

/**************** 个人中心end******************/


/**************** 健康管理 start******************/
/**
 * 获取健康数据
 * @param {Number}  recordId 健康卡id
 */
export async function getHealthData(recordId) {
	return await baseRequest({
		url: `/api/v2/health`,
		method: 'GET',
		data: { recordId }
	});
};

/**
 * 获取血压列表
 * @param {Number}  recordId 档案id
 */
export async function getXyList(data) {
	return await baseRequest({
		url: `/api/v2/blood/list`,
		method: 'GET',
		data
	});
};

/**
 * 添加血压
 * @param {String}  date 记录日期
 * @param {String}  time 记录时间
 * @param {Number}  pulse 脉搏次数
 * @param {Number}  systolicPressure 收缩压
 * @param {Number}  diastolicPressure 舒张压
 * @param {Number}  recordId 档案id
 */
export async function addXy(data) {
	return await baseRequest({
		url: `/api/v2/blood`,
		method: 'POST',
		crypt: true,
		data
	});
};

/** 删除指定血压数据 */
export async function deleteBloodData(id) {
	return await baseRequest({
		url: `/api/v2/blood/${id}`,
		method: 'DELETE'
	});
};

/**
 * 获取最近的血压记录
 * @param {Number}  recordId 档案id
 */
export async function getRencentlyXy(data) {
	return await baseRequest({
		url: `/api/v2/blood/last`,
		method: 'GET',
		data
	});
};

/**
 * 获取变化曲线趋势图
 * @param {Number}  days 倒叙天数
 * @param {Number}  recordId 档案id
 */
export async function getXyChartsData(data) {
	return await baseRequest({
		url: `/api/v2/blood/change`,
		method: 'GET',
		data
	});
};

/** 获取用药提醒列表 */
export async function getDrugList(id) {
	return await baseRequest({
		url: `/api/v2/medicationReminder/list`,
		method: 'GET',
		data: {
			recordId: id
		}
	});
};

/** 删除用药提醒 */
export async function delDrugTips(id) {
	return await baseRequest({
		url: `/api/v2/medicationReminder/${id}`,
		method: 'DELETE'
	});
};

/** 开关用药提醒 */
export async function switchDrugTips(id) {
	return await baseRequest({
		url: `/api/v2/medicationReminder/${id}`,
		method: 'PUT'
	});
};

/** 添加用药提醒 */
export async function addDrugTips(data) {
	return await baseRequest({
		url: `/api/v2/medicationReminder`,
		method: 'POST',
		crypt: true,
		data
	});
};

/** 添加血糖记录 */
export async function addBloodSuger(data) {
	return await baseRequest({
		url: `/api/v2/blood-sugar`,
		method: 'POST',
		crypt: true,
		data
	});
};

/** 删除指定血糖数据 */
export async function deleteBloodSugarData(id) {
	return await baseRequest({
		url: `/api/v2/blood-sugar/${id}`,
		method: 'DELETE'
	});
};

/** 获取最近一次的血糖记录 */
export async function getRecentBloodSuger(data) {
	return await baseRequest({
		url: `/api/v2/blood-sugar/top`,
		method: 'GET',
		data
	});
};

/** 获取血糖趋势数据 */
export async function getRecentBloodSugerCharts(data) {
	return await baseRequest({
		url: `/api/v2/blood-sugar/trend`,
		method: 'GET',
		data
	});
};

/** 获取血糖历史记录 */
export async function getBloodSugerHistory(data) {
	return await baseRequest({
		url: `/api/v2/blood-sugar/history`,
		method: 'GET',
		data
	});
};

/** 添加体重记录 */
export async function addWeightRecord(data) {
	return await baseRequest({
		url: `/api/v2/weight`,
		method: 'POST',
		crypt: true,
		data
	});
};

/** 获取最近一次体重记录 */
export async function getLatestWeightRecord(recordId) {
	return await baseRequest({
		url: `/api/v2/weight/top`,
		method: 'GET',
		data: { recordId }
	});
};

/** 获取体重历史趋势 */
export async function getWeightRecordTrend(data) {
	return await baseRequest({
		url: `/api/v2/weight/trend`,
		method: 'GET',
		data
	});
};

/** 获取体重历史记录 */
export async function getWeightHistoryList(data) {
	return await baseRequest({
		url: `/api/v2/weight/history`,
		method: 'GET',
		data
	});
};

/** 删除指定体重数据 */
export async function deleteWeightData(id) {
	return await baseRequest({
		url: `/api/v2/weight/${id}`,
		method: 'DELETE'
	});
};

/**
 * 添加心率
 * @param {Number}  bmp 心率
 * @param {Number}  day 日期
 * @param {Number}  recordId 档案id
 */
export async function addRate(data) {
	return await baseRequest({
		url: `/api/v2/heart-rate`,
		method: 'POST',
		crypt: true,
		data
	});
};

/** 删除指定体重数据 */
export async function deleteRateData(id) {
	return await baseRequest({
		url: `/api/v2/heart-rate/${id}`,
		method: 'DELETE'
	});
};

/** 心率历史记录 */
export async function getHisRate(data) {
	return await baseRequest({
		url: `/api/v2/heart-rate/history`,
		method: 'GET',
		data
	});
};

/** 心率最近添加记录 */
export async function getRecentRate(id) {
	return await baseRequest({
		url: `/api/v2/heart-rate/top`,
		method: 'GET',
		data: {
			recordId: id
		}
	});
};

/** 心率变化趋势 */
export async function getRateTrend(data) {
	return await baseRequest({
		url: `/api/v2/heart-rate/trend`,
		method: 'GET',
		data
	});
};
/**************** 健康管理 end******************/


/**************** 门诊缴费 start*****************/
/** 查询门诊待缴费列表 */
export async function getUnpaidClinicList(data) {
	return await baseRequest({
		url: `/api/v2/order/clinic/unpaid`,
		method: 'GET',
		data
	});
};

/** 查询门诊订单详情 */
export async function getClinicOrderDetails(orderId) {
	return await baseRequest({
		url: `/api/v2/order/clinic/detail/${orderId}`,
		method: 'GET'
	});
};

/** 查询门诊订单列表 */
export async function getClinicOrderList(data) {
	return await baseRequest({
		url: `/api/v2/order/clinic/list`,
		method: 'GET',
		data
	});
};
/**************** 门诊缴费 end*****************/

/**************** 住院相关 start*****************/

/** 
 * 获取住院列表
 * @param {Object} beginDate  入院起始时间
 * @param {Object} endDate  入院结束时间
 * @param {Object} recordId  就诊卡id
 * @param {Object} hospitalId  医院id
 */
export async function gethospitalizedList(data) {
	return await baseRequest({
		url: `/api/v2/in-hospital/list`,
		method: 'GET',
		data
	});
};
/** 
 * 获取住院详情
 * @param {Object} recordId 档案id
 * @param {Object} visitid 就诊id
 */
export async function gethospitalizedDetails(data) {
	return await baseRequest({
		url: `/api/v2/in-hospital/detail`,
		method: 'GET',
		data
	});
};
/**
 * 获取支持住院缴费的医院
 */
export async function getRechargeHosedList(name = '') {
	return await baseRequest({
		url: `/api/v2/hospital/in-hospital`,
		method: 'GET',
		data: { name }
	});
};
/**
 * 保存用户默认选择的门诊充值医院
 * @param {Object} hospitalId 医院Id
 */
export async function setDefaultRechargeHosed(hospitalId) {
	return await baseRequest({
		url: `/api/v2/member/default/in-hospital/${hospitalId}`,
		method: 'PUT'
	});
};

/** 获取用户默认选择的住院医院 */
export async function getDefaultRechargeHosed() {
	return await baseRequest({
		url: `/api/v2/member/default/in-hospital`,
		method: 'GET'
	});
};
/** 
 * 获取住院充值记录
 * @param {Object} recordId 档案id
 * @param {Object} hospitalId 医院id
 */
export async function getHosedRechargelist(data) {
	return await baseRequest({
		url: `/api/v2/in-hospital/pay-deposit-fee/list`,
		method: 'GET',
		data
	});
};
/** 
 * 获取住院详情
 * @param {Object} recordId 档案id
 * @param {Object} hospitalId 医院id
 * @param {Object} visitId 就诊id
 * @param {Object} date 日期
 */
export async function getDailyBill(data) {
	return await baseRequest({
		url: `/api/v2/daily-bill/detail`,
		method: 'GET',
		data
	});
};
/** 
 * 住院充值
 * @param {Object} recordId 档案id
 * @param {Object} hospitalId 医院id
 */
export async function rechargeHosed(data) {
	return await baseRequest({
		url: `/api/v2/in-hospital/pay-deposit-fee`,
		method: 'POST',
		crypt: true,
		data
	});
};
/** 
 * 获取住院充值结果
 * @param {Object} orderId 订单id
 */
export async function getRechargeResult(orderId) {
	return await baseRequest({
		url: `/api/v2/in-hospital/pay-deposit-fee/${orderId}`,
		method: 'GET'
	});
};
/** 
 * 获取住院充值详情
 * @param {Object} orderId 订单id
 */
export async function getRechargeDetails(orderId) {
	return await baseRequest({
		url: `/api/v2/in-hospital/pay-deposit-fee/detail/${orderId}`,
		method: 'GET'
	});
};

/**************** 住院相关 end*****************/


/*************** 问卷调查start *************/
/** 获取问卷调查列表 */
export async function getVoteList(data) {
	return await baseRequest({
		url: '/api/vote/list',
		method: 'get',
		data
	});
};

/** 根据ID获取问卷调查 */
export async function getVote(id) {
	return await baseRequest({
		url: `/api/vote/${id}`,
		method: 'get'
	});
};

/** 问卷调查结果上传 第一步 */
export async function saveVoteSubmit(data) {
	return await baseRequest({
		url: '/api/vote/save/submit',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 满意度调查结果上传 第一步 */
export async function saveSatisfactionVoteSubmit(data) {
	return await baseRequest({
		url: '/api/vote/save/satisfaction',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 满意度调查结果上传 第一步 */
export async function checkHasSubmit(data) {
	return await baseRequest({
		url: '/api/vote/hasSubmit',
		method: 'GET',
		data
	});
};

/** 问卷调查结果上传 第二步 */
export async function saveVoteItem(data) {
	return await baseRequest({
		url: '/api/vote/save/item',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 诊前问卷调查结果上传 第一步 */
export async function savePreVoteSubmit(data) {
	return await baseRequest({
		url: '/api/vote/save/checkInSubmit',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 根据ID获取已回答问卷调查 */
export async function getVoteDetil(data) {
	return await baseRequest({
		url: '/api/vote/detil',
		method: 'get',
		data
	});
};

/** 诊前问卷调查信息查询今日是否有提交记录 */
export async function checkTodayPreMsg(data) {
	return await baseRequest({
		url: `/api/todayCheckInRecord`,
		method: 'post',
		data
	});
};

/** 诊前问卷调查信息提交 */
export async function savePreMsg(data) {
	return await baseRequest({
		url: `/api/checkInRecord`,
		method: 'post',
		data
	});
};

/** 诊前问卷调查信息更新 */
export async function updatePreMsg(data) {
	return await baseRequest({
		url: `/api/vote/update/item`,
		method: 'post',
		data
	});
};

/** 诊前问卷调查历史记录列表 */
export async function getPreMsgList(data) {
	return await baseRequest({
		url: `/api/checkInRecordList`,
		method: 'post',
		data
	});
};
/*************** 问卷调查end *************/


/*************** 症状自查start *************/
/** 获取身体部位 智能导诊 */
export async function getBodyInfo(data) {
	return await baseRequest({
		url: '/api/body',
		method: 'GET',
		data
	});
};

/** 根据部位获取症状类别列表 */
export async function getBodySymptom(data) {
	return await baseRequest({
		url: '/api/symptom/byPartId',
		method: 'GET',
		data
	});
};

/** 根据症状id获取具体症状列表 */
export async function getSymptomInfo(data) {
	return await baseRequest({
		url: '/api/symptom/getSympById',
		method: 'GET',
		data
	});
};

/** 根据具体症状列表 获得推荐科室 */
export async function getReDep(data) {
	return await baseRequest({
		url: '/api/symptom/getDeptBySympId',
		method: 'GET',
		data
	});
};

/** 根据具体症状列表 根据症状的关键字获取症状 */
export async function getDeptBySympName(data) {
	return await baseRequest({
		url: '/api/symptom/getDeptBySympName',
		method: 'GET',
		data
	});
};
/*************** 症状自查end *************/


/*************** 病友圈start *************/
/** 获取病友圈列表，按照圈子中话题量排序 */
export async function getPatientGroupList(data) {
	return await baseRequest({
		url: '/api/patient-group/get/list',
		method: 'GET',
		data
	});
};

/** 患友列表 */
export async function getPatientList(data) {
	return await baseRequest({
		url: '/api/patient-group-member/get/patient/list',
		method: 'GET',
		data
	});
};

/** 获取圈内医生 */
export async function getPatientGroupDoctor(groupId) {
	return await baseRequest({
		url: `/api/patient-group/get/doctor?groupId=${groupId}`,
		method: 'GET'
	});
};

/** 患友圈子绑定 */
export async function getPatientGroupMemberBindPatient(data) {
	return await baseRequest({
		url: '/api/patient-group-member/bind/patient',
		method: 'GET',
		data
	});
};

/** 根据圈子类型获取话题列表  */
export async function getPatientGroupArticleList(data) {
	return await baseRequest({
		url: '/api/patient-group-article/get/list',
		method: 'GET',
		data
	});
};

/** 查询话题详情 */
export async function getPatientGroupArticleDetail(id) {
	return await baseRequest({
		url: `/api/patient-group-article/get/detail?id=${id}`,
		method: 'GET'
	});
};

/** 新增话题 */
export async function addPatientGroupArticleSave(data) {
	return await baseRequest({
		url: '/api/patient-group-article/save',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 获取评论列表 */
export async function getPatientGroupCommentList(data) {
	return await baseRequest({
		url: '/api/patient-group-comment/getList',
		method: 'GET',
		data
	});
};

/** 根据父id获取评论列表 */
export async function getPatientGroupCommentListByParentid(data) {
	return await baseRequest({
		url: '/api/patient-group-comment/getList/parentid',
		method: 'GET',
		data
	});
};

/** 根据ID获取评论 */
export async function getPatientGroupCommentById(data) {
	return await baseRequest({
		url: '/api/patient-group-comment/getById',
		method: 'GET',
		data
	});
};

/** 患友圈子关系查询 */
export async function getPatientGroupMemberIsBind(data) {
	return await baseRequest({
		url: '/api/patient-group-member/is/bind',
		method: 'GET',
		data
	});
};

/** 患友圈子解除绑定 */
export async function getPatientGroupMemberPatientNoBind(data) {
	return await baseRequest({
		url: '/api/patient-group-member/no/bind/patient',
		method: 'GET',
		data
	});
};

/** 浏览数更新 */
export async function getPatientGroupArticleViewNum(id) {
	return await baseRequest({
		url: `/api/patient-group-article/view/num?id=${id}`,
		method: 'GET'
	});
};

/** 评论话题 */
export async function replyPatientGroupCommentSave(data) {
	return await baseRequest({
		url: '/api/patient-group-comment/save',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 根据ID编辑话题 */
export async function editPatientGroupArticleById(data) {
	return await baseRequest({
		url: '/api/patient-group-article/editById',
		method: 'POST',
		crypt: true,
		data
	});
};

/** 根据ID编辑评论 */
export async function editPatientGroupCommentById(data) {
	return await baseRequest({
		url: '/api/patient-group-comment/editById',
		method: 'POST',
		crypt: true,
		data
	});
};
/*************** 病友圈end *************/
/*************** 运营数据start *************/
/** 
 * 获取总数据
 * @param {string} year 年份
 * @param {string} hospitalId 医院id
 * @param {Object} dataType 1:支付数量；2:退款数量 3:订单金额；4、交易金额；5、退款金额
 */
export async function getTotalDataChart(data) {
	return await baseRequest({
		url: '/api/operationalData',
		method: 'GET',
		data
	});
};
/** 
 * 获取分类数据
 * @param {string} year 年份 
 * @param {string} hospitalId 医院id
 * @param {Number} businessType 业务类型：1:挂号费;2:门诊费;3:检查费;4:住院预交金;5:住院消费
 * @param {Number} dataType 数据类型：1:支付数量；2:支付金额
 */
export async function getDetailDataChart(data) {
	return await baseRequest({
		url: '/api/operationalData/byBusiness',
		method: 'GET',
		data
	});
};
/** 
 * 获取报告数据
 * @param {string} year 年份 
 * @param {string} hospitalId 医院id
 */
export async function getReportChart(data) {
	return await baseRequest({
		url: '/api/operationalData/report',
		method: 'GET',
		data
	});
};
/*************** 运营数据end *************/
/*************** APP额外接口start *************/
/** APP版本更新 */
export async function getAppUpdate() {
	return await baseRequest({
		url: '/api/version/getUpdate',
		method: 'GET'
	});
};

/** APP获取智能导诊URL */
export async function getZndzUrl() {
	return await baseRequest({
		url: '/api/appmenu/getPcZndzUrl',
		method: 'GET',
	});
};
/*************** APP额外接口end *************/
/*************** 扫码付start *************/
/**
 * 获取支付信息
 * @param {*} hospitalId 医院id
 * @param {*} cardNo 卡号
 * @param {*} cardType 卡类型
 */
export async function getMsg(data) {
	return await baseRequest({
		url: '/api/scan-pay/clinic/list',
		method: 'GET',
		data
	});
};
/*************** 扫码付End *************/
