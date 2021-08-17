import {BussController} from "./api/BussController.js";
import {TicketController} from "./api/TicketController.js";
import {NavElement} from "./component/NavElement.js";
import {MenuElement} from "./component/MenuElement.js";
import {TicketLayerElement} from "./component/TicketLayerElement.js";
import {BuyTicketPopupElement} from "./component/BuyTicketPopupElement.js";
import {BuyLayerElement} from "./component/BuyLayerElement.js";
import {ErrorPopupElement} from "./component/ErrorPopupElement.js";
import {TicketPopupElement} from "./component/TicketPopupElement.js";
let bussController = new BussController();
bussController.getBuses();
let ticketController = new TicketController();
let app = document.querySelector("#app");
let nav = new NavElement();
app.append(nav.render());
let ticket_layer = new TicketLayerElement();
app.append(ticket_layer.render());
let buy_layer = new BuyLayerElement();
app.append(buy_layer.render());
let menuElement = new MenuElement();
app.append(menuElement.render());
let buyTicketPopupElement = new BuyTicketPopupElement();
document.body.append(buyTicketPopupElement.render());
let errorPopupElement = new ErrorPopupElement();
document.body.append(errorPopupElement.render());
let ticketPopupElement = new TicketPopupElement();
document.body.append(ticketPopupElement.render());
menuElement.buyElement.addEventListener("click", () => {
  buyTicketPopupElement.show();
});
buyTicketPopupElement.ok.addEventListener("click", async () => {
  const buss = await bussController.getById(buyTicketPopupElement.code);
  if (buss) {
    ticketController.createTicket({code: buss.code, route: buss.route, car_number: buss.car_number, carrier: buss.carrier});
    ticket_layer.ticketElement.reRender(ticketController.ticket);
    ticketPopupElement.reRender(ticketController.ticket);
    ticketPopupElement.node.addEventListener("click", () => {
      ticketPopupElement.hide();
    });
    ticket_layer.node.classList.add("hide");
    nav.next("Купить билет");
    buy_layer.reRender(ticketController.ticket);
    buy_layer.buyButtonElement.addEventListener("click", () => {
      nav.back("Транспорт Красноярска");
      buy_layer.node.classList.add("hide");
      ticket_layer.node.classList.remove("hide");
      ticket_layer.node.classList.add(`smoll`);
      ticket_layer.categoryElement.classList.remove("hide");
      menuElement.node.classList.remove("hide");
    });
    buy_layer.node.classList.remove(`hide`);
    menuElement.node.classList.add("hide");
  } else {
    errorPopupElement.show();
  }
});
nav.backButtonElement.addEventListener("click", () => {
  nav.back("Транспорт Красноярска");
  buy_layer.node.classList.add("hide");
  ticket_layer.node.classList.remove("hide");
  ticket_layer.node.classList.add(`smoll`);
  ticket_layer.categoryElement.classList.remove("hide");
  menuElement.node.classList.remove("hide");
});
ticket_layer.node.addEventListener("click", () => {
  if (ticketController.ticket) {
    ticketPopupElement.show();
  }
});
