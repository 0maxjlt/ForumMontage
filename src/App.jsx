import { Fragment, useState } from 'react'
import './App.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import VideosDashboard from "./pages/VideosDashboard";
import Forum from "./pages/Forum";
import Layout from './components/Layout';
import MyBreadcrumbs from './components/Header';



const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {

  return (
    <Fragment>
      <ThemeProvider theme={darkTheme}>
      <CssBaseline />
     
        <Router>
            <Routes>
              <Route path="/" element={<Layout/>} >
                <Route path="/" element={<Home />} />  {/* Route de connexion */}
                <Route path="/login" element={<Login />} />  {/* Route de connexion */}
                <Route path="/dashboard" element={<Dashboard />} />  {/* Route de connexion */}
                <Route path ="/dashboard/:id" element={<VideosDashboard />} />
                <Route path = "/Forum" element={<Forum />} />
              </Route>
            </Routes>
        </Router>
      </ThemeProvider>
    </Fragment>
  );





}

export default App
