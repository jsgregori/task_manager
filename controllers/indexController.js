
const indexController = {
    root: (req, res, next) => {
        res.render('index', { title: 'Express' });
        // res.render('login', { title: 'Express' });
    }
};

module.exports = indexController;