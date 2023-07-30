// https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript

// module.exports.toCamel = (s) => {
//   return s.replace(/([_][a-z])/gi, (r) => {
//     return r.toUpperCase().replace("_", "");
//   });
// };

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.getNewGeoData = async (name, city, state, country) => {
  try {
    let geoData = await geocoder
      .forwardGeocode({
        query: `${name}, ${city}, ${state}, ${country}`,
        limit: 1,
      })
      .send();
    return JSON.stringify(geoData.body.features[0].geometry);
  } catch (error) {
    new Error(error);
  }
};

module.exports.objKeysToCamel = (obj) => {
  function strToCamel(s) {
    return s.replace(/([_][a-z])/gi, (r) => {
      return r.toUpperCase().replace('_', '');
    });
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      return [strToCamel(key), value];
    })
  );
};

module.exports.catchAsync = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

module.exports.calcTotalTimesPlayed = (arr) => {
  let result = 0;
  arr.forEach((el) => {
    result += +el.timesPlayed;
  });
  return result;
};

let stateNames = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delware',
  DC: 'District Of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

module.exports.stateAbrevToName = (key) => {
  return stateNames[key];
};

module.exports.stateNameToAbrev = (value) => {
  return Object.keys(stateNames).find((key) => stateNames[key] === value);
};

// find total shows played for a venue

// await pool.query(
//   `Select COUNT(*) from shows join venues on venues.id = venue_id where venues.id = $1`,
//   [row.id]
