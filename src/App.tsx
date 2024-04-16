import React, { useEffect, useRef, useState } from 'react';

import * as monaco from 'monaco-editor';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
// import Toast from 'react-bootstrap/Toast';

import { ModelWrapper } from './common';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Viz from './Viz';

const wrapper0 = {
	id: 0,
	model: null,
};

// [todo] get/set all tabs; currently only store definition from active tab
export default function App() {

	const [ graphDef, setGraphDef ] = useState<string>("");
	const [ wrappers, setWrappers ] = useState<ModelWrapper[]>([ wrapper0 ]);
	const [ activeID, setActiveID ] = useState<number | null>(null);
	const [ webStorageLoaded, setWebStorageLoaded ] = useState<boolean>(false);

	const timeoutRef = useRef<NodeJS.Timeout>();
	const webStorageRef = useRef<Storage>();
	const itemRef = useRef<string | null>(null);

	// on component mount
	useEffect(() => {

		webStorageRef.current = localStorage;
		itemRef.current = webStorageRef.current.getItem("graphDef");
		if (itemRef.current) {
			console.log(`Retrieving stored graphDef: ${ itemRef.current }`);
			setGraphDef(itemRef.current);
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
					console.log(`Setting stored graphDef: ${ graphDef }`);
					webStorageRef.current.setItem("graphDef", graphDef);
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
							graphDef={ graphDef }
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