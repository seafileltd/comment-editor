import { getPreCharacters } from '../extension/plugins/mention/helper';

export const searchCollaborators = (collaborators, searchValue, editor) => {
  const validSearchValue = searchValue ? searchValue.trim().toLowerCase() : '';
  const validCollaborators = Array.isArray(collaborators) && collaborators.length > 0 ? collaborators : [];
  if (!validSearchValue) return validCollaborators;

  // The current character is '@' and the previous character is a null character
  const beforeStr = getPreCharacters(editor);
  const isEmptyStr = beforeStr.slice(-2, -1).trim().length === 0;
  if (beforeStr.slice(-1) === '@' && isEmptyStr) {
    return validCollaborators;
  }

  return validCollaborators.filter(collaborator => {
    const { name, name_pinyin = '' } = collaborator;
    if (name.toString().toLowerCase().indexOf(validSearchValue) > -1) return true;
    if (!name_pinyin) return false;
    const validNamePinyin = name_pinyin.toString().toLowerCase();
    const validSearchPinyinValue = validSearchValue.replace(/ |'/g, '');

    // complete: For example, seatable can be retrieved when searching for sea.
    if (validNamePinyin.indexOf(validSearchPinyinValue) > -1) return true;
    if (validNamePinyin.replace(/'/g, '').indexOf(validSearchPinyinValue) > -1) return true;

    const validNamePinyinList = validNamePinyin.split('\'');
    // acronym: For example, sea table can be retrieved when searching for st.
    const namePinyinAcronym = validNamePinyinList.map(item => item && item.trim() ? item.trim().slice(0, 1) : '');
    if (namePinyinAcronym.join('').indexOf(validSearchPinyinValue) > -1) return true;

    return false;
  });
};
