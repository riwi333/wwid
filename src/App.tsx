import React, { useEffect, useRef, useState } from 'react';

import * as monaco from 'monaco-editor';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
// import Toast from 'react-bootstrap/Toast';

import { ModelWrapper } from './common';
import { loadWebStorage, saveWebStorage } from './storage';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Viz from './Viz';

const wrappers0 = [{
	id: 0,
	model: monaco.editor.createModel(""),
}];

// [todo] get/set all tabs; currently only store definition from active tab
export default function App() {

	const [ graphDef, setGraphDef ] = useState<string>("");
	const [ wrappers, setWrappers ] = useState<ModelWrapper[]>(wrappers0);
	const [ activeID, setActiveID ] = useState<number | null>(null);
	const [ webStorageLoaded, setWebStorageLoaded ] = useState<boolean>(false);

	const webStorageRef = useRef<Storage>();
	const timeoutRef = useRef<NodeJS.Timeout>();

	// on component mount
	useEffect(() => {

		webStorageRef.current = localStorage;
		const tmp = loadWebStorage(webStorageRef.current);
		if (tmp.length > 0) {
			console.log(`Loaded ${ tmp.length } definitions from Web Storage`);

			setWrappers(tmp);
		}
		// default (no web storage) = `wrappers0 (above)
		else {
			console.log("Nothing loaded from Web Storage");
		}

		setWebStorageLoaded(true);

	}, []);

	useEffect(() => {

		// clear previous timeout; only write to storage if the full duration
		// has passed without changes to `graphDef so storage isn't 
		// overwritten every keystroke
		clearTimeout(timeoutRef.current);

		if (webStorageLoaded) {
			timeoutRef.current = setTimeout(() => {

				if (webStorageRef.current) {
					console.log("Saving the following to Web Storage:");
					console.log(wrappers);

					saveWebStorage(webStorageRef.current, wrappers);
				}
			}, 5000);
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
			</Container>
		</>
	);
} 