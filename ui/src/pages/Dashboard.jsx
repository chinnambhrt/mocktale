import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Folder } from 'lucide-react';
import Layout from '../components/Layout';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:3000/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleDeleteProject = async (id, e) => {
        e.preventDefault(); // Prevent navigation
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await axios.delete(`http://localhost:3000/projects/${id}`);
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
                <Link
                    to="/projects/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7E4F1F] hover:bg-[#643f19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7E4F1F]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 group relative"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Folder className="w-6 h-6 text-[#7E4F1F]" />
                            </div>
                            <button
                                onClick={(e) => handleDeleteProject(project.id, e)}
                                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{project.description || 'No description'}</p>
                    </Link>
                ))}
            </div>
        </Layout>
    );
};

export default Dashboard;
