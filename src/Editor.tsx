import React, { useEffect, useRef, useState } from 'react';

import * as monaco from 'monaco-editor';

import { Fixed, ModelWrapper } from './common';

// custom autocompletion provider
// class MyCompletionProvider implements monaco.languages.CompletionItemProvider {
class MyCompletionProvider implements monaco.languages.InlineCompletionsProvider {

    // [todo] not unique with multiple page loads/web storage
    public generateNodeID(): string {

        // use a UUID generator but only the first few bytes
        // [todo] window.crypto is only available in certain web contexts (localhost is fine)
        // [todo] deal with collisions (shorter UUID => more likely collisions)
        let uuid = window.crypto.randomUUID();
        let suuid = uuid.toString().slice(0, 4);

        let id = "_" + suuid;

        return id;
    }

    public provideInlineCompletions(model: monaco.editor.ITextModel, 
        position: monaco.Position, 
        context: monaco.languages.InlineCompletionContext, 
        token: monaco.CancellationToken)
        : monaco.languages.ProviderResult<monaco.languages.InlineCompletions> {
    // public provideCompletionItems(model: monaco.editor.ITextModel, 
    // 	position: monaco.Position, context: monaco.languages.CompletionContext, 
    // 	token: monaco.CancellationToken)
    // 	: monaco.languages.ProviderResult<monaco.languages.CompletionList> {

        // determine what to insert based on current position/content

        // console.log(position);

        // activate autocomplete after TAB-ing a new line
        let lineContent = model.getLineContent(position.lineNumber);
        let match = lineContent.match(/^\s+$/);
        if (match) {
            // node ID + open brackets/escape quote
            let insert = this.generateNodeID() + '["';

            // // close brackets/escape quote
            // let closeBracketEdit: monaco.editor.ISingleEditOperation = {
            // 	text: '"]',
            // 	range: {} as monaco.Range,
            // };

            // let word = model.getWordUntilPosition(position);
        
            // return {
                // suggestions: [
                // 	{
                // 		label: "new node",
                // 		kind: monaco.languages.CompletionItemKind.Function,
                // 		documentation: "new line, new node",
                // 		commitCharacters: [ "\t" ],
                // 		insertText: '${1:' + insert + '}["${2:}"',
                // 		insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                // 		range: {
                // 			startLineNumber: position.lineNumber,
                // 			endLineNumber: position.lineNumber,
                // 			startColumn: word.startColumn,
                // 			endColumn: word.endColumn
                // 		}
                // 	}
                // ]
            // };
            return {
                items: [
                    {
                        insertText: insert,
                    }
                ]
            }
        }

        // return { suggestions: [] };
        return { items: [] };
    }

    // public handleItemDidShow(completions: monaco.languages.InlineCompletions<monaco.languages.InlineCompletion>, item: monaco.languages.InlineCompletion, updatedInsertText: string): void {
    // 	console.log(updatedInsertText);	
    // }

    public freeInlineCompletions(completions: 
        monaco.languages.InlineCompletions<monaco.languages.InlineCompletion>)
            : void {}
}

type EditorProps = {
    setGraphDef: React.Dispatch<React.SetStateAction<string>>;
    wrappers: ModelWrapper[];
    setWrappers: React.Dispatch<React.SetStateAction<ModelWrapper[]>>;
    activeID: number | null;
    setActiveID: React.Dispatch<React.SetStateAction<number | null>>;
    webStorageLoaded: boolean;
    useDarkMode: boolean;
}

export default function Editor({ setGraphDef, wrappers, setWrappers, activeID, 
    setActiveID, webStorageLoaded, useDarkMode }: EditorProps) {

    const [ prevUseDarkMode, setPrevUseDarkMode ] = 
        useState<boolean | null>(null);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const editorContainerRef = useRef<HTMLDivElement>(null);

    if (prevUseDarkMode === null || prevUseDarkMode !== useDarkMode) {
        if (editorRef.current) {
            let nextTheme = useDarkMode ? 'vs-dark' : 'vs';
            editorRef.current.updateOptions({ theme: nextTheme });
        }

        setPrevUseDarkMode(useDarkMode);
    }

    // on component mount
    useEffect(() => {

        // enable autocompletion provider for registered langauge
        monaco.languages.registerInlineCompletionsProvider(
        // monaco.languages.registerCompletionItemProvider(
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
                    theme: useDarkMode ? 'vs-dark' : 'vs',
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