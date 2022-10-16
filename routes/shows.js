const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, getNewGeoData, stateNameToAbrev } = require("../utils");
const { isAdmin, isLoggedIn } = require("../middleware");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const data = require("../data.js");
const { VERSION } = require("ejs");

// router.use((req, res, next) => {
//   console.log(req.session);
//   next();
// });

router.get(
  "/",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllShows();
    res.render("table-map", data.allShows(req, rows));
  })
);

router.get(
  "/shows/:songid",
  catchAsync(async (req, res) => {
    let { rows } = await db.getShowsBySongID(req.params.songid);
    res.render("table-map", data.allShows(req, rows));
  })
);

router.get(
  "/show/:id",
  catchAsync(async (req, res) => {
    let { rows } = await db.getShowByID(req.params.id);
    res.render("single-model", data.singleShow(req, rows));
  })
);

router.get(
  "/show/date/:date",
  catchAsync(async (req, res) => {
    let { rows } = await db.getShowByDate(req.params.date);
    res.render("single-model", data.singleShow(req, rows));
  })
);

// the routes below are waiting for password reset functionality so that auth can be live

router.get(
  "/new-show",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllVenues();
    res.render("new-show/venue-input", data.newShowInput(req, rows));
  })
);

router.post(
  "/new-show/venue-check",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    if (req.body.address) {
      let venue = req.session.newShow.venue;
      req.session.newShow.venue.geometry = await getNewGeoData(
        req.body.address,
        venue.city,
        venue.state,
        venue.country
      );
    } else {
      let { date, name, city, state, country, venueId } = req.body;
      req.session.newShow = {
        date: date,
        venue: {
          name: name,
          city: city,
          state: state,
          country: country,
          geometry: !venueId
            ? await getNewGeoData(name, city, state, country)
            : await db.getVenueGeoData(venueId),
        },
      };
    }
  res.render("new-show/venue-check", data.venueCheck(req));
  })
);

router.get("/new-show/set-input", isLoggedIn, isAdmin, (req, res) => {
  res.render("new-show/set-input", { user: req.user });
});

router.post(
  "/new-show/show-confirm",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    req.session.newShow.notes = req.body.notes;
    const totalSets = !/(Set\s?[1-9]:?)/gi.test(req.body.songs)
      ? 1
      : req.body.songs.match(/(Set\s?[1-9]:?)/gi).length;

    const didEncore = /(Encore\s?:?)/gi.test(req.body.songs);

    // song details format from db

    // {
    //   title: song.match(/[\w\s\?'\u2019]+/gi).toString(),
    //   position: index + 1,
    //   setNumber: 1,
    //   transition: />/g.test(song),
    //   versionNotes: song.match(/[@#\$%\+^&\*]/gis),
    // }

    // details needed to save in db

    // does the song exist already? If so, song_id else...
    // is_song?
    // created_by?
    // updated_by?
    // title?
    // author?
    // notes?
    // instrumental?
    // slug?
    // created_at
    // updated_at

    async function buildSongDetails() {
      req.session.newShow.songs = [];
      const allSongs = req.body.songs
        .split(/\r\n/)
        .filter((song) => song.length > 0);
      let currentSet = 1;
      let songPosition = 1;
      let dbSearchResult;

      for (song of allSongs) {
        if (/(Set\s?[1-9]:?)/gi.test(song) || /(Encore\s?:?)/gi.test(song)) {
          currentSet = +song.match(/\d/g) || "Encore";
        } else {
          dbSearchResult = await db.existingSongSearch(
            song.match(/[\w\s\?&#'\-""()/.:\u2019]+/gi).toString()
          );
          req.session.newShow.songs.push({
            id: !dbSearchResult ? null : dbSearchResult.id,
            title: !dbSearchResult ? song : dbSearchResult.title,
            position: songPosition,
            setNumber: currentSet,
            transition: />/.test(song),
            versionNotes: /[@#\$%\+^&\*](?!\s|\w)/g.test(song)
              ? song.match(/[@#\$%\+^&\*](?!\s|\w)/g).join("")
              : null,
          });
          songPosition += 1;
        }
      }
    }

    await buildSongDetails();

    // function splitSets() {
    //   let results = [];
    //   if (totalSets == 1 && !didEncore) {
    //     return req.body.songs.split(/\r\n/);
    //   } else if (totalSets == 1 && didEncore) {
    //     results.push(
    //       req.body.songs
    //         .match(/^.*?(?=\r\n\r\nEncore\s?:?)/gis)
    //         .toString()
    //         .split(/\r\n/)
    //     );
    //     results.push(
    //       req.body.songs
    //         .match(/(?<=Encore\s?:?\r\n).*?$/gis)
    //         .toString()
    //         .split(/\r\n/)
    //     );
    //     return results;
    //   } else {
    //     let positionOne;
    //     let positionTwo;
    //     let encorePositionOne = `(?<=Encore\\s?:?\\r\\n)`;
    //     let encorePositionTwo = `(?=\\r\\n\\r\\nEncore\\s?:?)`;
    //     const end = "$";
    //     if (didEncore) {
    //       for (i = 1; i <= totalSets + 1; i++) {
    //         positionOne = `(?<=Set\\s?${i}:?\\r\\n)`;
    //         positionTwo = `(?=\\r\\n\\r\\nSet\\s?${i + 1}:?)`;
    //         i == totalSets
    //           ? (positionTwo = encorePositionTwo)
    //           : i == totalSets + 1
    //           ? ((positionOne = encorePositionOne), (positionTwo = end))
    //           : positionTwo;
    //         results.push(
    //           req.body.songs
    //             .match(new RegExp(`${positionOne}.*?${positionTwo}`, "gis"))
    //             .toString()
    //             .split(/\r\n/)
    //         );
    //       }
    //       return results;
    //     } else {
    //       for (i = 1; i <= totalSets; i++) {
    //         positionOne = `(?<=Set\\s?${i}:?\\r\\n)`;
    //         positionTwo = `(?=\\r\\n\\r\\nSet\\s?${i + 1}:?)`;
    //         i == totalSets ? (positionTwo = end) : positionTwo;
    //         results.push(
    //           req.body.songs
    //             .match(new RegExp(`${positionOne}.*?${positionTwo}`, "gis"))
    //             .toString()
    //             .split(/\r\n/)
    //         );
    //       }
    //       return results;
    //     }
    //   }
    // }

    // function formatSongsForViewAndStorage(arr, totalSets, didEncore) {
    //   arr.map((song, index) => {
    //     return {
    //       title: song.match(/[\w\s\?'\u2019]+/gi).toString(),
    //       position: index + 1,
    //       setNumber: 1,
    //       transition: />/g.test(song),
    //       versionNotes: song.match(/[@#\$%\+^&\*]/gis),
    //       id: Number || null,
    //     };
    //   });
    // }

    console.log(req.session.newShow.songs.some((element) => element.setNumber == "Encore"), req.session.newShow.notes)

    res.render("single-model", data.singleShow(req));
  })
);

// the route below contains code for updating geodata

router.get(
  "/show/update",
  catchAsync(async (req, res) => {
    let toUpdate = await pool.query(
      "SELECT id, name, city, state, country, geom FROM venues WHERE id = $1",
      [id]
    );

    toUpdate.rows.forEach(async (row) => {
      const geoData = await geocoder
        .forwardGeocode({
          query: `${row.name}, ${row.city}, ${row.state}, ${row.country}`,
          limit: 1,
        })
        .send();

      let addGeom = await pool.query(
        `UPDATE venues SET geom = ST_GeomFromGeoJSON($1)  WHERE id = $2`,
        [geoData.body.features[0].geometry, row.id]
      );
    });

    res.send("thanks");
  })
);

router.get(
  "/update",
  catchAsync(async (req, res) => {
    let allVenues = await pool.query(
      "SELECT id, name, city, state, country FROM venues"
    );

    allVenues.rows.forEach(async (row) => {
      const geoData = await geocoder
        .forwardGeocode({
          query: `${row.name}, ${row.city}, ${row.state}, ${row.country}`,
          limit: 1,
        })
        .send();

      let addGeom = await pool.query(
        `UPDATE venues SET geom = ST_GeomFromGeoJSON($1)  WHERE id = $2`,
        [geoData.body.features[0].geometry, row.id]
      );
    });

    res.send("thanks");
  })
);

module.exports = router;
