const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Class = new Schema( //?
    {
        id: { type: String, require: true },
        times: [
            {
                day: { type: Number},
                start: {
                    minutes: { type: Number },
                    hours: { type: Number },
                },
                
                end: {
                    minutes: { type: Number },
                    hours: { type: Number },
                }
            }
        ],
        students: [
            {
                type: String,
                //type: Schema.Types.ObjectId, ref: 'Student'
            }
        ]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('class', Class);