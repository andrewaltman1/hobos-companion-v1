const { Pool } = require("pg");

const pool = new Pool({
  user: "andrewaltman",
  host: "localhost",
  database: "rre-shows",
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
pool.connect();

module.exports.pool = pool;

module.exports.getAllShows = () => {
  return pool.query(
    'SELECT venues.id as "venueId", shows.id as "showId", name as "venueName", city, state, country, date, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat FROM venues JOIN shows ON shows.venue_id = venues.id ORDER BY date'
  );
};

module.exports.getShowsBySongID = (id) => {
  return pool.query(
    'SELECT songs.title, venues.id as "venueId", shows.id as "showId", name as "venueName", city, state, country, date, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat FROM venues JOIN shows ON shows.venue_id = venues.id JOIN versions ON shows.id = show_id JOIN songs ON songs.id = song_id WHERE songs.id = $1 ORDER BY date',
    [id]
  );
};

module.exports.getShowByID = (id) => {
  return pool.query(
    `SELECT to_char(date,'MM/DD/YYYY') As date, city, show_notes as "showNotes", state, country, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, name, title, position, set_number as "setNumber", song_notes as "versionNotes", transition FROM shows JOIN venues ON venues.id = shows.venue_id JOIN versions ON shows.id = show_id JOIN songs ON songs.id = song_id WHERE shows.id = $1`,
    [id]
  );
};

module.exports.getShowByDate = (date) => {
  return pool.query(
    `SELECT to_char(date,'MM/DD/YYYY') As date, city, show_notes as "showNotes", state, country, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, name, title, position, set_number as "setNumber", song_notes as "versionNotes", transition FROM shows JOIN venues ON venues.id = shows.venue_id JOIN versions ON shows.id = show_id JOIN songs ON songs.id = song_id WHERE shows.date = $1`,
    [date]
  );
};

module.exports.getAllSongs = () => {
  return pool.query(
    `SELECT id, title, author, versions_count as "timesPlayed" FROM songs WHERE songs.is_song = true ORDER BY "timesPlayed" DESC`
  );
};

module.exports.getAllSongsByAuthor = (author) => {
  return pool.query(
    `SELECT id, title, author, versions_count as "timesPlayed" FROM songs WHERE songs.author LIKE $1 ORDER BY "timesPlayed" DESC`,
    [`%${author}%`]
  );
};

module.exports.getSongByID = (id) => {
  return pool.query(
    `SELECT id, title, author, notes, versions_count as "timesPlayed", (
          SELECT to_char(MIN(date), 'MM-DD-YYYY') as "firstTimePlayed" from shows JOIN versions on shows.id = show_id JOIN songs on songs.id = song_id WHERE songs.id = $1
          ), (
          SELECT to_char(MAX(date), 'MM-DD-YYYY') as "mostRecent" from shows JOIN versions on shows.id = show_id JOIN songs on songs.id = song_id WHERE songs.id = $1
          ) 
          FROM songs WHERE songs.id = $1`,
    [id]
  );
};

module.exports.getAllVenues = () => {
  return pool.query(
    `SELECT id as "venueId", name as "venueName", city, state, country, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, (select MAX(id) as "totalPerformances" from shows) FROM venues ORDER BY name`
  );
};

module.exports.getVenueByID = (id) => {
  return pool.query(
    `SELECT name, city, state, country, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, date, shows.id FROM venues JOIN shows ON venues.id = shows.venue_id WHERE venues.id = $1 ORDER BY date`,
    [id]
  );
};

module.exports.getVenuesByCity = (city, state) => {
  return pool.query(
    `SELECT city, state, country, MAX(date) as "mostRecent", COUNT(*) as "total", venues.id as "venueId", name as "venueName", ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, (SELECT AVG(ST_X(geom)) AS "centerLng" FROM venues where city = $1 AND state = $2 OR country = $2), (SELECT AVG(ST_Y(geom)) AS "centerLat" FROM venues where city = $1 AND state = $2 OR country = $2) FROM venues join shows on venues.id = venue_id where city = $1 AND state = $2 OR country = $2 group by venues.id ORDER BY "total" DESC`,
    [city, state]
  );
};

module.exports.getVenuesByState = (state) => {
  return pool.query(
    `SELECT city, state, country, venues.id as "venueId", COUNT(*) as "total", name as "venueName", ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, (SELECT AVG(ST_X(geom)) AS "centerLng" FROM venues where state = $1 or country = $1), (SELECT AVG(ST_Y(geom)) AS "centerLat" FROM venues where state = $1 or country = $1) FROM venues join shows on venues.id = venue_id where state = $1 or country = $1 group by venues.id order by "total" desc`,
    [state]
  );
};
