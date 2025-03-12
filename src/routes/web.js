const express = require('express')
const { getHomepage, postCreateUsers, create_user, list_users,UpdateUsers,EditUsers,Delete,
    PostDelete,PostLogin,PLC_data,PLC_HMI} = require('../controllers/homeController')
const router = express.Router()
//khai báo route
router.get('/', getHomepage)

router.post('/create-users', postCreateUsers)
router.get('/create_user', create_user)
router.get('/list', list_users)
router.get('/edit/:id', EditUsers)
router.post('/update-users', UpdateUsers)
router.post('/Delete/:id', Delete)
router.post('/Delete', PostDelete)
router.post('/login-users', PostLogin)
router.get('/data', PLC_data)
router.get('/hmi', PLC_HMI)
module.exports = router