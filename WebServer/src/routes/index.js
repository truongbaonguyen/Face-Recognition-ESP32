const siteRouter = require('./site.js')
const classRouter = require('./class.js')

function route(app) {
    // app.get('/', (req, res) => {
    // res.render('home');
    // });

    // app.get('/news', (req, res) => {
    // res.render('news');
    // });
    app.use('/classes-list', (req, res) => {
        res.render('classes-list');
    })
    app.use('/classes', classRouter)
    app.use('/', siteRouter)

    // app.get('/search', (req, res) => {
    // res.render('search');
    // });
}

module.exports = route;