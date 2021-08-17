import {Element} from "./Element.js";
import {MenuItemElement} from "./MenuItemElement.js";
export class MenuElement extends Element {
  render() {
    this.node = document.createElement("div");
    this.node.id = "menu";
    this.node.classList.add("text-center", "shadow");
    this.ticket = new MenuItemElement().render({
      icon: `icon-ticket`,
      title: "Билет"
    });
    this.history = new MenuItemElement().render({
      icon: `icon-clock`,
      title: "История"
    });
    this.buyElement = new MenuItemElement().render({
      icon: `icon-add`,
      title: "История",
      mode: `big`
    });
    this.buyElement.id = "buy";
    this.pay = new MenuItemElement().render({
      icon: `icon-pay`,
      title: "Оплата"
    });
    this.navigation = new MenuItemElement().render({
      icon: `icon-navigation`,
      title: "Еще"
    });
    this.node.append(this.ticket);
    this.node.append(this.history);
    this.node.append(this.buyElement);
    this.node.append(this.pay);
    this.node.append(this.navigation);
    return this.node;
  }
}
