const  express = require('express');
const _ = require('lodash');
const router = express.Router();

const Db = require('../services/db');

/* GET active tournamets. */

const createTable = (tournament) => {
  let playerScores = _.cloneDeep(tournament.players);
  playerScores = playerScores.map((player) => (
    Object.assign({}, player, {
      points: 0,
      matches: 0,
      for: 0,
      against: 0,
    })
  ));
  tournament.matches.forEach((match) => {
    if (match.played) {
      const player1 = _.find(playerScores, {id: match.player_1_id})
      player1.matches++;
      player1.points += match.player_1_points;
      player1.for += match.player_1_goals;
      player1.against += match.player_2_goals;

      const player2 = _.find(playerScores, {id: match.player_2_id});
      player2.matches++;
      player2.points += match.player_2_points;
      player2.for += match.player_2_goals;
      player2.against += match.player_1_goals;
    };
  });

  playerScores = playerScores.map((ps) => (
    Object.assign({}, ps, {goal_difference: ps.for - ps.against})
  ));
  return _.orderBy(playerScores, ['points', 'goal_difference'], ['desc', 'desc']);
};

router.get('/active', async function(req, res, next) {
  let tournament = await Db.getActiveTournament();
  const table = createTable(tournament);
  console.log('Table---', table);
  res.render('active_tournament', { title: 'Active Tournament' });
});

router.get('/next_match', async function (req, res) {
  res.status(200).json(await Db.getNextMatch())
});

router.post('/save_match', async function (req, res) {
  const {player_1_id, player_2_id, player_1_goals, player_2_goals } = req.body;
  if (_.isNil(player_1_id) || _.isNil(player_2_id) || _.isNil(player_1_goals) || _.isNil(player_2_goals)) {
    return res.status(400).json({
      message: 'Missing required params',
    });
  };
  console.log(player_1_id, player_2_id, player_1_goals, player_2_goals);
  await Db.saveMatch({player_1_id, player_2_id, player_1_goals, player_2_goals});
  return res.status(200).json({});
});

router.post('/start', async function(req, res, next) {
  const {tournament_id: tournamentId} = req.body;
  const tournament = await Db.startTournament(parseInt(tournamentId));
  res.status(200).json({status: 'ok'});
});

module.exports = router;
