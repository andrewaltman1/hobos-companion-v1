const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync } = require("../utils");
const { isLoggedIn, isAdmin } = require("../middleware");
const view = require("../view");

router.get(
  "/songs",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllSongs();
    res.render("table-map", view.allSongs(req, rows));
  })
);

router.get(
  "/songs/editor",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    res.render("song-editor", {
      user: req.user,
      song: req.session.newSongs[0],
    });
  })
);

router.post(
  "/songs/editor",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    await db.updateSong(req, req.session.newSongs[0]);
    req.session.newSongs = req.session.newSongs.slice(1);
    req.session.newSongs.length > 0
      ? res.render("song-editor", {
          user: req.user,
          song: req.session.newSongs[0],
        })
      : res.render("single-model", view.confirmation(req));
  })
);

router.get(
  "/songs/author/:author",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllSongsByAuthor(req.params.author);
    res.render("table-map", view.allSongs(req, rows, req.params.author));
  })
);

router.get(
  "/songs/:id",
  catchAsync(async (req, res) => {
    let { rows } = await db.getSongByID(req.params.id);
    res.render("single-model", view.singleSong(req, rows));
  })
);

module.exports = router;
