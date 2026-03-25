import { useState, useEffect, useRef } from 'react';
import { Todo, FilterType } from './types';

const STORAGE_KEY = 'react-todos';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = () => {
    const text = inputValue.trim();
    if (!text) return;
    const newTodo: Todo = {
      id: generateId(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTodo();
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="url(#grad)" />
              <path d="M9 16.5L13.5 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="title">マイTODO</h1>
          {todos.length > 0 && (
            <span className="badge">{todos.length}</span>
          )}
        </header>

        {/* Input area */}
        <div className="input-card">
          <input
            ref={inputRef}
            className="todo-input"
            type="text"
            placeholder="やることを入力してください..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            className="add-btn"
            onClick={addTodo}
            disabled={!inputValue.trim()}
            aria-label="Add todo"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Todo list */}
        {todos.length > 0 && (
          <div className="list-card">
            {filteredTodos.length === 0 ? (
              <div className="empty-filter">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="#e2e8f0" strokeWidth="2" />
                  <path d="M13 20h14M20 13v14" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p>{filter === 'all' ? 'すべて' : filter === 'active' ? '未完了' : '完了済み'}のタスクはありません</p>
              </div>
            ) : (
              <ul className="todo-list">
                {filteredTodos.map((todo, index) => (
                  <li
                    key={todo.id}
                    className={`todo-item ${todo.completed ? 'completed' : ''}`}
                    style={{ '--index': index } as React.CSSProperties}
                  >
                    <label className="checkbox-wrapper" aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}>
                      <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <span className="checkbox-custom">
                        {todo.completed && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </label>
                    <span className="todo-text">{todo.text}</span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTodo(todo.id)}
                      aria-label={`Delete "${todo.text}"`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Footer */}
            <div className="list-footer">
              <span className="count-label">
                残り <strong>{activeCount}</strong> 件
              </span>

              <div className="filter-group" role="group" aria-label="Filter todos">
                {(['all', 'active', 'completed'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'すべて' : f === 'active' ? '未完了' : '完了済み'}
                  </button>
                ))}
              </div>

              <button
                className={`clear-btn ${completedCount === 0 ? 'hidden' : ''}`}
                onClick={clearCompleted}
                disabled={completedCount === 0}
              >
                完了済みを削除 ({completedCount})
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {todos.length === 0 && (
          <div className="empty-state">
            <div className="empty-illustration">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="36" fill="#f1f5f9" />
                <rect x="24" y="28" width="32" height="4" rx="2" fill="#e2e8f0" />
                <rect x="24" y="36" width="24" height="4" rx="2" fill="#e2e8f0" />
                <rect x="24" y="44" width="28" height="4" rx="2" fill="#e2e8f0" />
                <circle cx="56" cy="56" r="14" fill="url(#grad2)" />
                <path d="M51 56l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="grad2" x1="42" y1="42" x2="70" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2>タスクがありません</h2>
            <p>上の入力欄からタスクを追加しましょう。</p>
          </div>
        )}
      </div>
    </div>
  );
}
