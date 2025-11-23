import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Play } from 'lucide-react';
import Layout from '../components/Layout';

const ApiDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [api, setApi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApi();
    }, [id]);

    const fetchApi = async () => {
        try {
            const response = await axios.get('http://localhost:3000/projects'); // We need to find the API from all projects or fetch specific API endpoint
            // Since we don't have a direct "get single api" endpoint in the initial plan, let's assume we can fetch it via project or add a new endpoint.
            // Wait, the plan didn't specify get single API. I should probably add it or filter from project list.
            // Actually, I can just fetch all APIs for the project if I knew the project ID, but I only have API ID.
            // Let's add a GET /apis/:id endpoint to the backend for convenience, or iterate.
            // For now, let's assume I added it or will add it.
            // Let's try to fetch from /apis/project/:projectId but I don't have projectId here easily unless I pass it or fetch it.

            // Let's just fetch all projects and find it? No that's inefficient.
            // I will add a GET /apis/:id endpoint to the backend. It's better.
            // But for now, let's assume I can fetch it.

            // Actually, let's implement the GET /apis/:id in the backend first or now.
            // I'll assume it exists for now and fix backend later if needed.
            // Wait, I didn't add it in the backend implementation.
            // I will add it in the backend in a separate step or just use a workaround.
            // Workaround: I'll fetch all projects, then for each project fetch APIs until I find it.
            // That's bad.
            // I'll just add the endpoint to backend.

            // For this file content, I will assume the endpoint exists: GET http://localhost:3000/apis/:id
            // I will add this endpoint to the backend in the next step.

            const apiResponse = await axios.get(`http://localhost:3000/apis/${id}`); // This needs to be implemented
            setApi({
                ...apiResponse.data,
                response_body: typeof apiResponse.data.response_body === 'string'
                    ? apiResponse.data.response_body
                    : JSON.stringify(apiResponse.data.response_body, null, 2)
            });
            setLoading(false);
        } catch (error) {
            // Fallback if endpoint doesn't exist yet (for dev)
            console.error('Error fetching API:', error);
            setError('Failed to load API details');
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let parsedBody;
            try {
                parsedBody = JSON.parse(api.response_body);
            } catch (e) {
                alert('Invalid JSON in response body');
                return;
            }

            await axios.put(`http://localhost:3000/apis/${id}`, {
                ...api,
                response_body: parsedBody
            });
            alert('API updated successfully');
        } catch (error) {
            console.error('Error updating API:', error);
            alert('Error updating API');
        }
    };

    if (loading) return <Layout><div>Loading...</div></Layout>;
    if (error) return <Layout><div>{error}</div></Layout>;
    if (!api) return <Layout><div>API not found</div></Layout>;

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-900">Edit API: {api.name}</h1>
                </div>
                <div className="flex space-x-3">
                    <a
                        href={`http://localhost:3000/mock/${api.project_id}${api.endpoint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Test Endpoint
                    </a>
                    <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={api.name}
                                onChange={(e) => setApi({ ...api, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={api.endpoint}
                                onChange={(e) => setApi({ ...api, endpoint: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Code</label>
                            <input
                                type="number"
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={api.response_status}
                                onChange={(e) => setApi({ ...api, response_status: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Response Body (JSON)</label>
                            <textarea
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border font-mono"
                                rows="15"
                                value={api.response_body}
                                onChange={(e) => setApi({ ...api, response_body: e.target.value })}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ApiDetails;
