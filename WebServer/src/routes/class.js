const express = require('express')
const router = express.Router()

const classController = require('../app/controllers/ClassController.js')

router.put('/students', classController.addStudents)
router.post('/', classController.createClass)
router.get('/:idClass', classController.index)
router.get('/', classController.getAll)


module.exports = router