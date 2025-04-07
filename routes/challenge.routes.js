const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge.model');
const Rule = require('../models/Rules.model');
const Progress = require('../models/Progress.model');

// Route to create a new challenge
router.post('/create', async (req, res) => {
  try {
    const { image, title, endDate, rules, userId } = req.body;

    const challenge = new Challenge({
      image,
      title,
      endDate,
      userId
    });

    await challenge.save();

    const ruleDocuments = rules.map(rule => new Rule({
      description: rule.description,
      points: rule.points,
      challenge: challenge._id,
      ciclo: challenge.ciclo
    }));

    await Rule.insertMany(ruleDocuments);

    challenge.rules = ruleDocuments.map(rule => rule._id);
    await challenge.save();

    res.status(201).json({ message: 'Challenge created successfully', challenge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating challenge' });
  }
});

// -----------------------
// Place the specific route first!
// -----------------------

// Route to get challenges for a specific user
router.get('/userChallenge', async (req, res) => {
  try {
    const { userId } = req.query; // Get the userId from query parameters
    console.log(userId);
    
    // Build the query object
    const query = userId ? { userId } : {};

    // Find challenges that match the userId, populate related fields
    const challenges = await Challenge.find(query)
      .populate('rules')
      .populate({
        path: 'progress',
        populate: {
          path: 'completedRules.rule',
          model: 'Rule'
        }
      });

    res.status(200).json(challenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving challenges' });
  }
});

// Route to get a specific challenge with all its details
router.get('/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId)
      .populate('rules')
      .populate({
        path: 'progress',
        populate: {
          path: 'completedRules.rule',
          model: 'Rule'
        }
      });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving challenge' });
  }
});

// Route to get all challenges with all their details
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('rules')
      .populate({
        path: 'progress',
        populate: {
          path: 'completedRules.rule',
          model: 'Rule'
        }
      });
    res.status(200).json(challenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving challenges' });
  }
});

// Route to update a challenge
router.put('/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { image, title, endDate, startDate, rules, ciclo } = req.body;

    const challenge = await Challenge.findById(challengeId).populate('rules');
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Save the current cycle's data before updating
    if (ciclo && challenge.ciclo !== ciclo) {
      challenge.cycles.push({
        ciclo: challenge.ciclo,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        rules: challenge.rules
      });
    }

    // Update challenge fields
    if (image) challenge.image = image;
    if (title) challenge.title = title;
    if (endDate) challenge.endDate = endDate;
    challenge.startDate = startDate || new Date();
    if (ciclo) challenge.ciclo = ciclo;

    // Update rules if provided
    if (rules) {
      const ruleDocuments = rules.map(rule => new Rule({
        description: rule.description,
        points: rule.points,
        challenge: challengeId,
        ciclo: ciclo
      }));

      await Rule.insertMany(ruleDocuments);

      challenge.rules = ruleDocuments.map(rule => rule._id);
    }

    await challenge.save();

    res.status(200).json({ message: 'Challenge updated successfully', challenge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating challenge' });
  }
});

// Route to update the progress of a challenge
router.post('/:challengeId/progress', async (req, res) => {
  try {
    const { challengeId } = req.params;
    let { date, completedRules, status } = req.body;

    console.log('Received date:', date);
    date = new Date(date);
    console.log('Parsed date:', date);

    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    let progress = await Progress.findOne({ challenge: challengeId, date });

    if (!progress) {
      progress = new Progress({
        date,
        completedRules: completedRules.map(ruleId => ({
          rule: ruleId._id,
          status: ruleId.status
        })),
        challenge: challengeId
      });
    } else {
      console.log(completedRules);
      progress.completedRules = completedRules.map(rule => ({
        rule: rule._id,
        status: rule.status
      }));
    }

    await progress.save();

    if (!challenge.progress.includes(progress._id)) {
      challenge.progress.push(progress._id);
      await challenge.save();
    }

    res.status(200).json({ message: 'Progress updated successfully', progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating progress' });
  }
});

module.exports = router;
