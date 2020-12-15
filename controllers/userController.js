const db = require("../database/models");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { check, validationResult, body } = require("express-validator");

const userController = {
  // FORMULARIO DE INICIO DE SESSIÓN
  login: (req, res, next) => {
    res.render("login", { title: "Express" });
  },

  // VALIDAR INFORMACIÓN DE USUARIO PARA INICIAR SERSSIÓN
  validate: (req, res, next) => {
    let errors = validationResult(req);

    // 1) SI EL FORMULARIO PRESENTA ERRORES
    if (!errors.isEmpty()) {
      console.log(`${errors.errors[0].msg}`);

      // 1.1) VOLVER A CARGAR FORMULARIO DE INICIO DE SESSIÓN
      return res.render("login", { title: "Express" });
    } else {
      // 2) SI EL FORMULARIO NO PRESENTA ERRORES
      const email = req.body.username;
      const password = req.body.password;

      // 2.1) BUSCAR USUARIO EN LA BASE DE DATOS
      db.User.findOne({
        where: {
          email: email,
        },
      }).then((user) => {
        // 2.1.1) EL USUARIO NO EXISTE
        if (!user) {
          res.render("index", { title: "EL USUARIO NO SE ENCUENTRA REGISTRADO" }); //no existe el usuario
        } else {

          // 2.1.2) EL USUARIO EXISTE

          // 2.1.2.1) VALIDAR CONTRASEÑA
          if (bcrypt.compareSync(password, user.password)) {
            console.log("CONTRASEÑA CORRECTA");
            
            // 2.1.2.2 DEFINICIÓN DE LA SESSIÓN
            req.session.user = {
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              type: user.category,
              image: user.image,
            };

            if (req.session.user.image == null) {
              req.session.user.image = "generic_user.png";
            }

            res.redirect("/task");
          } else {
            console.log(user);
            res.render("index", { title: "CONTRASEÑA INCORRECTA" });
          }
        }
      });
    }
  },

  // CERRAR SESSIÓN
  logout: (req, res, next) => {
    req.session.user = undefined;
    res.redirect("/users/login");
  },

  // FORMULARIO DE INICIO DE SESSIÓN
  signin: (req, res, next) => {
    res.render("signin", {
      firstname: "",
      lastname: "",
      password: "",
    });
  },

  // REGISTRAR NUEVO USUARIO
  create: (req, res, next) => {
    let errors = validationResult(req);

    // 1) EL FORMULARIO DE REGISTRO PRESENTA ERRORES
    if (!errors.isEmpty()) {
      console.log(errors.errors);

      // 1.1) ELIMINAR IMAGEN DE PERFIL CARGADA
      if (req.files[0] != undefined) {
        const userFilePath = path.join(__dirname, `../public/images/img_users/${req.files[0].filename}`);
        fs.unlink(userFilePath, (error) => {
          console.log(`SE BORRÓ EL ARCHIVO ${req.files[0].filename} CON ERROR: ${error}`);
        });
      }

      // 1.2) VOLVER A CARGAR FOMULARIO DE REGISTRO
      return res.render("signin", {
        firstname: "",
        lastname: "",
        password: "",
      });
    } else {
      // 2) EL FORMULARIO DE REGISTRO NO PRESENTA ERRORES

      // 2.1) ESPECIFICAR INFORMACIÓN DE PERFIL
      const newUser = {
        first_name: req.body.firstname,
        last_name: req.body.lastname,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        category: "user",
        image: null,
      };

      // 2.2) ESPECIFICAR IMAGEN DE PERFIL SI SE CARGÓ UNA
      if (req.files[0] != undefined) {
        newUser.image = req.files[0].filename;
      }

      // 2.3) GUARDAR NUEVO USUARIO
      db.User.create(newUser).then(() => {
        res.redirect("/users/login");
      });
    }
  },

  // MOSTAR INFORMACIÓN DE PERFIL
  profile: (req, res, next) => {
    userData = {
      firstname: req.session.user.firstName,
      lastname: req.session.user.lastName,
      email: req.session.user.email,
      category: req.session.user.type,
      avatar: req.session.user.image,
    };

    res.render("profile", userData);
  },

  // MOSTRAR INFORMACIÓN DE PERFIL A EDITAR
  edit: (req, res, next) => {
    userData = {
      avatar: req.session.user.image,
      firstname: req.session.user.firstName,
      lastname: req.session.user.lastName,
      email: req.session.user.email,
    };

    res.render("edit_profile", userData);
  },

  // GUARDAR CAMBIOS EN LA INFORMACIÓN DE PERFIL
  save: (req, res, next) => {
    let errors = validationResult(req);

    // 1) EL FORMULARIO DE EDICIÓN TIENE ERRORES
    if (!errors.isEmpty()) {
      console.log(errors.errors);

      // 1.1) BORRAR IMAGEN DE PERFIL CARGADA
      if (req.files[0] != undefined) {
        const userFilePath = path.join(__dirname, `../public/images/img_users/${req.files[0].filename}`);

        fs.unlink(userFilePath, (error) => {
          console.log(`SE BORRÓ EL ARCHIVO ${req.files[0].filename} CON ERROR: ${error}`);
        });
      }

      // 1.2) REDIRECT
      return res.redirect("/users/profile/edit");
    } else {
      // 2) EL FORMULARIO DE EDICIÓN NO TIENE ERRORES

      // 2.1) SI SE CARGÓ UNA NUEVA IMAGEN DE PERFIL
      if (req.files[0] != undefined) {
        // 2.1.1) BORRAR IMAGEN DE PERFIL ACTUAL
        const userFilePath = path.join(__dirname, `../public/images/img_users/${req.session.user.image}`);

        fs.unlink(userFilePath, (error) => {
          console.log(`SE BORRÓ EL ARCHIVO ${req.session.user.image} CON ERROR: ${error}`);
        });

        // 2.1.2) ACTUALIZAR INFORMACIÓN DE PERFIL EN BD
        db.User.update(
          {
            first_name: req.body.firstname,
            last_name: req.body.lastname,
            password: bcrypt.hashSync(req.body.password, 10),
            image: req.files[0].filename,
          },
          {
            where: {
              email: req.session.user.email,
            },
          }
        ).then(() => {
          // 2.1.3) ACTUALIZAR INFORMACIÓN DE PERFIL EN LA SESSIÓN

          req.session.user.firstName = req.body.firstname;
          req.session.user.lastName = req.body.lastname;
          req.session.user.image = req.files[0].filename;

          // REDIRECT
          res.redirect("/users/profile");
        });
      } else {
        // 2.2) SI NO SE CARGÓ UNA NUEVA IMAGEN DE PERFIL

        // 2.2.1) ACTUALIZAR INFORMACIÓN DE PERFIL EN LA BD
        console.log(`HASTA AQUÍ LLEGUÉ Y EL EMAIL ES ${req.session.user.email}`);
        db.User.update(
          {
            first_name: req.body.firstname,
            last_name: req.body.lastname,
            password: bcrypt.hashSync(req.body.password, 10),
          },
          {
            where: {
              email: req.session.user.email,
            },
          }
        ).then(() => {
          // 2.2.2) ACTUALIZAR INFORMACIÓN DE PERFIL EN LA SESSIÓN
          req.session.user.firstName = req.body.firstname;
          req.session.user.lastName = req.body.lastname;

          // 2.2.3) REDIRECT
          res.redirect("/users/profile");
        });
      }
    }
  },
};

module.exports = userController;
