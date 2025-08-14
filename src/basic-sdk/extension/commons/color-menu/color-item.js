import React from 'react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const ColorItem = ({ color, lastUsedColor }) => {
  const { t } = useTranslation('sdoc-editor');
  return (
    <div
      className={classnames('sdoc-color-item', { 'selected': lastUsedColor === color.value })}
      style={{ backgroundColor: color.value }}
      color={color.value}
      data-color={color.value}
      title={color.index ? t(color.name, { value: color.index }) : t(color.name) }
    >
    </div>
  );
};

ColorItem.propTypes = {
  color: PropTypes.object,
  lastUsedColor: PropTypes.string,
  t: PropTypes.func,
};

export default ColorItem;
