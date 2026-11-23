import React, { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from '../../site/app';

jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router-dom');
});

jest.mock('../../site/pages/comment-editor', () => ({ scenario }) => (
  <div data-scenario={scenario}>{scenario}</div>
));

describe('comment integration routes', () => {
  let container;
  let root;
  let previousActEnvironment;

  beforeEach(() => {
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.body.appendChild(document.createElement('div'));
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  });

  it.each([
    ['SDoc Comment', '/sdoc-comment-editor', 'sdoc'],
    ['MD Comment', '/md-comment-editor', 'md'],
  ])('opens the %s integration from the home page', async (label, url, scenario) => {
    await act(async () => root.render(<MemoryRouter><App /></MemoryRouter>));
    const link = container.querySelector(`a[href="${url}"]`);
    expect(link.textContent).toBe(label);
    await act(async () => link.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0, cancelable: true })));
    expect(container.querySelector('[data-scenario]').dataset.scenario).toBe(scenario);
  });

  it('opens the MD integration directly', async () => {
    await act(async () => root.render(<MemoryRouter initialEntries={['/md-comment-editor']}><App /></MemoryRouter>));
    expect(container.querySelector('[data-scenario]').dataset.scenario).toBe('md');
  });
});
