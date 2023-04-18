/* eslint-disable no-unused-vars */
// __tests__/todo.test.js
/* eslint-disable no-undef */

const db = require('../models')

const getJSDate = (days) => {
  if (!Number.isInteger(days)) {
    throw new Error('Need to pass an integer as days')
  }
  const today = new Date()
  const oneDay = 60 * 60 * 24 * 1000
  return new Date(today.getTime() + days * oneDay)
}

describe('Tests for functions in todo.js', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true })
  })

  test('Todo.overdue should return all tasks (including completed ones) that are past their due date', async () => {
    const todo = await db.Todo.addTask({
      title: 'This is a sample item',
      dueDate: getJSDate(-2),
      completed: false
    })
    const items = await db.Todo.overdue()
    expect(items.length).toBe(1)
  })

  test('Todo.dueToday should return all tasks that are due today (including completed ones)', async () => {
    const dueTodayItems = await db.Todo.dueToday()
    const todo = await db.Todo.addTask({
      title: 'This is a sample item',
      dueDate: getJSDate(0),
      completed: false
    })
    const items = await db.Todo.dueToday()
    expect(items.length).toBe(dueTodayItems.length + 1)
  })

  test('Todo.dueLater should return all tasks that are due on a future date (including completed ones)', async () => {
    const dueLaterItems = await db.Todo.dueLater()
    const todo = await db.Todo.addTask({
      title: 'This is a sample item',
      dueDate: getJSDate(2),
      completed: false
    })
    const items = await db.Todo.dueLater()
    expect(items.length).toBe(dueLaterItems.length + 1)
  })

  test('Todo.markAsComplete should change the `completed` property of a todo to `true`', async () => {
    const overdueItems = await db.Todo.overdue()
    const aTodo = overdueItems[0]
    expect(aTodo.completed).toBe(false)
    await db.Todo.markAsComplete(aTodo.id)
    await aTodo.reload()

    expect(aTodo.completed).toBe(true)
  })

  test('For a completed past-due item, Todo.displayableString should return a string of the format `ID. [x] TITLE DUE_DATE`', async () => {
    const overdueItems = await db.Todo.overdue()
    const aTodo = overdueItems[0]
    expect(aTodo.completed).toBe(true)
    const displayValue = aTodo.displayableString()
    expect(displayValue).toBe(
      `${aTodo.id}. [x] ${aTodo.title} ${aTodo.dueDate}`
    )
  })

  test('For an incomplete todo in the future, Todo.displayableString should return a string of the format `ID. [ ] TITLE DUE_DATE`', async () => {
    const dueLaterItems = await db.Todo.dueLater()
    const aTodo = dueLaterItems[0]
    expect(aTodo.completed).toBe(false)
    const displayValue = aTodo.displayableString()
    expect(displayValue).toBe(
      `${aTodo.id}. [ ] ${aTodo.title} ${aTodo.dueDate}`
    )
  })

  test('For an incomplete todo due today, Todo.displayableString should return a string of the format ID. [ ] TITLE (date should not be shown)', async () => {
    const dueTodayItems = await db.Todo.dueToday()
    const aTodo = dueTodayItems[0]
    expect(aTodo.completed).toBe(false)
    const displayValue = aTodo.displayableString()
    expect(displayValue).toBe(`${aTodo.id}. [ ] ${aTodo.title}`)
  })

  test('For a complete todo due today, Todo.displayableString should return a string of the format ID. [x] TITLE (date should not be shown)', async () => {
    const dueTodayItems = await db.Todo.dueToday()
    const aTodo = dueTodayItems[0]
    expect(aTodo.completed).toBe(false)
    await db.Todo.markAsComplete(aTodo.id)
    await aTodo.reload()
    const displayValue = aTodo.displayableString()
    expect(displayValue).toBe(`${aTodo.id}. [x] ${aTodo.title}`)
  })
})
/* const todoList = require('../todo')

describe('TodoList Test Suite', () => {
  let todos
  const today = new Date()
  const oneDay = 60 * 60 * 24 * 1000
  const yesterday = new Date(today.getTime() - 1 * oneDay)
  const tomorrow = new Date(today.getTime() + 1 * oneDay)

  beforeEach(() => {
    todos = todoList()
  })

  test('Should add new todo', () => {
    const initialCount = todos.all.length
    todos.add({ title: 'New Todo', dueDate: tomorrow.toISOString().slice(0, 10), completed: false })
    expect(todos.all.length).toBe(initialCount + 1)
  })

  test('Should mark a todo as completed', () => {
    const todo = { title: 'New Todo', dueDate: tomorrow.toISOString().slice(0, 10), completed: false }
    todos.add(todo)
    const index = todos.all.findIndex(item => item === todo)
    todos.markAsComplete(index)
    expect(todos.all[index].completed).toBe(true)
  })

  test('Should retrieve overdue items', () => {
    todos.add({ title: 'Overdue Todo', dueDate: yesterday.toISOString().slice(0, 10), completed: false })
    todos.add({ title: 'Due Today Todo', dueDate: today.toISOString().slice(0, 10), completed: false })
    const overdueCount = todos.overdue().length
    todos.add({ title: 'Overdue Todo 2', dueDate: yesterday.toISOString().slice(0, 10), completed: false })
    expect(todos.overdue().length).toBe(overdueCount + 1)
  })

  test('Should retrieve due today items', () => {
    todos.add({ title: 'Overdue Todo', dueDate: yesterday.toISOString().slice(0, 10), completed: false })
    todos.add({ title: 'Due Today Todo', dueDate: today.toISOString().slice(0, 10), completed: false })
    const dueTodayCount = todos.dueToday().length
    todos.add({ title: 'Due Today Todo 2', dueDate: today.toISOString().slice(0, 10), completed: false })
    expect(todos.dueToday().length).toBe(dueTodayCount + 1)
  })

  test('Should retrieve due later items', () => {
    todos.add({ title: 'Overdue Todo', dueDate: yesterday.toISOString().slice(0, 10), completed: false })
    todos.add({ title: 'Due Today Todo', dueDate: today.toISOString().slice(0, 10), completed: false })
    todos.add({ title: 'Due Later Todo', dueDate: tomorrow.toISOString().slice(0, 10), completed: false })
    const dueLaterCount = todos.dueLater().length
    todos.add({ title: 'Due Later Todo 2', dueDate: tomorrow.toISOString().slice(0, 10), completed: false })
    expect(todos.dueLater().length).toBe(dueLaterCount + 1)
  })
}) */
