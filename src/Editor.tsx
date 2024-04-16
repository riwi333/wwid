import React, { useEffect, useState, useRef } from 'react';

import * as monaco from 'monaco-editor';

import { ModelWrapper } from './common';

type EditorProps = {
	// graphDef: string | null;
	graphDef: string;
	// setGraphDef: React.Dispatch<React.SetStateAction<string | null>>;
	setGraphDef: React.Dispatch<React.SetStateAction<string>>;
	wrappers: ModelWrapper[];
	setWrappers: React.Dispatch<React.SetStateAction<ModelWrapper[]>>;
	activeID: number | null;
	setActiveID: React.Dispatch<React.SetStateAction<number | null>>;
	webStorageLoaded: boolean;
}

export default function Editor({ graphDef, setGraphDef, wrappers, setWrappers, 
	activeID, setActiveID, webStorageLoaded }: EditorProps) {

	// const [ editor, setEditor ] = 
	// 	useState<monaco.editor.IStandaloneCodeEditor | null>(null);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const editorContainerRef = useRef<HTMLDivElement>(null);

    // on monaco editor load
    useEffect(() => {

		// do not load the editor until the web storage process has completed,
		// regardless of whether anything was retrieved; this makes syncing
		// between internal state and editor appearance easier
		if (editorContainerRef.current &&
			webStorageLoaded) {
			
			editorRef.current = monaco.editor.create(editorContainerRef.current, 
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
				const model0 = monaco.editor.createModel(graphDef);

				// assign the editor's initial model to state
				// [] using map() is probs unneeded but shouldn't cause any 
				// issues
				setWrappers(wrappers.map((wrapper) => {

					if (wrapper.id === 0) {
						return { 
							...wrapper,
							model: model0,
						};
					} else {
						return wrapper;
					}
				}));

				// sync the initial editor model between app state and monaco
				// state
				editorRef.current.setModel(model0);

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