import TodoItem from './TodoItem';

function TodoList({ todos }) {
  return (
    <ul className="todo-list">
      {todos.map((todo, index) => (
        <TodoItem key={index} todo={todo} />
      ))}
    </ul>
  );
}

export default TodoList;
