import {Element} from "./Element.js";
export class NavElement extends Element {
  next(title) {
    this.titleElement.textContent = title;
    this.backButtonElement.classList.remove(`hide`);
  }
  back(title) {
    this.titleElement.textContent = title;
    this.backButtonElement.classList.add(`hide`);
  }
  render() {
    this.node = document.createElement(`div`);
    this.node.classList.add(`nav`, `bg-red`, `shadow`, `white`, `center-y`);
    this.backButtonElement = document.createElement(`span`);
    this.backButtonElement.classList.add(`icon-back`, `hide`);
    this.titleElement = document.createElement(`h2`);
    this.titleElement.textContent = `Транспорт Красноярска`;
    this.node.append(this.backButtonElement);
    this.node.append(this.titleElement);
    return this.node;
  }
}
