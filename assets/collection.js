class Collection {
  constructor() {
    console.log('collection script loaded');
    this.init();
  }

  init() {
    // init collection-specific logic
  }
}

// conditionally instantiate Collection if a specific DOM element exists
if (document.querySelector('.collection-wrapper')) {
  new Collection();
}
