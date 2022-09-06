const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, sumSinglePropOfArrEl } = require("../utils");
const Song = require("../models/song");

router.get(
  "/songs",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllSongs();

    res.render("songs/all-songs", {
      user: req.user,
      table: {
        title: "All Songs",
        subtitleOne: `Unique Songs:  ${rows.length}`,
        subtitleTwo: `Total Plays:  ${sumSinglePropOfArrEl(rows)}`,
        headerOne: "Plays ",
        headerTwo: "Title ",
        headerThree: "Writer ",
        rows: "songs",
      },
      rows: rows,
    });
  })
);

// router.get(
//   "/songs",
//   catchAsync(async (req, res) => {
//     let { rows } = await db.getAllSongs();

//     res.render("partials/table", {
//       user: req.user,
//       table: {
//         tableHeaderOne: "Plays",
//         tableHeaderTwo: "Title",
//         tableHeaderThree: "Writer",
//         rows: rows,
//       },
//     });
//   })
// );

router.get(
  "/songs/author/:author",
  catchAsync(async (req, res) => {
    const { author } = req.params;
    let { rows } = await db.getAllSongsByAuthor(author);

    console.log(rows);

    res.render("songs/all-songs", {
      title: author,
      rows,
      totalPerformed: sumSinglePropOfArrEl(rows),
      user: req.user,
    });
  })
);

router.get(
  "/songs/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { rows } = await db.getSongByID(id);
    console.log(new Song(rows[0]));

    res.render("songs/single-song", {
      song: new Song(rows[0]),
      user: req.user,
    });
  })
);

module.exports = router;
