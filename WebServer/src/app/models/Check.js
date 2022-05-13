const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Check = new Schema(
    {
        id: { type: String, require: true },
        idClass: { type: String},
        time: {
            minutes: { type: Number },
            hours: { type: Number },
            day: { type: Number },
            date: { type: Number },
            month: { type: Number },
            year: { type: Number },
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('check', Check);
