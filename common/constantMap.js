/**----------------- 存放一些常量的类------------------*/
// 将所有常量封装进constantMap中方便引入
let constantMap = new Map();

constantMap.set('orderStatus', {
	"ALL": '全部',
	"UNPAID": '待支付',
	"PAID": '已支付',
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

// 订阅模板消息ID
constantMap.set('tmplIds',{
	'REGISTER': ['',''],
	"PAY": ['',''],
	'RECHARGE': ['','']
})

export default constantMap;
