import {Element} from "./Element.js";
import {TicketElement} from "./TicketElement.js";
export class TicketLayerElement extends Element {
  constructor() {
    super(...arguments);
    this.ticketElement = new TicketElement();
  }
  render() {
    this.node = document.createElement("div");
    this.node.id = `ticket_layer`;
    this.categoryElement = document.createElement("div");
    this.categoryElement.classList.add("type_ticket", "white-1", "hide");
    let owerlay = document.createElement("span");
    owerlay.classList.add("bg-red", "shadow", "white", "center-x", "center-y", "nameplate");
    let categoryIcon = document.createElement("span");
    categoryIcon.classList.add("icon-ticket");
    let categroyTitle = document.createTextNode(`Полный`);
    let ticket = document.createElement("div");
    ticket.id = `ticket`;
    owerlay.append(categoryIcon);
    owerlay.append(categroyTitle);
    this.categoryElement.append(owerlay);
    ticket.append(this.ticketElement.render());
    this.node.append(this.categoryElement);
    this.node.append(ticket);
    return this.node;
  }
}
