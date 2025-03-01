import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/todos";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [taskImages, setTaskImages] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const promises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => resolve(reader.result);
      });
    });
    Promise.all(promises).then((base64Images) => setTaskImages(base64Images));
  };

  const addTask = async (e) => {
    e.preventDefault();
    const res = await axios.post(API_URL, { text: taskText, completed: false, images: taskImages });
    setTodos([...todos, res.data]);
    setTaskText("");
    setTaskImages([]);
  };

  const checkboxStatus = async (id) => {
    const task = todos.find((t) => t.id === id);
    if (!task) return;
    const res = await axios.put(`${API_URL}/${id}`, { ...task, completed: !task.completed });
    setTodos(todos.map((t) => (t.id === id ? res.data : t)));
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setTodos(todos.filter((t) => t.id !== id));
  };

  const editTask = (id, text) => {
    setEditingTaskId(id);
    setEditTaskText(text);
  };

  const saveTask = async (id) => {

    const task = todos.find((t) => t.id === id);
    const updatedTask = {
      text: editTaskText,
      images: taskImages.length > 0 ? taskImages : task.images,
    };

    try {
      const res = await axios.put(`${API_URL}/${id}`, updatedTask);
      setTodos(todos.map((t) => (t.id === id ? res.data : t)));
      setEditingTaskId(null);
      setTaskImages([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white shadow-2xl rounded-2xl">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">To-Do List</h1>
      <form onSubmit={addTask} className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="What needs to be done?"
          className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="p-2 border rounded-lg w-full" />
        {taskImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {taskImages.map((img, index) => (
              <img key={index} src={img} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
            ))}
          </div>
        )}
        <button className="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition">Add</button>
      </form>
      <div className="space-y-3">
        {todos.length > 0 ? (
          todos.map((task) => (
            <div key={task.id} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm">
              <div className="flex-1">
                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    value={editTaskText}
                    onChange={(e) => setEditTaskText(e.target.value)}
                    className="p-2 border rounded-lg w-full"
                  />
                ) : (
                  <span className={`text-lg ${task.completed ? "line-through text-gray-400" : ""}`}>{task.text}</span>
                )}
                {task.images && task.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.images.map((img, index) => (
                      <img key={index} src={img} alt="Task" className="w-16 h-16 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={task.completed} onChange={() => checkboxStatus(task.id)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
                {editingTaskId === task.id ? (
                  <button onClick={() => saveTask(task.id)} className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition">Save</button>
                ) : (
                  <>
                    <button onClick={() => editTask(task.id, task.text)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition">Edit</button>
                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition">Delete</button>
                  </>
                )}
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
