import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Code, Download, Upload, ArrowLeft } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import Layout from '../components/Layout';

const ProjectDetails = () => {
    const { id } = useParams();
    const [apis, setApis] = useState([]);

    useEffect(() => {
        fetchApis();
    }, [id]);

    const fetchApis = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/apis/project/${id}`);
            setApis(response.data);
        } catch (error) {
            console.error('Error fetching APIs:', error);
        }
    };

    const handleDeleteApi = async (apiId) => {
        if (!window.confirm('Are you sure you want to delete this API?')) return;
        try {
            await axios.delete(`http://localhost:3000/apis/${apiId}`);
            fetchApis();
        } catch (error) {
            console.error('Error deleting API:', error);
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apis, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `project-${id}-apis.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = async (e) => {
            try {
                const importedApis = JSON.parse(e.target.result);
                for (const api of importedApis) {
                    // Remove ID to create new entries
                    const { id: _, created_at: __, ...apiData } = api;
                    // Ensure response_body is parsed if it's a string, or kept as object
                    let body = apiData.response_body;
                    if (typeof body === 'string') {
                        try {
                            body = JSON.parse(body);
                        } catch (e) {
                            // keep as string if parse fails, though it should be object for the API
                        }
                    }

                    await axios.post('http://localhost:3000/apis', {
                        ...apiData,
                        project_id: id,
                        response_body: body
                    });
                }
                fetchApis();
            } catch (error) {
                console.error('Error importing APIs:', error);
                alert('Error importing APIs');
            }
        };
    };

    const methodColors = {
        GET: 'bg-green-100 text-green-800',
        POST: 'bg-blue-100 text-blue-800',
        PUT: 'bg-yellow-100 text-yellow-800',
        DELETE: 'bg-red-100 text-red-800',
        PATCH: 'bg-purple-100 text-purple-800',
    };

    return (
        <Layout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center">
                    <Link to="/" className="mr-4 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">Project APIs</h1>
                </div>
                <div className="flex space-x-3">
                    <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                        <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <Link
                        to={`/project/${id}/apis/new`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7E4F1F] hover:bg-[#643f19]"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New API
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {apis.map((api) => (
                        <li key={api.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center flex-1 min-w-0">
                                    <Link to={`/api/${api.id}`} className="flex-1 flex items-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${methodColors[api.method] || 'bg-gray-100 text-gray-800'} mr-4 w-16 justify-center`}>
                                            {api.method}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-[#7E4F1F] truncate">{api.name}</p>
                                            <p className="text-sm text-gray-500 truncate">{api.endpoint}</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <a
                                        href={`http://localhost:3000/mock/${id}${api.endpoint}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-500 hover:text-[#7E4F1F] flex items-center"
                                    >
                                        <Code className="w-4 h-4 mr-1" />
                                        Test
                                    </a>
                                    <button
                                        onClick={() => handleDeleteApi(api.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {apis.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No APIs found. Create one to get started.
                        </li>
                    )}
                </ul>
            </div>
        </Layout>
    );
};

export default ProjectDetails;
