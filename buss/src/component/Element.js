export class Element {
  constructor() {
    this.onMount();
  }
  async onMount() {
  }
  reRender(...args) {
    for (let i = 0; i < this.node.childNodes.length; i) {
      this.node.children[i].remove();
    }
    this.node.replaceWith(this.render(...args));
  }
  render(...args) {
    this.node = document.createElement("h1");
    this.node.textContent = `New Element`;
    return this.node;
  }
}
