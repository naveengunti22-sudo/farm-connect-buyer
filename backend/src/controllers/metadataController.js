const { query } = require('../config/database');

const getReferenceData = (req, res, next) => {
  try {
    const states = query('SELECT * FROM states ORDER BY name ASC');
    const districts = query('SELECT * FROM districts ORDER BY name ASC');
    const markets = query('SELECT * FROM markets ORDER BY name ASC');
    const categories = query('SELECT * FROM categories ORDER BY id ASC');
    const crops = query('SELECT * FROM crops ORDER BY name ASC');
    const cropVarieties = query('SELECT * FROM crop_varieties ORDER BY name ASC');

    res.json({
      success: true,
      referenceData: {
        states,
        districts,
        markets,
        categories,
        crops,
        cropVarieties
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReferenceData
};
