"use client"

import {useRef, useState} from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'
import 'quill-emoji/dist/quill-emoji.css'

function RichTextEdit() {
    const [value, setValue] = useState('');
    const quillRef = useRef<ReactQuill>(null);

    const modules = {
        toolbar: [
            ["bold", "italic", "underline", "strike"], // toggled buttons
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"], // remove formatting button
        ],

    };

    const formats = [
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
    ];

    const getPlainText = () => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
            return editor.getText();
        }
        return "";
    };

    return (
        <div>
            <ReactQuill theme={"snow"} value={value} onChange={setValue} modules={modules} formats={formats}
                        className={"mb-4"}/>
            <button type={"button"} className={"border mr-4"} onClick={() => console.log(value)}>Log HTML Content</button>
            <button type={"button"} className={"border"} onClick={() => console.log(getPlainText())}>Log Plain Text</button>
        </div>
    )
}

export default RichTextEdit;
