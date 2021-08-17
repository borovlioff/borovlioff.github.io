export class TicketController {
  constructor() {
    this.startTicket = {
      date: new Date(2021, 7, 2, 20, 28),
      ticketCount: 297260518,
      ticketPerSecond: 8
    };
  }
  createTicket({code, route, car_number, carrier}) {
    this.ticket = {
      code,
      route,
      car_number,
      carrier,
      date: new Date(),
      type: "Полный",
      count: 1,
      number: this.getTicketNumber()
    };
  }
  getTicketNumber() {
    let nowDate = new Date();
    let nowMilliseconds = nowDate.getTime();
    let nowSecond = nowMilliseconds / 1e3;
    let oldMilliseconds = this.startTicket.date.getTime();
    let oldSecond = oldMilliseconds / 1e3;
    let interim = nowSecond - oldSecond;
    let newNumber = this.startTicket.ticketCount + Math.round(interim * this.startTicket.ticketPerSecond);
    return newNumber;
  }
}
