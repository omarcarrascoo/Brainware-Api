
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organizationsSchema = new Schema({
    name:{type: String, required: true},
    code:{type: String, required: true},
    organizationLeaderEmail:{type: String, required: true},
    createdAt:{type: Date, default: Date.now},
    status: {type: String, default: "active"}
})

const Organization = mongoose.model('Organization', organizationsSchema);


module.exports = Organization;
