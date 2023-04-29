// const {pool} = require('../db');

//   module.exports.getAllShows = async (req, res, next) => {
//     if (req.url == '/new-show/confirmation') {
//       allShowsCache.update();
//       //end response
//     } else {
//       const response = await pool.query('SELECT venues.id as "venueId", shows.id as "showId", name as "venueName", city, state, country, date, ST_AsGeoJSON(geom) AS geometry FROM venues JOIN shows ON shows.venue_id = venues.id ORDER BY date DESC');
//       res.locals.allShows = response.rows
//       console.log(res.locals.allShows[0])
//       next()
//     }
//   };

//move all the db.shows functions here