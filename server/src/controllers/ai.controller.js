const { generateAIResponse } = require('../config/gemini');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const handleChat = async (req, res, next) => {
  try {
    const { persona = 'dsaMentor', prompt, context = {} } = req.body;

    if (!prompt) {
      throw new ApiError(400, 'Prompt is required');
    }

    const aiMessage = await generateAIResponse({
      persona,
      prompt,
      context: {
        ...context,
        userId: req.user.id,
        userRole: req.user.role
      }
    });

    return res.status(200).json(
      new ApiResponse(200, { persona, message: aiMessage }, 'AI response generated')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleChat
};
