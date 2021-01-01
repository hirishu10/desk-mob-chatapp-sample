import { createStore } from "redux";
// import { createStore, applyMiddleware, compose } from "redux";
// import thunk from "redux-thunk";
import mainReducer from "./redux/reducers/mainReducer";

// const initialState = {};
// const midelware = [thunk];

const store = createStore(mainReducer);
// // Redux dev tool code if you use for production don't use this only for Development Purpose
// // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

export default store;
