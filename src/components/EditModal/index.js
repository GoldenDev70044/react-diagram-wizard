import { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

import Table from '../Table';
import './index.scss';

const EditModal = (props) => {
  const [node, setNode] = useState(null);
  const [checked, setChecked] = useState({});
  const listKeys = {
    actions: ['parameter', 'expression', 'status'],
    links: ['name', 'parameter', 'expression', 'operator']
  }

  useEffect(() => {
    setNode({...(props.node ?? {})});
  }, [props]);

  const handleInputChange = (e) => {
    const target = e.target;
    setNode(s=>({...s, [target.name]: target.value}));
  }

  const handleCheck = (e, type, data, isCheck = false) => {
    if(isCheck) {
      if(checked[type] === data) {
        data = 0;
      }

      setChecked({...checked, [type]: data});
      return;
    }
  }

  const handleSave = () => {
    let nodeObj = {...node};
    let isValid = true;
    
    if(nodeObj.title === '') {
      return;
    }

    nodeObj.actions.forEach((action) => {
      action.status = action.status === '' ? 0 : action.status;
      if(action.parameter === '') {
        isValid = false;
        return;
      }
    });

    nodeObj.links.forEach((link) => {
      if(link.name === '' || link.parameter === '') {
        isValid = false;
        return;
      }
    });

    if(isValid) {
      props.onSave(nodeObj);
    }
  }

  const handleClose = () => {
    props.onHide();
  }

  const handleAdd = (type) => {
    let nodeItem = {...node};
    let list = [...(nodeItem[type] ?? [])];
    
    let keys = listKeys[type];
    let newItem = {};

    keys.forEach((key) => {
      newItem[key] = '';
    });
    
    newItem.id = getMaxId(list) + 1;

    if(type === 'links') {
      newItem.next_node_id = nodeItem.id + 1;
      newItem.action_id = getMaxId(nodeItem.actions) + 1;
    }

    list.push(newItem);
    nodeItem[type] = list;
    setNode(nodeItem);
  }

  const getMaxId = (arr) => {
    let maxId = 1;

    arr.forEach((item) => {
      maxId = item.id > maxId ? item.id : maxId;
    });
    return maxId;
  }

  const handleDelete = (type) => {
    let nodeItem = {...node};
    let selectedId = checked[type];

    if(!selectedId || selectedId < 1) {
      return;
    }
    
    let list = [...(nodeItem[type] ?? [])];

    let index = list.findIndex((item) => {
      return item.id === selectedId;
    });

    if(type === 'actions') {
      list.splice(index, 1);
      let links = [...(nodeItem.links ?? [])];

      let linkIndex = links.findIndex((link) => {
        return link.action_id === selectedId;
      });

      links.splice(linkIndex, 1);
      nodeItem.links = links;
    } else {
      list.splice(index, 1);
    }

    nodeItem[type] = list;
    
    setNode({...nodeItem});
    setChecked({...checked, [type]: -1});
  }

  const handleMove = (dir, type) => {
    let selectedId = checked[type];

    if(!selectedId || selectedId < 1) {
      return;
    }

    let nodeItem = {...node};
    let list = [...(nodeItem[type] ?? [])];
    let index = list.findIndex((item) => {
      return item.id === selectedId;
    });

    let tempIndex = index + dir;

    if(tempIndex < 0 || tempIndex > list.length - 1) {
      return;
    }

    let tempItem = {...list[tempIndex]};

    list[tempIndex] = {...list[index]};
    list[index] = tempItem;

    nodeItem[type] = list;
    setNode(nodeItem);
  }

  const dataList = (title) => {
    let type = title.toLowerCase();

    return (
      <div className={type}>
        <div className="data-title">
          <div>
            <h3>{title}</h3>
            <span className="description">Please specify your actions in this node</span>
          </div>
          <ul className="controls">
            <li onClick={() => handleAdd(type)}><FontAwesomeIcon icon={faPlus} /></li>
            <li onClick={() => handleDelete(type)}><FontAwesomeIcon icon={faTimes} /></li>
            <li onClick={() => handleMove(-1, type)}><FontAwesomeIcon icon={faArrowUp} /></li>
            <li onClick={() => handleMove(1, type)}><FontAwesomeIcon icon={faArrowDown} /></li>
          </ul>
        </div>
        <Table
          type={type}
          data={node ? node[type] : null}
          status={node ? node.status : null}
          nodes={props.nodes}
          checkedId={checked[type]}
          onCheck={handleCheck} />
      </div>
    )
  }

  return (
    <div className="modal-container">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Edit node</h3>
          <div className="controls">
            <div className="button" onClick={handleSave}><FontAwesomeIcon icon={faSave} /></div>
            <div className="button" onClick={handleClose}><FontAwesomeIcon icon={faTimes} /></div>
          </div>
        </div>
        <div className="modal-body">
          <div className="main-info">
            <div>
              <label>Node name</label>
              <input name="title" onChange={handleInputChange} value={node?.title || ''} className={node?.title === '' ? 'invalid' : ''} />
            </div>
            <div>
              <label>Notes</label>
              <textarea rows="5" name="notes" onChange={handleInputChange} value={node?.notes || ''}></textarea>
            </div>
          </div>

          <div className="data-list">
            {dataList('Actions')}
            {dataList('Links')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditModal