/**
 * @flow
 */
import * as React from 'react';
import {useState, forwardRef, useCallback, useEffect, useContext, useMemo, useRef, Fragment, useReducer, useLayoutEffect} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {SettingsContext} from '../Settings/SettingsContext';
import { RequestsContext } from './RequestsContext';

import Toggle from '../Toggle';
import { LOCAL_STORAGE_NETWORK_FILTER_WOLF_RPOXY } from '../../../constants';
import { useLocalStorage } from '../hooks';
import ButtonIcon from '../ButtonIcon';
import styles from './Requests.css';
import { initResizeState, resizeReducer, ResizeState, ResizeAction, setResizeCSSVariable, getOrientation } from './Components';
import { localStorageSetItem } from '../../../storage';

type Column = {
  columnLabel: any,
  columnBody: any
}

const MINIMUM_SIZE = 50;

type ResizableColumnProps = {
  localStorageColumnIndex: number,
  leftChildren: any,
  rightChildren: any,
}

function ResizableColumn ({ columns }: { columns: Array<Column> }) {
  const wrapperElementRef = useRef<null | HTMLElement>(null);
  const resizeElementRef = useRef<null | HTMLElement>(null);

  const [refs, setRefs] = useState([]);

  const [state, dispatch] = useReducer<ResizeState, any, ResizeAction>(
    resizeReducer,
    null,
    initResizeState,
  );

  const {horizontalPercentage, verticalPercentage} = state;

  useLayoutEffect(() => {
    const resizeElement = resizeElementRef.current;

    setResizeCSSVariable(
      resizeElement,
      'horizontal',
      horizontalPercentage * 100,
    );
    setResizeCSSVariable(resizeElement, 'vertical', verticalPercentage * 100);
  }, []);

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      localStorageSetItem(
        `Wolf::DevTools::createResizeReducerColumn${localStorageColumnIndex}`,
        JSON.stringify({
          horizontalPercentage,
          verticalPercentage,
        }),
      );
    }, 500);

    return () => clearTimeout(timeoutID);
  }, [horizontalPercentage, verticalPercentage]);

  useEffect(() => {
    setRefs(columns.map(() => React.createRef()));
  }, [columns]);

  const {isResizing} = state;

  const onResizeStart = () =>
    dispatch({type: 'ACTION_SET_IS_RESIZING', payload: true});

  let onResize;
  let onResizeEnd;
  if (isResizing) {
    onResizeEnd = () =>
      dispatch({type: 'ACTION_SET_IS_RESIZING', payload: false});

    // $FlowFixMe[missing-local-annot]
    onResize = event => {
      const resizeElement = resizeElementRef.current;
      const wrapperElement = wrapperElementRef.current;

      if (!isResizing || wrapperElement === null || resizeElement === null) {
        return;
      }

      event.preventDefault();


      const { width, left } = wrapperElement.getBoundingClientRect();

      const currentMousePosition = event.clientX - left

      const boundaryMin = MINIMUM_SIZE;
      const boundaryMax = width - MINIMUM_SIZE;

      const isMousePositionInBounds =
        currentMousePosition > boundaryMin &&
        currentMousePosition < boundaryMax;

      if (isMousePositionInBounds) {
        const resizedElementDimension = width;
        const actionType = 'ACTION_SET_HORIZONTAL_PERCENTAGE';
        const percentage =
          (currentMousePosition / resizedElementDimension) * 100;

        setResizeCSSVariable(resizeElement, 'horizontal', percentage);

        dispatch({
          type: actionType,
          payload: currentMousePosition / resizedElementDimension,
        });
      }
    };
  }

  return (
    <div
      ref={wrapperElementRef}
      className={styles.Column}
      onMouseMove={onResize}
      onMouseLeave={onResizeEnd}
      onMouseUp={onResizeEnd}
    >
      <Fragment>
        {
          columns.map(({ columnLabel, columnBody }, index) => (
            <Fragment>
              <div className={styles.RequestsTableHead} ref={refs[index]}>
                <table>
                  <thead>
                    <tr>
                      <th>{columnLabel}</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className={styles.RequestsTableBody}>
                <table>
                  <tbody>
                    {columnBody}
                  </tbody>
                </table>
              </div>
            </Fragment>
          ))
        }
        <div ref={resizeElementRef} className={styles.LeftColumnWrapper}>
          {leftChildren}
        </div>
        <div className={styles.ResizeBarWrapper}>
          <div onMouseDown={onResizeStart} className={styles.ResizeBar} />
        </div>
        <div className={localStorageColumnIndex === 1 ? styles.Innermostlayer : styles.RightColumnWrapper}>
          {rightChildren }
        </div>
      </Fragment>
    </div>
  )
}

function ResizableColumns ({ columns }: { columns: Array<Column> }) {

  const [refs, setRefs] = useState([]);

  const renderColumns = columns.reverse().map(({ columnLabel, columnBody }, index) => (
    <Fragment>
      <div className={styles.RequestsTableHead} ref={refs[index]}>
        <table>
          <thead>
            <tr>
              <th>{columnLabel}</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className={styles.RequestsTableBody}>
        <table>
          <tbody>
            {columnBody}
          </tbody>
        </table>
      </div>
    </Fragment>
  ))

  useEffect(() => {
    setRefs(columns.map(() => React.createRef()));
  }, [columns]);

  useEffect(() => {
    const handleScroll = (e) => {
      const scrollLeft = e.target.scrollLeft;
      const scrollTop = e.target.scrollTop;
      // 更新其他表格的滚动位置
      refs.forEach((ref) => {
        if (ref.current && ref.current !== e.target) {
          ref.current.scrollLeft = scrollLeft;
          ref.current.scrollTop = scrollTop;
        }
      });
    };

    // 为每个表格添加滚动事件监听器
    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.addEventListener('scroll', handleScroll);
      }
    });

    return () => {
      // 组件卸载时移除事件监听器
      refs.forEach((ref) => {
        if (ref.current) {
          ref.current.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, [refs]);

  return (
    <Fragment>
      {
        // columns.reverse().reduce((accumulator, item, index) => {
        renderColumns.reduce((accumulator, item, index) => {
          return (
            <ResizableColumn
              localStorageColumnIndex={index}
              leftChildren={item}
              rightChildren={accumulator}
            />
          )
        })
      }
    </Fragment>
  )
}

function Requests({}: Props) {
  const {lineHeight} = useContext(SettingsContext);
  const { requestData, startRecording, selectRequest, selectedRequestId, filterText } = useContext(RequestsContext);

  console.log('requestData', requestData?.length, requestData)

  const [shouldFilterWolfProxyUrl, setShouldFilterWolfProxyUrl] =
  useLocalStorage(LOCAL_STORAGE_NETWORK_FILTER_WOLF_RPOXY, false);

  const requests = useMemo(() => {
    let res = requestData;
    if (filterText) {
      res = res.filter(({ request: { name, url }}) => name.includes(filterText) || url.includes(filterText))
    }
    if (!shouldFilterWolfProxyUrl) {
      return res;
    }
    return res.filter(({ wolfProxyHeaders }) => wolfProxyHeaders[`WOLF-PROXY-URL`] )
  }, [requestData, shouldFilterWolfProxyUrl, filterText]);

  if (requests.length === 0) return (
    <tr className={styles.TableRow}>
      <td className={styles.NoRequestCell}>
        {`No Wolf request ${filterText ? 'under filter「' + filterText + '」' : '' }recorded.`}
      </td>
    </tr>
  );

  const columns : Array<Column> = [
    {
      columnLabel: 'Name',
      columnBody: requests.map(({ request, id }) => (
        <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
          <td className={styles.TableCell}>
            {request.name}
          </td>
        </tr>
      ))
    },
    {
      columnLabel: 'Status',
      columnBody: requests.map(({ response, id }) => (
        <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
          <td className={styles.TableCell}>
            {response.status}
          </td>
        </tr>
      ))
    },
    {
      columnLabel: <Fragment>
        Wolf-Proxy-Url
          <Toggle
            isChecked={shouldFilterWolfProxyUrl}
            onChange={() => setShouldFilterWolfProxyUrl(!shouldFilterWolfProxyUrl)}
            title={
              shouldFilterWolfProxyUrl
                ? '只展示 Wolf 代理请求'
                : '展示所有 Wolf 请求'
            }>
            <ButtonIcon type="filter" />
          </Toggle>
      </Fragment>,
      columnBody: requests.map(({ wolfProxyHeaders, id }) => (
        <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
          <td className={styles.TableCell}>
            {wolfProxyHeaders[`WOLF-PROXY-URL`]}
          </td>
        </tr>
      ))
    },
  ]

  return (
    <div className={styles.AutoSizerWrapper}>
      <AutoSizer>
        {({height, width}) => (
          <div className={styles.RequestsTablesWrapper} style={{ width, height }}>
            {/* <ResizableColumn columns={columns} /> */}
            <div className={styles.RequestsTableHeads}>
              <div className={styles.RequestsTableHead}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 200 }}>Name</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className={styles.RequestsTableHead}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 200 }}>Status</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className={styles.RequestsTableHead}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 200 }}>
                        <Fragment>
                          Wolf-Proxy-Url
                            <Toggle
                              isChecked={shouldFilterWolfProxyUrl}
                              onChange={() => setShouldFilterWolfProxyUrl(!shouldFilterWolfProxyUrl)}
                              title={
                                shouldFilterWolfProxyUrl
                                  ? '只展示 Wolf 代理请求'
                                  : '展示所有 Wolf 请求'
                              }>
                              <ButtonIcon type="filter" />
                            </Toggle>
                        </Fragment>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <div className={styles.RequestsTableBodies}>
              <div className={styles.RequestsTableBody}>
                <table>
                  <tbody>
                    {requests.map(({ request, id }) => (
                      <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
                        <td className={styles.TableCell}>
                          {request.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.RequestsTableBody}>
                <table>
                  <tbody>
                    {requests.map(({ response, id }) => (
                      <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
                        <td className={styles.TableCell}>
                          {response.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.RequestsTableBody}>
                <table>
                  <tbody>
                    {requests.map(({ wolfProxyHeaders, id }) => (
                      <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
                        <td className={styles.TableCell}>
                          {wolfProxyHeaders[`WOLF-PROXY-URL`]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>



            {/* <div className={styles.RequestsTableHead}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 200 }}>Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={styles.RequestsTable}>
              <div className={styles.RequestsTableBody}>
                <table>
                  <tbody>
                    {requests.map(({ request, id }) => (
                      <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
                        <td className={styles.TableCell}>
                          {request.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.RequestsTable}>
              <div className={styles.RequestsTableHead}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 200 }}>Status</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className={styles.RequestsTableBody}>
                <table>
                  <tbody>
                    {requests.map(({ response, id }) => (
                      <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
                        <td className={styles.TableCell}>
                          {response.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.RequestsTable}>
              <div className={styles.RequestsTableHead}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 200 }}>
                        <Fragment>
                          Wolf-Proxy-Url
                            <Toggle
                              isChecked={shouldFilterWolfProxyUrl}
                              onChange={() => setShouldFilterWolfProxyUrl(!shouldFilterWolfProxyUrl)}
                              title={
                                shouldFilterWolfProxyUrl
                                  ? '只展示 Wolf 代理请求'
                                  : '展示所有 Wolf 请求'
                              }>
                              <ButtonIcon type="filter" />
                            </Toggle>
                        </Fragment>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className={styles.RequestsTableBody}>
                <table>
                  <tbody>
                    {requests.map(({ wolfProxyHeaders, id }) => (
                      <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
                        <td className={styles.TableCell}>
                          {wolfProxyHeaders[`WOLF-PROXY-URL`]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}


              {/* <ResizableColumns columns={columns} /> */}
              {/* <ResizableColumn>
                <div className={styles.RequestsTableHead}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: 200 }}>Name</th>
                        </tr>
                      </thead>
                    </table>
                </div>
                <div className={styles.RequestsTableBody}>
                  <table>
                    <tbody>
                      {requests.map(({ request, id }) => (
                        <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
                          <td className={styles.TableCell}>
                            {request.name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ResizableColumn>
              <ResizableColumn>
                <div className={styles.RequestsTableHead}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: 50 }}>Status</th>
                        </tr>
                      </thead>
                    </table>
                </div>
                <div className={styles.RequestsTableBody}>
                  <table>
                    <tbody>
                      {requests.map(({ response, id }) => (
                        <tr className={`${styles.TableRow} ${id === selectedRequestId && styles.SelectedRequest}`} key={id} onClick={() => selectRequest(id)}>
                          <td className={styles.TableCell}>
                            {response.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ResizableColumn> */}
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

export default Requests;
