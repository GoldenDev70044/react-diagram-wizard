import React, { useState, useEffect, useRef } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faSave, faCopy, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import IconArrow from './components/IconArrow';
import EditModal from './components/EditModal';

import './App.scss';

function App() {
  const [modalShow, setModalShow] = useState(false);
  const [originNodes, setOriginNodes] = useState([
    {
      id: 1,
      title: 'Menu',
      notes: '',
      actions: [
        {id: 1, parameter: 'Digits', expression: '', status: 0},
        {id: 2, parameter: 'Keyword', expression: '', status: 1},
        {id: 3, parameter: 'Digit', expression: '', status: 1},
        {id: 4, parameter: 'Time', expression: 10, status: 0}
      ],
      links: [
        {id: 1, name: 'Digit1', parameter: 'Digits', expression: '', operator: '=', action_id: 1, next_node_id: 2},
        {id: 2, name: 'Keyword1', parameter: 'Keyword', expression: '', operator: '=', action_id: 2, next_node_id: 2},
        {id: 3, name: 'Digit2', parameter: 'Digit', expression: '', operator: '=', action_id: 3, next_node_id: 3},
        {id: 4, name: 'Nothing', parameter: 'Time', expression: 10, operator: '=', action_id: 4, next_node_id: 4}
      ],
      status: [{text: 'Delay', value: 0}, {text: 'Assign', value: 1}]
    },
    {
      id: 2,
      title: 'Play1',
      actions: [
        {id: 1, parameter: 'File', expression: 'example.wav', status: 1,}
      ],
      links: [
        {id: 1, name: 'Next', parameter: 'File', expression: 'example.wav', operator: '>', action_id: 1, next_node_id: 4}
      ],
      status: [{text: 'Play', value: 0}]
    },
    {
      id: 3,
      title: 'Transfer Hanoi',
      actions: [],
      links: [],
    },
    {
      id: 4,
      title: 'Terminate',
      actions: [],
      links: [],
    },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [modalShowedNode, setModalShowedNode] = useState(null);
  const [nextNodes, setNextNodes] = useState(null);
  const [showedNodes, setShowedNodes] = useState([]);
  const [iconPosition, setIconPosition] = useState([]);
  const [diagramData, setDiagramData] = useState([]);
  const diagram = useRef(null);

  useEffect(() => {
    getIconPositions();
  }, [diagramData, originNodes]);

  const handleSave = (node) => {
    const id = node.id;
    let items = [...(originNodes ?? [])];
    let index = items.findIndex((n, i) => {
      return n.id === id;
    });

    index = index === -1 ? items.length : index;
    items[index] = node;
    setOriginNodes(items);
    setModalShow(false);
  }

  const addNewNode = (e) => {
    let id = getMaxId(originNodes) + 1;
    
    showModal(e, id);
  }

  const deleteNode = () => {
    let list = [...(originNodes ?? [])];
    let result = removeFromArrayByItem(list, selectedNodeId, 'id');
    setOriginNodes(result);

    let diagramList = [...(diagramData ?? [])];
    let diagramResult = removeFromArrayByItem(diagramList, selectedNodeId, 'node');
    setDiagramData(diagramResult);
  }

  const selectNode = (e, nodeId) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
  }

  const cloneNode = () => {
    const list = [...(originNodes ?? [])];

    let index = list.findIndex((elem) => {
      return elem.id === selectedNodeId;
    });

    if(index < 0) {
      return;
    }

    let selectedNode = {...list[index]};
    selectedNode.id = getMaxId(list) + 1;
    
    list.push(selectedNode);
    
    setOriginNodes(list);
    setSelectedNodeId(null);
  }

  const removeFromArrayByItem = (arr, item, itemType) => {
    let list = [...(arr ?? [])];
    
    let index = list.findIndex((elem) => {
      return elem[itemType] === item;
    });

    if(index > -1) {
      list.splice(index, 1);
    }

    return list;
  }

  const nextStep = (e, link) => {
    e.stopPropagation();
    let nextId = typeof link === 'number' ? link : link.next_node_id;
    
    if(nextId === 0) {
      link = {id: nextId}
      nextId = originNodes[0].id;
    }
    
    let showed = showedNodes ? showedNodes : [];
    let targetId = Number(e.target.dataset.id);

    showed.push(nextId);
    
    let uniqueShowed = [...new Set(showed)];
    setShowedNodes(uniqueShowed);

    const data = [...(diagramData ?? [])];
    const item = {
      node: targetId,
      link: link.id
    };

    let index = data.findIndex((item) => {
      return item.node === targetId && item.link === link.id;
    });

    if(index < 0) {
      data.push(item);
    }
    
    setDiagramData(data);
  }

  const getIconPositions = () => {
    const diagramElem = diagram.current;
    const children = diagramElem.querySelectorAll('.diagram-item');
    
    const positions = [];

    for (let i = 0; i < children.length; i++) {
      let elem = children[i];

      if(elem.classList.contains('diagram-item') && children[i + 1] && children[i + 1].classList.contains('diagram-item')) {
        if(diagramData.length > 0 && elem.dataset.id < diagramData[diagramData.length - 1].node) {
          const actionBtns = elem.querySelectorAll('.action button');
          for(let i = 0; i < actionBtns.length; i++) {
            actionBtns[i].setAttribute('disabled', true);
          }
        }

        let actionElems = [elem];

        if(i > 0) {
          actionElems = getActionElems(elem);
        }

        actionElems.forEach((actionElem) => {
          
          let position = { sx: 0, sy: 0, ex: 0, ey: 0 };
          let boundingRect = actionElem.getBoundingClientRect();

          position.sx = boundingRect.x + actionElem.offsetWidth;
          position.sy = boundingRect.y + actionElem.offsetHeight / 2;

          let nextNodeId = actionElem.dataset.nextId;
          let nextNode = children[i + 1];

          if(nextNodeId) {
            nextNode = getNextNode(actionElem);
          }

          if(nextNode) {

            boundingRect = nextNode.getBoundingClientRect();
            position.ex = boundingRect.x;
            position.ey = boundingRect.y + nextNode.offsetHeight / 2;
            
            positions.push(position);
          }
        });
      }
    }

    setIconPosition(positions);
  }

  const getActionElems = (nodeElem) => {
    let result = [];
    let actionElems = nodeElem.querySelectorAll('.action');

    for(let i = 0; i < actionElems.length; i++) {
      result.push(actionElems[i]);
    }

    return result;
  }

  const getNextNode = (actionElem) => {
    const diagramElem = diagram.current;
    const children = diagramElem.querySelectorAll('.diagram-item');
    let nextNode = null;
    const nextNodeId = Number(actionElem.dataset.nextId);
    const actionNodeId = Number(actionElem.querySelector('button[data-id]').dataset.id);

    if(nextNodeId < actionNodeId) {
      return null;
    }

    for (let i = 0; i < children.length; i++) {
      const elem = children[i];
      const elemId = Number(elem.dataset.id);

      if(elemId === nextNodeId) {
        nextNode = elem;
        return nextNode;
      }
    }

    return nextNode;
  }

  const showModal = (e, id) => {
    e.stopPropagation();
    let index = -1;
    let afterNodes = [];
    let items = [...(originNodes ?? [])]

    let node = items.find((item, i) => {
      if(item.id === id) {
        index = i;
        return item;
      }

      return null;
    });

    items.forEach((n, i) => {
      if(i > index) {
        afterNodes.push(n);
      }
    });

    if(!node) {
      node = {id: getMaxId(items) + 1, title: '', notes: '', actions: [], links: [], status: []};
      afterNodes = [];
    }

    setModalShowedNode(node);
    setNextNodes(afterNodes);
    setModalShow(true);
  }

  const getMaxId = (arr) => {
    let maxId = 1;

    arr.forEach((item) => {
      maxId = item.id > maxId ? item.id : maxId;
    });
    return maxId;
  }

  const getNodeJsx = (node, nodeIndex) => {
    return (<div className={`diagram-item ${selectedNodeId === node.id ? 'selected' : ''}`} key={nodeIndex} data-id={node.id} onClick={(e) => selectNode(e, node.id)}>
      <h3>{node.title}</h3>
      <ul>
        {node.links.map((link, linkIndex) => {
          return <li key={linkIndex} className="action" data-id={link.id} data-next-id={link.next_node_id}>
            <button data-id={node.id} onClick={(e) => nextStep(e, link)}>
              {link.name}
            </button>
          </li>
        })}
      </ul>
      <span className="icon-ellipsis" onClick={(e) => showModal(e, node.id)}><FontAwesomeIcon icon={faEllipsisV} /></span>
    </div>);
  }
  
  const nodeItems = originNodes.map((node, nodeIndex) => {
    if(node.id === 3 && originNodes[nodeIndex - 1].id === 2) {
      return null;
    }
    
    let elem = getNodeJsx(node, nodeIndex);

    if(node.id === 2) {
      const transferNode = originNodes.find((n) => {
        return n.id === 3;
      });

      elem = <div key={nodeIndex} className="group-node">{elem}{transferNode && getNodeJsx(transferNode, nodeIndex + 1)}</div>;
    }

    return elem;
  });

  return (
    <div className="App">
      <div className="top-bar">
        <h3 className="title">Script Builder</h3>
        <ul className="controls">
          <li onClick={(e) => addNewNode(e)} ><a href="#"><FontAwesomeIcon icon={faPlus} /></a></li>
          <li onClick={() => deleteNode()}><a href="#"><FontAwesomeIcon icon={faTimes} /></a></li>
          <li><a href="#"><FontAwesomeIcon icon={faSave} /></a></li>
          <li onClick={() => cloneNode()}><a href="#"><FontAwesomeIcon icon={faCopy} /></a></li>
        </ul>
      </div>

      <div className="diagram" ref={diagram}>
        <div className="diagram-item start">
          Start
          <span className="icon-ellipsis"><FontAwesomeIcon icon={faEllipsisV} /></span>
        </div>
        
        <div className="diagram-item answer" data-id="0">
          <h3>Answer</h3>
          <div className="action" data-id="0">
            <button data-id="0" onClick={(e) => nextStep(e, 0)}>
              Next
            </button>
          </div>
          <span className="icon-ellipsis"><FontAwesomeIcon icon={faEllipsisV} /></span>
        </div>
        
        {nodeItems}
      </div>

      {modalShow && 
        <EditModal
        node={{...modalShowedNode}}
        nodes={nextNodes}
        onHide={() => {setModalShow(false)}}
        onSave={handleSave}
        />
      }
      <IconArrow data={iconPosition} />
    </div>
  );
}

export default App;
