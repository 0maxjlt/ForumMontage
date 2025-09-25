import { Fragment } from 'react'
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
import VideoAppli from "./pages/VideoAppli";
import Discussions from "./pages/Discussions";


import Layout from './components/Layout';
import MyBreadcrumbs from './components/Header';
import { MessageProvider } from './components/Context'; // ✅ import correct

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

        <MessageProvider> {/* ✅ Le Provider autour du Router */}
          <Router>
            <Routes>
              <Route path="/" element={<Layout />} >
                <Route index element={<Home />} />  
                <Route path="login" element={<Login />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="dashboard/:id" element={<VideosDashboard />} />
                <Route path="forum" element={<Forum />} />
                <Route path="video/:username/:videoId" element={<VideoAppli />} />
                <Route path="messagerie" element={<Discussions />} />
              </Route>
            </Routes>
          </Router>
        </MessageProvider>

      </ThemeProvider>
    </Fragment>
  );
}

export default App;
