const random = require('./random')

const numbers = [
  // 联通
  130, 131, 132, 145, 155, 156, 166, 175, 176, 185, 186,
  // 移动
  134, 135, 136, 137, 138, 139, 147, 150, 151, 152, 157, 158, 159, 178, 182, 183, 184, 187, 188, 198
  // 电信用户占比太少，不参与随机
]

module.exports = exclude => {
  let phone
  while (true) {
    phone = numbers[random(0, numbers.length - 1)] + String(Math.random() * 10).slice(-8)
    // 别随机到了要领取的那个号，理论上应该收集使用辅助的用户手机号，都存起来排除
    if (phone !== exclude) {
      return phone
    }
  }
}
