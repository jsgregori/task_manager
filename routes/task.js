var express = require('express');
var router = express.Router();

const userMiddleware = require('../middlewares/userMiddleware');

const taskController = require('../controllers/taskController');


router.get('/', userMiddleware, taskController.root);

router.get('/add', userMiddleware, taskController.add);
router.post('/add', taskController.create);

module.exports = router;
