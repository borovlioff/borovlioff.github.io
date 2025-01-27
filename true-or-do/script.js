const fullscreenIcon = document.getElementById("fullscreenIcon");
const userModal = document.getElementById("userModal");
const manageUsers = document.getElementById("manageUsers");
const closeUserModal = document.getElementById("closeUserModal");
const usernameInput = document.getElementById("usernameInput");
const addUserButton = document.getElementById("addUserButton");
const userList = document.getElementById("userList");
const truthButton = document.getElementById("truthButton");
const dareButton = document.getElementById("dareButton");
const output = document.getElementById("output");

let users = [];

// Полноэкранный режим
fullscreenIcon.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Открыть модальное окно управления пользователями
manageUsers.addEventListener("click", (e) => {
  e.preventDefault();
  userModal.style.display = "block";
});

// Закрыть модальное окно
closeUserModal.addEventListener("click", () => {
  userModal.style.display = "none";
});

// Добавить пользователя
addUserButton.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name && !users.includes(name)) {
    users.push(name);
    renderUserList();
    usernameInput.value = "";
  }
});

// Удалить пользователя
userList.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const name = e.target.dataset.name;
    users = users.filter((user) => user !== name);
    renderUserList();
  }
});

// Вывод случайного имени участника
const getRandomUser = () => {
  if (users.length > 0) {
    return users[Math.floor(Math.random() * users.length)];
  }
  return null;
};

// Кнопки "Правда" и "Действие"
truthButton.addEventListener("click", () => {
  const user = getRandomUser();
  output.textContent = user ? `Правда для ${user}` : "Правда";
});

dareButton.addEventListener("click", () => {
  const user = getRandomUser();
  output.textContent = user ? `Действие для ${user}` : "Действие";
});

// Обновить список пользователей
function renderUserList() {
  userList.innerHTML = users
    .map(
      (user) =>
        `<li>${user} <button data-name="${user}">Удалить</button></li>`
    )
    .join("");
}