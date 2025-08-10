import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddTodoComponent } from './add-todo/add-todo.component';
import { CommonModule } from '@angular/common';
import { TodoItem } from './models/to-do-item';
import { TodoStorageService } from './services/todo-storage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddTodoComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'To-Do List App';
  todos: TodoItem[] = [];

  constructor(private todoStorage: TodoStorageService) {}

  saveTodos(): void {
    this.todoStorage.saveTodos(this.todos);
  }
  
  onTodoAdded(todo: TodoItem): void {
    this.todos.push(todo);
    this.saveTodos();
  }
}
