import {Element} from "./Element.js";
export class MenuItemElement extends Element {
  render(item) {
    this.node = document.createElement("div");
    if (item.mode == `big`) {
      this.node.classList.add(`${item.icon}`, `big`);
    } else {
      let iconElement = document.createElement("span");
      iconElement.classList.add(`${item.icon}`);
      let titleElement = document.createElement("p");
      titleElement.textContent = item.title;
      this.node.append(iconElement);
      this.node.append(titleElement);
    }
    return this.node;
  }
}
