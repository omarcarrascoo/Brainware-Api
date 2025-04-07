const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ruleSchema = new Schema({
  description: { type: String, required: true },
  points: { type: Number, default: 0 },
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  ciclo: { type: String, required: true }
});

const Rule = mongoose.model('Rule', ruleSchema);

module.exports = Rule;
