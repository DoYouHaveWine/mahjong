import CryptoJS from '@/common/utils/aes.js';

/**
 * aes 加密方法(用于请求参数加密)
 */
export const encrypt = (str, k, i) => {
	let srcs = str;
	let key = CryptoJS.enc.Utf8.parse(k);
	let iv = CryptoJS.enc.Utf8.parse(i);

	var encryptedData = CryptoJS.AES.encrypt(srcs, key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	return encryptedData.toString();
}

/**
 * aes 解密方法
 */
export const decrypt = (str, k, i) => {
	let encryptedHexStr = str;
	let key = CryptoJS.enc.Utf8.parse(k);
	let iv = CryptoJS.enc.Utf8.parse(i);
	var decrypted = CryptoJS.AES.decrypt(encryptedHexStr, key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	return decrypted.toString(CryptoJS.enc.Utf8);
};

/**
 * web h5  随机获得32位数字key
 * 传给后台做第一次的加解密拿取数据
 */
export const getRandomAesKey = () => {
	var str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var n = 32,
		s = '';
	for (var i = 0; i < n; i++) {
		var rand = Math.floor(Math.random() * str.length);
		s += str.charAt(rand);
	}
	return s;
};
