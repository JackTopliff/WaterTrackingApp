const mongoose = require('mongoose');
const waterSchema = new mongoose.Schema({
    email :{
        type : String,
        required : true
    },
    waterGoal :{
        type : Number,
        default : 0
    },
    waterConsumed :{
        type : Number,
        default : 0.0
    },
    date :{
        type : Date,
        default : Date.now
    }
});
const Water = mongoose.model('Water', waterSchema);

module.exports = Water;