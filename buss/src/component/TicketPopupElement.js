import {PopupElement} from "./PopupElement.js";
export class TicketPopupElement extends PopupElement {
  render(ticket) {
    this.node = document.createElement("div");
    this.node.classList.add(`ticket-info`, "popup");
    let owerlay = document.createElement("div");
    owerlay.classList.add("owerlay");
    if (ticket) {
      let relevance = document.createElement(`p`);
      relevance.textContent = `Действует`;
      let relevanceTime = document.createElement(`span`);
      relevanceTime.classList.add(`time`);
      relevanceTime.textContent = ` 15`;
      let sek = 15;
      setInterval(() => {
        if (sek == 0) {
          this.hide();
          sek = 15;
        }
        if (this.visible) {
          sek--;
        }
        relevanceTime.textContent = ` ${sek}`;
      }, 1e3);
      relevance.append(relevanceTime);
      relevance.appendChild(document.createTextNode(` сек.`));
      let bought = document.createElement(`p`);
      let boughtTime = document.createElement(`span`);
      bought.textContent = `Куплен: `;
      boughtTime.textContent = `недавно`;
      setInterval(() => {
        let minutes = 0;
        if (minutes > 0) {
          boughtTime.textContent = ` ${Math.trunc(minutes)} мин. назад`;
        } else {
          boughtTime.textContent = `недавно`;
          minutes++;
        }
      }, 6e4);
      bought.append(boughtTime);
      this.ticketElement = document.createElement(`div`);
      this.ticketElement.classList.add(`ticket`);
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
      this.ticketQR = document.createElement(`img`);
      this.ticketQR.src = `../assets/img/qr-ticket.svg`;
      this.ticketQR.classList.add(`hide`, `qr-ticket`);
      owerlay.append(relevance);
      owerlay.append(bought);
      this.ticketElement.append(carrierElement);
      this.ticketElement.append(routeElement);
      this.ticketElement.append(car_numberElement);
      this.ticketElement.append(numberElement);
      this.ticketElement.append(countAndTypeElement);
      this.ticketElement.append(dateElement);
      owerlay.append(this.ticketElement);
      owerlay.append(this.ticketQR);
      let ticketElement = this.ticketElement;
      let ticketQR = this.ticketQR;
      owerlay.addEventListener(`click`, (e) => {
        e.stopPropagation();
        ticketElement.classList.toggle(`hide`);
        ticketQR.classList.toggle(`hide`);
      });
    }
    this.node.append(owerlay);
    return this.node;
  }
}
