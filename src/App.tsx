import React, { useState } from 'react';

import * as monaco from 'monaco-editor';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { ModelWrapper } from './common';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Viz from './Viz';

const wrapper0 = {
	id: 0,
	model: monaco.editor.createModel(""),
};

export default function App() {

	const [ graphDef, setGraphDef ] = useState<string>("");
	const [ wrappers, setWrappers ] = useState<ModelWrapper[]>([ wrapper0 ]);
	const [ activeID, setActiveID ] = useState<number>(0);

	return (
		<>
			<Container fluid>
				<Row className="toolbar-container">
					<Toolbar
						wrappers={ wrappers }
						setWrappers={ setWrappers }
						activeID={ activeID }
						setActiveID={ setActiveID }
					/>
				</Row>
				<Row>
					<Col>
						<Editor 
							setGraphDef={ setGraphDef } 
							wrappers={ wrappers }
							setWrappers={ setWrappers }
							activeID={ activeID }
							setActiveID={ setActiveID } 
						/>
					</Col>
					<Col>
						<Viz graphDef={ graphDef } />
					</Col>
				</Row>
			</Container>
		</>
	);
}