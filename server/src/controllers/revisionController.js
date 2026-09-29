import StudentNote from '../models/StudentNote.js';
import RevisionItem from '../models/RevisionItem.js';
import SavedConcept from '../models/SavedConcept.js';
import RevisionCard from '../models/RevisionCard.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';

// ==========================================
// 1. PERSONAL NOTES
// ==========================================

export const createNote = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title, content, topicId, subject, questionId, roadmapNodeId } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const note = await StudentNote.create({
      userId,
      title,
      content,
      topicId: topicId || null,
      subject: subject || '',
      questionId: questionId || null,
      roadmapNodeId: roadmapNodeId || null
    });

    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { topicId, subject } = req.query;

    const filter = { userId };
    if (topicId) filter.topicId = topicId;
    if (subject) filter.subject = new RegExp(`^${subject}$`, 'i');

    const notes = await StudentNote.find(filter)
      .populate('topicId', 'name subject')
      .populate({
        path: 'questionId',
        select: '-isCorrect -solutionCode -solutionExplanation -hiddenTestCases -testCases'
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { noteId } = req.params;
    const { title, content, topicId, subject } = req.body;

    const note = await StudentNote.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied'
      });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (topicId !== undefined) note.topicId = topicId;
    if (subject !== undefined) note.subject = subject;

    await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { noteId } = req.params;

    const note = await StudentNote.findOneAndDelete({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. MARK FOR REVISION (Questions & Topics)
// ==========================================

export const markForRevision = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type, questionId, topicId, reason } = req.body;

    if (!type || !['QUESTION', 'TOPIC'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be QUESTION or TOPIC'
      });
    }

    if (type === 'QUESTION' && !questionId) {
      return res.status(400).json({
        success: false,
        message: 'questionId is required when type is QUESTION'
      });
    }

    if (type === 'TOPIC' && !topicId) {
      return res.status(400).json({
        success: false,
        message: 'topicId is required when type is TOPIC'
      });
    }

    // Check if duplicate exists
    const query = {
      userId,
      type,
      questionId: questionId || null,
      topicId: topicId || null
    };

    let item = await RevisionItem.findOne(query);
    if (!item) {
      item = await RevisionItem.create({
        ...query,
        reason: reason || ''
      });
    } else if (reason) {
      item.reason = reason;
      await item.save();
    }

    return res.status(201).json({
      success: true,
      message: `${type} marked for revision`,
      item
    });
  } catch (error) {
    next(error);
  }
};

export const unmarkForRevision = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type, questionId, topicId, itemId } = req.body;

    let query = { userId };
    if (itemId) {
      query._id = itemId;
    } else if (type) {
      query.type = type;
      if (questionId) query.questionId = questionId;
      if (topicId) query.topicId = topicId;
    }

    const result = await RevisionItem.findOneAndDelete(query);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Revision item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item unmarked from revision'
    });
  } catch (error) {
    next(error);
  }
};

export const getRevisionItems = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type } = req.query;

    const filter = { userId };
    if (type && ['QUESTION', 'TOPIC'].includes(type)) {
      filter.type = type;
    } else {
      filter.type = { $in: ['QUESTION', 'TOPIC'] };
    }

    const items = await RevisionItem.find(filter)
      .populate('topicId', 'name subject category')
      .populate({
        path: 'questionId',
        select: '-isCorrect -solutionCode -solutionExplanation -hiddenTestCases -testCases'
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. IMPORTANT TOPICS
// ==========================================

export const markTopicImportant = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { topicId, reason } = req.body;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: 'topicId is required'
      });
    }

    const query = {
      userId,
      type: 'IMPORTANT_TOPIC',
      topicId,
      questionId: null
    };

    let item = await RevisionItem.findOne(query);
    if (!item) {
      item = await RevisionItem.create({
        ...query,
        reason: reason || 'Marked as important topic'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Topic marked as important',
      item
    });
  } catch (error) {
    next(error);
  }
};

export const removeTopicImportant = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { topicId } = req.params;

    const result = await RevisionItem.findOneAndDelete({
      userId,
      type: 'IMPORTANT_TOPIC',
      topicId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Important topic record not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Topic removed from important list'
    });
  } catch (error) {
    next(error);
  }
};

export const getImportantTopics = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const items = await RevisionItem.find({
      userId,
      type: 'IMPORTANT_TOPIC'
    })
      .populate('topicId')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      importantTopics: items
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. SAVED CONCEPTS
// ==========================================

export const saveConcept = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { topicId, subject, title, conceptSnapshot } = req.body;

    if (!title || !conceptSnapshot) {
      return res.status(400).json({
        success: false,
        message: 'Title and conceptSnapshot are required'
      });
    }

    const saved = await SavedConcept.create({
      userId,
      topicId: topicId || null,
      subject: subject || '',
      title,
      conceptSnapshot
    });

    return res.status(201).json({
      success: true,
      message: 'Concept saved for revision',
      concept: saved
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedConcepts = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { topicId, subject } = req.query;

    const filter = { userId };
    if (topicId) filter.topicId = topicId;
    if (subject) filter.subject = new RegExp(`^${subject}$`, 'i');

    const concepts = await SavedConcept.find(filter)
      .populate('topicId', 'name subject category')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      concepts
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedConcept = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { conceptId } = req.params;

    const result = await SavedConcept.findOneAndDelete({ _id: conceptId, userId });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Saved concept not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Saved concept deleted'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. REVISION CARDS & SCHEDULING
// ==========================================

export const createRevisionCard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { topicId, sourceType, sourceId, front, back, difficulty } = req.body;

    if (!front || !back) {
      return res.status(400).json({
        success: false,
        message: 'Front and back card content are required'
      });
    }

    const card = await RevisionCard.create({
      userId,
      topicId: topicId || null,
      sourceType: sourceType || 'MANUAL',
      sourceId: sourceId || null,
      front,
      back,
      difficulty: difficulty || 'MEDIUM',
      nextReviewAt: new Date(),
      reviewCount: 0
    });

    return res.status(201).json({
      success: true,
      message: 'Revision card created',
      card
    });
  } catch (error) {
    next(error);
  }
};

export const getRevisionCards = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { dueOnly } = req.query;

    const filter = { userId };
    if (dueOnly === 'true' || dueOnly === true) {
      filter.nextReviewAt = { $lte: new Date() };
    }

    const cards = await RevisionCard.find(filter)
      .populate('topicId', 'name subject')
      .sort({ nextReviewAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      cards
    });
  } catch (error) {
    next(error);
  }
};

export const getDueRevisionCards = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const cards = await RevisionCard.find({
      userId,
      nextReviewAt: { $lte: new Date() }
    })
      .populate('topicId', 'name subject')
      .sort({ nextReviewAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      cards
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review revision card - deterministic interval update
 * 1st review: +1 day
 * 2nd review: +3 days
 * 3rd review: +7 days
 * 4th review: +14 days
 * 5th+ review: +30 days
 */
export const reviewCard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cardId } = req.params;

    const card = await RevisionCard.findOne({ _id: cardId, userId });
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Revision card not found or access denied'
      });
    }

    const nextCount = card.reviewCount + 1;
    let daysToAdd = 1;
    if (nextCount === 1) daysToAdd = 1;
    else if (nextCount === 2) daysToAdd = 3;
    else if (nextCount === 3) daysToAdd = 7;
    else if (nextCount === 4) daysToAdd = 14;
    else daysToAdd = 30;

    card.reviewCount = nextCount;
    card.lastReviewedAt = new Date();
    card.nextReviewAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    await card.save();

    return res.status(200).json({
      success: true,
      message: 'Card reviewed successfully',
      card,
      nextReviewDays: daysToAdd
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRevisionCard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cardId } = req.params;

    const card = await RevisionCard.findOneAndDelete({ _id: cardId, userId });
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Revision card not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Revision card deleted'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. REVISION CENTER OVERVIEW
// ==========================================

export const getRevisionOverview = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [notesCount, revisionItemsCount, importantTopicsCount, savedConceptsCount, dueCardsCount, totalCardsCount] = await Promise.all([
      StudentNote.countDocuments({ userId }),
      RevisionItem.countDocuments({ userId, type: { $in: ['QUESTION', 'TOPIC'] } }),
      RevisionItem.countDocuments({ userId, type: 'IMPORTANT_TOPIC' }),
      SavedConcept.countDocuments({ userId }),
      RevisionCard.countDocuments({ userId, nextReviewAt: { $lte: new Date() } }),
      RevisionCard.countDocuments({ userId })
    ]);

    return res.status(200).json({
      success: true,
      overview: {
        notesCount,
        revisionItemsCount,
        importantTopicsCount,
        savedConceptsCount,
        dueCardsCount,
        totalCardsCount
      }
    });
  } catch (error) {
    next(error);
  }
};
