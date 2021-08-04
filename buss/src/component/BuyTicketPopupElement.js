import {PopupElement} from "./PopupElement.js";
export class BuyTicketPopupElement extends PopupElement {
  show() {
    super.show();
    this.input.focus();
  }
  render() {
    this.node = document.createElement("div");
    this.node.id = `buy_popup`;
    this.node.classList.add("popup");
    let owrlay = document.createElement("div");
    owrlay.classList.add(`owerlay`, `shadow`);
    let label = document.createElement("label");
    this.input = document.createElement("input");
    this.input.type = "number";
    label.textContent = `Введите код`;
    let error = document.createElement("span");
    error.classList.add("error");
    let action_owerlay = document.createElement(`div`);
    action_owerlay.classList.add(`action`);
    this.ok = document.createElement(`span`);
    this.ok.classList.add("ok");
    this.ok.textContent = "ОК";
    this.cancel = document.createElement(`span`);
    this.cancel.classList.add("cancel");
    this.cancel.textContent = `ОТМЕНА`;
    this.cancel.addEventListener("click", () => {
      this.input.value = ``;
      this.hide();
    });
    this.ok.addEventListener("click", () => {
      if (this.input.value) {
        this.hide();
        this.code = parseInt(this.input.value);
        this.input.value = ``;
      } else {
        error.textContent = `Обязательно для заполнения`;
      }
    });
    action_owerlay.append(this.cancel);
    action_owerlay.append(this.ok);
    owrlay.append(label);
    owrlay.append(this.input);
    owrlay.append(error);
    owrlay.append(action_owerlay);
    this.node.append(owrlay);
    return this.node;
  }
}
