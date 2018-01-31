const  express = require('express');
const router = express.Router();

/* GET active tournamets. */
router.get('/active', function(req, res, next) {
  res.render('active_tournament', { title: 'Active Tournament' });
});

module.exports = router;
