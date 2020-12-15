module.exports = (sequelize, dataType) => {

    const alias = 'User';

    const cols = {
        id: {
            type: dataType.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        first_name: {
            type: dataType.STRING,
            allowNull: false
        },
        last_name: {
            type: dataType.STRING,
            allowNull: false
        },
        email: {
            type: dataType.STRING,
            allowNull: false
        },
        password: {
            type: dataType.STRING,
            allowNull: true
        },
        category: {
            type: dataType.STRING,
            allowNull: false
        },
        image: {
            type: dataType.STRING,
            allowNull: true
        }
    };

    const config = {
        tableName: 'users',
        timestamps: false
    };

    const User = sequelize.define(alias, cols, config);

    User.associate = function(models){
        User.hasMany(models.Task, {
            as: 'task',
            foreignKey: 'user_id'
        });
    }

    return User;

}