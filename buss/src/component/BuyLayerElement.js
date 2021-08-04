import {Element} from "./Element.js";
export class BuyLayerElement extends Element {
  reRender(ticket) {
    super.reRender(ticket);
  }
  render(ticket) {
    this.node = document.createElement("div");
    this.node.id = `buy_layer`;
    if (!ticket) {
      ticket = {
        date: new Date(),
        code: 0,
        type: "",
        count: 1,
        route: 0,
        carrier: "",
        car_number: "",
        number: 0
      };
      this.node.classList.add("hide");
    }
    let pay_method_title = document.createElement("h2");
    pay_method_title.textContent = `Способы оплаты`;
    let pay_method_owerlay = document.createElement("div");
    pay_method_owerlay.classList.add(`pay_method`, `center-y`);
    let pay_method_current_img = document.createElement("img");
    pay_method_current_img.src = `./assets/img/google_pay_mark.png`;
    let pay_method_current_title = document.createElement("span");
    pay_method_current_title.classList.add(`title`);
    pay_method_current_title.textContent = "Google pay";
    let pay_method_current_select = document.createElement("span");
    pay_method_current_select.classList.add(`icon`, `icon-navigation-vertical`);
    pay_method_owerlay.append(pay_method_current_img);
    pay_method_owerlay.append(pay_method_current_title);
    pay_method_owerlay.append(pay_method_current_select);
    let count_ticket_title = document.createElement("h2");
    count_ticket_title.classList.add(`count_title`);
    count_ticket_title.textContent = `Количество билетов`;
    let count_ticket_number = document.createElement("span");
    count_ticket_number.textContent = `1`;
    count_ticket_title.append(count_ticket_number);
    let count_ticket_number_range = document.createElement("input");
    count_ticket_number_range.type = "range";
    count_ticket_number_range.value = `1`;
    count_ticket_number_range.min = `1`;
    count_ticket_number_range.max = `5`;
    count_ticket_number_range.step = `1`;
    count_ticket_number_range.addEventListener(`touchmove`, () => {
      count_ticket_number.textContent = count_ticket_number_range.value;
    });
    let ticket_route_title = document.createElement("h2");
    ticket_route_title.classList.add(`route_title`);
    ticket_route_title.textContent = `Маршрут ${ticket.route}`;
    function creatShortInfo({icon, title, description}) {
      let owerlay = document.createElement("div");
      owerlay.classList.add("short-info");
      let iconElement = document.createElement("span");
      iconElement.classList.add(`icon`, `${icon}`);
      let titleElement = document.createElement("span");
      titleElement.classList.add("title");
      titleElement.textContent = `${title}`;
      let descriptionElement = document.createElement("span");
      descriptionElement.classList.add("description");
      descriptionElement.textContent = `${description}`;
      owerlay.append(iconElement);
      owerlay.append(titleElement);
      owerlay.append(descriptionElement);
      return owerlay;
    }
    let ticketTypeElement = creatShortInfo({icon: "icon-ticket", title: `Тип билета`, description: `${ticket.type}`});
    let routeElement = creatShortInfo({icon: "icon-buss", title: `От-до`, description: `${ticket.car_number}`});
    let carrierElement = creatShortInfo({icon: "icon-carrier", title: `Перевозчик`, description: `${ticket.carrier}`});
    this.buyButtonElement = document.createElement("span");
    this.buyButtonElement.classList.add(`btn`, `bg-red`, `white-1`);
    this.buyButtonElement.textContent = `Купить билет ${26} ₽`;
    this.node.append(pay_method_title);
    this.node.append(pay_method_owerlay);
    this.node.append(count_ticket_title);
    this.node.append(count_ticket_number_range);
    this.node.append(ticket_route_title);
    this.node.append(ticketTypeElement);
    this.node.append(routeElement);
    this.node.append(carrierElement);
    this.node.append(this.buyButtonElement);
    return this.node;
  }
}
