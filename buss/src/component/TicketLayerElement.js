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
    this.categoryElement = document.createElement("span");
    this.categoryElement.classList.add("bg-red", "shadow", "white", "center-x", "center-y", "nameplate", "type_ticket", "white-1", "hide");
    let categoryIcon = document.createElement("span");
    categoryIcon.classList.add("icon-ticket");
    let categroyTitle = document.createTextNode(`Полный`);
    let ticket = document.createElement("div");
    ticket.id = `ticket`;
    this.categoryElement.append(categoryIcon);
    this.categoryElement.append(categroyTitle);
    ticket.append(this.ticketElement.render());
    this.node.append(this.categoryElement);
    this.node.append(ticket);
    return this.node;
  }
}
