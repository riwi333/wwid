import React, { useEffect, useRef, useState } from 'react';

import * as monaco from 'monaco-editor';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

import { Fixed, ModelWrapper } from './common';
import { loadWebStorage, saveWebStorage } from './storage';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Viz from './Viz';
import DarkModeIcon from '../assets/bootstrap-icons/moon-stars-fill.svg';
import LightModeIcon from '../assets/bootstrap-icons/moon.svg';

const wrappers0 = [{
    id: 0,
    model: monaco.editor.createModel("", Fixed.MonacoLanguageID)
}];

// [todo] get/set all tabs; currently only store definition from active tab
export default function App() {

    const [ graphDef, setGraphDef ] = useState<string>("");
    const [ wrappers, setWrappers ] = useState<ModelWrapper[]>(wrappers0);
    const [ activeID, setActiveID ] = useState<number | null>(null);
    const [ webStorageLoaded, setWebStorageLoaded ] = useState<boolean>(false);
    const [ showStorageLoadToast, setShowStorageLoadToast ] = 
        useState<boolean>(false);
    const [ storageLoadToastBody, setStorageLoadToastBody ] = 
        useState<string>();
    const [ showStorageSaveToast, setShowStorageSaveToast ] = 
        useState<boolean>(false);
        const [ storageSaveToastBody, setStorageSaveToastBody ] = 
        useState<string>();
    const [ useDarkMode, setUseDarkMode ] = useState<boolean>(false);
    
    const webStorageRef = useRef<Storage>();
    const timeoutRef = useRef<NodeJS.Timeout>();

    // styling reactive to dark mode toggle
    const appStyle: React.CSSProperties = { 
        backgroundColor: useDarkMode ? Fixed.DarkModeBackgroundColor 
            : 'transparent',
    };
    const toastStyle: React.CSSProperties = {
        backgroundColor: useDarkMode ? Fixed.DarkModeBackgroundColor 
            : 'transparent',
        borderColor: useDarkMode ? 'white' : 'black',
        color: useDarkMode ? 'white': 'black',
    };
    const toggleStyle: React.CSSProperties = {
        border: '1px solid ' + (useDarkMode ? 'white' : 'black'),
    };
    const iconStyle: React.CSSProperties = {
        filter: useDarkMode ? 'invert(1)' : 'invert(0)',
    };

    // on component mount
    useEffect(() => {

        // register custom language prior to create any text models
        // monaco.languages.register({ id: Fixed.MonacoLanguageID });

        webStorageRef.current = localStorage;
        const tmp = loadWebStorage(webStorageRef.current);
        if (tmp.length > 0) {
            setStorageLoadToastBody(
                `Loaded ${ tmp.length } definitions from Web Storage`
            );
            setWrappers(tmp);
        }
        // default (no web storage) = `wrappers0 (above)
        else {
            setStorageLoadToastBody("Nothing loaded from Web Storage");
        }

        setWebStorageLoaded(true);
        setShowStorageLoadToast(true);

    }, []);

    useEffect(() => {

        // clear previous timeout; only write to storage if the full duration
        // has passed without changes to `graphDef so storage isn't 
        // overwritten every keystroke
        clearTimeout(timeoutRef.current);

        if (webStorageLoaded) {
            timeoutRef.current = setTimeout(() => {

                if (webStorageRef.current) {
                    setStorageSaveToastBody(`Saving ${ wrappers.length } 
                        definitions to Web Storage`);
                    saveWebStorage(webStorageRef.current, wrappers);
                }

                setShowStorageSaveToast(true);
                
            }, Fixed.WebStorageDirtyTimeout_ms);
        }

        return () => clearTimeout(timeoutRef.current);

    }, [ graphDef ]);

    return (
        <Container fluid style={ appStyle }>
            <Row>
                <Toolbar
                    wrappers={ wrappers }
                    setWrappers={ setWrappers }
                    activeID={ activeID }
                    setActiveID={ setActiveID }
                />
            </Row>
            <Row className="primary-row">
                <Col>
                    <Editor
                        setGraphDef={ setGraphDef }
                        wrappers={ wrappers }
                        setWrappers={ setWrappers }
                        activeID={ activeID }
                        setActiveID={ setActiveID }
                        webStorageLoaded={ webStorageLoaded }
                        useDarkMode={ useDarkMode }
                    />
                </Col>
                <Col>
                    <Viz 
                        graphDef={ graphDef } 
                        webStorageLoaded={ webStorageLoaded }
                        useDarkMode={ useDarkMode }
                    />
                </Col>
            </Row>
            <div
                className="dark-mode-toggle position-absolute top-0 end-0"
                onClick={ () => setUseDarkMode(! useDarkMode) }
                style={ toggleStyle }
            >
                <img 
                    src={ useDarkMode ? DarkModeIcon : LightModeIcon } 
                    style={ iconStyle } />
            </div>
            <ToastContainer
                position="bottom-start"
                style={{ zIndex: 1, }}
            >
                <Toast
                    style={ toastStyle }
                    show={ showStorageLoadToast } 
                    onClose={ () => setShowStorageLoadToast(false) }
                    delay={ Fixed.ToastAutohideDelay_ms }
                    autohide
                >
                    <Toast.Body>{ storageLoadToastBody }</Toast.Body>
                </Toast>
                <Toast
                    style={ toastStyle }
                    show={ showStorageSaveToast }
                    onClose={ () => setShowStorageSaveToast(false) }
                    delay={ Fixed.ToastAutohideDelay_ms }
                    autohide
                >
                    <Toast.Body>{ storageSaveToastBody }</Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}