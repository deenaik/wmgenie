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

  console.log('Todos in KanbanBoard:', todos);

  const columns = {
    'TODO': todos.filter(todo => todo.status === 'TODO' || !todo.status),
    'DOING': todos.filter(todo => todo.status === 'DOING'),
    'DONE': todos.filter(todo => todo.status === 'DONE'),
  };

  console.log('Columns:', columns);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, todoId: string) => {
    console.log('Started dragging:', todoId);
    setDraggedItem(todoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (draggedItem) {
      console.log('Dropping item:', draggedItem, 'into status:', status);
      onUpdateTodo(draggedItem, status);
      setDraggedItem(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="kanban-board">
      {Object.entries(columns).map(([status, items]) => (
        <div
          key={status}
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          <h2>{status}</h2>
          {items.length === 0 ? (
            <div className="kanban-empty">No items</div>
          ) : (
            items.map((todo) => (
              <div
                key={todo.id}
                className="kanban-item"
                draggable
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