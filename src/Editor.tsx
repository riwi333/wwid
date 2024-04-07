import React, { useEffect, useRef } from 'react';

import * as monaco from 'monaco-editor';

import { ModelWrapper } from './common';

type EditorProps = {
	setGraphDef: React.Dispatch<React.SetStateAction<string>>;
	wrappers: ModelWrapper[];
	setWrappers: React.Dispatch<React.SetStateAction<ModelWrapper[]>>;
	activeID: number;
	setActiveID: React.Dispatch<React.SetStateAction<number>>;
}

export default function Editor({ setGraphDef, wrappers, setWrappers, activeID, 
	setActiveID }: EditorProps) {

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

			editorRef.current.onDidChangeModelContent(() => {
				setGraphDef(editorRef.current!.getValue());
				setWrappers(wrappers.map((wrapper) => {
					if (wrapper.id == 0) {
						return { 
							...wrapper, 
							model: editorRef.current!.getModel() 
						};
					} else {
						return wrapper;
					}
				}));
			})

			setActiveID(0);
		}

		return () => editorRef.current?.dispose();

    }, [ editorContainerRef ]);

	// switch monaco models via active tab/ID
	useEffect(() => {

		if (editorRef.current) {
			editorRef.current.setModel(wrappers[activeID].model);
			editorRef.current.onDidChangeModelContent(() => {
				setGraphDef(editorRef.current!.getValue());
				setWrappers(wrappers.map((wrapper) => {
					if (wrapper.id == activeID) {
						return { 
							...wrapper, 
							model: editorRef.current!.getModel() 
						};
					} else {
						return wrapper;
					}
				}));
			});

			setGraphDef(editorRef.current.getValue());
		}

	}, [ activeID ]);

    return (
        <>
            <div className="editor-container" ref={ editorContainerRef } />
        </>
    )
}