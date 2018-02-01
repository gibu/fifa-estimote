const _ = require('lodash');

const createTable = (tournament) => {
  let playerScores = _.cloneDeep(tournament.players);
  playerScores = playerScores.map((player) => (
    Object.assign({}, player, {
      points: 0,
      matches: 0,
      for: 0,
      against: 0,
      wins: 0,
      draws: 0,
      loses: 0,
    })
  ));
  tournament.matches.forEach((match) => {
    if (match.played) {
      const player1 = _.find(playerScores, {id: match.player_1_id})
      player1.matches++;
      player1.points += match.player_1_points;
      player1.for += match.player_1_goals;
      player1.against += match.player_2_goals;
      if (match.player_1_points === 3) {
        player1.wins += 1;
      } else if (match.player_1_points === 1) {
        player1.draws += 1;
      } else {
        player1.loses += 1;
      }
      const player2 = _.find(playerScores, {id: match.player_2_id});
      player2.matches++;
      player2.points += match.player_2_points;
      player2.for += match.player_2_goals;
      player2.against += match.player_1_goals;
      if (match.player_2_points === 3) {
        player2.wins += 1;
      } else if (match.player_2_points === 1) {
        player2.draws += 1;
      } else {
        player2.loses += 1;
      }
    };
  });

  playerScores = playerScores.map((ps) => (
    Object.assign({}, ps, {goal_difference: ps.for - ps.against})
  ));
  return _.orderBy(playerScores, ['points', 'goal_difference'], ['desc', 'desc']);
};

module.exports = createTable;
