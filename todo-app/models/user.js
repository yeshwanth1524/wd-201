'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Todo, {
        foreignKey: 'userId'
      })
      // define association here
    }
  }
  User.init({ 
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
      },
    },
  // lastname can be empty
  lastName: DataTypes.STRING,

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: true,
    },
  },
   
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};