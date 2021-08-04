import {Element} from "./Element.js";
export class MenuElement extends Element {
  creatMenuElement({icon, title}) {
    let owerlayElement = document.createElement("div");
    let iconElement = document.createElement("span");
    iconElement.classList.add(`${icon}`);
    let titleElement = document.createElement("p");
    titleElement.textContent = title;
    owerlayElement.append(iconElement);
    owerlayElement.append(titleElement);
    return owerlayElement;
  }
  render() {
    this.node = document.createElement("div");
    this.node.id = "menu";
    this.node.classList.add("text-center", "shadow");
    function creatMenuItem({icon, title}) {
      let owerlayElement = document.createElement("div");
      let iconElement = document.createElement("span");
      iconElement.classList.add(`${icon}`);
      let titleElement = document.createElement("p");
      titleElement.textContent = title;
      owerlayElement.append(iconElement);
      owerlayElement.append(titleElement);
      return owerlayElement;
    }
    let ticket = creatMenuItem({icon: "icon-ticket", title: "Билет"});
    let history = creatMenuItem({icon: "icon-clock", title: "История"});
    this.buyElement = document.createElement("div");
    this.buyElement.id = `buy`;
    this.buyElement.classList.add("icon-add");
    let pay = creatMenuItem({icon: "icon-pay", title: "Оплата"});
    let navigation = creatMenuItem({icon: "icon-navigation", title: "Еще"});
    this.node.append(ticket);
    this.node.append(history);
    this.node.append(this.buyElement);
    this.node.append(pay);
    this.node.append(navigation);
    return this.node;
  }
}
