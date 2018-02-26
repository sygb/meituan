const express = require('express')
const router = express.Router()
const meituan = require('../meituan')

router.post('/', async (req, res, next) => {
  res.json(await meituan(req.body))
})

module.exports = router
