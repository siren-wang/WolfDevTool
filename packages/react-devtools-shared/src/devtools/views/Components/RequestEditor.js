import * as React from 'react';
import {forwardRef, useCallback, useContext, useMemo, useState} from 'react';
import {copy} from 'clipboard-js';

import { NewRow, Row } from './NativeStyleEditor/StyleEditor';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import { serializeDataForCopy } from '../utils';
import { BridgeContext, StoreContext } from '../context';

import styles from './NativeStyleEditor/StyleEditor.css';
import requestStyles from './RequestEditor.css';
import { isJson } from './utils';

type RequestEditorProps = {
    request: Array<{
        name: string,
        value: string,
    }>
}

function RequestEditor({request}: RequestEditorProps): React.Node {
  
    const changeAttribute = (oldName: string, newName: string, value: any) => {
        console.log('oldName: ', oldName, ', newName: ', newName, ', value: ', value);

    };
  
    const changeValue = (name: string, value: any) => {
        console.log('name,', name, ', value: ', value);
    };
  
    return (
        <div className={`${styles.StyleEditor} ${requestStyles.RequestEditor}`}>
        <div className={styles.HeaderRow}>
        </div>
        {request.length > 0 &&
            request.map(({ name, value }) => (
            <Row
                key={name}
                attribute={name}
                changeAttribute={changeAttribute}
                changeValue={changeValue}
                validAttributes={null}
                value={value}
                shouldStringify={false}
            />
        ))}
        <NewRow
          changeAttribute={changeAttribute}
          changeValue={changeValue}
          validAttributes={null}
          attributePlaceholder="Header"
        />
      </div>
    );
}

type RequestJsonEditorProps = {
    content: string
}

export function RequestJsonEditor({content}: RequestJsonEditorProps): React.Node {
    if (!isJson(content)) return <div>{content}</div>;
    const parsedContent = JSON.parse(content);
  
    const changeAttribute = (oldName: string, newName: string, value: any) => {
    };

    const changeValue = (name: string, value: any) => {

    };

    const keys = useMemo(() => Array.from(Object.keys(parsedContent)), [parsedContent]);

    const handleCopy = () => copy(serializeDataForCopy(parsedContent));

    return (
        <div className={styles.StyleEditor}>
        <div className={styles.HeaderRow}>
            <div className={styles.Header}>
            <div className={styles.Brackets}>{'{'}</div>
            </div>
            <Button onClick={handleCopy} title="Copy to clipboard">
            <ButtonIcon type="copy" />
            </Button>
        </div>
        {keys.length > 0 &&
            keys.map(attribute => (
            <Row
                key={attribute}
                attribute={attribute}
                changeAttribute={changeAttribute}
                changeValue={changeValue}
                validAttributes={null}
                value={parsedContent[attribute]}
                shouldStringify={false}
            />
            ))}
        <NewRow
            changeAttribute={changeAttribute}
            changeValue={changeValue}
            validAttributes={null}
            attributePlaceholder="Key"
        />
        <div className={styles.Brackets}>{'}'}</div>
        </div>
    );
}

export default RequestEditor;

