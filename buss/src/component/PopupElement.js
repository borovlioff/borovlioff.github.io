import {Element} from "./Element.js";
export class PopupElement extends Element {
  hide() {
    this.node.classList.remove("show");
    this.visible = false;
  }
  show() {
    this.node.classList.add("show");
    this.visible = true;
  }
}
