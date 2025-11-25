import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Play } from 'lucide-react';
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

    useEffect(() => {
        fetchApi();
    }, [id]);

    const fetchApi = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/apis/${id}`);
            const apiData = response.data;
            // Ensure fields are strings for the editor
            apiData.response_body = typeof apiData.response_body === 'string' ? apiData.response_body : JSON.stringify(apiData.response_body, null, 2);
            apiData.required_headers = apiData.required_headers || '{}';
            apiData.required_path_params = apiData.required_path_params || '{}';
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

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!api) return <NotFound />;

    return (
        <Layout>
            <div>
                <div className="mb-6">
                    <Breadcrumbs items={[
                        { name: 'Projects', href: '/' },
                        { name: project ? project.name : 'Project', href: `/project/${api.project_id}` },
                        { name: 'Edit API' }
                    ]} />
                    <h1 className="text-2xl font-semibold text-gray-900 mt-2" title={api.name}>
                        {api.name.length > 20 ? api.name.substring(0, 20) + '...' : api.name}
                    </h1>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleUpdate}>
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
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Response Body (JSON)</label>
                            <JsonEditor
                                value={api.response_body}
                                onChange={(val) => setApi({ ...api, response_body: val })}
                                minHeight="200px"
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
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7E4F1F] hover:bg-[#643f19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7E4F1F]"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ApiDetails;
