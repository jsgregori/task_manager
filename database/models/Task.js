module.exports = (sequelize, dataType) => {

    const alias = 'Task';

    const cols = {
        id: {
            type: dataType.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        site: {
            type: dataType.STRING,
            allowNull: false
        },
        task: {
            type: dataType.STRING,
            allowNull: false
        },
        project: {
            type: dataType.STRING,
            allowNull: false
        },
        request_date: {
            type: dataType.DATE,
            allowNull: true
        },
        execution_date: {
            type: dataType.DATE,
            allowNull: true
        },
        status: {
            type: dataType.STRING,
            allowNull: false
        },
        user_id: {
            type: dataType.INTEGER,
            allowNull: true
        }
    };

    const config = {
        tableName: 'tasks',
        timestamps: false
    };

    const Task = sequelize.define(alias, cols, config);

    Task.associate = function(models){
        Task.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'user_id'
        });
    }

    return Task;

}