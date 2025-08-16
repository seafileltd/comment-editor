export const eventStopPropagation = (event) => {
  if (!event) return;
  event.stopPropagation();
  event.nativeEvent && event.nativeEvent.stopImmediatePropagation && event.nativeEvent.stopImmediatePropagation();
};

export const registerResizeEvents = (eventsMap = {}) => {
  for (let key in eventsMap) {
    document.addEventListener(key, eventsMap[key]);
  }
};

export const unregisterResizeEvents = (eventsMap = {}) => {
  for (let key in eventsMap) {
    document.removeEventListener(key, eventsMap[key]);
  }
};
