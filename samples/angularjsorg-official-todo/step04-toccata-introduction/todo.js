/// <reference path="typings/angularjs/angular.d.ts" />
toccata = toccata(angular);
toccata.setModule(angular.module('todoApp', []));
var TodoListController = (function () {
    function TodoListController() {
        this.todos = [
            { text: 'learn angular', done: true },
            { text: 'build an angular app', done: false }
        ];
        // noop
    }
    TodoListController.prototype.addTodo = function () {
        this.todos.push({ text: this.todoText, done: false });
        this.todoText = '';
    };
    TodoListController.prototype.remaining = function () {
        var count = 0;
        angular.forEach(this.todos, function (todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };
    TodoListController.prototype.archive = function () {
        var _this = this;
        var oldTodos = this.todos;
        this.todos = [];
        angular.forEach(oldTodos, function (todo) {
            if (!todo.done)
                _this.todos.push(todo);
        });
    };
    return TodoListController;
})();
toccata.module('todoApp')
    .controller('TodoListController', TodoListController);
