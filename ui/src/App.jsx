import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import ApiDetails from './pages/ApiDetails';
import NewProject from './pages/NewProject';
import NewApi from './pages/NewApi';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects/new" element={<NewProject />} />
                <Route path="/project/:id" element={<ProjectDetails />} />
                <Route path="/project/:projectId/apis/new" element={<NewApi />} />
                <Route path="/api/:id" element={<ApiDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
