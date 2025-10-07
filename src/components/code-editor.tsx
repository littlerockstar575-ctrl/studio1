"use client";

import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; // Using prism-tomorrow theme

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
}

export function CodeEditor({ code, setCode }: CodeEditorProps) {
    return (
        <Editor
            value={code}
            onValueChange={c => setCode(c)}
            highlight={c => highlight(c, languages.javascript, 'javascript')}
            padding={10}
            className="bg-card border rounded-md font-code text-sm min-h-[150px] focus-within:ring-2 focus-within:ring-ring"
        />
    );
}
