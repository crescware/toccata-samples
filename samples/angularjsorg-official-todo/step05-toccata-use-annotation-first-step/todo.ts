/// <reference path="typings/angularjs/angular.d.ts" />

declare var toccata: any;
toccata = toccata(angular);
toccata.setModule(angular.module('todoApp', []));

const {NgController} = toccata;

@NgController()
class TodoListController {
  todoText: string;
  todos = [
    {text:'learn angular', done:true},
    {text:'build an angular app', done:false}
  ];

  constructor() {
    // noop
  }

  addTodo() {
    this.todos.push({text:this.todoText, done:false});
    this.todoText = '';
  }

  remaining() {
    var count = 0;
    angular.forEach(this.todos, (todo) => {
      count += todo.done ? 0 : 1;
    });
    return count;
  }

  archive() {
    var oldTodos = this.todos;
    this.todos = [];
    angular.forEach(oldTodos, (todo) => {
      if (!todo.done) this.todos.push(todo);
    });
  }
}
