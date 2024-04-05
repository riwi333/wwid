import React, { useState } from 'react';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import Editor from './Editor';
import Viz from './Viz';

export default function App() {

	const [ graphDef, setGraphDef ] = useState<string>("");

	return (
		<>
			<Container fluid>
				<Row>
					<Col>
						<Editor setGraphDef={ setGraphDef } />
					</Col>
					<Col>
						<Viz graphDef={ graphDef } />
					</Col>
				</Row>
			</Container>
		</>
	);
}