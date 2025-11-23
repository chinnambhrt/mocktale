import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import JsonEditor from '../components/JsonEditor';
import Layout from '../components/Layout';
import Accordion from '../components/Accordion';

const NewApi = () => {
    // ... (keep imports and state setup)
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [newApi, setNewApi] = useState({
        name: '',
        method: 'GET',
        endpoint: '',
        response_status: 200,
        response_body: '{}',
        request_match_type: 'NONE',
        request_body_match: '',
        required_headers: '{}'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let parsedBody, parsedHeaders;
            try {
                parsedBody = JSON.parse(newApi.response_body);
                parsedHeaders = JSON.parse(newApi.required_headers || '{}');
            } catch (e) {
                alert('Invalid JSON in body or headers');
                setLoading(false);
                return;
            }

            await axios.post('http://localhost:3000/apis', {
                project_id: projectId,
                ...newApi,
                response_body: parsedBody,
                required_headers: parsedHeaders
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

                <form onSubmit={handleSubmit}>
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <Accordion title="General & Response Configuration" defaultOpen={true}>
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
                                    placeholder="/users/:id"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                    value={newApi.endpoint}
                                    onChange={(e) => setNewApi({ ...newApi, endpoint: e.target.value })}
                                />
                                <p className="mt-1 text-xs text-gray-500">Use :param for dynamic segments (e.g., /users/:id)</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Response Body (JSON)</label>
                                <JsonEditor
                                    value={newApi.response_body}
                                    onChange={code => setNewApi({ ...newApi, response_body: code })}
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
                        </Accordion>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <Accordion title="Request Validation & Matching" defaultOpen={false}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Headers (JSON)</label>
                                    <JsonEditor
                                        value={newApi.required_headers}
                                        onChange={code => setNewApi({ ...newApi, required_headers: code })}
                                        placeholder='{"Authorization": "Bearer token"}'
                                        sample={`{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}`}
                                        sampleTitle="Sample Headers"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Request Matching</label>
                                    <select
                                        className="rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-1 border"
                                        value={newApi.request_match_type || 'NONE'}
                                        onChange={(e) => setNewApi({ ...newApi, request_match_type: e.target.value })}
                                    >
                                        <option value="NONE">No Matching (Any Body)</option>
                                        <option value="EXACT">Exact Match (JSON)</option>
                                        <option value="SCHEMA">Schema Match (JSON Schema)</option>
                                    </select>
                                </div>
                                {newApi.request_match_type && newApi.request_match_type !== 'NONE' && (
                                    <div className="mb-4">
                                        <JsonEditor
                                            value={newApi.request_body_match || ''}
                                            onChange={code => setNewApi({ ...newApi, request_body_match: code })}
                                            minHeight="150px"
                                            placeholder={newApi.request_match_type === 'EXACT' ? 'Enter expected JSON body...' : 'Enter JSON Schema...'}
                                            sample={newApi.request_match_type === 'EXACT' ? `{
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
                                            sampleTitle={newApi.request_match_type === 'EXACT' ? 'Sample Request Body' : 'Sample JSON Schema'}
                                        />
                                    </div>
                                )}
                            </div>
                        </Accordion>
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
        </Layout>
    );
};

export default NewApi;
