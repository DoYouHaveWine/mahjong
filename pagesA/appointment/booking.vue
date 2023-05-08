<template>
	<view class="book-bg">
		<view class="book-bg-temp ptb-5"></view>
		<view class="book-bg-1 ptb-10 plr-10">
			<view class="flex-box align-center bg-white plr-10 ptb-10 border-box todo-box">
				<image :src="snMsg.room.backgroundImage" style="width: 204rpx;height: 232rpx;"></image>
				<view class="flex-item plr-10">
					<view class="just-between align-center">
						<view class="fb flex-box align-center">
							<text>{{snMsg.room.name}}</text>
						</view>
						<!-- <view>
							<text class="tip-doing">使用中</text>
						</view> -->
					</view>
					<view class="just-between align-center mt10">
						<view class="fb f-14">预约须知:</view>
						<view class="f-14 c-58AA6C fb" @tap="goDirection()">使用教程></view>
					</view>
					<view v-if="" class="mt10 f-12 c-66">24小时营业</view>
				</view>
			</view>
		</view>
		
		<view class="flex-box align-center mlr10 book-bg-2">
			<view class="prelative" style="width: 100%;">
				<image v-if="bookType==1" src="../../static/appointment/bg_appointment_1.png" style="width: 100%; height: 76upx;" mode="widthFix"></image>
				<image v-if="bookType==2" src="../../static/appointment/bg_appointment_2.png" style="width: 100%; height: 76upx;" mode="widthFix"></image>
				<view class="just-between align-center book-bg-2-top prelative">
					<view class="flex-item fb f-16 tc" :class="bookType==1?'c-33':'c-white'" @tap="bookTypeChange(1)">
						<view>小时模式</view>
						<view v-if="bookType==1" class="bookType-bg"></view>
					</view>
					<view class="flex-item fb f-16 tc" :class="bookType==2?'c-33':'c-white'" @tap="bookTypeChange(2)">
						<view>卡券套餐</view>
						<view v-if="bookType==2" class="bookType-bg"></view>
					</view>
					<view class="txt-youhui f-8 fb flex-box align-center" :class="bookType==1?'txt-youhui1':'txt-youhui2'">
						<view class="flex-item tc">
							<view>限时</view>
							<view>特惠</view>
						</view>
					</view>
				</view>
				
				<block v-if="bookType==1">
					<block v-if="business && showModeIdx===1">
						<view class="just-between align-center plr-5 mt5 sort-view">
							<view v-for="(item,index) in snMsg.dateArr" :key='index' class="flex-item tc sort-item" :class="index==showIdx&&'active'" @tap="showIdx=index">
								<view class="f-12 txt1 tc">{{item.weekStr}}</view>
								<view class="f-14 txt2 tc">{{item.dateStr}}</view>
								<view class="line"></view>
							</view>
						</view>
						
						<view class="flex-box align-center plr-10 mt20">
							<view class="flex-item c-33 fb f-16">预订时长:</view>
							<view v-if="!meituanC && !douyinC" class="flex-box align-center f-14">
								<view class="hour-box" :class="selectHour==1&&'active'" @tap="chooseHour(1)">
									{{meal1.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box" :class="selectHour==2&&'active'" @tap="chooseHour(2)">
									{{meal2.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box" :class="selectHour==3&&'active'" @tap="chooseHour(3)">
									{{meal3.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box" :class="selectHour==4&&'active'">
									<picker class="" @change="bindChooseHourChange" :range="hourArr" :value="hourIdx" mode="selector">
										<text class="">其他</text>
									</picker>
								</view>
							</view>
							<view v-else class="flex-box align-center f-14">
								<view class="hour-box">
									{{meal1.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box">
									{{meal2.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box">
									{{meal3.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box">
									其他
								</view>
							</view>
						</view>
						
						<view class="flex-box align-center plr-10 mt15 f-16 fb mb15">
							<view class="flex-item c-33">预订时间:</view>
							<view class="time-box">
								<picker class="" @change="bindTimeChange" :range="timeArr" :value="timeIdx" mode="multiSelector">
									<text class="">{{time.d}} {{time.h}} : {{time.m}}</text>
								</picker>
							</view>
							<view class="plr-5">-</view>
							<view class="time-box disable">
								<text class="">{{time._d}} {{time._h}} : {{time._m}}</text>
							</view>
						</view>
					</block>
					
					<block v-if="business && showModeIdx===2">
						<view class="just-between align-center plr-5 mt5 sort-view">
							<view v-for="(item,index) in snMsg.dateArr" :key='index' class="flex-item tc sort-item" :class="index==showIdx&&'active'" @tap="showIdx=index">
								<view class="f-12 txt1 tc">{{item.weekStr}}</view>
								<view class="f-14 txt2 tc">{{item.dateStr}}</view>
								<view class="line"></view>
							</view>
						</view>
						
						<view class="flex-box align-center plr-10 mt20">
							<view class="flex-item c-33 fb f-16">预订套餐:</view>
							<view v-if="!meituanC && !douyinC" class="flex-box align-center f-14">
								<view class="hour-box" :class="selectMeal==1&&'active'" @tap="chooseMeal(1)" v-if="_meal1.price*1>0 && _meal1.period*1>0">
									{{_meal1.period}}<text class="f-12">小时套餐</text>
								</view>
								<view class="hour-box" :class="selectMeal==2&&'active'" @tap="chooseMeal(2)" v-if="_meal2.price*1>0 && _meal2.period*1>0">
									{{_meal2.period}}<text class="f-12">小时套餐</text>
								</view>
								<view class="hour-box" :class="selectMeal==3&&'active'" @tap="chooseMeal(3)" v-if="_meal3.price*1>0 && _meal3.period*1>0">
									{{_meal3.period}}<text class="f-12">小时套餐</text>
								</view>
							</view>
							<view v-else class="flex-box align-center f-14">
								<view class="hour-box" v-if="_meal1.price*1>0 && _meal1.period*1>0">
									{{_meal1.period}}<text class="f-12">小时套餐</text>
								</view>
								<view class="hour-box" v-if="_meal2.price*1>0 && _meal2.period*1>0">
									{{_meal2.period}}<text class="f-12">小时套餐</text>
								</view>
								<view class="hour-box" v-if="_meal3.price*1>0 && _meal3.period*1>0">
									{{_meal3.period}}<text class="f-12">小时套餐</text>
								</view>
							</view>
						</view>
						
						<view class="flex-box align-center plr-10 mt15 f-16 fb mb15">
							<view class="flex-item c-33">预订时间:</view>
							<view class="time-box">
								<picker class="" @change="bindTimeChange" :range="timeArr" :value="timeIdx" mode="multiSelector">
									<text class="">{{time.d}} {{time.h}} : {{time.m}}</text>
								</picker>
							</view>
							<view class="plr-5">-</view>
							<view class="time-box disable">
								<text class="">{{time._d}} {{time._h}} : {{time._m}}</text>
							</view>
						</view>
					</block>
					
					<block v-if="!business && showModeIdx===1">
						<view class="flex-box align-center plr-10 mt20">
							<view class="flex-item c-33 fb f-16">预订时长:</view>
							<view v-if="!meituanC && !douyinC" class="flex-box align-center f-14">
								<view class="hour-box" :class="selectHour==1&&'active'" @tap="chooseHour(1)">
									{{meal1.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box" :class="selectHour==2&&'active'" @tap="chooseHour(2)">
									{{meal2.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box" :class="selectHour==3&&'active'" @tap="chooseHour(3)">
									{{meal3.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box" :class="selectHour==4&&'active'">
									<picker class="" @change="bindChooseHourChange" :range="hourArr" :value="hourIdx" mode="selector">
										<text class="">其他</text>
									</picker>
								</view>
							</view>
							<view v-else class="flex-box align-center f-14">
								<view class="hour-box">
									{{meal1.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box">
									{{meal2.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box">
									{{meal3.period}}<text class="f-12">小时</text>
								</view>
								<view class="hour-box">
									其他
								</view>
							</view>
						</view>
						
						<view class="flex-box align-center plr-10 mt15 f-16 fb mb15">
							<view class="flex-item c-33">预订时间:</view>
							<view class="time-box disable">
								<text class="">{{time.d}} {{time.h}} : {{time.m}}</text>
							</view>
							<view class="plr-5">-</view>
							<view class="time-box disable">
								<text class="">{{time._d}} {{time._h}} : {{time._m}}</text>
							</view>
						</view>
					</block>
					
					<block v-if="!business && showModeIdx===2">
						<view class="flex-box align-center plr-10 mt20">
							<view class="flex-item c-33 fb f-16">预订套餐:</view>
							<view v-if="!meituanC && !douyinC" class="flex-box align-center f-14">
								<view class="hour-box" :class="selectMeal==1&&'active'" @tap="chooseMeal(1)" v-if="_meal1.price*1>0 && _meal1.period*1>0">
									{{_meal1.period}}<text class="f-12">小时套餐</text>
								</view>
								<view class="hour-box" :class="selectMeal==2&&'active'" @tap="chooseMeal(2)" v-if="_meal2.price*1>0 && _meal2.period*1>0">
									{{_meal2.period}}<text class="f-12">小时套餐</text>
								</view>
								<view class="hour-box" :class="selectMeal==3&&'active'" @tap="chooseMeal(3)" v-if="_meal3.price*1>0 && _meal3.period*1>0">
									{{_meal3.period}}<text class="f-12">小时套餐</text>
								</view>
							</view>
							<view v-else class="flex-box align-center f-14">
								<view class="hour-box" v-if="_meal1.price*1>0 && _meal1.period*1>0">
									{{_meal1.period}}<text class="f-12">小时套餐</text>
								</view>
								<view class="hour-box" v-if="_meal2.price*1>0 && _meal2.period*1>0">
									{{_meal2.period}}<text class="f-12">小时套餐</text>
								</view>
								<view class="hour-box" v-if="_meal3.price*1>0 && _meal3.period*1>0">
									{{_meal3.period}}<text class="f-12">小时套餐</text>
								</view>
							</view>
						</view>
						
						<view class="flex-box align-center plr-10 mt15 f-16 fb mb15">
							<view class="flex-item c-33">预订时间:</view>
							<view class="time-box disable">
								<text class="">{{time.d}} {{time.h}} : {{time.m}}</text>
							</view>
							<view class="plr-5">-</view>
							<view class="time-box disable">
								<text class="">{{time._d}} {{time._h}} : {{time._m}}</text>
							</view>
						</view>
					</block>
				</block>
				<block v-if="bookType==2">
					<view class="coupon-bg">
						<view class="c-66 tc fb f-12">卡券消费，不支持退款，预订时长以卡券上为准</view>
						<view class="coupon-head just-between align-center">
							<view class="flex-item tc" :class="1==showCouponIdx&&'active'" @tap="tabCoupon(1)">
								<view class="f-14 tc">我的卡券</view>
							</view>
							<view class="flex-item tc" :class="2==showCouponIdx&&'active'" @tap="tabCoupon(2)">
								<view class="f-14 tc">商家卡券</view>
							</view>
						</view>
						<scroll-view class="coupon-body ptb-5" scroll-y="true">
							<view v-if="couponList.length==0" class="tc">
								<image src="/static/ic_empty.png" class="empty-coupon"></image>
								<view class="f-12 c-33 mt10">暂无卡券</view>
							</view>
							<block v-else>
								<view v-for="(item,index) in couponList" :key='index' class="flex-box align-center mb10 plr-10 coupon-list prelative" @tap="selectCoupon(item.uuid, index)">
									<image v-if="item.type!==22 && index!==selectCouponIdx" :src="'/static/img/icon_coupon_bg1.png'" style="width: 100%; height: 118upx;" ></image>
									<image v-if="item.type===22 && index!==selectCouponIdx" :src="'/static/img/icon_coupon_bg3.png'" style="width: 100%; height: 118upx;" ></image>
									<image v-if="index===selectCouponIdx" :src="'/static/img/icon_coupon_bg2.png'" style="width: 100%; height: 118upx;" ></image>
									<view class="flex-box align-center coupon-vt">
										<view class="c-white coupon-vt-1 tc">
											<view class="f-18">¥ <text class="plr-5 f24">{{item.unitPrice}}</text></view>
											<view class="f-12" style="text-decoration: line-through;">原价{{item.originalPrice}}元</view>
										</view>
										<view class="c-white coupon-vt-2">
											<view class="f-12">{{item.name}}</view>
											<view class="f-12 flex-box align-center mt5">可兑换<text class="plr-5 mlr5 f-12 fb bg-F4 c-33 v-middle" style="border-radius: 8upx;">{{item.couponHours}}</text>小时</view>
										</view>
										<view class="coupon-vt-3 tc">
											<view class="coupon-vt-31 f-12" @tap="showCouponDetail(item)">查看详情</view>
										</view>
									</view>
								</view>
							</block>
						</scroll-view>
					</view>
				</block>
			</view>
		</view>
		
		<view class="ptb-10 plr-10 mlr10 book-bg-3 mt10">
			<view class="just-between align-center">
				<view></view>
				<view class="flex-box tr" style="font-size: 16upx;">
					<view class="flex-box align-center">
						<view class="b-d-11 tc mlr5"></view>已预约时段
					</view>
					<view class="flex-box align-center">
						<view class="b-a-11 tc mlr5"></view>可预约时段
					</view>
				</view>
			</view>
			
			<view class="mt10">
				<block v-for="(item1,index1) in snMsg.dateArr" :key='index1'>
					<view v-show="index1==showIdx" class="just-between align-center">
						<view v-for="(item2,index2) in item1.timeArr" :key='index2' class="flex-item align-center">
							<view v-if="!item2.unused" class="b-d tr flex-box align-center">
								<view v-if="index2%2==0" class="b-d-1 tr"></view>
								<view v-if="index2%2!=0" class="b-d-2 tr"></view>
							</view>
							<view v-else class="b-a tr v-middle flex-box align-center">
								<view v-if="index2%2==0" class="b-a-1 tr"></view>
								<view v-if="index2%2!=0" class="b-a-2 tr"></view>
							</view>
						</view>
					</view>
					<view v-show="index1==showIdx" class="just-between">
						<view v-for="(item2,index2) in item1.timeArr" :key='index2' class="flex-item">
							<view v-if="index2%2==0" class="tr mt5 f-8">{{item2.id}}</view>
							<view v-if="index2%2!=0" class="tr mt5 f-8">{{item2.id}}</view>
						</view>
					</view>
				</block>
			</view>
		</view>
		
		<view v-if="bookType==1" class="ptb-10 plr-10 mlr10 book-bg-4 mt10">
			<view class="just-between align-center">
				<view class="plr-5 flex-box align-center">
					<image src="/static/list/tuangou.png" class="icon" mode="heightFix"></image>
				</view>
				<view class="flex-box align-center">
					<input @tap="scanQrcode()" :disabled="true" :placeholder="meituan||douyin?'优惠券扫码':'暂不支持兑换'" placeholder-class="c-99 f-14" class="f-14 c-33 tr mlr5" v-model="duihuanId" />
					<image v-if="(meituan||douyin) && !duihuanId" src="/static/appointment/icon_scan2.png" class="icon" @tap="scanQrcode()" mode="heightFix"></image>
					<image v-if="(meituan||douyin) && duihuanId" src="/static/appointment/icon_clear.png" class="icon" @tap="clearQrcode()" mode="heightFix"></image>
					<image v-if="(!meituan && !douyin)" src="/static/appointment/icon_scan2.png" class="icon" mode="heightFix"></image>
				</view>
			</view>
			<view class="fg-line plr-10 mt10"></view>
			<block v-if="(!meituanC && !douyinC) && showModeIdx===1">
				<view class="just-between align-center mt10">
					<view class="plr-5 flex-box align-center f-14 c-99">预约时长</view>
					<view class="plr-5 flex-box align-center f-14 c-33">{{ useHour }}小时</view>
				</view>
				<view class="just-between align-center mt10">
					<view class="plr-5 flex-box align-center f-14 c-99">包厢价格</view>
					<view v-if="selectHour==1" class="plr-5 flex-box align-center f-14 c-33">{{ snMsg.room.unitPrice }}元/小时</view>
					<view v-if="selectHour==2" class="plr-5 flex-box align-center f-14 c-33">{{ snMsg.room.unitPrice }}元/小时</view>
					<view v-if="selectHour==3" class="plr-5 flex-box align-center f-14 c-33">{{ snMsg.room.unitPrice }}元/小时</view>
					<view v-if="selectHour==4" class="plr-5 flex-box align-center f-14 c-33">{{ snMsg.room.unitPrice }}元/小时</view>
				</view>
			</block>
			<block v-if="(!meituanC && !douyinC) && showModeIdx===2">
				<view class="just-between align-center mt10">
					<view class="plr-5 flex-box align-center f-14 c-99">包厢价格</view>
					<view v-if="selectMeal==1" class="plr-5 flex-box align-center f-14 c-33">{{ _meal1.price }}元 - {{ _meal1.period }}小时套餐</view>
					<view v-if="selectMeal==2" class="plr-5 flex-box align-center f-14 c-33">{{ _meal2.price }}元 - {{ _meal2.period }}小时套餐</view>
					<view v-if="selectMeal==3" class="plr-5 flex-box align-center f-14 c-33">{{ _meal3.price }}元 - {{ _meal3.period }}小时套餐</view>
				</view>
			</block>
		</view>
		
		<view class="ptb-10 plr-10 mlr10 book-sm mt10">
			<view class="f-14 fb">使用说明</view>
			<view class="f-12 c-99 mt5">
				<text>{{snMsg.room.remark}}</text>
			</view>
		</view>
		
		<view v-if="bookType==1" class="flex-box align-center book-ft">
			<view class="book-ft-1 flex-box align-center" style="margin-left: 50upx;">
				<view v-if="duihuanId && (meituanC || douyinC)" class="align-center tc">
					<view class="f-16 c-33 fb">{{useHour}}小时套餐</view>
					<view class="f-12 c-FF6C1B">券码有效，等待核销</view>
				</view>
				<view v-else class="flex-box align-center">
					<view class="f-18 c-33 fb">{{snMsg.totalPrice.toFixed(2)}}元</view>
					<view v-if="snMsg.openIntegral && !balance && !duihuanId" class="f-12 c-FF6C1B plr-5">(余额不足)</view>
				</view>
			</view>
			<navigator class="book-ft-2 flex-box align-center" :url="'/pages/recharge/recharge?cid='+contactorUuid+'&back=true'">
				<view class="flex-item tc">
					<view class="f-16">余额充值</view>
					<view class="f-12" style="margin-top: 4upx;">({{totalMoney.toFixed(2)}} 元)</view>
				</view>
			</navigator>
			<view class="book-ft-3 flex-box align-center f-16 c-white">
				<block v-if="hasPhone">
					<view @tap="duihuan" class="flex-item tc" v-if="!duihuanId && quanId">卡券兑换</view>
					<view @tap="duihuan1" class="flex-item tc" v-if="duihuanId && meituanC && !quanId">美团验券</view>
					<view @tap="duihuan2" class="flex-item tc" v-if="duihuanId && douyinC && !quanId">抖音验券</view>
					<view @tap="book2" class="flex-item tc" v-if="!duihuanId && !quanId && balanceC==2 && showModeIdx==1">余额支付</view>
					<view @tap="book1" class="flex-item tc" v-if="!duihuanId && !quanId && balanceC==1 && showModeIdx==1">在线支付</view>
					<view @tap="book4" class="flex-item tc" v-if="!duihuanId && !quanId && balanceC==2 && showModeIdx==2">余额支付</view>
					<view @tap="book3" class="flex-item tc" v-if="!duihuanId && !quanId && balanceC==1 && showModeIdx==2">在线支付</view>
				</block>
				
				<block v-else>
					<button open-type="getPhoneNumber" @getphonenumber="duihuan" @tap="getCode" hover-class="none" class="flex-item tc" v-if="!duihuanId && quanId">卡券兑换</button>
					<button open-type="getPhoneNumber" @getphonenumber="duihuan1" @tap="getCode" hover-class="none" class="flex-item tc" v-if="duihuanId && meituanC && !quanId">美团验券</button>
					<button open-type="getPhoneNumber" @getphonenumber="duihuan2" @tap="getCode" hover-class="none" class="flex-item tc" v-if="duihuanId && douyinC && !quanId">美团验券</button>
					<button open-type="getPhoneNumber" @getphonenumber="book2" @tap="getCode" hover-class="none" class="flex-item tc" v-if="!duihuanId && !quanId && balanceC==2 && showModeIdx==1">余额支付</button>
					<button open-type="getPhoneNumber" @getphonenumber="book1" @tap="getCode" hover-class="none" class="flex-item tc" v-if="!duihuanId && !quanId && balanceC==1 && showModeIdx==1">在线支付</button>
					<button open-type="getPhoneNumber" @getphonenumber="book4" @tap="getCode" hover-class="none" class="flex-item tc" v-if="!duihuanId && !quanId && balanceC==2 && showModeIdx==2">余额支付</button>
					<button open-type="getPhoneNumber" @getphonenumber="book3" @tap="getCode" hover-class="none" class="flex-item tc" v-if="!duihuanId && !quanId && balanceC==1 && showModeIdx==2">在线支付</button>
				</block>
			</view>
		</view>
		
		<view v-if="bookType==2" class="flex-box align-center book-ft">
			<view class="book-ft-1 flex-box align-center" style="margin-left: 50upx;">
				<view class="flex-box align-center">
					<view class="f-18 c-33 fb">{{couponList[selectCouponIdx]?couponList[selectCouponIdx].unitPrice.toFixed(2):'0.00'}}元</view>
					<view class="f-12 c-FF6C1B plr-5"></view>
				</view>
			</view>
			<navigator class="book-ft-2 flex-box align-center" :url="'/pages/recharge/recharge?cid='+contactorUuid+'&back=true'">
				<view class="flex-item tc">
					<view class="f-16">余额充值</view>
					<view class="f-12" style="margin-top: 4upx;">({{totalMoney.toFixed(2)}} 元)</view>
				</view>
			</navigator>
			<view class="book-ft-3 flex-box align-center f-16 c-white">
				<block v-if="hasPhone">
					<view v-if="1==showCouponIdx" @tap="useCoupon" class="flex-item tc">核销兑换</view>
					<view v-if="2==showCouponIdx" @tap="buyCoupon" class="flex-item tc">购券兑换</view>
				</block>
				
				<block v-else>
					<button v-if="1==showCouponIdx" open-type="getPhoneNumber" @getphonenumber="useCoupon" @tap="getCode" hover-class="none" class="flex-item tc">核销兑换</button>
					<button v-if="2==showCouponIdx" open-type="getPhoneNumber" @getphonenumber="buyCoupon" @tap="getCode" hover-class="none" class="flex-item tc">购券兑换</button>
				</block>
			</view>
		</view>
		
		<view v-if="showM" class="bg-meng"></view>
		<view v-if="showM" class="psd-box bg-white tc border-box plr-20 ptb-15">
			<view class="mb10 f-18 fb">使用说明</view>
			<view v-if="business" class="f-14 c-66 mt5 tl">24小时营业，可提前{{snMsg.dateArr.length}}天预约，预约成功后不支持退款！</view>
			<view class="f-14 c-66 mt5 tl">
				<text>{{snMsg.room.remark}}</text>
			</view>
			<view @tap="showM=false" class="sure-btn c-white f-16 tc mt10 dib">已了解</view>
		</view>
		
		<view v-if="showC" class="bg-meng"></view>
		<view v-if="showC" class="psd-box bg-white tc border-box plr-20 ptb-15">
			<view class="mb10 f-18 fb">{{coupon.name}} · 使用说明</view>
			<view class="f-14 c-66 mt5 tl">每周{{coupon.weekDay.replace('1','一').replace('2','二').replace('3','三').replace('4','四').replace('5','五').replace('6','六').replace('7','日').replace(/;/g,'')}}({{coupon.startTime}}-{{coupon.endTime}})可用</view>
			<view v-if="coupon.type==1" class="f-14 c-66 mt5 tl">最长兑换限定范围内的{{coupon.couponHours}}小时</view>
			<view v-if="coupon.type==2||item.type==22" class="f-14 c-66 mt5 tl">可在限定范围下单预订{{coupon.couponHours}}小时</view>
			<view @tap="hideCouponDetail" class="sure-btn c-white f-16 tc mt10 dib">已了解</view>
		</view>
	</view>
</template>

<script>
import { getRoom, wallet1, goCancel, goV3book, goV3book2, goV5book, goV5book2, goV6book1, goV6book2, goV6book3, goV6book4,
	binding, auth,
	validCode, goV3dui2, goV3dui, goV5dui2, goV5dui, useCoupon2, useCoupon, buyCoupon2, buyCoupon,
	queryCoupon1, queryCoupon2 } from '@/common/http/api.js';
export default {
	data() {
		return {
			shortName: getApp().globalData.shortName,
			ifLogin: false,
			hasPhone: false,
			openPhone: false,
			authCode: '',
			merchantUuid: '',
			contactorUuid: '',
			roomUuid: '',
			roomName: '',
			equipmentUuid: '',
			checkMode: 1,
			checkTime: 0,
			cleanFlag: false,
			balanceC: 1,
			balanceD: false,
			balance: false,
			totalMoney: 0.00,
			totalIntegral: 0,
			money: 0.00,
			integral: 0,
			useHour: 0,
			meituan: false,
			meituanC: false,
			douyin: false,
			douyinC: false,
			duihuanId: '',
			quanId: '',
			snMsg: {
				isStaff: false,
				dateArr: [],
				room: {
					backgroundImage: '',
					calcHoursDay: 0,
					unitPrice: 0,
					priceType: 1,
					remark: ''
				},
				totalPrice: 0,
				totalIntegral: 0,
				openIntegral: true
			},
			meal1: {
				name: '',
				price: 0,
				period: 0,
				type: 1
			},
			meal2: {
				name: '',
				price: 0,
				period: 0,
				type: 1
			},
			meal3: {
				name: '',
				price: 0,
				period: 0,
				type: 1
			},
			_meal1: {
				name: '',
				price: 0,
				period: 0,
				type: 1
			},
			_meal2: {
				name: '',
				price: 0,
				period: 0,
				type: 1
			},
			_meal3: {
				name: '',
				price: 0,
				period: 0,
				type: 1
			},
			business: false,
			showIdx: 0,
			showCoupon: false,
			showCouponIdx: 1,
			showModeIdx: 1,
			couponList: [],
			selectCouponIdx: -1,
			dateArr: [],
			timeArr: [
				['00时', '01时', '02时', '03时', '04时', '05时', '06时', '07时', '08时', '09时', '10时', '11时', '12时', '13时', '14时', '15时', '16时', '17时', '18时', '19时', '20时', '21时', '22时', '23时'],
				['00分', '05分', '10分', '15分', '20分', '25分', '30分', '35分', '40分', '45分', '50分', '55分']
			],
			timeIdx: [13, 0],
			time: {
				'd': '',
				'h': '12',
				'm': '00',
				'_d': '',
				'_h': '12',
				'_m': '00'
			},
			hourArr: [],
			hourIdx: -1,
			bookType: 1,
			showM: false,
			showC: false,
			coupon: {},
			selectHour: 4,
			selectMeal: 0,
			showTimePicker: false
		};
	},
	onLoad(options) {
		this.roomUuid = options.rid
		this.scan()
	},
	methods: {
		navigateBack() {
			this.getWallet()
		},
		goDirection() {
			this.$linkJump({ url: '/pagesA/help/index' })
		},
		async scan() {
			let _this = this;
			let res = await getRoom({
				roomUuid: _this.roomUuid
			})
			if (res.code == 200) {
				_this.snMsg = res.data
				_this.roomName = _this.snMsg.room.name
				_this.contactorUuid = _this.snMsg.contactorUuid
				_this.merchantUuid = _this.snMsg.room.merchantUuid
				_this.equipmentUuid = _this.snMsg.room.equipmentUuid
				_this.useHour = _this.snMsg.room.calcHoursDay
				_this.meituan = _this.snMsg.openMeituan
				_this.douyin = _this.snMsg.openDouyin
				_this.business = _this.snMsg.business
				_this.snMsg.openIntegral = true
				if (_this.business) {
					_this.getTime()
					_this.setTime()
				} else {
					_this.getTime1()
					_this.setTime1()
				}
				_this.showModeIdx = 1
				let ix = 0;
				for(let i=_this.useHour; i<=24; i++) {
					_this.hourArr.push(i)
					if (ix==0) {
						_this.meal1.period = i
					} else if (ix==2) {
						_this.meal2.period = i
					} else if (ix==4) {
						_this.meal3.period = i
					}
					ix++
				}
				_this.hourIdx = 0
				
				_this.getWallet()
				_this.clearQrcode()
				
				let meal1Arr = _this.snMsg.room.meal1.split('#')
				_this._meal1 = {
					name: meal1Arr[0],
					price: meal1Arr[1],
					period: meal1Arr[2],
					type: meal1Arr[3]
				}
				let meal2Arr = _this.snMsg.room.meal2.split('#')
				_this._meal2 = {
					name: meal2Arr[0],
					price: meal2Arr[1],
					period: meal2Arr[2],
					type: meal2Arr[3]
				}
				let meal3Arr = _this.snMsg.room.meal3.split('#')
				_this._meal3 = {
					name: meal3Arr[0],
					price: meal3Arr[1],
					period: meal3Arr[2],
					type: meal3Arr[3]
				 }
				
			} else if (res.code == 401) {
				// _this.autoLogin()
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none',
					duration: 2000
				})
			}
		},
		
		book1(e) {
			this._book1(e)
		},
		async _book1(e) {
			let _this = this;
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await goV3book2({
						roomUuid: _this.snMsg.room.uuid,
						openIntegral: _this.balanceC==2?true:false,
						useHour: _this.useHour,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.requestPayment({
						    provider: 'wxpay',
							timeStamp: res.data.timeStamp,
							nonceStr: res.data.nonceStr,
							package: res.data.package,
							signType: res.data.signType,
							paySign: res.data.paySign,
						    success() {
								uni.switchTab({
									url: '/pages/order/index'
								})
							},
							fail() {
								_this.cancel();
							}
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await goV3book({
						roomUuid: _this.snMsg.room.uuid,
						openIntegral: _this.balanceC==2?true:false,
						useHour: _this.useHour,
						checkMode: _this.checkMode,
						checkTime: _this.checkTime
					})
					if (res.code == 200) {
						uni.requestPayment({
							provider: 'wxpay',
							timeStamp: res.data.timeStamp,
							nonceStr: res.data.nonceStr,
							package: res.data.package,
							signType: res.data.signType,
							paySign: res.data.paySign,
							success(res) {
								uni.switchTab({
									url: '/pages/order/index'
								})
							},
							fail() {
								_this.cancel();
							}
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 701);
			}
		},
		
		book2(e) {
			let _this = this;
			uni.showModal({
				title: '温馨提示',
				content: '是否使用余额支付',
				confirmText: '支付',
				confirmColor: '#58AA6C',
				cancelColor: '#CCCCCC',
				success: (res) => {
					if (res.confirm) {
						_this._book2(e)
					}
				}
			})
		},
		async _book2(e) {
			let _this = this;
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await goV5book2({
						roomUuid: _this.snMsg.room.uuid,
						useHour: _this.useHour,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await goV5book2({
						roomUuid: _this.snMsg.room.uuid,
						useHour: _this.useHour
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 702);
			}
		},
		
		book3(e) {
			this._book3(e)
		},
		async _book3(e) {
			let _this = this;
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await goV6book1({
						roomUuid: _this.snMsg.room.uuid,
						useMeal: _this.selectMeal,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.requestPayment({
						    provider: 'wxpay',
							timeStamp: res.data.timeStamp,
							nonceStr: res.data.nonceStr,
							package: res.data.package,
							signType: res.data.signType,
							paySign: res.data.paySign,
						    success() {
								uni.switchTab({
									url: '/pages/order/index'
								})
							},
							fail() {
								_this.cancel();
							}
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await goV6book3({
						roomUuid: _this.snMsg.room.uuid,
						useMeal: _this.selectMeal
					})
					if (res.code == 200) {
						let data = res.data.data;
						uni.requestPayment({
						    provider: 'wxpay',
							timeStamp: res.data.timeStamp,
							nonceStr: res.data.nonceStr,
							package: res.data.package,
							signType: res.data.signType,
							paySign: res.data.paySign,
						    success() {
								uni.switchTab({
									url: '/pages/order/index'
								})
							},
							fail() {
								_this.cancel();
							}
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 703);
			}
		},
		
		book4(e) {
			let _this = this;
			uni.showModal({
				title: '温馨提示',
				content: '是否使用余额支付',
				confirmText: '支付',
				confirmColor: '#58AA6C',
				cancelColor: '#CCCCCC',
				success: (res) => {
					if (res.confirm) {
						_this._book4(e)
					}
				}
			})
		},
		async _book4(e) {
			let _this = this;
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await goV6book2({
						roomUuid: _this.snMsg.room.uuid,
						useMeal: _this.selectMeal,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await goV6book4({
						roomUuid: _this.snMsg.room.uuid,
						useMeal: _this.selectMeal
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 704);
			}
		},
		
		cancel() {
			let _this = this;
			goCancel({
				roomUuid: _this.snMsg.room.uuid
			})
		},
		cacl() {
			this.integral = (this.snMsg.totalPrice * 0.2).toFixed(0);
			this.money = (this.snMsg.totalPrice - this.integral).toFixed(2);
			
			let integral_temp = 0, money_temp = 0.00;
			if (this.snMsg.openIntegral) {
				if (this.totalIntegral > this.integral) {
					integral_temp = this.integral;
					money_temp = (this.snMsg.totalPrice - integral_temp).toFixed(2);
				} else {
					integral_temp = this.totalIntegral;
					money_temp = (this.snMsg.totalPrice - integral_temp).toFixed(2);
				}
			} else {
				integral_temp = 0;
				money_temp = (this.snMsg.totalPrice - integral_temp).toFixed(2);
			}
			
			this.snMsg.totalIntegral = integral_temp
			if (!this.meituanC && !this.douyinC) {
				if (money_temp > this.totalMoney) {
					this.balance = false
					this.balanceD = true
					this.balanceC = 1
				} else {
					this.balance = true
					this.balanceD = false
					this.balanceC = 2
				}
			}
		},
		chooseHour(mode) {
			this.selectHour = mode
			if (mode == 1) {
				this.useHour = this.meal1.period
			} else if (mode == 2) {
				this.useHour = this.meal2.period
			} else if (mode == 3) {
				this.useHour = this.meal3.period
			}
			this.snMsg.totalPrice = this.snMsg.room.unitPrice * this.useHour
			
			if (this.business) {
				this.setTime()
			} else {
				this.getTime1()
				this.setTime1()
			}
			
			this.cacl()
		},
		chooseMeal(mode) {
			this.selectMeal = mode
			if (mode == 1) {
				this.useHour = this._meal1.period*1
				this.snMsg.totalPrice = this._meal1.price*1
			} else if (mode == 2) {
				this.useHour = this._meal2.period*1
				this.snMsg.totalPrice = this._meal2.price*1
			} else if (mode == 3) {
				this.useHour = this._meal3.period*1
				this.snMsg.totalPrice = this._meal3.price*1
			}
			
			if (this.business) {
				this.setTime()
			} else {
				this.getTime1()
				this.setTime1()
			}
			
			this.cacl()
		},
		bindChooseHourChange(e) {
			this.selectHour = 4
			let value = e.detail.value
			this.hourIdx = value
			this.useHour = this.hourArr[this.hourIdx]
			
			this.snMsg.totalPrice = this.snMsg.room.unitPrice * this.useHour
			
			if (this.business) {
				this.setTime()
			} else {
				this.getTime1()
				this.setTime1()
			}
			
			this.cacl()
		},
		checkChange() {
			this.meituanC = false
			this.douyinC = false
			this.duihuanId = ''
			this.selectHour = 4
			this.useHour = this.snMsg.room.calcHoursDay
			
			this.snMsg.totalPrice = this.snMsg.room.unitPrice * this.useHour
			this.cacl()
			
			if (this.snMsg.openIntegral) {
				this.balanceC = 2
			} else {
				this.balanceC = 1
			}
		},
		async getWallet() {
			let _this = this;
			//获取钱包
			let res = await wallet1()
			if (res.code == 200) {
				let data = res.data;
				_this.totalMoney = data.money + data.integral;
				_this.totalIntegral = 0;
				
				if (data.cellphone) {
					_this.hasPhone = true;
				}
				
				_this.integral = (_this.snMsg.totalPrice * 0.2).toFixed(0);
				_this.money = (_this.snMsg.totalPrice - _this.integral).toFixed(2);
				
				_this.cacl();
			} else if (res.code == 401) {
				_this.autoLogin()
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none',
					duration: 2000
				})
			}
		},
		
		getCode() {
			let _this = this;
			wx.login({
				success: (res) => {
					if (res.code) {
						_this.authCode = res.code;
					} else {
						console.log('登录失败')
					}
				}
			})
		},
		async goLogin(e, type) {
			let _this = this;
			if (_this.hasPhone) {
				_this.loginSucess(type);
			} else {
				if (e.detail.encryptedData && e.detail.iv) {
					let res = await binding({
						authCode: _this.authCode,
						wxEncryptData: e.detail.encryptedData,
						wxIvData: e.detail.iv
					})
					if (res.code === 200) {
						_this.hasPhone = true;
						uni.showModal({
							title: '温馨提醒',
							content: '授权成功，是否继续',
							confirmText: '继续',
							confirmColor: '#58AA6C',
							cancelColor: '#CCCCCC',
							success(res) {
								if (res.confirm) {
									_this.loginSucess(type);
								}
							}
						})
					}
				}
			}
		},
		loginSucess(type) {
			let _this = this;
			if (type == 701) {
				_this.book1()
			} else if (type == 702) {
				_this.book2()
			} else if (type == 703) {
				_this.book3()
			} else if (type == 704) {
				_this.book4()
			} else if (type == 2) {
				_this.duihuan()
			} else if (type == 101) {
				_this.duihuan1()
			} else if (type == 102) {
				_this.duihuan2()
			} else if (type == 3) {
				_this.scanQrcode()
			} else if (type == 21) {
				_this.useCoupon()
			} else if (type == 22) {
				_this.buyCoupon()
			}
		},
		autoLogin() {
			let _this = this;
			wx.login({
				success: async (res) => {
					if (res.code) {
						_this.authCode = res.code;
						let res1 = await auth({
							authCode: _this.authCode
						})
						if (res1.code === 200) {
							_this.autoLoginSuccess(res.data.data.accessToken.accessToken)
						}
					} else {
						console.log('登录失败！')
					}
				}
			})
		},
		autoLoginSuccess(token) {
			let _this = this;
			if (token) {
				uni.setStorage({
					key: 'token',
					data: token,
					success: () => {
						_this.scan()
						if (_this.business) {
							_this.getWallet()
							_this.getTime()
							_this.getDateArr()
							_this.setTime()
						}
					},
				})
			}
		},
		
		scanQrcode() {
			let _this = this;
			uni.scanCode({
				success: async res => {
					// _this.useHour = 3
					// _this.duihuanId = '12345678'
					// _this.meituanC = true
					// _this.douyinC = true
					// if (_this.business) {
					// 	_this.setTime();
					// }
					// _this.snMsg.totalPrice = _this.snMsg.room.unitPrice * _this.useHour
					// _this.cacl();
				
					if (res.errMsg == 'scanCode:ok') {
						let res = await validCode({
							roomUuid: _this.roomUuid,
							qrcode: res.result
						})
						if (res.code === 200) {
							let data = res.data;
							_this.useHour = data.totalHours;
							_this.duihuanId = data.duihuanId;
							
							if (data.meituan) {
								_this.meituanC = true
							}
							if (data.douyin) {
								_this.douyinC = true
							}
							
							if (_this.business) {
								_this.setTime();
							}
							
							_this.snMsg.totalPrice = _this.snMsg.room.unitPrice * _this.useHour
							_this.cacl();
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none',
								duration: 2000,
								success() {
									_this.checkChange()
								}
							})
						}
					} else {
						uni.showToast({
							title: '无效二维码，请重新扫码',
							icon: 'none',
							duration: 2000,
							success() {
								_this.checkChange()
							}
						});
					}
				},
				fail(res) {
					if (res.errMsg == 'scanCode:fail') {
						uni.showToast({
							title: '无效二维码，请重新扫码',
							icon: 'none',
							duration: 2000,
							success() {
								_this.checkChange()
							}
						})
					}
				}
			})
		},
		clearQrcode() {
			this.checkChange()
		},
		
		duihuan(e) {
			this._duihuan(e)
		},
		async _duihuan(e) {
			let _this = this;
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await goV3dui2({
						roomUuid: _this.snMsg.room.uuid,
						duihuanId: _this.duihuanId,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await goV3dui({
						roomUuid: _this.snMsg.room.uuid,
						duihuanId: _this.duihuanId,
						checkMode: _this.checkMode,
						checkTime: _this.checkTime
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 2);
			}
		},
		
		duihuan1(e) {
			this._duihuan1(e)
		},
		async _duihuan1(e) {
			let _this = this;
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await goV3dui2({
						roomUuid: _this.snMsg.room.uuid,
						duihuanId: _this.duihuanId,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await goV3dui({
						roomUuid: _this.snMsg.room.uuid,
						duihuanId: _this.duihuanId,
						checkMode: _this.checkMode,
						checkTime: _this.checkTime
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 101);
			}
		},
		
		duihuan2(e) {
			this._duihuan2(e)
		},
		async _duihuan2(e) {
			let _this = this;
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await goV5dui2({
						roomUuid: _this.snMsg.room.uuid,
						duihuanId: _this.duihuanId,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await goV5dui({
						roomUuid: _this.snMsg.room.uuid,
						duihuanId: _this.duihuanId,
						checkMode: _this.checkMode,
						checkTime: _this.checkTime
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 102);
			}
		},
		
		bindTimeChange(e) {
			let value = e.detail.value
			this.timeIdx[0] = value[0]
			this.timeIdx[1] = value[1]
			this.time.h = this.timeArr[0][value[0]].replace('时', '')
			this.time.m = this.timeArr[1][value[1]].replace('分', '')
			
			this.setTime()
		},
		bindTimePickerChange(e) {
			console.log(e)
			let value = e.detail.value
			this.timeIdx[0] = value[0]
			this.timeIdx[1] = value[1]
			this.time.h = this.timeArr[0][value[0]].replace('时', '')
			this.time.m = this.timeArr[1][value[1]].replace('分', '')
			
			this.setTime()
		},
		getTime() {
			let now = new Date()
			let d = now.getDate()
			let h = now.getHours()
			let m = now.getMinutes()
			let m1 = parseInt(m/5) + 1
			if (m1 == 12) {
				m1 = 0
				h++
			}
			if (h == 24) {
				h = 0
			}
			this.timeIdx[0] = h
			this.timeIdx[1] = m1
			this.time.h = this.timeArr[0][h].replace('时', '')
			this.time.m = this.timeArr[1][m1].replace('分', '')
		},
		setTime() {
			let idx = this.timeIdx[0] + this.useHour
			if (idx > 23) {
				this.time._d = '次日'
				idx = idx - 24
			} else {
				this.time._d = ''
			}
			this.time._h = this.timeArr[0][idx].replace('时', '')
			this.time._m = this.time.m
		},
		getTime1() {
			let now = new Date()
			let d = now.getDate()
			let h = now.getHours()
			let m = now.getMinutes()
			this.timeIdx[0] = h
			this.timeIdx[1] = m
			this.time.h = h<10?'0'+h:h
			this.time.m = m<10?'0'+m:m
		},
		setTime1() {
			let idx = this.timeIdx[0] + this.useHour
			if (idx > 23) {
				this.time._d = '次日'
				idx = idx - 24
			} else {
				this.time._d = ''
			}
			this.time._h = idx<10?'0'+idx:idx
			this.time._m = this.time.m
		},
		
		bookTypeChange(mode) {
			if (mode == 1) {
				this.bookType = 1
			} else if (mode == 2) {
				this.bookType = 2
				this.tabCoupon(2)
			}
		},
		
		chooseCoupon() {
			this.showCoupon = true
			this.showCouponIdx = 2
			this.queryMerchantCoupon()
		},
		tabCoupon(mode) {
			this.couponList = []
			this.selectCouponIdx = -1
			this.showCouponIdx = mode
			if (mode == 1){
				this.queryUserCoupon()
			} else if (mode == 2) {
				this.queryMerchantCoupon()
			}
		},
		tabMode(mode) {
			this.showModeIdx = mode
			
			this.meituanC = false
			this.douyinC = false
			this.duihuanId = ''
			
			if (mode == 1) {
				this.selectHour = 4
				this.useHour = this.snMsg.room.calcHoursDay
				this.snMsg.totalPrice = this.snMsg.room.unitPrice * this.useHour
				this.cacl()
			} else if (mode == 2) {
				if (this._meal1.price*1>0 && this._meal1.period*1>0) {
					this.selectMeal = 1
					this.useHour = this._meal1.period*1
					this.snMsg.totalPrice = this._meal1.price*1
					this.cacl()
				} else if (this._meal2.price*1>0 && this._meal2.period*1>0) {
					this.selectMeal = 2
					this.useHour = this._meal2.period*1
					this.snMsg.totalPrice = this._meal2.price*1
					this.cacl()
				} else if (this._meal3.price*1>0 && this._meal3.period*1>0) {
					this.selectMeal = 3
					this.useHour = this._meal3.period*1
					this.snMsg.totalPrice = this._meal3.price*1
					this.cacl()
				}
			}
			
			if (this.snMsg.openIntegral) {
				this.balanceC = 2
			} else {
				this.balanceC = 1
			}
		},
		
		selectCoupon(uuid, idx) {
			this.selectCouponIdx = idx
		},
		
		async queryUserCoupon() {
			let _this = this
			let res = await queryCoupon1({
				roomUuid: _this.roomUuid
			})
			if (res.code == 200) {
				_this.couponList = res.data
			}
		},
		async queryMerchantCoupon() {
			let _this = this
			let res = await queryCoupon2({
				roomUuid: _this.roomUuid
			})
			if (res.code == 200) {
				_this.couponList = res.data
			}
		},
		
		useCoupon(e) {
			this._useCoupon(e)
		},
		async _useCoupon(e) {
			let _this = this;
			if (_this.selectCouponIdx == -1) {
				uni.showToast({
					icon: 'error',
					title: '请选择卡券',
					duration: 1200,
					success() {
						
					}
				})
				return
			}
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await useCoupon2({
						roomUuid: _this.snMsg.room.uuid,
						couponUuid: _this.couponList[_this.selectCouponIdx].uuid,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await useCoupon({
						roomUuid: _this.snMsg.room.uuid,
						couponUuid: _this.couponList[_this.selectCouponIdx].uuid
					})
					if (res.code == 200) {
						uni.switchTab({
							url: '/pages/order/index'
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 21);
			}
		},
		
		buyCoupon(e) {
			this._buyCoupon(e)
		},
		async _buyCoupon(e) {
			let _this = this;
			if (_this.selectCouponIdx == -1) {
				uni.showToast({
					icon: 'error',
					title: '请选择卡券',
					duration: 1200,
					success() {
						
					}
				})
				return
			}
			if (_this.hasPhone) {
				if (_this.business) {
					let res = await buyCoupon2({
						roomUuid: _this.snMsg.room.uuid,
						couponUuid: _this.couponList[_this.selectCouponIdx].uuid,
						useTimes: _this.snMsg.dateArr[_this.showIdx].id + ';' + _this.timeIdx.join(';')
					})
					if (res.code == 200) {
						uni.requestPayment({
						    provider: 'wxpay',
							timeStamp: res.data.timeStamp,
							nonceStr: res.data.nonceStr,
							package: res.data.package,
							signType: res.data.signType,
							paySign: res.data.paySign,
						    success() {
								uni.switchTab({
									url: '/pages/order/index'
								})
							},
							fail() {
								_this.cancel();
							}
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				} else {
					let res = await buyCoupon({
						roomUuid: _this.snMsg.room.uuid,
						couponUuid: _this.couponList[_this.selectCouponIdx].uuid
					})
					if (res.code == 200) {
						uni.requestPayment({
						    provider: 'wxpay',
							timeStamp: res.data.timeStamp,
							nonceStr: res.data.nonceStr,
							package: res.data.package,
							signType: res.data.signType,
							paySign: res.data.paySign,
						    success() {
								uni.switchTab({
									url: '/pages/order/index'
								})
							},
							fail() {
								_this.cancel();
							}
						})
					} else if (res.code == 401) {
						_this.autoLogin()
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 3000
						})
					}
				}
			} else {
				_this.goLogin(e, 22);
			}
		},
		preview(url) {
			uni.previewImage({
				urls: url.split(',')
			})
		},
		
		showCouponDetail(coupon) {
			this.coupon = coupon
			this.showC = true
		},
		hideCouponDetail() {
			this.coupon = {}
			this.showC = false
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f7f7f7;
}
.book-bg-temp {
	background: linear-gradient(180deg, #58AA6C 0%, #84C794 100%);
	height: 150rpx;
}

.book-bg-1 {
	position: relative;
	top: -150rpx;
	
	.head-bottom {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		padding: 6upx 10upx 6upx 30upx;
		border-bottom-left-radius: 12upx;
		border-bottom-right-radius: 12upx;
	}
	.head-bottom-1 {
		background: rgba(0, 0, 0, 0.8);
		border-radius: 20upx;
		padding: 5upx 15upx;
	}
	
	.txt-animate {
		background: rgba(0, 0, 0, 0.75);
		position: absolute;
		left: 0;
		right: 0;
		bottom: 48upx;
		overflow: hidden;
		
		.animate {
			display: inline-block;
			white-space: nowrap;
			animation: 15s wordsLoop linear infinite normal;
		}
	}
}
@keyframes wordsLoop {
	0% {
		transform: translateX(0px);
	}
	100% {
		transform: translateX(-100%);
	}
}

.book-bg-2 {
	position: relative;
	top: -150rpx;
	background-color: #FFFFFF;
	border-radius: 22upx;
	border: 6upx solid #7BC18C;
	
	.book-bg-2-top {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		height: 80upx;
	}
	
	.bookType-bg{
		border: 1px solid #7BC18C;
		margin: 10upx 38% 0 38%;
	}
	
	.sort-item {
		background-color: #FFFFFF;
		padding: 2px 0px;
		margin: 0 5px;
		border-radius: 3px;
		.txt1 {
			color: #666666;
		}
		.txt2 {
			margin-top: 6upx;
			color: #333333;
			font-weight: 600;
		}
	}
	.sort-item.active{
		background-color: #7BC18C;
		padding: 4upx 0;
		margin: 0 10upx;
		border-radius: 8upx;
		.txt1 {
			color: #FFFFFF;
		}
		.txt2 {
			color: #FFFFFF;
		}
	}

	.txt-youhui1{
		position: absolute;
		top: 4upx;
		right: 4upx;
		color: #7BC18C;
		height: 70upx;
		width: 70upx;
		// padding: 15upx 18upx;
		background-color: #FFFFFF;
		border-radius: 50%;
	}
	.txt-youhui2{
		position: absolute;
		top: 4upx;
		right: 4upx;
		color: #FFFFFF;
		height: 70upx;
		width: 70upx;
		// padding: 15upx 18upx;
		background-color: #7BC18C;
		border-radius: 50%;
	}
	
	.hour-box {
		background-color: #FFFFFF;
		padding: 8upx 14upx;
		margin: 0 8upx;
		border-radius: 10upx;
		border: 1px solid #E4E4E4;
		color: #333333;
	}
	.hour-box.active {
		background-color: #7BC18C;
		padding: 8upx 14upx;
		margin: 0 8upx;
		border-radius: 10upx;
		color: #FFFFFF;
	}
	
	.time-box {
		background-color: #7BC18C;
		padding: 12upx 30upx;
		margin: 0 10upx;
		border-radius: 10upx;
		color: #FFFFFF;
	}
	.time-box.disable {
		background-color: #FFFFFF;
		padding: 12upx 30upx;
		margin: 0 10upx;
		border-radius: 10upx;
		border: 1px solid #E4E4E4;
		color: #333333;
	}

	.coupon-head {
		margin: 10upx 120upx;
		background-color: #7BC18C;
		border-radius: 8upx;
		color: #FFFFFF;
	}
	.coupon-head .active {
		margin: 6upx 6upx;
		background-color: #FFFFFF;
		border-radius: 8upx;
		color: #333333;
	}
	
	.coupon-body {
		height: 450upx;
	}
	.empty-coupon {
		width: 408upx;
		height: 254upx;
	}
	.coupon-vt {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		
		.coupon-vt-1 {
			width: 33%;
		}
		.coupon-vt-2 {
			width: 39%;
			overflow: hidden;
			
			.coupon-tl {
				display: inline-block;
				white-space: nowrap;
				animation: 10s wordsLoop linear infinite normal;
			}
			
		}
		.coupon-vt-3 {
			width: 28%;
			color: #7BC18C;
			
			.coupon-vt-31 {
				background-color: #FFFFFF;
				padding: 10upx;
				border-radius: 50upx;
				width: 65%;
			}
		}
	}
}

.book-bg-3 {
	position: relative;
	top: -150rpx;
	background-color: #FFFFFF;
	border-radius: 26upx;
	
	.b-a{
		background-color: #F4F4F4;
		height: 14upx;
		
		.b-a-1 {
			height: 14upx;
			width: 1px;
			background-color: #CCCCCC;
		}
		.b-a-2 {
			height: 2px;
			width: 2px;
			border-radius: 2px;
			background-color: #CCCCCC;
		}
	}
	.b-d{
		background-color: #58AA6C;
		height: 14upx;
		
		.b-d-1 {
			height: 14upx;
			width: 1upx;
			background-color: #FFFFFF;
		}
		.b-d-2 {
			height: 2px;
			width: 2px;
			border-radius: 2px;
			background-color: #FFFFFF;
		}
	}
	.b-a-11{
		background-color: #F4F4F4;
		border-radius: 5upx;
		width: 25upx;
		height: 18upx;
	}
	.b-d-11{
		background-color: #58AA6C;
		border-radius: 5upx;
		width: 25upx;
		height: 18upx;
	}
}

.book-bg-4 {
	position: relative;
	top: -150rpx;
	background-color: #FFFFFF;
	border-radius: 26upx;
	
	.fg-line {
		border-bottom: 1px solid #D9D9D9;
	}
	
	.icon {
		height: 46upx;
	}
}

.book-sm {
	position: relative;
	top: -150rpx;
	background-color: #FFFFFF;
	border-radius: 26upx;
}

.book-ft {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 24upx;
	height: 104upx;
	background-color: #FFFFFF;
	border-radius: 52upx;
	
	
	.book-ft-1 {
		width: 44%;
		height: 100%;
		background-color: #FFFFFF;
		border-top-left-radius: 52upx;
		border-bottom-left-radius: 52upx;
	}
	.book-ft-2 {
		width: 28%;
		height: 100%;
		background-color: #EBF1FF;
		color: #58AA6C;
	}
	.book-ft-3 {
		width: 28%;
		height: 100%;
		background-color: #58AA6C;
		border-top-right-radius: 52upx;
		border-bottom-right-radius: 52upx;
		
		button {
			width: 28%;
			color: #FFFFFF;
			background-color: #58AA6C;
			font-size: 32upx;
			border-top-right-radius: 52upx;
			border-bottom-right-radius: 52upx;
			border: 0px;
		}
		button::after {
			border: 0px;
		}
	}
}

.sure-btn {
	width: 300upx;
	height: 64upx;
	line-height: 64upx;
	background: #58AA6C;
	border-radius: 32upx;
}

.psd-box {
	width: 90%;
	position: fixed;
	top: 45%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 1000;
	border-radius: 10px;
}

.time-picker {
	position: fixed;
	bottom: 0;
	right: 0;
	left: 0;
	height: 50vh;
	z-index: 1000;
	background-color: #FFFFFF;
}

.todo-box {
	box-shadow: 2rpx 6rpx 30rpx 2rpx rgba(109, 75, 23, 0.1);
	border-radius: 16rpx 16rpx 16rpx 16rpx;

	.tip-doing {
		color: #D9A661;
		background: rgba(217, 166, 97, 0.12);
		border-radius: 8rpx 8rpx 8rpx 8rpx;
		opacity: 1;
		border: 1rpx solid #D9A661;
		padding: 4rpx 6rpx;
		font-size: 24rpx;
	}
}
</style>
