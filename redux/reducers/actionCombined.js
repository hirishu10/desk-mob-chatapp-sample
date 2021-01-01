import { GET_CURRENT_USER, IS_DARK_MODE } from "../actions/types";

const initialState = {
  email: "rishu",
  isDarkMode: false,
};

const actionCombined = (state = initialState, action) => {
  switch (action.type) {
    case GET_CURRENT_USER:
      return { ...state, email: action.payload };
    case GET_CURRENT_USER:
      return state.email;
    case IS_DARK_MODE:
      return { ...state, isDarkMode: action.payload };
    default:
      return state;
  }
};

export default actionCombined;
