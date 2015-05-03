/// <reference path="typings/angularjs/angular.d.ts" />
var __decorate = this.__decorate || function (decorators, target, key, value) {
    var kind = typeof (arguments.length == 2 ? value = target : value);
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        switch (kind) {
            case "function": value = decorator(value) || value; break;
            case "number": decorator(target, key, value); break;
            case "undefined": decorator(target, key); break;
            case "object": value = decorator(target, key, value) || value; break;
        }
    }
    return value;
};
toccata = toccata(angular);
var View = toccata.View, Component = toccata.Component, bootstrap = toccata.bootstrap;
var TodoList = (function () {
    function TodoList() {
        this.todos = [
            { text: 'learn angular', done: true },
            { text: 'build an angular app', done: false }
        ];
        // noop
    }
    TodoList.prototype.addTodo = function () {
        this.todos.push({ text: this.todoText, done: false });
        this.todoText = '';
    };
    TodoList.prototype.remaining = function () {
        var count = 0;
        angular.forEach(this.todos, function (todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };
    TodoList.prototype.archive = function () {
        var _this = this;
        var oldTodos = this.todos;
        this.todos = [];
        angular.forEach(oldTodos, function (todo) {
            if (!todo.done)
                _this.todos.push(todo);
        });
    };
    TodoList = __decorate([Component({
        selector: 'todo-list'
    }), View({
        templateUrl: 'todo-list.html'
    })], TodoList);
    return TodoList;
})();
bootstrap(TodoList);
