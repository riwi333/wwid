import React, { useEffect, useState, useRef } from 'react';

import * as monaco from 'monaco-editor';

import { Fixed, ModelWrapper } from './common';

// custom autocompletion provider
class MyCompletionProvider implements monaco.languages.CompletionItemProvider {

	public provideCompletionItems(model: monaco.editor.ITextModel, 
		position: monaco.Position, context: monaco.languages.CompletionContext, 
		token: monaco.CancellationToken)
		: monaco.languages.ProviderResult<monaco.languages.CompletionList> {
		
		console.log(position);
		// console.log(context);
		// console.log(token.toString());

		let word = model.getWordUntilPosition(position);
		let test_suggest: monaco.languages.CompletionItem = {
			label: "test suggestion",
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "testing testy testing",
			insertText: '"test[ing]"',
			range: { 
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn
			},
		};

		return {
			suggestions: [ test_suggest ]
		};
	}
}

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

	// on component mount
	useEffect(() => {

		// enable autocompletion provider for registered langauge
		monaco.languages.registerCompletionItemProvider(
			Fixed.MonacoLanguageID, new MyCompletionProvider);

	}, []);

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
					model: null,
					minimap: { 
						enabled: false 
					},
				}
			);
			// model set to null since all model creation is contained by ModelWrapper objects

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