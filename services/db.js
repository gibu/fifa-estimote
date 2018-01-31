const url = require('url');
const _ = require('lodash');

const parseConnection = (connectionString) => {
  let user;
  let password;
  const { hostname, auth, port, pathname } = url.parse(connectionString);
  const database = pathname.replace('/', '');
  if (auth && auth.split(':').length === 2) {
    [user, password] = auth.split(':');
  }

  return {
    user,
    password,
    host: hostname,
    port,
    database,
  };
};

const connection = parseConnection('postgres://yewdbyfndddgja:886977e1be8a9a354bb1da0fcdeb24dc2a8586758b25cb920fa78f8e412c280a@ec2-54-247-101-191.eu-west-1.compute.amazonaws.com:5432/da7qnnkde2pks8')
connection.ssl = true;

const db = require('knex')({
  connection,
  client: 'pg',
});

class Db {
  static async getTournametById(tournamentId) {
    const tournament = await db('tournaments')
      .where('id', tournamentId)
      .first('*');
    if (!tournament) {
      throw new Error(Db.errors.tournamet_not_found);
    }

    const players = await db('tournament_players')
      .leftJoin('players', 'tournament_players.player_id', 'players.id')
      .select('players.id', 'players.nick', 'players.club');

    const matches = await db('matches')
      .where('tournament_id', tournamentId)
      .select('*');
    return Object.assign({}, tournament, { players, matches });
  }

  static async startTournament(tournamentId) {
    const tournament = await this.getTournametById(tournamentId);
    let matches = [];
    console.log('t--', tournament);
    if (tournament.status !== 'pending') {
      throw new Error(Db.db.cannot_start_tournament);
    }

    const players = tournament.players;
    for(let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          tournament_id: tournamentId,
          player_1_id: players[i].id,
          player_2_id: players[j].id,
        });
      }
    }
    matches = _.shuffle(matches);
    matches = _.map(matches, (match, i) => (Object.assign({}, match, {sequence: i})));
    await this.createMatches(matches);
    // console.log('M--', matches);
    await this.markTournamentAsActive(tournamentId);
    return this.getTournametById(tournamentId);
  }

  static async createMatches(matches) {
    return db.batchInsert('matches', matches);
  }

  static async getActiveTournament() {
    const tournamet = await db('tournaments')
      .where('status', 'active')
      .first('*');
    if (!tournamet) {
      throw new Error(Db.db.cannot_start_tournament);
    };
    return this.getTournametById(tournamet.id);
  };

  static async markTournamentAsActive(tournamentId) {
    return db('tournaments')
      .where('id', tournamentId)
      .update({
        status: 'active',
        updated_at: new Date(),
      });
  }

  static async getPlayer(playerId) {
    return db('players')
      .where('id', playerId)
      .first('*');
  };
  static async getNextMatch() {
    const activeTournament = await this.getActiveTournament();
    const match = await db('matches')
      .where('tournament_id', activeTournament.id)
      .where('played', false)
      .orderBy('sequence', 'ASC')
      .first('*');

    const [player1, player2] = [await this.getPlayer(match.player_1_id), await this.getPlayer(match.player_2_id)]
    console.log('M---', player2);
    return Object.assign({}, match, {
      player_1: player1,
      player_2: player2,
    });
  }
};

Db.errors = {
  'tournamet_not_found': 'Tournament not found',
  'cannot_start_tournament': 'Cannot start tournamet',
};

module.exports = Db;
