import {Element} from "./Element.js";
export class TicketElement extends Element {
  render(ticket) {
    let owerlay = document.createElement(`div`);
    owerlay.classList.add(`owerlay`);
    let neckline = `<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>`;
    let neckline_top = document.createElement(`div`);
    neckline_top.classList.add(`neckline`, `top`);
    neckline_top.innerHTML = neckline;
    let neckline_bottom = document.createElement(`div`);
    neckline_bottom.classList.add(`neckline`, `bottom`);
    neckline_bottom.innerHTML = neckline;
    owerlay.append(neckline_top);
    if (ticket) {
      neckline_top.classList.add(`neckline`, `top`, `bg-red`);
      neckline_bottom.classList.add(`neckline`, `bottom`, `bg-red`);
      owerlay.classList.remove(`shadow`);
      let ticketHeaderTitleElement = document.createElement(`h2`);
      ticketHeaderTitleElement.classList.add(`header`);
      ticketHeaderTitleElement.textContent = `Текущий билет`;
      owerlay.append(ticketHeaderTitleElement);
      let current_ticket = document.createElement(`div`);
      current_ticket.id = `current_ticket`;
      let carrierElement = document.createElement(`p`);
      carrierElement.textContent = ticket.carrier;
      let routeElement = document.createElement(`p`);
      routeElement.textContent = `Маршрут №${ticket.route}`;
      let car_numberElement = document.createElement(`p`);
      car_numberElement.textContent = ticket.car_number;
      car_numberElement.classList.add(`mb-1`);
      let numberElement = document.createElement(`p`);
      numberElement.textContent = `Билет №${ticket.number}`;
      let countAndTypeElement = document.createElement(`p`);
      countAndTypeElement.classList.add(`strong`);
      countAndTypeElement.textContent = `${ticket.count} (${ticket.type}) - 26,00 ₽`;
      let dateElement = document.createElement(`p`);
      let dateNewFormat = `${ticket.date.getDate()} ${ticket.date.toLocaleString("ru", {month: "long"})},  ${ticket.date.getHours()}:${ticket.date.getMinutes() > 9 ? ticket.date.getMinutes() : `0` + ticket.date.getMinutes()}`;
      dateElement.textContent = dateNewFormat;
      current_ticket.append(carrierElement);
      current_ticket.append(routeElement);
      current_ticket.append(car_numberElement);
      current_ticket.append(numberElement);
      current_ticket.append(countAndTypeElement);
      current_ticket.append(dateElement);
      owerlay.append(current_ticket);
      let ticketFooterTitleElement = document.createElement(`h2`);
      ticketFooterTitleElement.classList.add(`footer`, `center-x`, `center-y`);
      ;
      let ticketFooterTitleIconElement = document.createElement(`span`);
      ticketFooterTitleIconElement.classList.add(`icon`, `icon-qr`);
      ticketFooterTitleElement.append(ticketFooterTitleIconElement);
      let ticketFooterTitleTextElement = document.createTextNode(`Предъявить билет`);
      ticketFooterTitleElement.append(ticketFooterTitleTextElement);
      owerlay.append(ticketFooterTitleElement);
    } else {
      owerlay.classList.add(`shadow`);
      neckline_top.classList.add(`neckline`, `top`, `bg-17-24`);
      neckline_bottom.classList.add(`neckline`, `bottom`, `bg-24-17`);
      let no_ticket = document.createElement(`div`);
      no_ticket.id = `no_ticket`;
      let title = document.createElement(`h2`);
      title.textContent = `Нет действющего билета`;
      let description = document.createElement(`p`);
      description.innerHTML = `Для покупки билета нажмите <span>+</span> внизу экрана`;
      no_ticket.append(title);
      no_ticket.append(description);
      owerlay.append(no_ticket);
    }
    owerlay.append(neckline_bottom);
    this.node = owerlay;
    return owerlay;
  }
}
