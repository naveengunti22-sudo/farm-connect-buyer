const matchingEngine = require('../services/matchingEngine');

const getMatches = (req, res, next) => {
  try {
    const { requirementId, listingId } = req.query;

    if (requirementId) {
      const matchResult = matchingEngine.getMatchesForRequirement(Number(requirementId));
      return res.json({
        success: true,
        type: 'requirement_matches',
        ...matchResult
      });
    }

    if (listingId) {
      const matchResult = matchingEngine.getMatchesForListing(Number(listingId));
      return res.json({
        success: true,
        type: 'listing_matches',
        ...matchResult
      });
    }

    // Role-based or general discovery
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : null;

    const matches = matchingEngine.getAllMatches(userId, userRole);
    res.json({
      success: true,
      type: 'all_matches',
      matches
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatches
};
