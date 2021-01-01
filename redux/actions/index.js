import { SET_CURRENT_USER, GET_CURRENT_USER, IS_DARK_MODE } from "./types";

/**
 *
 * @param {*} uEmail RECEIVE CURRENT USER EMAIL
 * @returns RETURN THE CURRENT USER TO THE STORE
 */
const setCurrentUserFromTheStore = (uEmail) => {
  return {
    type: SET_CURRENT_USER,
    payload: uEmail,
  };
};

/**
 *
 * @returns GET THE CURRENT USER EMAIL FOR FETCHING THE DATA FORM THE SERVER
 */
const getCurrentUserFromTheStore = () => {
  return {
    type: GET_CURRENT_USER,
  };
};

/**
 *
 * @param {*} condition Dark mode or Light mode condition passed to the store function
 * @returns return the current state of the isDarkMode
 */
const setIsDarkMode = (condition) => {
  return {
    type: IS_DARK_MODE,
    payload: condition,
  };
};

export {
  setCurrentUserFromTheStore,
  getCurrentUserFromTheStore,
  setIsDarkMode,
};
