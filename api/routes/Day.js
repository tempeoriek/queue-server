const router = express.Router(),
day = require('../controllers/DayController');

router.get('/fetch', day.fetchRecord);
router.get('/fetch_admin', day.fetchRecordAdmin);

module.exports = router;
