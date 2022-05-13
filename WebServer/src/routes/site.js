const express = require('express')//?
const router = express.Router()

const siteController = require('../app/controllers/SiteController.js')

//newsController.index

//router.use('/search', siteController.search)
router.get('/', siteController.index)

router.post('/check', siteController.check)
router.get('/check', siteController.getCheck)
router.get('/info', siteController.getInfo)

module.exports = router