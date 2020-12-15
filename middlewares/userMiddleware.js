function userMiddleware(req, res, next) {
  if (req.session.user != undefined) {
    console.log("SESSIÓN ABIERTA");
    next();
  } else {
    console.log('DEBE INICIAR SESIÓN');
    res.redirect('/users/login');
}
}

module.exports = userMiddleware;
