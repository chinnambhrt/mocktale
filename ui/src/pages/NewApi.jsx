import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import Layout from '../components/Layout';

const NewApi = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [newApi, setNewApi] = useState({
        name: '',
        method: 'GET',
        endpoint: '',
        response_status: 200,
        response_body: '{}'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let parsedBody;
            try {
                parsedBody = JSON.parse(newApi.response_body);
            } catch (e) {
                alert('Invalid JSON in response body');
                setLoading(false);
                return;
            }

            await axios.post('http://localhost:3000/apis', {
                project_id: projectId,
                ...newApi,
                response_body: parsedBody
            });
            navigate(`/project/${projectId}`);
        } catch (error) {
            console.error('Error creating API:', error);
            alert('Failed to create API');
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link to={`/project/${projectId}`} className="mr-4 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">Create New API</h1>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                value={newApi.name}
                                onChange={(e) => setNewApi({ ...newApi, name: e.target.value })}
                                placeholder="e.g., Get Users"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
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
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
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
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
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
                            <div className="border border-gray-300 rounded-md shadow-sm focus-within:border-[#7E4F1F] focus-within:ring-1 focus-within:ring-[#7E4F1F] overflow-hidden">
                                <Editor
                                    value={newApi.response_body}
                                    onValueChange={code => setNewApi({ ...newApi, response_body: code })}
                                    highlight={code => highlight(code, languages.js)}
                                    padding={10}
                                    style={{
                                        fontFamily: '"Fira code", "Fira Mono", monospace',
                                        fontSize: 14,
                                        minHeight: '200px',
                                        backgroundColor: '#f9fafb'
                                    }}
                                    textareaClassName="focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Link
                                to={`/project/${projectId}`}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7E4F1F] hover:bg-[#643f19] disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Creating...' : 'Create API'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default NewApi;
