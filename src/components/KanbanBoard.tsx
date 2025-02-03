import { DragEvent, useState } from 'react';
import type { Schema } from "../../amplify/data/resource";

type TodoItem = Schema["Todo"]["type"];

interface KanbanBoardProps {
  todos: TodoItem[];
  onUpdateTodo: (id: string, status: string) => void;
  onDeleteTodo: (id: string) => void;
}

export function KanbanBoard({ todos, onUpdateTodo, onDeleteTodo }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  console.log('Todos in KanbanBoard:', todos);

  const columns = {
    'TODO': todos.filter(todo => todo.status === 'TODO' || !todo.status),
    'DOING': todos.filter(todo => todo.status === 'DOING'),
    'DONE': todos.filter(todo => todo.status === 'DONE'),
  };

  console.log('Columns:', columns);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, todoId: string) => {
    console.log('Started dragging:', todoId);
    e.currentTarget.classList.add('dragging');
    setDraggedItem(todoId);
    e.dataTransfer.setData('text/plain', todoId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(status);
    const column = e.currentTarget;
    column.classList.add('drag-over');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);
    const column = e.currentTarget;
    column.classList.remove('drag-over');
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const todoId = e.dataTransfer.getData('text/plain');
    console.log('Dropping todo:', todoId, 'into status:', status);
    
    if (todoId) {
      try {
        await onUpdateTodo(todoId, status);
        console.log('Drop successful');
      } catch (error) {
        console.error('Drop failed:', error);
      }
    }
    
    setDraggedItem(null);
    setDragOverColumn(null);
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedItem(null);
    setDragOverColumn(null);
    document.querySelectorAll('.kanban-column').forEach(column => {
      column.classList.remove('drag-over');
    });
  };

  return (
    <div className="kanban-board">
      {Object.entries(columns).map(([status, items]) => (
        <div
          key={status}
          className={`kanban-column ${dragOverColumn === status ? 'drag-over' : ''}`}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <h2>{status}</h2>
          {items.length === 0 ? (
            <div className="kanban-empty">No items</div>
          ) : (
            items.map((todo) => (
              <div
                key={todo.id}
                className={`kanban-item ${draggedItem === todo.id ? 'dragging' : ''}`}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onDeleteTodo(todo.id)}
              >
                {todo.content}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
} 