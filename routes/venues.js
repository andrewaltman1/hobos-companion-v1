const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync } = require("../utils");
const view = require("../view");

router.get(
  "/venues",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllVenues(req);
    res.render("table-map", view.venues(req, rows));
  })
);

router.get(
  "/venues/states/:state",
  catchAsync(async (req, res) => {
    let { rows } = await db.getVenuesByState(req.params.state);
    res.render("table-map", view.venues(req, rows));
  })
);

router.get(
  "/venues/cities/:city.:state",
  catchAsync(async (req, res) => {
    let { rows } = await db.getVenuesByCity(req.params.city, req.params.state);
    res.render("table-map", view.venuesByCity(req, rows));
  })
);

router.get(
  "/venues/:id",
  catchAsync(async (req, res) => {
    let { rows } = await db.getVenueByID(req.params.id);
    res.render("single-model", view.singleVenue(req, rows));
  })
);

module.exports = router;
