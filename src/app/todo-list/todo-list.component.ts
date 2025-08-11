import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TodoItem } from '../models/to-do-item';

@Component({
  selector: 'app-todo-list',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css'
})
export class TodoListComponent implements OnInit, OnChanges {
  @Input() todos: TodoItem[] = [];
  @Output() todoUpdated = new EventEmitter<TodoItem>();
  @Output() todoDeleted = new EventEmitter<number>();
  @Output() todoCompleted = new EventEmitter<number>();
  @Output() clearAll = new EventEmitter<void>();

  todoFormArray: FormArray;
  editingStates: boolean[] = [];

  constructor(private fb: FormBuilder) {
    this.todoFormArray = this.fb.array([]);
  }

  ngOnInit(): void {
    this.updateFormArray();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todos']) {
      this.updateFormArray();
    }
  }

  updateFormArray(): void {
    // Clear existing form array and editing states
    while (this.todoFormArray.length !== 0) {
      this.todoFormArray.removeAt(0);
    }
    this.editingStates = [];
    
    // Build new form array based on current todos
    this.todos.forEach((todo, index) => {
      const todoForm = this.fb.group({
        id: [todo.id],
        text: [todo.text, [Validators.required, Validators.minLength(1)]],
        completed: [todo.completed],
        startDate: [todo.startDate ? this.formatDateForInput(todo.startDate) : ''],
        endDate: [todo.endDate ? this.formatDateForInput(todo.endDate) : '']
      }, { validators: this.dateRangeValidator });
      
      this.todoFormArray.push(todoForm);
      this.editingStates.push(false);
    });
  }

  dateRangeValidator(group: FormGroup) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  formatDateForInput(date: Date): string {
    if (!date) return '';
    try {
      // Ensure we have a proper Date object
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    try {
      // Ensure we have a proper Date object
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString();
    } catch (error) {
      return '';
    }
  }

  getDateStatus(todo: TodoItem): string {
    if (!todo || !todo.endDate) return '';
    
    try {
      const today = new Date();
      const endDate = todo.endDate instanceof Date ? todo.endDate : new Date(todo.endDate);
      
      if (isNaN(endDate.getTime())) return '';
      
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'overdue';
      if (diffDays === 0) return 'due-today';
      if (diffDays <= 3) return 'due-soon';
      return 'on-track';
    } catch (error) {
      return '';
    }
  }

  getDateStatusText(todo: TodoItem): string {
    if (!todo || !todo.endDate) return '';
    
    try {
      const today = new Date();
      const endDate = todo.endDate instanceof Date ? todo.endDate : new Date(todo.endDate);
      
      if (isNaN(endDate.getTime())) return '';
      
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      if (diffDays <= 3) return `Due in ${diffDays} day(s)`;
      return `${diffDays} days remaining`;
    } catch (error) {
      return '';
    }
  }

  startEdit(index: number): void {
    this.editingStates[index] = true;
  }

  cancelEdit(index: number): void {
    if (index < 0 || index >= this.editingStates.length) {
      return;
    }
    
    this.editingStates[index] = false;
    // Reset form to original values
    if (index < this.todos.length && index < this.todoFormArray.length) {
      const originalTodo = this.todos[index];
      const formGroup = this.todoFormArray.at(index) as FormGroup;
      formGroup.patchValue({
        text: originalTodo.text,
        startDate: originalTodo.startDate ? this.formatDateForInput(originalTodo.startDate) : '',
        endDate: originalTodo.endDate ? this.formatDateForInput(originalTodo.endDate) : ''
      });
    }
  }

  saveEdit(index: number): void {
    if (index < 0 || index >= this.todoFormArray.length) {
      return;
    }
    
    const formGroup = this.todoFormArray.at(index) as FormGroup;
    if (formGroup.valid) {
      const formValue = formGroup.value;
      const updatedTodo: TodoItem = {
        id: formValue.id,
        text: formValue.text.trim(),
        completed: formValue.completed,
        startDate: formValue.startDate ? new Date(formValue.startDate) : undefined,
        endDate: formValue.endDate ? new Date(formValue.endDate) : undefined
      };
      
      this.todoUpdated.emit(updatedTodo);
      this.editingStates[index] = false;
    }
  }

  toggleCompletion(index: number): void {
    if (index >= 0 && index < this.todos.length) {
      const todoId = this.todos[index].id;
      this.todoCompleted.emit(todoId);
      
      // Update the form control as well to keep it in sync
      if (index < this.todoFormArray.length) {
        const formGroup = this.todoFormArray.at(index) as FormGroup;
        if (formGroup) {
          formGroup.patchValue({ completed: !this.todos[index].completed });
        }
      }
    }
  }

  deleteTodo(index: number): void {
    if (index >= 0 && index < this.todos.length) {
      const todoText = this.todos[index].text;
      const confirmDelete = window.confirm(
        `Are you sure you want to delete this todo item?\n\n"${todoText}"\n\nThis action cannot be undone.`
      );
      
      if (confirmDelete) {
        const todoId = this.todos[index].id;
        this.todoDeleted.emit(todoId);
      }
    }
  }

  clearAllTodos(): void {
    const todoCount = this.todos.length;
    const confirmClear = window.confirm(
      `Are you sure you want to delete all ${todoCount} todo item(s)?\n\nThis action cannot be undone and will permanently remove all your todos.`
    );
    
    if (confirmClear) {
      this.clearAll.emit();
    }
  }

  getTodoFormGroup(index: number): FormGroup {
    if (index < 0 || index >= this.todoFormArray.length) {
      return this.fb.group({});
    }
    return this.todoFormArray.at(index) as FormGroup;
  }

  isEditing(index: number): boolean {
    return this.editingStates[index] || false;
  }

  // Helper method to check if form array is properly initialized
  isFormArrayReady(): boolean {
    return this.todoFormArray && this.todoFormArray.length === this.todos.length;
  }

  // TrackBy function for ngFor to improve performance
  trackByTodoId(index: number, todo: TodoItem): number {
    return todo ? todo.id : index;
  }
}
