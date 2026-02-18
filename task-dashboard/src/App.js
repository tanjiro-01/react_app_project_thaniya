import React, { useState, useEffect, useMemo } from 'react';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');

  // 🌙 Dark Mode State (persisted)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load tasks
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('smartTasks')) || [];
    setTasks(savedTasks);
  }, []);

  // Save tasks
  useEffect(() => {
    localStorage.setItem('smartTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    setTasks([...tasks, { ...task, id: Date.now(), status: 'To Do' }]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateStatus = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const processedTasks = useMemo(() => {
    return tasks
      .filter(t => (filterStatus === 'All' || t.status === filterStatus))
      .filter(t => (filterPriority === 'All' || t.priority === filterPriority))
      .sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [tasks, filterStatus, filterPriority, sortOrder]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status !== 'Completed').length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Smart Task Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Efficiently manage your daily priorities
            </p>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1.5 text-sm rounded-lg border 
                       bg-white text-gray-700 
                       dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700
                       hover:shadow-sm transition"
          >
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SummaryCard title="Total Tasks" value={stats.total} color="blue" />
          <SummaryCard title="Pending" value={stats.pending} color="yellow" />
          <SummaryCard title="Completed" value={stats.completed} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Task Form */}
          <div className="lg:col-span-1">
            <TaskForm onAdd={addTask} />
          </div>

          {/* Task List */}
          <div className="lg:col-span-2">

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4 
                            border dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">

              <div className="flex gap-2">
                <select onChange={(e) => setFilterStatus(e.target.value)}
                  className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded p-2 text-sm">
                  <option value="All">All Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <select onChange={(e) => setFilterPriority(e.target.value)}
                  className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded p-2 text-sm">
                  <option value="All">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium"
              >
                Sort by Date ({sortOrder === 'asc' ? '↑' : '↓'})
              </button>
            </div>

            {/* Task Items */}
            <div className="space-y-4">
              {processedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onStatusChange={updateStatus}
                />
              ))}

              {processedTasks.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 
                                rounded-xl border-2 border-dashed dark:border-gray-700">
                  <p className="text-gray-400 dark:text-gray-500">
                    No tasks found matching your filters.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* Summary Card (FIXED — No dynamic Tailwind classes) */
const SummaryCard = ({ title, value, color }) => {
  const borderColors = {
    blue: "border-blue-500",
    yellow: "border-yellow-500",
    green: "border-green-500"
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 ${borderColors[color]}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold">
        {title}
      </p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
};

/* Task Form */
const TaskForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ title: '', description: '', priority: 'Medium', dueDate: '' });
  };

  return (
    <form onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4 border dark:border-gray-700">

      <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">
        Create New Task
      </h2>

      <input type="text" required placeholder="Task Title"
        className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded-lg p-3"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
      />

      <textarea placeholder="Task Description"
        className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded-lg p-3 h-24"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <select
          className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded-lg p-2"
          value={formData.priority}
          onChange={e => setFormData({ ...formData, priority: e.target.value })}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <input type="date" required
          className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded-lg p-2"
          value={formData.dueDate}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>

      <button type="submit"
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
        Add Task
      </button>
    </form>
  );
};

/* Task Item */
const TaskItem = ({ task, onDelete, onStatusChange }) => {
  const statusColors = {
    'To Do': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    'Completed': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
      <div className="flex justify-between">

        <div>
          <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>
            {task.status}
          </span>

          <h3 className={`font-bold mt-2 text-gray-800 dark:text-gray-100 ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {task.description}
          </p>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="text-xs border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded p-1.5"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900 p-2 rounded-lg"
          >
            🗑️
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;