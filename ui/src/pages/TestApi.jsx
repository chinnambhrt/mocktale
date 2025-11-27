import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Loader } from 'lucide-react';
import Layout from '../components/Layout';
import JsonEditor from '../components/JsonEditor';
import Breadcrumbs from '../components/Breadcrumbs';

const TestApi = () => {
    const { id } = useParams();
    const [api, setApi] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Request State
    const [pathParams, setPathParams] = useState({});
    const [queryParams, setQueryParams] = useState([]);
    const [headers, setHeaders] = useState('{}');
    const [body, setBody] = useState('{}');

    // Response State
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApi();
    }, [id]);

    const fetchApi = async () => {
        try {
            const res = await axios.get(`/apis/${id}`);
            setApi(res.data);

            // Fetch Project
            try {
                const projectRes = await axios.get(`/projects/${res.data.project_id}`);
                setProject(projectRes.data);
            } catch (err) {
                console.error('Error fetching project:', err);
            }

            // Initialize path params from endpoint
            const matches = res.data.endpoint.match(/:[a-zA-Z0-9_]+/g);
            if (matches) {
                const initialPathParams = {};
                matches.forEach(param => {
                    initialPathParams[param.substring(1)] = '';
                });
                setPathParams(initialPathParams);
            }

            // Initialize headers
            if (res.data.required_headers) {
                setHeaders(typeof res.data.required_headers === 'string'
                    ? res.data.required_headers
                    : JSON.stringify(res.data.required_headers, null, 2));
            }

            // Initialize body for non-GET requests
            if (res.data.method !== 'GET' && res.data.request_body_match) {
                setBody(typeof res.data.request_body_match === 'string'
                    ? res.data.request_body_match
                    : JSON.stringify(res.data.request_body_match, null, 2));
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching API:', err);
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        setSending(true);
        setResponse(null);
        setError(null);

        try {
            // Construct URL
            let url = `${window.location.origin}/mock/${api.project_id}${api.endpoint}`;
            Object.keys(pathParams).forEach(key => {
                url = url.replace(`:${key}`, pathParams[key]);
            });

            // Add Query Params
            const queryString = queryParams
                .filter(p => p.key && p.value)
                .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                .join('&');

            if (queryString) {
                url += `?${queryString}`;
            }

            // Parse Headers and Body
            let parsedHeaders = {};
            try {
                parsedHeaders = JSON.parse(headers);
            } catch (e) {
                alert('Invalid JSON in Headers');
                setSending(false);
                return;
            }

            let parsedBody = {};
            if (api.method !== 'GET') {
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    alert('Invalid JSON in Body');
                    setSending(false);
                    return;
                }
            }

            const startTime = Date.now();
            const res = await axios({
                method: api.method,
                url: url,
                headers: parsedHeaders,
                data: api.method !== 'GET' ? parsedBody : undefined,
                validateStatus: () => true // Allow any status code
            });
            const endTime = Date.now();

            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                data: res.data,
                time: endTime - startTime,
                size: JSON.stringify(res.data).length
            });
        } catch (err) {
            console.error('Request failed:', err);
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const addQueryParam = () => {
        setQueryParams([...queryParams, { key: '', value: '' }]);
    };

    const updateQueryParam = (index, field, value) => {
        const newParams = [...queryParams];
        newParams[index][field] = value;
        setQueryParams(newParams);
    };

    const removeQueryParam = (index) => {
        const newParams = queryParams.filter((_, i) => i !== index);
        setQueryParams(newParams);
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!api) return <div className="p-10 text-center">API not found</div>;

    return (
        <Layout>
            <div className="mb-6">
                <Breadcrumbs items={[
                    { name: 'Projects', href: '/' },
                    { name: project ? project.name : 'Project', href: `/project/${api.project_id}` },
                    { name: 'Test API' }
                ]} />
                <div className="flex items-center justify-between mt-2">
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                        <Play className="w-6 h-6 mr-2 text-green-600" />
                        Test API: <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{api.method} {api.endpoint}</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Request Configuration */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Request Configuration</h2>

                        {/* Path Params */}
                        {Object.keys(pathParams).length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Path Parameters</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {Object.keys(pathParams).map(param => (
                                        <div key={param}>
                                            <label className="block text-xs text-gray-500 mb-1">{param}</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                                value={pathParams[param]}
                                                onChange={(e) => setPathParams({ ...pathParams, [param]: e.target.value })}
                                                placeholder={`Value for :${param}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Query Params */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-medium text-gray-700">Query Parameters</h3>
                                <button onClick={addQueryParam} className="text-xs text-[#7E4F1F] hover:text-[#643f19]">
                                    + Add Param
                                </button>
                            </div>
                            {queryParams.map((param, index) => (
                                <div key={index} className="flex space-x-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                        value={param.key}
                                        onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#7E4F1F] focus:ring-[#7E4F1F] sm:text-sm p-2 border"
                                        value={param.value}
                                        onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                                    />
                                    <button onClick={() => removeQueryParam(index)} className="text-red-500 hover:text-red-700">
                                        &times;
                                    </button>
                                </div>
                            ))}
                            {queryParams.length === 0 && <p className="text-xs text-gray-400 italic">No query parameters</p>}
                        </div>

                        {/* Headers */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Headers (JSON)</h3>
                            <JsonEditor
                                value={headers}
                                onChange={setHeaders}
                                minHeight="150px"
                            />
                        </div>

                        {/* Body */}
                        {api.method !== 'GET' && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Request Body (JSON)</h3>
                                <JsonEditor
                                    value={body}
                                    onChange={setBody}
                                    minHeight="200px"
                                />
                            </div>
                        )}

                        {/* Constructed URL Preview */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                                <span className="text-gray-500 text-sm mr-1">{api.method}</span>
                                <span className="text-gray-900 text-sm font-mono break-all">
                                    {(() => {
                                        let url = `${window.location.origin}/mock/${api.project_id}${api.endpoint}`;
                                        Object.keys(pathParams).forEach(key => {
                                            url = url.replace(`:${key}`, pathParams[key] || `:${key}`);
                                        });
                                        const queryString = queryParams
                                            .filter(p => p.key && p.value)
                                            .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                                            .join('&');
                                        if (queryString) url += `?${queryString}`;
                                        return url;
                                    })()}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSendRequest}
                            disabled={sending}
                            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {sending ? (
                                <>
                                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Play className="-ml-1 mr-2 h-4 w-4" />
                                    Send Request
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Response Display */}
                <div className="space-y-6 relative">
                    <div className="bg-white shadow rounded-lg p-6 flex flex-col sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Response</h2>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">
                                            Request Error: {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {response ? (
                            <div className="flex-1 flex flex-col">
                                <div className="flex space-x-4 mb-4 text-sm">
                                    <span className={`px-2 py-1 rounded font-semibold ${response.status >= 200 && response.status < 300 ? 'bg-green-100 text-green-800' :
                                        response.status >= 400 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {response.status} {response.statusText}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                        Time: {response.time}ms
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                        Size: {response.size} B
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Response Body</h3>
                                    <JsonEditor
                                        value={JSON.stringify(response.data, null, 2)}
                                        readOnly={true}
                                        minHeight="300px"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Response Headers</h3>
                                    <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-[200px] font-mono text-xs border border-gray-200">
                                        {Object.entries(response.headers).map(([key, value]) => (
                                            <div key={key} className="flex">
                                                <span className="font-semibold text-gray-600 mr-2">{key}:</span>
                                                <span className="text-gray-800 truncate">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 italic min-h-[200px]">
                                Send a request to see the response here
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TestApi;
