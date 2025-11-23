import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import { HelpCircle } from 'lucide-react';
import Modal from './Modal';

const JsonEditor = ({ value, onChange, placeholder, sample, sampleTitle, minHeight = '100px' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatJson = () => {
        try {
            if (!value) return;
            const parsed = JSON.parse(value);
            const formatted = JSON.stringify(parsed, null, 2);
            onChange(formatted);
        } catch (e) {
            // Ignore errors during auto-format attempts on blur if invalid
            console.log("Invalid JSON, skipping format");
        }
    };

    const handleBlur = () => {
        formatJson();
    };

    return (
        <div className="flex flex-col">
            <div className="flex justify-end space-x-2 mb-1">
                {sample && (
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <HelpCircle className="w-3 h-3 mr-1" />
                        Show Sample
                    </button>
                )}
                <button
                    type="button"
                    onClick={formatJson}
                    className="text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                >
                    Format
                </button>
            </div>
            <div className="border border-gray-300 rounded-md shadow-sm focus-within:border-[#7E4F1F] focus-within:ring-1 focus-within:ring-[#7E4F1F] overflow-hidden">
                <Editor
                    value={value || ''}
                    onValueChange={onChange}
                    onBlur={handleBlur}
                    highlight={code => highlight(code, languages.js)}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: minHeight,
                        backgroundColor: '#f9fafb'
                    }}
                    textareaClassName="focus:outline-none"
                    placeholder={placeholder}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={sampleTitle || "Sample JSON"}
            >
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                    {sample}
                </pre>
                <button
                    onClick={() => {
                        onChange(sample);
                        setIsModalOpen(false);
                    }}
                    className="mt-4 px-4 py-2 bg-[#7E4F1F] text-white rounded hover:bg-[#643f19] text-sm"
                >
                    Use This Sample
                </button>
            </Modal>
        </div>
    );
};

export default JsonEditor;
