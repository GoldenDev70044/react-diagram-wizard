import { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

import './index.scss';

const Table = ({
  type,
  nodes,
  checkedId,
  data,
  status,
  onCheck,
  ...props
}) => {
  const [list, setList] = useState(null);
  const [sortStatus, setSortStatus] = useState({
    item: 'id',
    order: 0
  });

  const headers = {
    actions: ['Action', 'Parameter', 'Expression'],
    links: ['Name', 'Parameter', 'Operator', 'Expression', 'Next Node']
  }

  useEffect(() => {
    setList([...(data ?? [])]);
  }, [data]);

  useEffect(() => {
    let items = [...(data ?? [])];

    if(type === 'links') {
      let filteredItems = items.filter((item) => {
        return item.next_node_id > -1;
      });

      setList(filteredItems);
      return;
    }

    setList(items);
  }, [data]);

  const handleChange = (e) => {
    const target = e.target;
    let id = Number(target.closest('tr[data-id]').dataset.id);
    
    if(target.type === 'checkbox') {
      onCheck(e, type, id, true);
      return;
    }

    let rows = [...(list ?? [])];
    let index = rows.findIndex((item) => {
      return item.id === id;
    });
    
    let value = target.value;
    value = target.type === 'select-one' ? Number(value) : value;
    rows[index][target.name] = value;

    setList([...rows]);
  }

  const sort = (item) => {
    let rows = list.slice(0, list.length);
    let order = 1;
    item = item.toLowerCase();
    
    switch (item) {
      case 'action':
        item = 'status';
        break;
      case 'next node':
        item = 'next_node_id';
        break;
      default:
        break;
    }

    if(item === sortStatus.item) {
      order = sortStatus.order * -1;

      if(sortStatus.order === -1) {
        order = -1;
        item = 'id';
      }
    }

    rows.sort((a, b) => {
      if ( a[item] < b[item] ){
        return 1 * order;
      }
      if ( a[item] > b[item] ){
        return -1 * order;
      }
      return 0;
    });

    setList(rows);
    setSortStatus({item, order: item === 'id' ? 0 : order});
  }

  const header = () => {
    if(type) {
      return headers[type].map((item, i) => {
        let icon = faSort;
        
        if(item.toLowerCase() === sortStatus.item
          || (item.toLowerCase() === 'action' && sortStatus.item === 'status')
          || (item.toLowerCase() === 'next node' && sortStatus.item === 'next_node_id')) {
          icon = sortStatus.order === 1 ? faSortDown : icon;
          icon = sortStatus.order === -1 ? faSortUp : icon;
        }
        
        return <th key={i}>{item} <FontAwesomeIcon icon={icon} onClick={() => {sort(item)}} /> </th>
      });
    }
  }

  return (
    <table>
      <thead>
        <tr>
          <th width="50">#</th>
          {header()}
        </tr>
      </thead>
      <tbody>
        {
          list && list.length < 1 &&
            <tr><td colSpan="6" style={{textAlign: 'center'}}>Not found!</td></tr>
        }
        { list && list.length > 0 &&
          list.map((item, i) => {
            return <tr key={i} data-id={item.id}>
              <td>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  {item.id} <input type="checkbox" onChange={handleChange} checked={checkedId === item.id} />
                </div>
              </td>
              {type === 'actions' &&
                <td>
                  <div>
                    <select name="status" value={item.status} onChange={handleChange}>
                      {
                        status.map((statusItem, i) => {
                          return <option key={i} value={statusItem.value}>{statusItem.text}</option>
                        })
                      }
                    </select>
                  </div>
                </td>
              }
              {type === 'links' &&
                <td><div><input name="name" onChange={handleChange} value={item.name} className={item.name === '' ? 'invalid' : ''} /></div></td>
              }
              <td><div><input name="parameter" onChange={handleChange} value={item.parameter} className={item.parameter === '' ? 'invalid' : ''} /></div></td>
              {type === 'links' &&
                <td><div><input name="operator" onChange={handleChange} value={item.operator} /></div></td>
              }
              <td><div><input name="expression" onChange={handleChange} value={item.expression} /></div></td>
              {type === 'links' &&
                <td>
                  <div>
                    <select name="next_node_id" value={item.next_node_id} onChange={handleChange}>
                      <option value='-1'></option>
                      {
                        nodes.map((node, i) => {
                          return <option key={i} value={node.id}>{node.title}</option>
                        })
                      }
                    </select>
                  </div>
                </td>
              }
            </tr>
          })}
        </tbody>
    </table>
  );
}

export default Table