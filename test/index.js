const meituan = require('../meituan')

;(async () => {
  console.log(await meituan({
    url: 'https://activity.waimai.meituan.com/coupon/sharechannel/B2EA8E1ABA8B47EA82DB475BA17B517D?urlKey=7C2971CE3407422C994F15903F4DE516&utm_term=AiphoneBwaimaiC6.3.1DweixinEwm-orderGB9A049F737DBDB44A756329274DACC71DB8A2769958703BCA4F775B1AB3ACC3720180225221206611&utm_source=appshare&utm_medium=iOSweb',
    mobile: '18012345678'
  }))
})()
