/* eslint-disable no-undef */
const todoList = require('../todo')

describe('TodoList Test Suite', () => {
  let todos

  beforeEach(() => {
    todos = todoList()
  })

  test('Should add new todo', () => {
    const initialCount = todos.all.length
    todos.add({ title: 'New Todo', dueDate: '2023-04-09', completed: false })
    expect(todos.all.length).toBe(initialCount + 1)
  })

  test('Should mark a todo as completed', () => {
    const todo = { title: 'New Todo', dueDate: '2023-04-09', completed: false }
    todos.add(todo)
    const index = todos.all.findIndex(item => item === todo)
    todos.markAsComplete(index)
    expect(todos.all[index].completed).toBe(true)
  })

  test('Should retrieve overdue items', () => {
    todos.add({ title: 'Overdue Todo', dueDate: '2023-04-08', completed: false })
    todos.add({ title: 'Due Today Todo', dueDate: '2023-04-09', completed: false })
    const overdue = todos.overdue()
    expect(overdue.length).toBe(1)
    expect(overdue[0].title).toBe('Overdue Todo')
  })

  test('Should retrieve due today items', () => {
    todos.add({ title: 'Overdue Todo', dueDate: '2023-04-08', completed: false })
    todos.add({ title: 'Due Today Todo', dueDate: '2023-04-09', completed: false })
    const dueToday = todos.dueToday()
    expect(dueToday.length).toBe(1)
    expect(dueToday[0].title).toBe('Due Today Todo')
  })

  test('Should retrieve due later items', () => {
    todos.add({ title: 'Overdue Todo', dueDate: '2023-04-08', completed: false })
    todos.add({ title: 'Due Today Todo', dueDate: '2023-04-09', completed: false })
    todos.add({ title: 'Due Later Todo', dueDate: '2023-04-10', completed: false })
    const dueLater = todos.dueLater()
    expect(dueLater.length).toBe(1)
    expect(dueLater[0].title).toBe('Due Later Todo')
  })

  test('Should format todos into a displayable list', () => {
    todos.add({ title: 'Todo 1', dueDate: '2023-04-08', completed: false })
    todos.add({ title: 'Todo 2', dueDate: '2023-04-09', completed: true })
    const displayableList = todos.toDisplayableList(todos.all)
    expect(displayableList).toBe('[ ] Todo 1 2023-04-08\n[x] Todo 2 ')
  })
})
