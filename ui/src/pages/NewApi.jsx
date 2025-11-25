import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import JsonEditor from '../components/JsonEditor';
import Breadcrumbs from '../components/Breadcrumbs';
import Layout from '../components/Layout';
import Accordion from '../components/Accordion';

const NewApi = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState(null);
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

    React.useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/projects/${projectId}`);
                setProject(res.data);
            } catch (err) {
                console.error('Error fetching project:', err);
            }
        };
        fetchProject();
    }, [projectId]);

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
            <div className='okbe'>
                <div className="mb-6">
                    <Breadcrumbs items={[
                        { name: 'Projects', href: '/' },
                        { name: project ? project.name : 'Project', href: `/project/${projectId}` },
                        { name: 'Create New API' }
                    ]} />
                    <h1 className="text-2xl font-semibold text-gray-900 mt-2">Create New API</h1>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                        value={newApi.endpoint}
                                        onChange={(e) => setNewApi({ ...newApi, endpoint: e.target.value })}
                                        placeholder="/users"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Response Status</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                    value={newApi.response_status}
                                    onChange={(e) => setNewApi({ ...newApi, response_status: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Response Body (JSON)</label>
                                <JsonEditor
                                    value={newApi.response_body}
                                    onChange={(val) => setNewApi({ ...newApi, response_body: val })}
                                    placeholder="{}"
                                    minHeight="200px"
                                />
                            </div>
                        </Accordion>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <Accordion title="Request Matching (Optional)" defaultOpen={false}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Match Type</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                    value={newApi.request_match_type}
                                    onChange={(e) => setNewApi({ ...newApi, request_match_type: e.target.value })}
                                >
                                    <option value="NONE">None (Match any request to endpoint)</option>
                                    <option value="PARTIAL_BODY">Partial Body Match (JSON)</option>
                                </select>
                            </div>

                            {newApi.request_match_type === 'PARTIAL_BODY' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Request Body Match (JSON)</label>
                                    <JsonEditor
                                        value={newApi.request_body_match}
                                        onChange={(val) => setNewApi({ ...newApi, request_body_match: val })}
                                        placeholder='{"key": "value"}'
                                        minHeight="150px"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        The request body must contain these fields and values to match this mock.
                                    </p>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Required Headers (JSON)</label>
                                <JsonEditor
                                    value={newApi.required_headers}
                                    onChange={(val) => setNewApi({ ...newApi, required_headers: val })}
                                    placeholder='{"Authorization": "Bearer token"}'
                                    minHeight="150px"
                                />
                            </div>
                        </Accordion>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7E4F1F] hover:bg-[#643f19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7E4F1F] disabled:opacity-50"
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
