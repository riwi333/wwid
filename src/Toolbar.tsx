import React, { useRef } from 'react';

import * as monaco from 'monaco-editor';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

import { Fixed, ModelWrapper, previewModelText } from './common';

import CloseIcon from '../assets/bootstrap-icons/x.svg';

export type ToolbarProps = {
    wrappers: ModelWrapper[];
    setWrappers: React.Dispatch<React.SetStateAction<ModelWrapper[]>>;
    activeID: number | null;
    setActiveID: React.Dispatch<React.SetStateAction<number | null>>;
    setShowErrorToast: React.Dispatch<React.SetStateAction<boolean>>;
    setErrorToastBody: React.Dispatch<React.SetStateAction<string>>;
}

// [todo] resize tabs, etc. once toolbar fills 100% width
export default function Toolbar({ wrappers, setWrappers, activeID, setActiveID, 
    setShowErrorToast, setErrorToastBody }: ToolbarProps) {

    const nextIDRef = useRef<number>(1);

    const addTabClickHandler = () => {

        const id1 = nextIDRef.current;
        const model1 = monaco.editor.createModel("", Fixed.MonacoLanguageID);

        setWrappers([ 
            ...wrappers,
            { 
                id: id1,
                model: model1,
            }
        ]);

        nextIDRef.current++;
    };

    const closeTabClickHandler = (e: React.MouseEvent<HTMLImageElement>, 
        id: number) => {
        
        e.stopPropagation();

        // at least 1 active tab must always exist
        if (wrappers.length < 2) {
            setErrorToastBody("Invalid operation: at least 1 tab must exist");
            setShowErrorToast(true);
        }
        else {
            // if needed, replace the active tab with one that will still exist
            if (id == activeID) {
                let nextWrapperIndex = (wrappers[0].id == activeID) ? 1 : 0;
                let nextActiveID = wrappers[nextWrapperIndex].id;
                setActiveID(nextActiveID);
            }

            setWrappers((wrappers) => 
                wrappers.filter(wrapper => wrapper.id != id));
        }
    };

    const tabs: React.ReactElement[] = wrappers.map((wrapper) => {
        return (
            <Button
                key={ wrapper.id }
                onClick={ () => setActiveID(wrapper.id) }
                variant={ wrapper.id === activeID ? "primary" : "light" }
            >
                <Form.Control
                    type="text" 
                    placeholder={ previewModelText(wrapper.model) } />
                <img 
                    src={ CloseIcon } 
                    onClick={ (e) => closeTabClickHandler(e, wrapper.id) } />
            </Button>
        );
    });
    tabs.push(
        <Button
            className="btn-add"
            key="add"
            onClick={ addTabClickHandler }
            variant="secondary"
        >
            Add
        </Button>
    );

    return (
        <ButtonGroup className="toolbar">
            { tabs }
        </ButtonGroup>
    );
}