import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Play } from 'lucide-react';
import JsonEditor from '../components/JsonEditor';
import Layout from '../components/Layout';

const ApiDetails = () => {
    // ... (keep imports and state setup)
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [api, setApi] = useState(null);

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
    if (!api) return <div className="p-10 text-center">API not found</div>;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link to={`/project/${api.project_id}`} className="mr-4 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">Edit API</h1>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Code</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                    value={api.response_status}
                                    onChange={(e) => setApi({ ...api, response_status: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                value={api.endpoint}
                                onChange={(e) => setApi({ ...api, endpoint: e.target.value })}
                            />
                            <p className="mt-1 text-xs text-gray-500">Use :param for dynamic segments (e.g., /users/:id)</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Required Headers (JSON)</label>
                                <JsonEditor
                                    value={api.required_headers || '{}'}
                                    onChange={code => setApi({ ...api, required_headers: code })}
                                    placeholder='{"Authorization": "Bearer token"}'
                                    sample={`{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}`}
                                    sampleTitle="Sample Headers"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Required Path Params (JSON)</label>
                                <JsonEditor
                                    value={api.required_path_params || '{}'}
                                    onChange={code => setApi({ ...api, required_path_params: code })}
                                    placeholder='{"id": "123"}'
                                    sample={`{
  "id": "123",
  "category": "books"
}`}
                                    sampleTitle="Sample Path Params"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Request Matching</label>
                                <select
                                    className="rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-1 border"
                                    value={api.request_match_type || 'NONE'}
                                    onChange={(e) => setApi({ ...api, request_match_type: e.target.value })}
                                >
                                    <option value="NONE">No Matching (Any Body)</option>
                                    <option value="EXACT">Exact Match (JSON)</option>
                                    <option value="SCHEMA">Schema Match (JSON Schema)</option>
                                </select>
                            </div>
                            {api.request_match_type && api.request_match_type !== 'NONE' && (
                                <div className="mb-4">
                                    <JsonEditor
                                        value={api.request_body_match || ''}
                                        onChange={code => setApi({ ...api, request_body_match: code })}
                                        minHeight="150px"
                                        placeholder={api.request_match_type === 'EXACT' ? 'Enter expected JSON body...' : 'Enter JSON Schema...'}
                                        sample={api.request_match_type === 'EXACT' ? `{
  "name": "John Doe",
  "email": "john@example.com"
}` : `{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" }
  },
  "required": ["name"]
}`}
                                        sampleTitle={api.request_match_type === 'EXACT' ? 'Sample Request Body' : 'Sample JSON Schema'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Response Body (JSON)</label>
                            <JsonEditor
                                value={api.response_body}
                                onChange={code => setApi({ ...api, response_body: code })}
                                minHeight="200px"
                                sample={`{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["admin", "user"]
}`}
                                sampleTitle="Sample Response Body"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Link
                                to={`/project/${api.project_id}`}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7E4F1F] hover:bg-[#643f19]"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Update API
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ApiDetails;
