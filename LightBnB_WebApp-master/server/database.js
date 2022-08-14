const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

const getUserWithEmail = function(email) {
  
  return pool
    .query(`
      SELECT * 
      FROM users 
      WHERE users.email = $1;`, [email])

    .then((result) => {
      if (result.rows[0]) {
        console.log(result.rows[0]);
        return result.rows[0];
      }
      return null;
    })

    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithEmail = getUserWithEmail;


const getUserWithId = function(id) {
  
  return pool
    .query(`
      SELECT * 
      FROM users 
      WHERE users.id = $1;`, [id])

    .then((result) => {
      if (result.rows) {
        console.log(result.rows[0]);
        return result.rows[0];
      }
      return null;
    })

    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithId = getUserWithId;


const addUser =  function(user) {
  
  const text = `
  INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
  const values = [user.name, user.email, user.password];
  
  return pool
    .query(text, values)
  
    .then((result) => {
      console.log(result.rows[0]);
    })

    .catch((err) => {
      console.log(err.message);
    });
};

exports.addUser = addUser;

/// Reservations

const getAllReservations = function(guest_id, limit = 10) {
  
  return pool
    .query(`
      SELECT reservations.*, properties.*
      FROM reservations
      JOIN properties ON reservations.property_id = properties.id
      JOIN property_reviews ON properties.id = property_reviews.property_id
      WHERE reservations.guest_id = $1
      GROUP BY properties.id, reservations.id
      ORDER BY reservations.start_date
      LIMIT $2`, [guest_id, limit])

    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })

    .catch((err) => {
      console.log(err.message);
    });
};

exports.getAllReservations = getAllReservations;

/// Properties

const getAllProperties = function(options, limit = 5) {

  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  LEFT JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1`;
  
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += ` AND city LIKE $${queryParams.length}`;
  }
  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    queryString += ` AND owner_id LIKE $${queryParams.length}`;
  }
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`, `${options.maximum_price_per_night}`);
    queryString += ` AND cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
  }
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` AND property_reviews.rating >= $${queryParams.length}`;
  }

  queryParams.push(limit);

  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length}
  `;

  console.log(queryString, queryParams);

  return pool
    .query(queryString, queryParams)
    .then((result) => result.rows);
};
exports.getAllProperties = getAllProperties;


const addProperty = function(property) {

  const text = `INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`;
  const values =  [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];
  
  return pool
    .query(text, values)
  
    .then((result) => {
      console.log(result.rows[0]);
      return result.rows[0];
    })

    .catch((err) => {
      console.log(err.message);
    });
};

exports.addProperty = addProperty;