const express = require('express');
const router = express.Router();
const Question = require('../models/Questions.model');

// POST endpoint para crear o actualizar una pregunta (ya existente)
router.post('/', async (req, res) => {
    try {
        const { ruleId, q1, q2, q3, q4, status } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Se busca si ya existe un registro con el mismo ruleId creado hoy
        let question = await Question.findOne({ ruleId, createdAt: { $gte: today } });

        if (question) {
            // Actualización del registro existente
            question.q1 = q1;
            question.q2 = q2;
            question.q3 = q3;
            question.q4 = q4;
            question.status = status;
            question = await question.save();
        } else {
            // Creación de un nuevo registro
            question = new Question({
                ruleId,
                q1,
                q2,
                q3,
                q4,
                status
            });
            question = await question.save();
        }

        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET endpoint para obtener las bitácoras de hoy
router.get('/', async (req, res) => {
    try {
        // Establece el inicio del día de hoy (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Define el inicio del día siguiente para delimitar el rango
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Consulta los registros creados hoy
        const questions = await Question.find({
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        }).sort({ createdAt: 1 });

        // Formatea los registros según lo esperado por el front
        const surveys = questions.map(question => ({
            id: question._id,
            ruleId: question.ruleId,
            q1: question.q1,
            q2: question.q2,
            q3: question.q3,
            q4: question.q4,
            status: question.status
        }));

        res.status(200).json(surveys);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
