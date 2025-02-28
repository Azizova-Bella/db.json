import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/todos"; // Server where our tasks are stored

export default function App() {
  const [todos, setTodos] = useState([]); // List of tasks
  const [text, setText] = useState(""); // New task text
  const [editingId, setEditingId] = useState(null); // Which task is being edited
  const [editText, setEditText] = useState(""); // New text for editing

  // 📌 1. Load tasks when the page opens
  useEffect(() => {
    axios.get(API_URL)
      .then((res) => setTodos(res.data)) // Save tasks to state
      .catch((err) => console.error("Error loading tasks:", err));
  }, []);

  // 📌 2. Add a new task
  const addTodo = async (e) => {
    e.preventDefault(); // Stop page from refreshing
    if (!text.trim()) return; // Stop empty tasks
    const newTodo = { text, completed: false }; // Create new task
    try {
      const res = await axios.post(API_URL, newTodo);
      setTodos([...todos, res.data]); // Add new task to the list
      setText(""); // Clear input box
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // 📌 3. Toggle task complete/incomplete
  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t.id === id); // Find task by ID
    if (!todo) return;
    try {
      const res = await axios.put(`${API_URL}/${id}`, { ...todo, completed: !todo.completed });
      setTodos(todos.map((t) => (t.id === id ? res.data : t))); // Update task in state
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // 📌 4. Delete a task
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter((t) => t.id !== id)); // Remove task from list
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // 📌 5. Start editing a task
  const startEditing = (id, text) => {
    setEditingId(id); // Set the task to be edited
    setEditText(text); // Fill input with current text
  };

  // 📌 6. Save edited task
  const updateTodo = async (id) => {
    if (!editText.trim()) return;
    const todo = todos.find((t) => t.id === id);
    try {
      const res = await axios.put(`${API_URL}/${id}`, { text: editText, completed: todo.completed });
      setTodos(todos.map((t) => (t.id === id ? res.data : t)));
      setEditingId(null); // Stop editing mode
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white shadow-lg rounded">
      <h1 className="text-xl font-bold mb-4">To-Do List</h1>

      {/* Form to add a new task */}
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task"
          className="p-2 border rounded w-full"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
      </form>

      {/* Show tasks */}
      {todos.length > 0 ? (
        todos.map((todo) => (
          <div key={todo.id} className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2">
            {editingId === todo.id ? (
              // Editing mode
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="p-1 border rounded w-full mr-2"
                />
                <button onClick={() => updateTodo(todo.id)} className="bg-green-500 text-white px-2 py-1 rounded">
                  Save
                </button>
              </>
            ) : (
              // Normal mode
              <>
                <span className={`flex-1 ${todo.completed ? "line-through text-gray-400" : ""}`}>
                  {todo.text}
                </span>
                <div>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="mr-2"
                  />
                  <button
                    onClick={() => startEditing(todo.id, todo.text)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No tasks yet!</p>
      )}
    </div>
  );
}
