import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const Accordion = ({ title, children, defaultOpen = false, className = '' }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border border-gray-200 rounded-lg mb-4 overflow-hidden ${className}`}>
            <button
                type="button"
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm font-medium text-gray-900">{title}</span>
                {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 bg-white border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
