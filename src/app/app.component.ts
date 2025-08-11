import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddTodoComponent } from './add-todo/add-todo.component';
import { CommonModule } from '@angular/common';
import { TodoItem } from './models/to-do-item';
import { TodoStorageService } from './services/todo-storage.service';
import { TodoListComponent } from './todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddTodoComponent, TodoListComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'To-Do List App';
  todos: TodoItem[] = [];

  constructor(private todoStorage: TodoStorageService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todos = this.todoStorage.loadTodos();
  }

  saveTodos(): void {
    this.todoStorage.saveTodos(this.todos);
  }

  onTodoAdded(todo: TodoItem): void {
    this.todos.push(todo);
    this.saveTodos();
  }

  toggleTodo(todoId: number): void {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
    }
  }

  deleteTodo(todoId: number): void {
    this.todos = this.todos.filter(t => t.id !== todoId);
    this.saveTodos();
  }

  clearAllTodos(): void {
    this.todos = [];
    this.saveTodos();
  }

  onTodoUpdated(updatedTodo: TodoItem): void {
    const index = this.todos.findIndex(todo => todo.id === updatedTodo.id);
    if (index !== -1) {
      this.todos[index] = updatedTodo;
      this.saveTodos();
    }
  }

  onTodoDeleted(todoId: number): void {
    this.deleteTodo(todoId);
  }

  onTodoCompleted(todoId: number): void {
    this.toggleTodo(todoId);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  getDateStatus(todo: TodoItem): string {
    if (!todo.endDate) return '';
    
    const today = new Date();
    const endDate = new Date(todo.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    if (diffDays <= 3) return 'due-soon';
    return 'on-track';
  }

  getDateStatusText(todo: TodoItem): string {
    if (!todo.endDate) return '';
    
    const today = new Date();
    const endDate = new Date(todo.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 3) return `Due in ${diffDays} day(s)`;
    return `${diffDays} days remaining`;
  }
}