/**
 * 获取小程序版本类型，包括develop（开发版）、trial（体验版）、release（正式版）
 * @return develop(开发版)、trial（体验版）、release（正式版）
 */
export function getVertionType() {
	const versionType = wx.getAccountInfoSync().miniProgram.envVersion
	console.log('小程序版本类型：', versionType);
	return versionType
}