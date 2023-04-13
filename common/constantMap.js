/**----------------- 存放一些常量的类------------------*/
// 将所有常量封装进constantMap中方便引入
let constantMap = new Map();

// 订单支付状态名
constantMap.set('payStatusName', {
	0: '待缴费',
	1: '已付款',
	2: '已退款',
	3: '已取消',
	4: '退款中',
	5: '已过期',
	6: '退款失败',
	7: '待现场支付',
	8: '待缴费', //未到就诊日不允许支付
	9: '待缴费', //到了就诊日允许支付
	10: '已完成',
	11: '支付异常',
	12: '支付中',
	13: '预约成功'//仅针对零元订单
})

constantMap.set('checkType', {
	1: '检查报告',
	2: '检验报告',
	3: '体检报告',
});

constantMap.set('paymentMethodName', {
	0: '线上支付',
	1: '线下支付'
});

constantMap.set('payMethodName', {
	1: '微信',
	2: '支付宝',
	3: '银联',
	4: '现场支付'
});
constantMap.set('timeType', {
	1: '上午',
	2: '下午',
	3: '晚上',
	4: '中午'
})
constantMap.set('doctorLevel', {
	1: '主任医生',
	2: '副主任医师',
	3: '主治医师',
	4: '住院医师'
})
constantMap.set('orderType', {
	1: '门诊预约',
	2: '特诊预约',
	3: '当日挂号',
	4: '门诊缴费'
})
constantMap.set('orderStatus', {
	"ALL": '全部',
	"UNPAID": '待支付',
	"PAID": '已支付',
	"TO_CHECKIN": '待报到',
	"QUEUEING": '排队中',
	"STOPPED": '已停诊',
	"TREATED": '已看诊',
	"CANCELLED": '已取消',
})
constantMap.set('weekType', {
	1: '一',
	2: '二',
	3: '三',
	4: '四',
	5: '五',
	6: '六',
	7: '日'
})
constantMap.set('recipeName', {
	1: '处方',
	2: '检验',
	3: '检查',
	4: '护理上门',
	5: '其他'
})

// 对应报告跳转的详情页
constantMap.set('reportUrl', {
	"XDS.RECIPE": "/medicalDetails",
	"XDS.PISBG": "/pathologyDetails",
	"XDS.LISBG": "/testDetails",
	"XDS.BacteriaLISBG": "/germDetails",
	"XDS.UR2.RISBG": "/inspectionDetails",
	"XDS.UR2.USBG": "/inspectionDetails",
	"XDS.UR2.EISBG": "/inspectionDetails"
})

// 建卡时与本人的关系
constantMap.set('relationShipType', {
	0: "本人",
	1: "父母",
	2: "配偶",
	3: "子女",
	4: "亲属",
	9: "其他"
})

// 血压（收缩压、舒张压、脉搏范围<前闭后开>）
constantMap.set('xyType', {
	'systolicRange': "90-139", //高压（收缩压）
	'diastolicRange': "60-89", //低压（舒张压）
	'pulse': "60-100" //脉搏
})

// 血糖
constantMap.set('bloodSugerType', {
	'EMPTINESS': "4.4-7.0", // 空腹
	'OTHER': "4.4-10" // 餐前/餐后/睡前/凌晨：
})

// 订阅模板消息ID
constantMap.set('tmplIds',{
	'REGISTER': ['4PZ2t2onp2x4mRpGzc3LMYye9NITWNNP9FfFzd_vxZY','RL5urufi8N9zT9OqjepYNMeW7Hw9YGqcHgx3pSJdB6I'],
	"PAY": ['rZFpJt9nwUj8lRa7nf-M-wEJSbfbtx1mRSTU_sCNWyE','yl9cNVNwMrppzFaAORyBKRK3MUpyN6XtQZnhpKVSlq8'],
	'RECHARGE': ['3XS7AkBDHc5vYggkJx90THJxIfJBHwrMFCR87pxP2CI','yl9cNVNwMrppzFaAORyBKRK3MUpyN6XtQZnhpKVSlq8']
})

export default constantMap;
