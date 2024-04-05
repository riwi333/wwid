import React, { useEffect, useRef } from 'react';

import * as monaco from 'monaco-editor';

type EditorProps = {
	setGraphDef: React.Dispatch<React.SetStateAction<string>>;
}

export default function Editor({ setGraphDef }: EditorProps) {

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const editorContainerRef = useRef<HTMLDivElement>(null);

    // on monaco editor load
    useEffect(() => {

        if (editorContainerRef.current) {
			editorRef.current = monaco.editor.create(editorContainerRef.current, 
				{
					value: "",
					// automaticLayout: true,
					minimap: { 
						enabled: false 
					},
					// overviewRulerBorder: false,
					// scrollbar: {
					// 	horizontalScrollbarSize: 5,
					// 	verticalScrollbarSize: 5,
					// },
					// wordWrap: "bounded",
					// wrappingIndent: "indent",
					// scrollBeyondLastLine: false,
				}
			);

			let model = editorRef.current.getModel();
			if (model !== null) {
				model.onDidChangeContent((e) => {
					setGraphDef(model!.getValue());
				});
			}
		}

		return () => editorRef.current?.dispose();

    }, [ editorContainerRef ]);

    return (
        <>
            <div className="editor-container" ref={ editorContainerRef } />
        </>
    )
}