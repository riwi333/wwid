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
	
	const webStorageRef = useRef<Storage>();
	const timeoutRef = useRef<NodeJS.Timeout>();

	// on component mount
	useEffect(() => {

		// register custom language prior to create any text models
		monaco.languages.register({ id: Fixed.MonacoLanguageID });

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
		<>
			<Container fluid>
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
						/>
					</Col>
					<Col>
						<Viz 
							graphDef={ graphDef } 
							webStorageLoaded={ webStorageLoaded }
						/>
					</Col>
				</Row>
				<ToastContainer
					position="bottom-start"
					style={{ zIndex: 1 }}
				>
					<Toast 
						show={ showStorageLoadToast } 
						onClose={ () => setShowStorageLoadToast(false) }
						delay={ Fixed.ToastAutohideDelay_ms }
						autohide
					>
						<Toast.Body>{ storageLoadToastBody }</Toast.Body>
					</Toast>
					<Toast
						show={ showStorageSaveToast }
						onClose={ () => setShowStorageSaveToast(false) }
						delay={ Fixed.ToastAutohideDelay_ms }
						autohide
					>
						<Toast.Body>{ storageSaveToastBody }</Toast.Body>
					</Toast>
				</ToastContainer>
			</Container>
		</>
	);
} 