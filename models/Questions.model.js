const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  ruleTitle: { type: String, required: true },
  ruleId: { type: String, required: true },
  q1: { type: String, required: true },
  q2: { type: String, required: true },
  q3: { type: String, required: true },
  q4: { type: String, required: true },
  status: { type: String, default: 'NA' },
  createdAt: { type: Date, default: Date.now },
});


const Question = mongoose.model('Questions', questionSchema);

module.exports = Question;
