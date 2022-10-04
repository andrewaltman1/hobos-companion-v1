module.exports.updateAllVenueGeom = async () => {
  let allVenues = await client.query(
    "SELECT id, name, city, state, country FROM venues"
  );

  allVenues.rows.forEach(async (row) => {
    const geoData = await geocoder
      .forwardGeocode({
        query: `${row.name}, ${row.city}, ${row.state}, ${row.country}`,
        limit: 1,
      })
      .send();

    let addGeom = await client.query(
      `UPDATE venues SET geom = ST_GeomFromGeoJSON($1)  WHERE id = $2`,
      [geoData.body.features[0].geometry, row.id]
    );
  });
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.user.admin) {
    req.session.messages = "Please, admins only";
    res.redirect("/login");
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
};

module.exports.login = (req, res) => {
  const redirectUrl = req.session.returnTo || "/";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};
