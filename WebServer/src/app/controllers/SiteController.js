const Check = require('../models/Check');
const Class = require('../models/Class');
const { multipleMongooseToObject } = require('../../util/mongoose.js')

var count = 0;
var info;
const SiteController = {
    // [GET] /
    index: async (req, res) => {
        res.render('home');
        if (count == 0) {
            var spawn = require('child_process').spawn;
            var process = spawn('python', ['./Face_Attendance.py']);
            process.stdout.on('data', function(data) {
            console.log(data.toString());
            res.send(data.toString());
            });
            count++;
        }
    },

    // [POST] /search
    check: async (req, res) => {
        try {
            const {
                id,
                time
            } = req.body;

            let currentTime;

            if (time) {
                currentTime = time;
            }
            else {
                const now = new Date()

                currentTime = {
                    minutes: now.getMinutes(),
                    hours: now.getHours(),
                    day: now.getDay(), //0 là chủ nhật -> 6 là thứ 7
                    date: now.getDate(),
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                }
            }
            let classes = await Class.find({});

            let currentClass = classes.find(item => {
                let temp = false;
                let times = item.times;
                times.forEach(time => {
                    if (time.day === currentTime.day) {
                        if (time.start.hours < currentTime.hours && currentTime.hours < time.end.hours)
                            temp = true;
                        if (time.start.hours === currentTime.hours && time.start.minutes <= currentTime.minutes)
                            temp = true;
                        if (time.end.hours === currentTime.hours && time.end.minutes >= currentTime.minutes)
                            temp = true;
                    }
                })
                return temp;
                //return item.times.day == currentTime.day;
            })
            if (!currentClass)
            {
                info = "NoClass";
                return res.json({ msg: "NoClass" });
            }

            let students = currentClass.students;
            if (!students.includes(id)) {
                info = "NoStudent";
                return res.json({ msg: 'NoStudent' });
            }

            let checks = await Check.find({})
            let currentCheck = checks.find(item => {
                if (item.id == id && item.idClass == currentClass.id && item.time.date == currentTime.date
                    && item.time.month == currentTime.month && item.time.year == currentTime.year)
                    return true;
            })
            if (currentCheck)
            {
                info = id;
                return res.json({ msg: 'this student has already checked' });
            }

            let check = new Check()
            check.id = id;
            check.time = currentTime;
            check.idClass = currentClass.id;
            await check.save();
            info = check.id;
            return res.json({ check });
        } catch (err) {
            return res.json({ msg: err.message });
        }
    },
    getCheck: async (req, res) => {
        try {
            const {
                idClass,
                date,
                month,
                year
            } = req.query;

            let checks = await Check.find({idClass: idClass});
            if(!date||!month||!year)
                return res.json({checks});
            let newChecks = checks.filter( item => {
                return item.time.date == date && item.time.month == month && item.time.year == year;
            });
            return res.json({newChecks});
        } catch (err) {
            return res.json({ msg: err.message });
        }
    },

    getInfo: async (req, res) => {
        try {
            return res.json({ msg: info });
        }
        catch (err) {
    return res.json({ msg: err.message });
    }
    },
}

module.exports = SiteController;
