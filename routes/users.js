var express = require("express");
var multer = require("multer");
var path = require("path");
var router = express.Router();
const db = require("../database/models");
const { check, validationResult, body } = require("express-validator");

const userMiddleware = require("../middlewares/userMiddleware");

const userController = require("../controllers//userController");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/img_users");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/login", userController.login);
router.post("/login", [check("username").isEmail()], userController.validate);

router.get("/signin", userController.signin);
router.post(
  "/signin",
  upload.any(),
  [
    check("firstname")
      .isLength({ min: 2 })
      .withMessage("Debe ingresar al menos 2 caracteres para nombre"),
    check("lastname")
      .isLength({ min: 2 })
      .withMessage("Debe ingresar al menos 2 caracteres para el nombre"),
    check("email").isEmail().withMessage("Debe ingresar un email"),
    body("email")
      .custom(async function (value, { req }) {
        const user = await db.User.findOne({
          where: { email: req.body.email },
        });
        if (user != null) {
          return Promise.reject();
        }
      })
      .withMessage("El usuario ya se encuentra registrado"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("El password debe contener al menos 8 caracteres"),
    body("confirmPassword").custom((value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
    body("password").custom((value, { req }) => {
      const validPass = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!validPass.test(value)) {
        throw new Error("La contraseña no cumple con los criterios");
      }
      return true;
    }),
  ],
  userController.create
);

router.get("/logout", userController.logout);

router.get("/profile", userMiddleware, userController.profile);
router.get("/profile/edit", userMiddleware, userController.edit);
router.put(
  "/profile/edit",
  upload.any(),
  userMiddleware,
  [
    check("firstname")
      .isLength({ min: 2 })
      .withMessage("Debe ingresar al menos 2 caracteres para nombre"),
    check("lastname")
      .isLength({ min: 2 })
      .withMessage("Debe ingresar al menos 2 caracteres para el nombre"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("El password debe contener al menos 8 caracteres"),
    body("confirmPassword").custom((value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
    body("password").custom((value, { req }) => {
      const validPass = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!validPass.test(value)) {
        throw new Error("La contraseña no cumple con los criterios");
      }
      return true;
    }),
  ],
  userController.save
);

module.exports = router;
