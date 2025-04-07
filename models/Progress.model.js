const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const progressSchema = new Schema({
  date: { type: Date, required: true },
  completedRules: [
    {
      rule: { type: Schema.Types.ObjectId, ref: 'Rule' },
      status: { type: String, enum: ['NA', 'HECHO', "FALLO"], default: 'NA' }
    }
  ],
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' }
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
