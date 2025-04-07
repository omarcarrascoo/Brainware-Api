const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
  image: { type: String, required: false, default: "https://emprendedores.es/wp-content/uploads/marketing-challenge-1024x576.jpg" },
  title: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  rules: [{ type: Schema.Types.ObjectId, ref: 'Rule' }],
  progress: [{ type: Schema.Types.ObjectId, ref: 'Progress' }],
  userId: {type: String, required: true},
  ciclo: {type: String, required: true, default: 1},
  reflection: {type:Boolean, required: true, default: false},
  cycles: [
    {
      ciclo: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      rules: [{ type: Schema.Types.ObjectId, ref: 'Rule' }]
    }
  ]
});
// Ensure virtual fields are included in the JSON output
challengeSchema.set('toObject', { virtuals: true });
challengeSchema.set('toJSON', { virtuals: true });

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
