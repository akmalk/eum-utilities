var geo = {};

/**
* Array of counties
*/
geo.countries = [
  "United Kingdom",
  "United States",
  "France",
  "Canada",
  "Spain",
  "Portugal",
  "Germany",
  "Italy",
  "Poland",
  "Czech Republic",
  "Greece",
  "Romania",
  "Ireland",
  "Morocco",
  "South Africa",
  "Egypt",
  "Mexico",
  "Panama",
  "Colombia",
  "Chile",
  "Argentina",
  "Peru",
  "Brazil",
  "Russian Federation",
  "China",
  "Japan",
  "India",
  "Australia"
];

/**
* Object with country as the key, and array of region/city objects
*/
geo.regions = {
  "United Kingdom" : [
    {r: 'Bolton', t: 'Horwich'}
  ],
  "United States" : [
    {r : 'Washington', t : 'Tacoma' }
  ],
  "France" : [
    {r : 'Alsace', t : 'Strasbourg' }
  ],
  "Canada" : [{r : 'British Columbia', t : 'Vancouver'}],
  "Spain" : [{r : 'Madrid', t : 'Madrid'}],
  "Portugal" : [{r : 'Lisboa', t : 'Lisbon'}],
  "Germany" : [{r : 'Hessen', t : 'Frankfurt'}],
  "Italy" : [{r : 'Toscana', t : 'Florence'}],
  "Poland" : [{r : 'Warsaw', t : 'Warsaw'}],
  "Czech Republic" : [{r : 'Prague', t : 'Prague'}],
  "Greece" : [{r : 'Athens', t : 'Athens' }],
  "Romania" : [{r : 'Bucharest', t : 'Bucharest' }],
  "Ireland" : [{r : 'Dublin', t : 'Dublin' }],
  "Morocco" : [{r : 'Fez', t : 'Fez' }],
  "South Africa" : [{r : 'Cape Town', t : 'Cape Town' }],
  "Egypt" : [{r : 'Cairo', t : 'Cairo'}],
  "Mexico" : [{r : 'Mexico City', t : 'Mexico City' }],
  "Panama" : [{r : 'Panama City', t : 'Panama City'}],
  "Colombia" : [{r : 'Cundinamarca', t : 'Bogota' }],
  "Chile" : [{r : 'r IV', t : 'Santiago' }],
  "Argentina" : [{r : 'Buenos Aires', t : 'Buenos Aires' }],
  "Peru" : [{r : 'Lima', t : 'Lima' }],
  "Brazil" : [{r : 'Amazonas', t : 'Manaus'}],
  "Russian Federation" : [{r : 'Kamchatka', t : 'Fedotyev'}],
  "China" : [{r : 'Hebei', t : 'Beijing' }],
  "Japan" : [{r : 'Hokkaido', t : 'Sapporo' }],
  "India" : [{r : 'Maharashtra', t : 'Mumbai'}],
  "Australia" : [{r : 'Victoria', t : 'Melbourne'}]
}

module.exports = geo;
