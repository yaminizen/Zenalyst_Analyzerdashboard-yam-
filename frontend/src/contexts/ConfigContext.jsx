import { createContext, useReducer } from 'react';

const initialState = {
  collapseMenu: false,
  collapseLayout: false,
  headerBackColor: '',
  collapseTabMenu: false,
  collapseHeaderMenu: false
};

const configReducer = (state, action) => {
  switch (action.type) {
    case 'COLLAPSE_MENU':
      return {
        ...state,
        collapseMenu: !state.collapseMenu
      };
    case 'COLLAPSE_LAYOUT':
      return {
        ...state,
        collapseLayout: !state.collapseLayout
      };
    case 'HEADER_BACK_COLOR':
      return {
        ...state,
        headerBackColor: action.headerBackColor
      };
    case 'COLLAPSE_TAB_MENU':
      return {
        ...state,
        collapseTabMenu: !state.collapseTabMenu
      };
    case 'COLLAPSE_HEADER_MENU':
      return {
        ...state,
        collapseHeaderMenu: !state.collapseHeaderMenu
      };
    default:
      return state;
  }
};

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [state, dispatch] = useReducer(configReducer, initialState);

  return (
    <ConfigContext.Provider value={{ state, dispatch }}>
      {children}
    </ConfigContext.Provider>
  );
};