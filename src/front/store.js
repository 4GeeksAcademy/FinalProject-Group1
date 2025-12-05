export const initialStore = () => {
  return {
    token: localStorage.getItem("access_token") ?? null,
    user: JSON.parse(localStorage.getItem("user")) ?? null,
    recipe_published: JSON.parse(localStorage.getItem("recipes")) || [],
    reportedComments: [], // <--- NUEVO: Estado para guardar los reportes
    currentUserId: null,
    message: null,
    todos: [
      {
        token: null,
        user: null,
      },
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

    case "login_success":
      return {
        ...store,
        token: action.payload.token,
        currentUserId: action.payload.user_id,
        user: action.payload.user,
      };

    case "logout":
      return {
        ...store,
        token: null,
        currentUserId: null,
        user: null,
      };

    case "update_user":
      return {
        ...store,
        user: action.payload,
      };

    case "SET_RECIPES":
      return {
        ...store,
        recipe_published: action.payload
      }

    // --- NUEVO CASO PARA ACTUALIZAR REPORTES ---
    case "SET_REPORTED_COMMENTS":
      return {
        ...store,
        reportedComments: action.payload
      };
    // -------------------------------------------

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

    case "CHECK_AUTH":
      return {
        ...store,
        token: localStorage.getItem("access_token") ?? null,
        user: JSON.parse(localStorage.getItem("user")) ?? null,
      };
    default:
      throw Error("Unknown action.");
  }
}