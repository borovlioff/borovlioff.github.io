function User(name, gender) {
    this.name = name;
    this.gender = gender;
}
var massUser = [];
let boxBottom = document.getElementById("box-botom");
let bottomNext = document.getElementById("nextUser");
let GetUser = document.getElementById("NameUserEnter");
let textUser = document.getElementById("UserName");
let OutText = document.getElementById("OutText");
let qestions = [];
let actions = [];

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}// Получение рандомного элемента из массива

massUser.count = -1; // Добавление своиства итерирование, для передвижение по массиву
massUser.next = function () {
    if (this.count >= this.length) { this.count = 0; return this[this.count]; }
    else { ++this.count; return this[this.count]; }
};
function Random(mass) {
    OutText.textContent = mass.random();
}
bottomNext.addEventListener("click", () => {
    ShowUserName(); OutText.textContent = "Правда или Действие?"; boxBottom.style.display = "block"; bottomNext.style.display = "none"
});

document.getElementById("qestion").addEventListener("click", () => {
    Random(qestions); boxBottom.style.display = "none"; bottomNext.style.display = "block"
});
document.getElementById("action").addEventListener("click", () => {
    Random(actions); boxBottom.style.display = "none"; bottomNext.style.display = "block"
});

function AddUser(gender) {
    if (GetUser.value.length == 0 || GetUser.value == null) { alert("Введите имя") }
    else {
        massUser.push(new User(GetUser.value, gender)); console.log(`New user: ${GetUser.value}:${gender}`);
        GetUser.placeholder = `Игрок ${massUser.length+1}`
    }
    GetUser.value = "";
    ShowUserName();
}

document.getElementById("Men").addEventListener("click", () => { AddUser("M") });
document.getElementById("Girl").addEventListener("click", () => { AddUser("G") });

function ShowUserName() {
    if (massUser.length != 0) {
        if (massUser.length <= 3) { textUser.textContent = massUser.next().name; }
        else { textUser.textContent = massUser.random().name; }
    }
}

function GetData() {
    var app = "https://script.google.com/macros/s/AKfycbwC4dLzpBH5tOBOEm9PMx2wpF1Od7_iDPQrFsRWVWKp0NG0-1ju/exec",
        output = '',
        xhr = new XMLHttpRequest();
    xhr.open('GET', app);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        if (xhr.status == 200) {
            try {
                var QestionAndAction = JSON.parse(xhr.responseText).result;
                qestions = QestionAndAction.qestion.slice()
                actions = QestionAndAction.action.slice();
            } catch (e) { console.log(e) }
        }
    }
    xhr.send()
}
GetData();