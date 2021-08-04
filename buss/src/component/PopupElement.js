import {Element} from "./Element.js";
export class PopupElement extends Element {
  hide() {
    this.node.classList.remove("show");
  }
  show() {
    this.node.classList.add("show");
  }
}
