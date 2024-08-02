class Grid extends HTMLElement {
  constructor() {
    super();
    console.log('grid component initialized');
  }
}

customElements.define('grid-component', Grid);
