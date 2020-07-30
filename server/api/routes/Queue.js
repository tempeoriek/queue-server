const router = express.Router(),
queue = require('../controllers/QueueController');

router.post('/book_vip', queue.bookVip);
router.post('/book_guest', queue.bookGuest);
router.post('/fetch', queue.fetchData);
// router.post('/test_api', queue.testApi);

module.exports = router;
