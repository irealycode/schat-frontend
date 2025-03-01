import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import HomeLogged from './HomeLogged';
import Home from './Home';
 
const HomeRouter: React.FC = () => {
  const token = localStorage.getItem("token")
  if (token) {
    return <HomeLogged token={token} />
  }
  return <Home/>;
};

export default HomeRouter;