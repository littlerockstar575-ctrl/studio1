
"use client";

import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-okaidia.css'; 

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    language: string;
}

export function CodeEditor({ code, setCode, language }: CodeEditorProps) {
    const highlightCode = (codeToHighlight: string) => {
        // Defensive guard to prevent crash on initial render
        if (typeof codeToHighlight !== 'string' || !language) {
            return "";
        }

        const lang = language.toLowerCase();
        const grammar = languages[lang];

        if (grammar) {
            return highlight(codeToHighlight, grammar, lang);
        }
        
        // Fallback to clike grammar if the language is not loaded to prevent crash.
        return highlight(codeToHighlight, languages.clike, 'clike');
    };

    const handleValueChange = (newCode: string) => {
        setCode(newCode);
    };

    // Prevent rendering the editor until the code and language are available to avoid race conditions.
    if (typeof code !== 'string' || !language) {
        return null;
    }

    return (
        <Editor
            value={code}
            onValueChange={handleValueChange}
            highlight={highlightCode}
            padding={10}
            className="bg-[#272822] text-white border rounded-md font-code text-sm min-h-[150px] focus-within:ring-2 focus-within:ring-ring"
        />
    );
}

    