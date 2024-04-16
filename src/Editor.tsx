import React, { useEffect, useState, useRef } from 'react';

import * as monaco from 'monaco-editor';

import { ModelWrapper } from './common';

type EditorProps = {
	setGraphDef: React.Dispatch<React.SetStateAction<string>>;
	wrappers: ModelWrapper[];
	setWrappers: React.Dispatch<React.SetStateAction<ModelWrapper[]>>;
	activeID: number | null;
	setActiveID: React.Dispatch<React.SetStateAction<number | null>>;
	webStorageLoaded: boolean;
}

export default function Editor({ setGraphDef, wrappers, setWrappers, activeID, 
	setActiveID, webStorageLoaded }: EditorProps) {

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const editorContainerRef = useRef<HTMLDivElement>(null);

    // on monaco editor load
    useEffect(() => {

		// do not load the editor until the web storage process has completed,
		// regardless of whether anything was retrieved; this makes syncing
		// between internal state and editor appearance easier
		if (editorContainerRef.current &&
			webStorageLoaded) {
			
			editorRef.current = monaco.editor.create(
				editorContainerRef.current, 
				{
					value: "",
					model: null,
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

			if (editorRef.current) {
				setActiveID(0);
				// setting activeID should trigger the Effect below
			}
			// [] else; editor creation fails?
		}

		return () => editorRef.current?.dispose();

    }, [ editorContainerRef, webStorageLoaded ]);

	// switch monaco models on active tab/ID change
	useEffect(() => {
		if (editorRef.current && activeID !== null) {
			editorRef.current.setModel(wrappers[activeID].model);
			editorRef.current.onDidChangeModelContent(() => {

				setGraphDef(editorRef.current!.getValue());
				setWrappers(wrappers.map((wrapper) => {

					if (wrapper.id === activeID) {
						return { 
							...wrapper, 
							model: editorRef.current!.getModel() 
						};
					} else {
						return wrapper;
					}
				}));
			});

			// sync visual text in editor and state
			setGraphDef(editorRef.current.getValue());
		}

	}, [ activeID ]);

    return (
        <>
            <div className="editor-container" ref={ editorContainerRef } />
        </>
    );
}