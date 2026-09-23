const aiAssistantService = require('../services/aiAssistantService');

const handleChat = async (req, res, next) => {
  try {
    const { message, userContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required.'
      });
    }

    const context = {
      ...(userContext || {}),
      userId: req.user ? req.user.id : null,
      role: req.user ? req.user.role : (userContext && userContext.role) || 'farmer'
    };

    const response = await aiAssistantService.processMessage({
      message,
      userContext: context
    });

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleChat
};
