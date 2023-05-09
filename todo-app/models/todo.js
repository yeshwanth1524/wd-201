"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static addTodo(todo) {
      return this.create({ title: todo.title, dueDate: todo.dueDate, completed: false });
    }
    
    static getTodos() {
      return this.findAll();
    }
    setCompletionStatus(bool) {
      return this.update({ completed: bool});
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    deleteTodo() {
      return this.destroy();
    }

    static completedItems() {
      return Todo.findAll({
        where: {
          completed: true,
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

    static async overdue() {
      const currentDate = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: currentDate,
          },
          completed: false,
        },
      });
    }
    
    static async dueToday() {
      const currentDate = new Date();
      const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return this.findAll({
        where: {
          dueDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
          completed: false,
        },
      });
    }
    
    static async dueLater() {
      const currentDate = new Date();
      const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      return this.findAll({
        where: {
          dueDate: {
            [Op.gte]: today,
          },
          completed: false,
        },
      });
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
