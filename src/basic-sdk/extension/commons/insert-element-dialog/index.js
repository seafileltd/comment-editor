import React, { useCallback, useEffect, useState, useRef } from 'react';
import { INTERNAL_EVENT } from '../../../constants';
import EventBus from '../../../utils/event-bus';
import { ELEMENT_TYPE, INSERT_POSITION, LOCAL_IMAGE } from '../../constants';
import { generateImageInfos, insertImage } from '../../plugins/image/helpers';
import AddLinkDialog from '../../plugins/link/dialog/add-link-dialog';

const InsertElementDialog = ({ editor }) => {
  const [dialogType, setDialogType] = useState('');
  const [element, setElement] = useState('');
  const [insertPosition, setInsertPosition] = useState(INSERT_POSITION.CURRENT);
  const [slateNode, setSlateNode] = useState(null);
  const [validEditor, setValidEditor] = useState(editor);
  const [linkTitle, setLinkTitle] = useState('');
  const [handleSubmit, setHandleSubmit] = useState(() => void 0);
  const [data, setData] = useState({});

  const uploadLocalImageInputRef = useRef();

  const onFileChanged = useCallback((event) => {
    const imgInfos = generateImageInfos(event.target.files);
    insertImage(validEditor, imgInfos, validEditor.selection, insertPosition);
    if (uploadLocalImageInputRef.current) {
      uploadLocalImageInputRef.current.value = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validEditor, uploadLocalImageInputRef, insertPosition, slateNode]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const toggleDialogSubscribe = eventBus.subscribe(INTERNAL_EVENT.INSERT_ELEMENT, toggleDialog);
    return () => {
      toggleDialogSubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDialog = useCallback(({
    type,
    element,
    insertPosition = INSERT_POSITION.CURRENT,
    slateNode,
    editor: paramEditor,
    linkTitle, // link shortcut wrapping link
    handleSubmit,
    data,
  }) => {
    setInsertPosition(insertPosition);
    setSlateNode(slateNode);
    setElement(element);
    setDialogType(type);
    setLinkTitle(linkTitle);
    setHandleSubmit(handleSubmit);
    // Apply for comment editor, as it has a different editor instance
    setValidEditor(paramEditor || editor);
    setData(data);
    if (type === LOCAL_IMAGE) {
      setTimeout(() => {
        uploadLocalImageInputRef.current && uploadLocalImageInputRef.current.click();
      }, 0);
    }
  }, [editor]);

  const closeDialog = useCallback(() => {
    setInsertPosition(INSERT_POSITION.CURRENT);
    setSlateNode(null);
    setElement('');
    setDialogType('');
    setValidEditor(null);
    setLinkTitle('');
    setData('');
  }, []);

  const props = {
    insertPosition,
    slateNode,
    editor: validEditor,
    element,
    closeDialog,
    linkTitle,
    handleSubmit,
    data,
  };

  switch (dialogType) {
    case ELEMENT_TYPE.LINK: {
      return (<AddLinkDialog {...props} />);
    }
    case LOCAL_IMAGE: {
      return (<input onClick={e => e.stopPropagation()} ref={uploadLocalImageInputRef} type="file" multiple={true} accept='image/*' style={{ display: 'none' }} onChange={onFileChanged} />);
    }
    default: {
      return null;
    }
  }
};

export default InsertElementDialog;
