import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import ApiDetails from './pages/ApiDetails';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/project/:id" element={<ProjectDetails />} />
                <Route path="/api/:id" element={<ApiDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
