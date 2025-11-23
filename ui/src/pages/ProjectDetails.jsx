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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newApi, setNewApi] = useState({
        name: '',
        method: 'GET',
        endpoint: '',
        response_status: 200,
        response_body: '{}'
    });

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

    const handleCreateApi = async (e) => {
        e.preventDefault();
        try {
            let parsedBody;
            try {
                parsedBody = JSON.parse(newApi.response_body);
            } catch (e) {
                alert('Invalid JSON in response body');
                return;
            }

            await axios.post('http://localhost:3000/apis', {
                project_id: id,
                ...newApi,
                response_body: parsedBody
            });
            setIsModalOpen(false);
            setNewApi({
                name: '',
                method: 'GET',
                endpoint: '',
                response_status: 200,
                response_body: '{}'
            });
            fetchApis();
        } catch (error) {
            console.error('Error creating API:', error);
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
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New API
                    </button>
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
                                            <p className="text-sm font-medium text-indigo-600 truncate">{api.name}</p>
                                            <p className="text-sm text-gray-500 truncate">{api.endpoint}</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <a
                                        href={`http://localhost:3000/mock/${id}${api.endpoint}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center"
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">Create New API</h2>
                        <form onSubmit={handleCreateApi}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={newApi.name}
                                    onChange={(e) => setNewApi({ ...newApi, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                    <select
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        value={newApi.method}
                                        onChange={(e) => setNewApi({ ...newApi, method: e.target.value })}
                                    >
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>PUT</option>
                                        <option>DELETE</option>
                                        <option>PATCH</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Code</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        value={newApi.response_status}
                                        onChange={(e) => setNewApi({ ...newApi, response_status: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="/users"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={newApi.endpoint}
                                    onChange={(e) => setNewApi({ ...newApi, endpoint: e.target.value })}
                                />
                            </div>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Response Body (JSON)</label>
                                    <div className="space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                try {
                                                    const formatted = JSON.stringify(JSON.parse(newApi.response_body), null, 2);
                                                    setNewApi({ ...newApi, response_body: formatted });
                                                } catch (e) {
                                                    alert('Invalid JSON: ' + e.message);
                                                }
                                            }}
                                            className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                                        >
                                            Format
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                try {
                                                    JSON.parse(newApi.response_body);
                                                    alert('Valid JSON');
                                                } catch (e) {
                                                    alert('Invalid JSON: ' + e.message);
                                                }
                                            }}
                                            className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                                        >
                                            Validate
                                        </button>
                                    </div>
                                </div>
                                <div className="border border-gray-300 rounded-md shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 overflow-hidden">
                                    <Editor
                                        value={newApi.response_body}
                                        onValueChange={code => setNewApi({ ...newApi, response_body: code })}
                                        highlight={code => highlight(code, languages.js)}
                                        padding={10}
                                        style={{
                                            fontFamily: '"Fira code", "Fira Mono", monospace',
                                            fontSize: 14,
                                            minHeight: '150px',
                                            backgroundColor: '#f9fafb'
                                        }}
                                        textareaClassName="focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProjectDetails;
