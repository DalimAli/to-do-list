import { Injectable } from '@angular/core';
import { TodoItem } from '../models/to-do-item';
@Injectable({
  providedIn: 'root'
})
export class TodoStorageService {
  private readonly STORAGE_KEY = 'todo-items';

  constructor() { }

  saveTodos(todos: TodoItem[]): void {
    try {
      const todosJson = JSON.stringify(todos);
      localStorage.setItem(this.STORAGE_KEY, todosJson);
    } catch (error) {
      console.error('Error saving todos to localStorage:', error);
    }
  }

  loadTodos(): TodoItem[] {
    try {
      const todosJson = localStorage.getItem(this.STORAGE_KEY);
      if (todosJson) {
        const todos = JSON.parse(todosJson);
        return todos || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading todos from localStorage:', error);
      return [];
    }
  }

  clearTodos(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing todos from localStorage:', error);
    }
  }

}
