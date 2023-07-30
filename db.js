const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// pool
//   .connect()
//   .then((resolve) => console.log(`Connected to DB: ${resolve.host}`))
//   .catch((err) => console.log(`DB error: ${err}`));

module.exports.pool = pool;

class CacheGenerator {
  constructor(dbQuery) {
    this.dbQuery = dbQuery;
    this.data = [];
    this.update();
  }
  async update() {
    const { rows } = await pool.query(this.dbQuery);
    this.data = rows;
  }
}

const allShowsCache = new CacheGenerator(
  'SELECT venues.id as "venueId", shows.id as "showId", name as "venueName", city, state, country, date, ST_AsGeoJSON(geom) AS geometry FROM venues JOIN shows ON shows.venue_id = venues.id ORDER BY date DESC'
);
const allSongsCache = new CacheGenerator(
  `SELECT songs.id, title, author, COUNT(*) as "timesPlayed" FROM songs JOIN versions ON songs.id = versions.song_id WHERE songs.is_song = true GROUP BY songs.id ORDER BY "timesPlayed" DESC`
);
const allVenuesCache = new CacheGenerator(
  `SELECT city, state, country, venues.id as "venueId", name as "venueName", COUNT(*) as "total", ST_AsGeoJSON(geom) AS geometry FROM venues join shows on venues.id = venue_id group by venues.id order by "total" DESC`
);

module.exports.getAllShows = async (req) => {
  if (req.url === '/new-show/confirmation' || allShowsCache.data.length === 0) {
    await allShowsCache.update();
    return allShowsCache.data;
  } else {
    return allShowsCache.data;
  }
};

module.exports.getShowsBySongID = (id) => {
  return pool.query(
    'SELECT venues.id as "venueId", shows.id as "showId", songs.title, name as "venueName", city, state, country, date, ST_AsGeoJSON(geom) AS geometry FROM venues JOIN shows ON shows.venue_id = venues.id JOIN versions ON shows.id = show_id JOIN songs ON songs.id = song_id WHERE songs.id = $1 ORDER BY date DESC',
    [id]
  );
};

module.exports.findUser = async () => {
  const { rows } = await pool.query('SELECT current_user');
  return rows[0];
};

module.exports.getShowByID = (id) => {
  return pool.query(
    `SELECT name, city, state, country, date, ST_AsGeoJSON(geom) AS geometry, show_notes as "showNotes", title, position, set_number as "setNumber", version_notes as "versionNotes", transition FROM shows JOIN venues ON venues.id = shows.venue_id JOIN versions ON shows.id = show_id JOIN songs ON songs.id = song_id WHERE shows.id = $1 ORDER BY position`,
    [id]
  );
};

module.exports.getShowByDate = (date) => {
  return pool.query(
    `SELECT name, city, state, country, date, ST_AsGeoJSON(geom) AS geometry, show_notes as "showNotes", title, position, set_number as "setNumber", version_notes as "versionNotes", transition FROM shows JOIN venues ON venues.id = shows.venue_id JOIN versions ON shows.id = show_id JOIN songs ON songs.id = song_id WHERE shows.date = $1 ORDER BY position`,
    [date]
  );
};

module.exports.insertNewShow = async (req) => {
  let { rows } = await pool.query(
    `INSERT INTO shows (date, venue_id, show_notes, created_by, created_at) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING id`,
    [
      req.session.newShow.date,
      req.session.newShow.venue.id,
      req.session.newShow.notes,
      req.user.id,
    ]
  );
  return rows[0].id;
};

module.exports.getAllSongs = async (req) => {
  if (req.url === '/new-show/confirmation' || allSongsCache.data.length === 0) {
    await allSongsCache.update();
    return allSongsCache.data;
  } else {
    return allSongsCache.data;
  }
};

module.exports.getAllSongsByAuthor = (author) => {
  return pool.query(
    `SELECT songs.id, title, author, COUNT(*) as "timesPlayed" FROM songs JOIN versions ON songs.id = versions.song_id WHERE SIMILARITY(author, $1) > 0.59 GROUP BY songs.id ORDER BY "timesPlayed" DESC`,
    [`%${author}%`]
  );
};

module.exports.getSongByID = (id) => {
  return pool.query(
    `SELECT songs.id, title, author, notes, COUNT(*) as "timesPlayed", (
          SELECT to_char(MIN(date), 'MM-DD-YYYY') as "firstTimePlayed" from shows JOIN versions on shows.id = show_id JOIN songs on songs.id = song_id WHERE songs.id = $1
          ), (
          SELECT to_char(MAX(date), 'MM-DD-YYYY') as "mostRecent" from shows JOIN versions on shows.id = show_id JOIN songs on songs.id = song_id WHERE songs.id = $1
          ) 
          FROM songs JOIN versions ON songs.id = versions.song_id WHERE songs.id = $1 GROUP BY songs.id`,
    [id]
  );
};

module.exports.insertNewSong = async (req, song) => {
  let { rows } = await pool.query(
    `INSERT INTO songs (title, created_by, created_at) VALUES ($1, $2, CURRENT_DATE) RETURNING id`,
    [song.title, req.user.id]
  );
  return rows[0].id;
};

module.exports.updateSong = async (req, song) => {
  return await pool.query(
    `UPDATE songs SET (author, is_song, notes, updated_by, updated_at, instrumental) = ($1, $2, $3, $4, CURRENT_DATE, $5) WHERE songs.id = $6`,
    [
      req.body.author,
      req.body.isSong,
      req.body.notes,
      req.user.id,
      req.body.instrumental,
      song.id,
    ]
  );
};

module.exports.insertNewVersion = async (req, song) => {
  return await pool.query(
    `INSERT INTO versions (show_id, position, set_number, song_id, transition, version_notes, created_at, created_by) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7)`,
    [
      req.session.newShow.id,
      song.position,
      song.setNumber,
      song.id,
      song.transition,
      song.versionNotes,
      req.user.id,
    ]
  );
};

module.exports.getAllVenues = async (req) => {
  if (
    req.url === '/new-show/confirmation' ||
    allVenuesCache.data.length === 0
  ) {
    await allVenuesCache.update();
    return allVenuesCache.data;
  } else {
    return allVenuesCache.data;
  }
};

module.exports.getVenuesByState = (state) => {
  return pool.query(
    `SELECT city, state, country, venues.id as "venueId", name as "venueName", COUNT(*) as "total", ST_AsGeoJSON(geom) AS geometry, (SELECT AVG(ST_X(geom)) AS "centerLng" FROM venues where state = $1 or country = $1), (SELECT AVG(ST_Y(geom)) AS "centerLat" FROM venues where state = $1 or country = $1) FROM venues join shows on venues.id = venue_id where state = $1 or country = $1 group by venues.id order by "total" DESC`,
    [state]
  );
};

module.exports.getVenuesByCity = (city, state) => {
  return pool.query(
    `SELECT city, state, country, venues.id as "venueId", name as "venueName", COUNT(*) as total, ST_AsGeoJSON(geom) AS geometry, (SELECT AVG(ST_X(geom)) AS "centerLng" FROM venues where city = $1 AND state = $2 OR country = $2), (SELECT AVG(ST_Y(geom)) AS "centerLat" FROM venues where city = $1 AND state = $2 OR country = $2), MAX(date) as "mostRecent" FROM venues join shows on venues.id = venue_id where city = $1 AND state = $2 OR country = $2 group by venues.id ORDER BY "total" DESC`,
    [city, state]
  );
};

module.exports.getVenueByID = (id) => {
  return pool.query(
    `SELECT venues.id AS "venueId", shows.id AS "showId", name, city, state, country, ST_AsGeoJSON(geom) AS geometry, date FROM venues JOIN shows ON venues.id = shows.venue_id WHERE venues.id = $1 ORDER BY date`,
    [id]
  );
};

module.exports.getVenueGeoData = async (venueId) => {
  let { rows } = await pool.query(
    `SELECT ST_asGeoJSON(geom) as geometry from venues WHERE venues.id = $1`,
    [venueId]
  );
  return rows[0].geometry;
};

module.exports.insertNewVenue = async (req) => {
  let { rows } = await pool.query(
    `INSERT INTO venues (name, city, state, country, created_by, created_at, geom) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, ST_GeomFromGeoJSON($6)) RETURNING id`,
    [
      req.session.newShow.venue.name,
      req.session.newShow.venue.city,
      req.session.newShow.venue.state,
      req.session.newShow.venue.country,
      req.user.id,
      `${req.session.newShow.venue.geometry}`,
    ]
  );
  return rows[0].id;
};

module.exports.testQuery = async (req) => {
  return await pool.query(`SELECT date from shows where id=1736`);
};

module.exports.existingSongSearch = async (song) => {
  let { rows } = await pool.query(
    `select title, id from songs where is_song = true and similarity(title, $1) > 0.67 limit 1`,
    [song]
  );
  return !rows[0] ? { id: null, title: song } : rows[0];
};
