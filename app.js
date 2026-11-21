// Зочны дэвтэр — сэтгэгдлийг энэ browser-т (localStorage) хадгална.
// AI-аар үүсгэсэн. Өдөр 6-гийн «Хамт хийх» хэсэгт /hyanalt командаар хянуулна.

const STORAGE_KEY = 'zochnii-devter';
const MAX_NAME = 50;
const MAX_TEXT = 500;

const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const textInput = document.getElementById('text');
const nameError = document.getElementById('name-error');
const textError = document.getElementById('text-error');
const formError = document.getElementById('form-error');
const list = document.getElementById('list');
const count = document.getElementById('count');

// Хадгалсан өгөгдөл гэмтсэн эсвэл browser хадгалахыг хориглосон бол хоосон жагсаалт буцаана.
function load() {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(entries)) return [];
    return entries.filter(function (entry) {
      return entry && typeof entry === 'object';
    });
  } catch (error) {
    return [];
  }
}

// Хадгалж чадсан бол true, чадаагүй бол false.
function save(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    return false;
  }
}

function asText(value) {
  return value === undefined || value === null ? '' : String(value);
}

// Зочны бичсэн зүйлийг зөвхөн текст болгож (textContent) оруулна — код болж ажиллахгүй.
function render(entries) {
  list.textContent = '';
  for (const entry of entries) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = asText(entry.name);
    const small = document.createElement('small');
    small.textContent = asText(entry.date);
    li.appendChild(strong);
    li.appendChild(document.createTextNode(': ' + asText(entry.text)));
    li.appendChild(small);
    list.appendChild(li);
  }
  count.textContent = '(' + entries.length + ')';
}

function validate(name, text) {
  nameError.textContent = '';
  textError.textContent = '';
  formError.textContent = '';

  if (!name) {
    nameError.textContent = 'Нэрээ бичнэ үү.';
  } else if (name.length > MAX_NAME) {
    nameError.textContent = 'Нэр ' + MAX_NAME + ' тэмдэгтээс урт байж болохгүй.';
  }

  if (!text) {
    textError.textContent = 'Сэтгэгдлээ бичнэ үү.';
  } else if (text.length > MAX_TEXT) {
    textError.textContent = 'Сэтгэгдэл ' + MAX_TEXT + ' тэмдэгтээс урт байж болохгүй.';
  }

  return !nameError.textContent && !textError.textContent;
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  if (!validate(name, text)) return;

  const entries = load();
  entries.unshift({
    name: name,
    text: text,
    date: new Date().toLocaleDateString('mn-MN'),
  });

  if (!save(entries)) {
    formError.textContent = 'Сэтгэгдлийг хадгалж чадсангүй. Browser-ийн хадгалах зай дүүрсэн эсвэл хаалттай байна.';
    return;
  }

  render(entries);
  form.reset();
});

render(load());
