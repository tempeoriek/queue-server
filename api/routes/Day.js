const router = express.Router(),
day = require('../controllers/DayController');

router.get('/fetch', day.fetchRecord);

module.exports = router;
