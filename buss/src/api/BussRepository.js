export class BussRepository {
  async getBuses() {
    let response = await fetch(`https://script.google.com/macros/s/AKfycbyE4H0g668lbJKPfjK1sZAEOCQb1Q-o1JlXk4fYflyv78IQT8IMqeEbt82WtICH4NrH/exec`);
    if (response.ok) {
      const data = await response.json();
      return data.buses;
    } else {
      alert("Ошибка сервера");
    }
  }
}
