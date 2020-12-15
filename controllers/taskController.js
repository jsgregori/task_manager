const db = require("../database/models");

const taskController = {
  root: (req, res, next) => {
    db.Task.findAll({
			include: [{
				association: 'user',
				where: {
					email: req.session.user.email
				}
			}]
		}).then((tareas) => {
      console.log(`LA IMAGEN DEL AVATAR ES ${req.session.user.image}`);

      console.log('HASTA AQUÍ LLEGUÉ OLÉ OLÉ OLÉ');
      console.log(tareas[0].user.first_name);

      res.render("tasks", {
        title: "Task Manager",
        tasks: tareas,
        avatar: req.session.user.image,
      });
    });
  },

  add: (req, res, next) => {
    db.User.findAll().then((usuarios) => {
      console.log(usuarios);

      res.render("add", { title: "Task Manager ADD", usuarios: usuarios });
    });
  },

  create: (req, res, next) => {
    console.log(req.body);

    const newTask = {
      site: req.body.site,
      task: req.body.task,
      project: req.body.project,
      request_date: "2020/11/5",
      execution_date: "",
      user_id: req.body.assigned,
      status: "PENDIENTE",
    };

    db.Task.create(newTask).then(() => {
      res.redirect("/task");
    });
  },
};

module.exports = taskController;
