const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge.model');
const Progress = require('../models/Progress.model');
const mongoose = require('mongoose');

router.get('/challengeProgress', async (req, res) => {
    console.log("Starting challengeProgress");
    
    try {
      const { challengeId, ciclo } = req.query;
  
      if (!mongoose.Types.ObjectId.isValid(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
  
      const challenge = await Challenge.findById(challengeId).populate('cycles.rules');
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
  
  
      // Buscar el ciclo en el array cycles
      let cycle = challenge.cycles.find(c => c.ciclo === ciclo);
      // Si no se encuentra y el ciclo solicitado es el actual (en la raíz)
      if (!cycle && ciclo === challenge.ciclo) {
        cycle = {
          ciclo: challenge.ciclo,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          rules: challenge.rules
        };
      }
      if (!ciclo) {
        cycle = {
          ciclo: challenge.ciclo,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          rules: challenge.rules
        };
      }
      if (!cycle) {
        console.log("Cycle not found");
        return res.status(412).json({ message: `Cycle ${ciclo} not found for this challenge` });
      }
      
      
      const { startDate, endDate, rules } = cycle;
  
      // Calcular el número total de días del ciclo
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      // Inicializar el array de progreso
      let progressData = new Array(totalDays).fill(0);
  
      // Buscar todos los registros de progreso para este challenge
      const progressEntries = await Progress.find({ challenge: challengeId }).populate('completedRules.rule');
  
      // Procesar cada entrada de progreso
      progressEntries.forEach(entry => {
        const dayIndex = Math.ceil((new Date(entry.date) - startDate) / (1000 * 60 * 60 * 24));
        entry.completedRules.forEach(completedRule => {
          if (rules.some(rule => rule._id.toString() === completedRule.rule._id.toString())) {
            const totalRules = entry.completedRules.filter(r => r.status !== 'NA').length;
            if (totalRules > 0) {
              const completedPoints = entry.completedRules
                .filter(r => r.status === 'HECHO' && rules.some(rule => rule._id.toString() === r.rule._id.toString()))
                .reduce((sum, r) => sum + r.rule.points, 0);
              const totalPoints = entry.completedRules
                .filter(r => r.status !== 'NA' && rules.some(rule => rule._id.toString() === r.rule._id.toString()))
                .reduce((sum, r) => sum + r.rule.points, 0);
              progressData[dayIndex] = (completedPoints / totalPoints) * 100;
            }
          }
        });
      });
  
      // Preparar la respuesta
      const data = {
        labels: Array.from({ length: totalDays }, (_, i) => `D${i + 1}`),
        datasets: [
          {
            data: progressData,
          },
        ],
      };
      
      console.log("Return of the challenge stats");
      
      console.log(data);
      
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred', error });
    }
  });
  

  router.get('/ruleProgress', async (req, res) => {
    try {
      const { challengeId, ciclo } = req.query;
  
      const challenge = await Challenge.findById(challengeId)
  .populate('cycles.rules')
  .populate('rules');

  
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
  
      // Buscar el ciclo en cycles
      let cycle = challenge.cycles.find(c => c.ciclo === ciclo);
      // Si no se encuentra, comprobar si es el ciclo actual
      if (!cycle && ciclo === challenge.ciclo) {
        cycle = {
          ciclo: challenge.ciclo,
          rules: challenge.rules
        };
      }
      if (!ciclo) {
        cycle = {
          ciclo: challenge.ciclo,
          rules: challenge.rules
        };
      }
      
      if (!cycle) {
        return res.status(404).json({ message: 'Cycle not found' });
      }
  
      const { rules } = cycle;

      console.log(rules);
      
  
      // Buscar todos los registros de progreso para el challenge
      const progressEntries = await Progress.find({ challenge: challengeId });

      console.log(progressEntries);
      
  
      const ruleProgress = {};
  
      // Inicializar el objeto de progreso para cada regla
      rules.forEach(rule => {
        ruleProgress[rule._id] = { description: rule.description, totalPoints: 0, accomplishedPoints: 0 };
      });
  
      // Procesar cada entrada de progreso
      progressEntries.forEach(progress => {
        progress.completedRules.forEach(completedRule => {
          const rule = ruleProgress[completedRule.rule];
          if (rule) {
            const currentRule = rules.find(r => r._id.toString() === completedRule.rule.toString());
            ruleProgress[completedRule.rule].totalPoints += currentRule.points;
            if (completedRule.status === 'HECHO') {
              ruleProgress[completedRule.rule].accomplishedPoints += currentRule.points;
            }
          }
        });
      });
      console.log(ruleProgress);
      
  
      // Calcular el porcentaje de cumplimiento para cada regla
      const result = Object.values(ruleProgress).map(rule => ({
        description: rule.description,
        accomplishmentPercentage: rule.totalPoints ? (rule.accomplishedPoints / rule.totalPoints) * 100 : 0
      }));
  
      console.log("Return of the rules stats");
      
      console.log(result);
      
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });
  

  router.get('/cycleStats', async (req, res) => {
    try {
      const { challengeId } = req.query;
  
      if (!mongoose.Types.ObjectId.isValid(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
  
      const challenge = await Challenge.findById(challengeId).populate('cycles.rules');
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
  
      let cyclesStats = [];
  
      // Calcular estadísticas para cada ciclo pasado (almacenado en cycles)
      for (const cycle of challenge.cycles) {
        let totalPoints = 0;
        let accomplishedPoints = 0;
        for (const rule of cycle.rules) {
          totalPoints += rule.points;
          const progressEntries = await Progress.find({ challenge: challengeId, 'completedRules.rule': rule._id });
          progressEntries.forEach(progress => {
            const completedRule = progress.completedRules.find(r => r.rule.toString() === rule._id.toString() && r.status === 'HECHO');
            if (completedRule) {
              accomplishedPoints += rule.points;
            }
          });
        }
        cyclesStats.push({
          ciclo: cycle.ciclo,
          accomplishmentPercentage: totalPoints ? (accomplishedPoints / totalPoints) * 100 : 0
        });
      }
  
      // Calcular estadísticas para el ciclo actual (almacenado en la raíz)
      let totalPointsCurrent = 0;
      let accomplishedPointsCurrent = 0;
      for (const rule of challenge.rules) {
        totalPointsCurrent += rule.points;
        const progressEntries = await Progress.find({ challenge: challengeId, 'completedRules.rule': rule._id });
        progressEntries.forEach(progress => {
          const completedRule = progress.completedRules.find(r => r.rule.toString() === rule._id.toString() && r.status === 'HECHO');
          if (completedRule) {
            accomplishedPointsCurrent += rule.points;
          }
        });
      }
      cyclesStats.push({
        ciclo: challenge.ciclo,
        accomplishmentPercentage: totalPointsCurrent ? (accomplishedPointsCurrent / totalPointsCurrent) * 100 : 0
      });
  
      res.json(cyclesStats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred', error });
    }
  });
  

module.exports = router;
