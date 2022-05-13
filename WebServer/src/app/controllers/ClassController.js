const Class = require('../models/Class');

const ClassController = {
    // [POST] /search

    index: async (req, res) => {
        res.render('class');
    },

    createClass: async (req, res) => {
        try {

            let data = req.body;
            let tempClass = await Class.findOne({id : data.id});
            if(tempClass) {
                let times = data.times;
                console.log(tempClass);
                let newTimes = tempClass.times.concat(times);
                tempClass.times = newTimes;
                await tempClass.save();
                return res.json({tempClass});
            }

            const newClass = new Class(req.body);
            await newClass.save()
            return res.json({ newClass });
        } catch (err) {
            return res.json({ msg: err.message });
        }
    },
    addStudents: async (req, res) => {
        try {
            const { idClass, idStudent } = req.body;
            let newClass = await Class.findOne({ id: idClass });
            if (!newClass)
                return res.json({ msg: 'class is not exist' });
            let students = newClass.students;
            if (students.includes(idStudent)) {
                return res.status(400).json({ msg: 'student has already exist' });
            }
            else {
                students.push(idStudent);
                newClass.students = students;
                await newClass.save();
            }

            return res.json({ newClass });

        } catch (err) {
            return res.json({ msg: err.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const classes = await Class.find({});
            let {idClass} = req.query;
            if (idClass){
                let currentClass = classes.find(item => item.id == idClass)
                return res.json({currentClass});
            }
            return res.json({classes});
        } catch (err) {
            return res.json({ msg: err.message });
        }
    },
}

module.exports = ClassController;
