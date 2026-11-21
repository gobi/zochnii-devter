// Зочны дэвтэр — сэтгэгдлийг Supabase-ийн `comments` хүснэгтэд хадгална.
// AI-аар үүсгэсэн. Өдөр 6-гийн «Хамт хийх» хэсэгт /hyanalt командаар хянуулна.

// Supabase-ийн төслийн хаяг ба НИЙТИЙН (anon / publishable) түлхүүр.
// Нийтийн түлхүүр browser-т байх нь хэвийн — эрхийг хүснэгтийн RLS дүрэм хамгаална (schema.sql).
// service_role / secret түлхүүрийг энд ХЭЗЭЭ Ч бүү хий.
const SUPABASE_URL = 'https://cqyakzvqmcpxgaksxrcs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MwZW9lIqnf3IPk57jxvAlQ_HgSQMVO6';

const COMMENTS_URL = SUPABASE_URL + '/rest/v1/comments';
const MAX_NAME = 50;
const MAX_TEXT = 500;
const MAX_SHOWN = 200;

const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const textInput = document.getElementById('text');
const submitButton = document.getElementById('submit');
const nameError = document.getElementById('name-error');
const textError = document.getElementById('text-error');
const formError = document.getElementById('form-error');
const list = document.getElementById('list');
const count = document.getElementById('count');
const status = document.getElementById('status');

function headers(extra) {
  return Object.assign({
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
  }, extra);
}

function asText(value) {
  return value === undefined || value === null ? '' : String(value);
}

function formatDate(value) {
  const date = new Date(value);
  return isNaN(date) ? '' : date.toLocaleDateString('mn-MN');
}

// Зочны бичсэн зүйлийг зөвхөн текст болгож (textContent) оруулна — код болж ажиллахгүй.
function render(entries) {
  list.textContent = '';
  for (const entry of entries) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = asText(entry.name);
    const small = document.createElement('small');
    small.textContent = formatDate(entry.created_at);
    li.appendChild(strong);
    li.appendChild(document.createTextNode(': ' + asText(entry.text)));
    li.appendChild(small);
    list.appendChild(li);
  }
  count.textContent = '(' + entries.length + ')';
  status.textContent = entries.length ? '' : 'Одоогоор сэтгэгдэл алга. Эхний сэтгэгдлийг та үлдээгээрэй.';
}

// Сүүлийн сэтгэгдлүүдийг сангаас татаж харуулна. Амжилттай бол true.
async function loadComments() {
  try {
    const response = await fetch(
      COMMENTS_URL + '?select=name,text,created_at&order=created_at.desc&limit=' + MAX_SHOWN,
      { headers: headers() }
    );
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const entries = await response.json();
    if (!Array.isArray(entries)) throw new Error('Буруу хариу');
    render(entries.filter(function (entry) {
      return entry && typeof entry === 'object';
    }));
    return true;
  } catch (error) {
    status.textContent = 'Сэтгэгдлүүдийг ачаалж чадсангүй. Интернэт холболтоо шалгаад хуудсыг дахин ачаална уу.';
    return false;
  }
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

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  if (!validate(name, text)) return;

  submitButton.disabled = true;
  submitButton.textContent = 'Илгээж байна…';
  try {
    const response = await fetch(COMMENTS_URL, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ name: name, text: text }),
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    form.reset();
    await loadComments();
  } catch (error) {
    formError.textContent = 'Сэтгэгдлийг илгээж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Үлдээх';
  }
});

status.textContent = 'Сэтгэгдлүүдийг ачаалж байна…';
loadComments();
