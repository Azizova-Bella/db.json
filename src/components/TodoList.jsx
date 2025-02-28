import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/todos";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    axios.get(API_URL).then((res) => setTodos(res.data));
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    const res = await axios.post(API_URL, { text, completed: false });
    setTodos([...todos, res.data]);
    setText("");
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const res = await axios.put(`${API_URL}/${id}`, {
      ...todo,
      completed: !todo.completed,
    });
    setTodos(todos.map((t) => (t.id === id ? res.data : t)));
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setTodos(todos.filter((t) => t.id !== id));
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
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white shadow-2xl rounded-2xl">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        To-Do List
      </h1>

      <form onSubmit={addTodo} className="flex gap-3 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition">
          Add
        </button>
      </form>

      <div className="space-y-3">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm"
            >
              <span
                className={`flex-1 text-lg ${
                  todo.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {todo.text}
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                  className="w-5 h-5 accent-blue-500 cursor-pointer"
                />
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
                <button
                    onClick={() => startEditing(todo.id, todo.text)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">+ add task</p>
        )}
      </div>
    </div>
  );
}
