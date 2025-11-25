import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import { HelpCircle, Braces } from 'lucide-react';
import Modal from './Modal';

const JsonEditor = ({ value, onChange, placeholder, sample, sampleTitle, minHeight = '100px', className = '', readOnly = false }) => {
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
        if (!readOnly) formatJson();
    };

    return (
        <div className={`flex flex-col ${className}`}>
            {!readOnly && (
                <div className="flex justify-end space-x-2 mb-1">
                    {sample && (
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                            title="Show Sample"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={formatJson}
                        className="text-xs p-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                        title="Format JSON"
                    >
                        <Braces className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className={`border border-gray-300 rounded-md shadow-sm overflow-hidden flex-1 flex flex-col ${!readOnly ? 'focus-within:border-[#7E4F1F] focus-within:ring-1 focus-within:ring-[#7E4F1F]' : 'bg-gray-50'}`}>
                <div className="flex-1 relative">
                    <Editor
                        value={value || ''}
                        onValueChange={readOnly ? () => { } : onChange}
                        onBlur={handleBlur}
                        highlight={code => highlight(code, languages.js)}
                        padding={10}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 14,
                            minHeight: minHeight,
                            height: '100%',
                            backgroundColor: readOnly ? '#f9fafb' : '#ffffff'
                        }}
                        textareaClassName="focus:outline-none"
                        placeholder={placeholder}
                        readOnly={readOnly}
                    />
                </div>
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
