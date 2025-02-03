import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { KanbanBoard } from "./components/KanbanBoard";

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ 
        content,
        status: 'TODO'  // Make sure this is exactly the same case as in the filter
      });
    }
  }

  // Add this console.log to debug
  console.log('Current todos:', todos);

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  async function updateTodoStatus(id: string, status: string) {
    try {
      console.log('Updating todo:', id, 'to status:', status);
      const updatedTodo = await client.models.Todo.update({
        id,
        status,
      });
      console.log('Update successful:', updatedTodo);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s Task Board</h1>
      <button onClick={createTodo}>+ Add New Task</button>
      <KanbanBoard 
        todos={todos}
        onUpdateTodo={updateTodoStatus}
        onDeleteTodo={deleteTodo}
      />
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
