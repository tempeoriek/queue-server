const router = express.Router(),
time = require('../controllers/TimeController');

router.post('/fetch', time.fetchRecord);

module.exports = router;
