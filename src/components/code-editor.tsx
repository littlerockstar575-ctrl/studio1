"use client";

import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-okaidia.css'; 

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
                
                setTimeout(() => {
                    editor.selectionStart = cursorPos;
                    editor.selectionEnd = cursorPos;
                }, 0);
                return;
            }
        }
        
        setCode(newCode);
    };

    const highlightCode = (codeToHighlight: string) => {
        const lang = language ? language.toLowerCase() : 'clike';
        const grammar = languages[lang];

        if (!grammar) {
            // Fallback to clike grammar if the language is not loaded to prevent crash.
             return highlight(codeToHighlight, languages.clike, 'clike');
        }

        try {
            return highlight(codeToHighlight, grammar, lang);
        } catch (e) {
            console.error("Syntax highlighting failed:", e);
            // Fallback to plain text on any unexpected error.
            return codeToHighlight;
        }
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
