import {BussRepository} from "./BussRepository.js";
export class BussController {
  constructor() {
    this.bussRepository = new BussRepository();
  }
  async getBuses() {
    this.buses = await this.bussRepository.getBuses();
  }
  async getById(id) {
    for (let i = 0; i < this.buses.length; i++) {
      let buss = this.buses[i];
      if (buss.code == id) {
        return buss;
      }
    }
  }
}
