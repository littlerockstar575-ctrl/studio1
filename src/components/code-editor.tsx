"use client";

import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css'; // Using prism-tomorrow theme

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    language: string;
}

export function CodeEditor({ code, setCode, language }: CodeEditorProps) {
    const handleValueChange = (newCode: string) => {
        const lastChar = newCode.length > code.length ? newCode[newCode.length - 1] : null;
        
        const pairMap: { [key: string]: string } = {
            '(': ')',
            '{': '}',
            '[': ']',
            '"': '"',
            "'": "'",
        };

        if (lastChar && pairMap[lastChar]) {
            const editor = document.querySelector('.prism-editor__textarea') as HTMLTextAreaElement;
            if (editor) {
                const cursorPos = editor.selectionStart;
                const codeWithPair = newCode.slice(0, cursorPos) + pairMap[lastChar] + newCode.slice(cursorPos);
                setCode(codeWithPair);
                
                // HACK: We need to wait for react to re-render to set cursor position.
                setTimeout(() => {
                    editor.selectionStart = cursorPos;
                    editor.selectionEnd = cursorPos;
                }, 0);
                return;
            }
        }
        
        setCode(newCode);
    };

    const highlightCode = (code: string) => {
        // Guard against undefined or null code, which causes Prism to crash.
        if (typeof code !== 'string') {
            return '';
        }
        
        const lang = language.toLowerCase();
        const grammar = languages[lang];

        if (grammar) {
            return highlight(code, grammar, lang);
        }
        // Fallback to clike grammar if the language is not loaded to prevent crash.
        return highlight(code, languages.clike, 'clike');
    };

    return (
        <Editor
            value={code}
            onValueChange={handleValueChange}
            highlight={highlightCode}
            padding={10}
            className="bg-card border rounded-md font-code text-sm min-h-[150px] focus-within:ring-2 focus-within:ring-ring"
        />
    );
}
