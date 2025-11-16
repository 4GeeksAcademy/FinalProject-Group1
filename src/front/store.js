export const initialStore = () => {
  return {
    currentUserId: 5,
    message: null,
    token: localStorage.getItem("token") ?? null,
    user: JSON.parse(localStorage.getItem("user")) ?? null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "add_task":
      const { id, color } = action.payload;

      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };

    case "SET_TOKEN":
      return {
        ...store,
        token: action.payload,
      };

    case "SET_USER":
      return {
        ...store,
        user: action.payload,
      };

    default:
      throw Error("Unknown action.");
  }
}
