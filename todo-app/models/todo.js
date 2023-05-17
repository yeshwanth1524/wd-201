"use strict";
const { Model} = require("sequelize");
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: 'userId'
      })
      // define association here
    }

    static addTodo({title, dueDate, userId}) {
      return this.create({ title: title, dueDate: dueDate, completed: false, userId });
    } 
    
    static async getTodos() {
      return await this.findAll();
    }

    setCompletionStatus(bool) {
      return this.update({ completed: bool});
    }

    // markAsCompleted() {
    //   return this.update({ completed: true });
    // }

    // deleteTodo() {
    //   return this.destroy();
    // }

    static async completedItems(userId) {
      return await this.findAll({
        where: {
          completed: true,
          userId
        },
      });
    }

    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

    static async overdue(userId) {
      const currentDate = new Date();
      return await this.findAll({
        where: {
          dueDate: {
            [Op.lt]: currentDate,
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    
    static async dueToday(userId) {
      const currentDate = new Date();
      const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return await this.findAll({
        where: {
          dueDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    
    static async dueLater(userId) {
      return await this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          userId,
          completed:false,
        },
        order: [["id", "ASC"]],
      })
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
