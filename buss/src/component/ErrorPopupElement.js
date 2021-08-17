import {PopupElement} from "./PopupElement.js";
export class ErrorPopupElement extends PopupElement {
  render() {
    this.node = document.createElement("div");
    this.node.classList.add(`error`, "popup");
    let owerlay = document.createElement("div");
    owerlay.classList.add("owerlay");
    let title = document.createElement("h2");
    title.textContent = `Ошибка`;
    let description = document.createElement("p");
    description.textContent = `Ошибка`;
    let action = document.createElement("div");
    action.classList.add("action");
    let close = document.createElement(`span`);
    close.classList.add("close");
    close.textContent = "ЗАКРЫТЬ";
    close.addEventListener("click", () => {
      this.hide();
    });
    action.append(close);
    owerlay.append(title);
    owerlay.append(description);
    owerlay.append(action);
    this.node.append(owerlay);
    return this.node;
  }
}
