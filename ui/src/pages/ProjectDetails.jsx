import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Code, Download, Upload, Search, Play, Copy, Check } from 'lucide-react';
import Layout from '../components/Layout';
import Shimmer from '../components/Shimmer';
import Breadcrumbs from '../components/Breadcrumbs';
import NotFound from './NotFound';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('ALL');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchProjectAndApis();
    }, [id]);

    const fetchProjectAndApis = async () => {
        setLoading(true);
        try {
            const [projectRes, apisRes] = await Promise.all([
                axios.get(`http://localhost:3000/projects/${id}`),
                axios.get(`http://localhost:3000/apis/project/${id}`)
            ]);
            setProject(projectRes.data);
            setApis(apisRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredApis = apis.filter(api => {
        const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            api.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMethod = filterMethod === 'ALL' || api.method === filterMethod;
        return matchesSearch && matchesMethod;
    });

    const handleDeleteApi = async (apiId) => {
        if (!window.confirm('Are you sure you want to delete this API?')) return;
        try {
            await axios.delete(`http://localhost:3000/apis/${apiId}`);
            fetchProjectAndApis();
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
                fetchProjectAndApis();
            } catch (error) {
                console.error('Error importing APIs:', error);
                alert('Error importing APIs');
            }
        };
    };

    const handleCopy = () => {
        const url = `http://localhost:3000/mock/${id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const methodColors = {
        GET: 'bg-green-100 text-green-800',
        POST: 'bg-blue-100 text-blue-800',
        PUT: 'bg-yellow-100 text-yellow-800',
        DELETE: 'bg-red-100 text-red-800',
        PATCH: 'bg-purple-100 text-purple-800',
    };

    if (!loading && !project) return <NotFound />;

    return (
        <Layout>
            <div className="mb-6">
                <Breadcrumbs items={[
                    { name: 'Projects', href: '/' },
                    { name: project ? project.name : 'Project Details' }
                ]} />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Project APIs</h1>
                        <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md border border-gray-200 w-fit">
                            <code className="text-sm text-gray-600 font-mono">
                                {`http://localhost:3000/mock/${id}`}
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
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#7E4F1F] focus:border-[#7E4F1F] sm:text-sm"
                        placeholder="Search APIs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#7E4F1F] focus:border-[#7E4F1F] sm:text-sm rounded-md"
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                    >
                        <option value="ALL">All Methods</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <Shimmer rows={5} columns={3} />
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Method
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Endpoint
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApis.map((api) => (
                                <tr key={api.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${methodColors[api.method] || 'bg-gray-100 text-gray-800'} w-16 justify-center`}>
                                            {api.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/api/${api.id}`} className="text-sm text-gray-900 font-medium hover:text-[#7E4F1F]">
                                            {api.endpoint}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{api.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-4">
                                            <a
                                                href={`http://localhost:3000/mock/${id}${api.endpoint}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-[#7E4F1F] transition-colors"
                                                title="Test Endpoint"
                                            >
                                                <Code className="w-5 h-5" />
                                            </a>
                                            <Link
                                                to={`/api/${api.id}/test`}
                                                className="text-gray-400 hover:text-green-600 transition-colors"
                                                title="Test API"
                                            >
                                                <Play className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteApi(api.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete API"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredApis.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No APIs found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </Layout>
    );
};

export default ProjectDetails;
