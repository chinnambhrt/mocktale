import React from 'react';

const Shimmer = ({ rows = 5, columns = 3 }) => {
    return (
        <div className="animate-pulse">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {[...Array(rows)].map((_, rowIndex) => (
                        <li key={rowIndex} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                    {[...Array(columns)].map((_, colIndex) => (
                                        <div key={colIndex} className="h-4 bg-gray-200 rounded col-span-1"></div>
                                    ))}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Shimmer;
