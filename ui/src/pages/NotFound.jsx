import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';

const NotFound = () => {
    return (
        <Layout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <div className="bg-gray-100 p-6 rounded-full mb-6 animate-bounce">
                    <Ghost className="w-16 h-16 text-gray-400" />
                </div>

                <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Plot Twist!</h2>

                <p className="text-gray-500 max-w-md mb-8 text-lg">
                    It seems you've wandered off the script. This page is purely fictional and doesn't exist in our story.
                </p>

                <div className="flex space-x-4">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7E4F1F]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7E4F1F] hover:bg-[#643f19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7E4F1F]"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Narrative
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default NotFound;
