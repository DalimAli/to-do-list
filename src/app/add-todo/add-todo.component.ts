import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TodoItem } from '../models/to-do-item';

@Component({
  selector: 'app-add-todo',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-todo.component.html',
  styleUrl: './add-todo.component.css'
})
export class AddTodoComponent {
  @Output() todoAdded = new EventEmitter<TodoItem>();
  
  todoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.todoForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]],
      startDate: [''],
      endDate: ['']
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(group: FormGroup) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  addTodo(): void {
    if (this.todoForm.valid) {
      const formValue = this.todoForm.value;
      const newTodo: TodoItem = {
        id: Date.now(),
        text: formValue.text.trim(),
        completed: false,
        startDate: formValue.startDate ? new Date(formValue.startDate) : undefined,
        endDate: formValue.endDate ? new Date(formValue.endDate) : undefined
      };
      
      this.todoAdded.emit(newTodo);
      this.clearForm();
    }
  }

  clearForm(): void {
    this.todoForm.reset();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.addTodo();
  }

  get text() { return this.todoForm.get('text'); }
  get startDate() { return this.todoForm.get('startDate'); }
  get endDate() { return this.todoForm.get('endDate'); }
}
