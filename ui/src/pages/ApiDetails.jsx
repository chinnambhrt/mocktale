import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Play, Copy, Check } from 'lucide-react';
import JsonEditor from '../components/JsonEditor';
import Breadcrumbs from '../components/Breadcrumbs';
import Layout from '../components/Layout';
import NotFound from './NotFound';

const ApiDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [api, setApi] = useState(null);
    const [project, setProject] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchApi();
    }, [id]);

    const fetchApi = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/apis/${id}`);
            const apiData = response.data;
            // Ensure fields are formatted JSON strings
            const formatField = (field) => {
                try {
                    const parsed = typeof field === 'string' ? JSON.parse(field) : field;
                    return JSON.stringify(parsed, null, 2);
                } catch (e) {
                    return field || '{}';
                }
            };

            apiData.response_body = formatField(apiData.response_body);
            apiData.required_headers = formatField(apiData.required_headers);
            apiData.required_path_params = formatField(apiData.required_path_params);
            if (apiData.request_body_match) {
                apiData.request_body_match = formatField(apiData.request_body_match);
            }
            setApi(apiData);

            // Fetch Project
            const projectRes = await axios.get(`http://localhost:3000/projects/${apiData.project_id}`);
            setProject(projectRes.data);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching API:', error);
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            let parsedBody, parsedHeaders, parsedParams;
            try {
                parsedBody = JSON.parse(api.response_body);
                parsedHeaders = JSON.parse(api.required_headers || '{}');
                parsedParams = JSON.parse(api.required_path_params || '{}');
            } catch (e) {
                alert('Invalid JSON in body, headers, or params');
                return;
            }

            await axios.put(`http://localhost:3000/apis/${id}`, {
                ...api,
                response_body: parsedBody,
                required_headers: parsedHeaders,
                required_path_params: parsedParams
            });
            alert('API updated successfully');
        } catch (error) {
            console.error('Error updating API:', error);
            alert('Failed to update API');
        }
    };

    const handleCopy = () => {
        const url = `http://localhost:3000/mock/${api.project_id}${api.endpoint}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!api) return <NotFound />;

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-4rem)]">
                <div className="mb-6">
                    <Breadcrumbs items={[
                        { name: 'Projects', href: '/' },
                        { name: project ? project.name : 'Project', href: `/project/${api.project_id}` },
                        { name: 'Edit API' }
                    ]} />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-4">
                        <h1 className="text-2xl font-semibold text-gray-900" title={api.name}>
                            {api.name.length > 20 ? api.name.substring(0, 20) + '...' : api.name}
                        </h1>
                        <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md border border-gray-200">
                            <code className="text-sm text-gray-600 font-mono">
                                {`http://localhost:3000/mock/${api.project_id}${api.endpoint}`}
                            </code>
                            <button
                                onClick={handleCopy}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                                title="Copy URL"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="h-full flex flex-col lg:flex-row gap-8 overflow-hidden">
                    {/* Left Column: Configuration */}
                    <div className="bg-white shadow rounded-lg p-6 flex-1 overflow-y-auto">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                value={api.name}
                                onChange={(e) => setApi({ ...api, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                    value={api.method}
                                    onChange={(e) => setApi({ ...api, method: e.target.value })}
                                >
                                    <option>GET</option>
                                    <option>POST</option>
                                    <option>PUT</option>
                                    <option>DELETE</option>
                                    <option>PATCH</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                    value={api.endpoint}
                                    onChange={(e) => setApi({ ...api, endpoint: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Response Status</label>
                            <input
                                type="number"
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                value={api.response_status}
                                onChange={(e) => setApi({ ...api, response_status: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Matching (Optional)</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Match Type</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                    value={api.request_match_type || 'NONE'}
                                    onChange={(e) => setApi({ ...api, request_match_type: e.target.value })}
                                >
                                    <option value="NONE">None (Match any request to endpoint)</option>
                                    <option value="PARTIAL_BODY">Partial Body Match (JSON)</option>
                                </select>
                            </div>

                            {api.request_match_type === 'PARTIAL_BODY' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Request Body Match (JSON)</label>
                                    <JsonEditor
                                        value={typeof api.request_body_match === 'string' ? api.request_body_match : JSON.stringify(api.request_body_match, null, 2)}
                                        onChange={(val) => setApi({ ...api, request_body_match: val })}
                                        minHeight="150px"
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Required Headers (JSON)</label>
                                <JsonEditor
                                    value={api.required_headers}
                                    onChange={(val) => setApi({ ...api, required_headers: val })}
                                    minHeight="150px"
                                    className="h-full"
                                />
                            </div>
                        </div>

                        <div className="flex justify-start mt-6">
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7E4F1F] hover:bg-[#643f19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7E4F1F]"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Response Body */}
                    <div className="bg-white shadow rounded-lg p-6 flex-1 flex flex-col h-full min-h-[400px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Response Body (JSON)</label>
                        <div className="flex-1 flex flex-col">
                            <JsonEditor
                                value={api.response_body}
                                onChange={(val) => setApi({ ...api, response_body: val })}
                                minHeight="100%"
                                className="h-full"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ApiDetails;
