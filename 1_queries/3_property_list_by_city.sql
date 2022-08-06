SELECT properties.id, title, cost_per_night, AVG(rating) AS average_rating
FROM properties
Join property_reviews ON properties.id = property_id
WHERE city = 'Vancouver' AND rating >= 4
GROUP BY properties.id
ORDER BY cost_per_night
LIMIT 10;