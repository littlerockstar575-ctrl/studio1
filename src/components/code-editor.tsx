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
    const handleValueChange = (newCode: string) => {
        // This is a simplified implementation for auto-closing brackets.
        // It works when you type an opening bracket.
        const lastChar = newCode.length > code.length ? newCode[newCode.length - 1] : null;
        
        const bracketMap: { [key: string]: string } = {
            '(': ')',
            '{': '}',
            '[': ']',
        };

        if (lastChar && bracketMap[lastChar]) {
            // A more robust solution would involve cursor position, but for now
            // we will just append the closing bracket.
            // This doesn't handle cursor placement well.
            // A proper implementation would use the editor's instance to place the cursor between the brackets.
            // `react-simple-code-editor` is very basic and doesn't expose the underlying textarea ref easily for this.
            // So we will just append.
            const editor = document.querySelector('.prism-editor__textarea') as HTMLTextAreaElement;
            if (editor) {
                const cursorPos = editor.selectionStart;
                const codeWithBracket = newCode.slice(0, cursorPos) + bracketMap[lastChar] + newCode.slice(cursorPos);
                setCode(codeWithBracket);
                
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

    return (
        <Editor
            value={code}
            onValueChange={handleValueChange}
            highlight={c => highlight(c, languages.javascript, 'javascript')}
            padding={10}
            className="bg-card border rounded-md font-code text-sm min-h-[150px] focus-within:ring-2 focus-within:ring-ring"
        />
    );
}
