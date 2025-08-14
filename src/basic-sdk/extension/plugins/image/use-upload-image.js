import { useEffect, useState } from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import context from '../../../context';
import { isImageUrlIsFromUpload } from './helpers';
import ImageCache from './image-cache';

const updateImageNode = async (editor, element, newUrl, uploadFromDtable) => {
  const nodePath = ReactEditor.findPath(editor, element);
  const newData = { src: newUrl };
  uploadFromDtable && (newData['upload_from_dtable'] = true);
  Transforms.setNodes(editor, { data: newData }, { at: nodePath });
};

const useUploadImage = ({ editor, element }) => {
  const { data } = element;
  const [isLoading, setIsLoading] = useState();
  const [isUploadError, setIsUploadError] = useState(false);

  useEffect(() => {
    const { src: url, file_uuid } = data;
    if (!isImageUrlIsFromUpload(url)) return;
    setIsLoading(true);

    const uploadCurrentImage = async () => {
      try {
        const fileItem = ImageCache.getImage(file_uuid);
        const imageUrl = await context.api.uploadLocalImage([fileItem]);
        if (imageUrl && imageUrl[0]) {
          const uploadFromDtable = imageUrl?.upload_from_dtable ? true : false;
          updateImageNode(editor, element, imageUrl[0], uploadFromDtable);
        }
      } catch (error) {
        console.error(error.message);
        setIsUploadError(true);
      } finally {
        ImageCache.deleteImage(file_uuid);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    uploadCurrentImage(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isUploadLoading: isLoading,
    isUploadError: isUploadError,
  };
};

export default useUploadImage;
