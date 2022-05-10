import React from "react";
import { Routes, Route, Outlet, Link, BrowserRouter } from "react-router-dom";

import LayoutBase from './layout/base'
// import HomePage from './home'
import MainPage from './main'
import NotFound from './common/404'

interface Props { context: {} }
export function Components(props: Props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutBase {...props.context} />}>
          <Route path="/main" element={<MainPage />} ></Route>
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Components;
