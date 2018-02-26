const axios = require('axios')
const querystring = require('querystring')
let cookies = require('./cookies')
const phone = require('./phone')
const rohr = require('./rohr')
const crypto = require('./crypto')

const origin = 'https://activity.waimai.meituan.com'

async function request ({url, mobile}) {
  if (!/^1\d{10}$/.test(mobile)) {
    throw new Error('请输入 11 位手机号码')
  }

  let params
  try {
    params = {
      ...querystring.parse(url.split('?').pop()),
      channelUrlKey: url.match(/\/(?:sharechannelredirect|sharechannel)\/(.*?)\?/).pop()
    }
  } catch (e) {
    if (url.indexOf('https://activity.waimai.meituan.com/') !== 0) {
      throw new Error('请输入正确的红包链接')
    }
  }

  console.log('开始抢红包', [url, mobile])

  const request = axios.create({
    baseURL: origin,
    headers: {
      origin,
      referer: origin,
      'user-agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T MicroMessenger) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36'
    },
    transformRequest: [data => querystring.stringify(data)]
  })

  async function post (url, params = {}, config = {}) {
    params._token = rohr.reload(`${url}?${querystring.stringify(params)}`)
    // console.log(params)
    const {data} = await request.post(url, params, config)
    data.data = crypto(data.data)
    if (typeof data.data === 'string') {
      data.data = JSON.parse(data.data)
    }
    // console.log(data)
    return data
  }

  let index = 0
  const {data} = await post('/async/coupon/sharechannelredirect', params)
  if (data === false) {
    throw new Error('红包链接不正确\n或\n请求美团服务器失败')
  }
  const lucky = ~~data.share_title.match(/第(\d+)个/).pop()
  console.log(`第 ${lucky} 个是手气最佳红包`)

  return (async function lottery (userPhone2) {
    const res = await (async function grabShareCoupon () {
      const userPhone = userPhone2 || phone(userPhone2)
      console.log(`使用 ${userPhone} 尝试领取`)
      const cookie = cookies[index]
      if (!cookie) {
        console.log('没这么多微信号 或 红包链接不正确')
        throw new Error('红包链接不正确\n或\n请求美团服务器失败')
      }
      const res = await post('/coupon/grabShareCoupon', {
        userPhone,
        channelUrlKey: data.channelUrlKey,
        urlKey: params.urlKey,
        dparam: data.dparam,
        originUrl: url,
        baseChannelUrlKey: '',
        uuid: '',
        platform: 11,
        partner: 162,
        riskLevel: 71
      }, {
        headers: {
          cookie
        }
      })
      // 4201 需要验证码
      // 1006 该号码归属地暂不支持
      // 1 成功
      // 7003 已领过
      // 4000 抢光了
      // 7002 微信 cookie 不正确或失效
      // 7006 今日领取次数达达到上限。领取次数居然是跟微信号走的，做公开服务暂时无解
      console.log(res.code, res.msg)
      if ([1, 4000, 7003].includes(res.code)) {
        return res
      }
      if (res.code === 7002) {
        throw new Error(`账号（${index}）无效，需要更新 cookie`)
      }
      if (res.code === 7006) {
        const [first, ...other] = cookies
        cookies = [...other, first]
      }
      return grabShareCoupon()
    })()
    const length = res.data.wxCoupons.length
    const number = lucky - length
    if (number <= 0) {
      console.log('手气最佳红包已被领取')
      return res.data.wxCoupons.find(w => w.bestLuck)
    }
    console.log(`还有 ${number} 个是最佳红包`)
    index++
    return lottery(number === 1 ? mobile : null)
  })()
}

module.exports = async params => {
  try {
    const res = await request(params)
    console.log(res)
    return {message: `手气最佳红包已被领取\n\n手气最佳：${res.nick_name}\n红包金额：${res.coupon_price / 100} 元\n领取时间：${res.dateStr}`}
  } catch (e) {
    console.error(e)
    return {message: e.message}
  }
}
