import { createClient } from "@supabase/supabase-js";

const API_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMXci3_5NkPy0FS_ddSHbzMfeKYyNEXAnA107MsKtOgkoFYt6sLwndImsrlpSIwstTsMfrIrjS7yc2OadtiuyCfIDMzbjaPvMv6Gc-H9n5smZeN0itJyD7X9PW4WkmqzTkz4DD7Yo_al2QJ3EwZ9X17lmYHDZnTmJioPlK0wo4-UnVnW15zBXIK7ubNmNNbJeV1jB3HiPMWH9dUbyLfCSnGEH1Zr5JfBUjUfjCxFBkSfrcgP-LSldLFKHiCCMBIqnqUhuGK5iNpDaHC1fzXhnCREj4ila6IOw5KBDpRt&lib=MfFvjvB14MTaUuGb9I0ppQ7vDcWBALqSa";

const REFRESH_MS = 60000;
const DASHBOARD_PIN = "3107";
const PIN_SESSION_KEY = "dashboardPinUnlocked";

/* Netlify / .env: SUPABASE_URL, SUPABASE_ANON_KEY (vite.config: envPrefix SUPABASE_) */
const supabaseUrl = import.meta.env.SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY ?? "";

const eventsBody = document.getElementById("eventsBody");
const searchInput = document.getElementById("searchInput");
const statusText = document.getElementById("statusText");
const updatedText = document.getElementById("updatedText");
const refreshButton = document.getElementById("refreshButton");
const overlay = document.getElementById("overlay");
const eventDrawer = document.getElementById("eventDrawer");
const closeDrawerButton = document.getElementById("closeDrawerButton");
const drawerTitle = document.getElementById("drawerTitle");
const drawerMeta = document.getElementById("drawerMeta");
const addNoteButton = document.getElementById("addNoteButton");
const notesTitle = document.getElementById("notesTitle");
const noteForm = document.getElementById("noteForm");
const callerInput = document.getElementById("callerInput");
const customerInput = document.getElementById("customerInput");
const commentInput = document.getElementById("commentInput");
const saveNoteButton = document.getElementById("saveNoteButton");
const notesList = document.getElementById("notesList");
const historyList = document.getElementById("historyList");
const historyStatus = document.getElementById("historyStatus");
const pinGate = document.getElementById("pinGate");
const pinForm = document.getElementById("pinForm");
const pinInput = document.getElementById("pinInput");
const pinError = document.getElementById("pinError");
const pinSubmitButton = document.getElementById("pinSubmitButton");

let allEvents = [];
let generatedAt = null;
let selectedEvent = null;
let supabaseClient = null;
let notesByEventKey = new Map();
let noteCountsByEventKey = new Map();
let appStarted = false;

function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

function formatDateTime(dateValue) {
  const date = new Date(dateValue);
  const datePart = new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${datePart} klo ${timePart}`;
}

function formatDateOnly(dateValue) {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getRemainingPillClass(remainingReal) {
  if (remainingReal <= 5) return "pill pill-low";
  if (remainingReal <= 15) return "pill pill-warn";
  return "pill pill-good";
}

/** Sama kuin Supabase event_key: location + "_" + startDate (API:n startDate sellaisenaan) */
function eventKey(event) {
  return `${event.location}_${event.startDate}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function groupNotesByEventKey(notes) {
  const grouped = new Map();
  const counts = new Map();
  notes.forEach((note) => {
    const key = note.event_key;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(note);
  });
  grouped.forEach((items) =>
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  );
  return { grouped, counts };
}

function updateNotesFormAvailability() {
  const ok = isSupabaseConfigured();
  addNoteButton.disabled = !ok;
  saveNoteButton.disabled = !ok;
  callerInput.disabled = !ok;
  customerInput.disabled = !ok;
  commentInput.disabled = !ok;
}

function renderNoteCards(rows) {
  notesTitle.textContent = `Merkinnät (${rows.length})`;
  if (rows.length === 0) {
    notesList.innerHTML =
      '<div class="empty-notes">Ei vielä merkintöjä. Lisää ensimmäinen merkintä tästä tapahtumasta.</div>';
    return;
  }

  notesList.innerHTML = rows
    .map((row) => {
      return `
        <article class="note-card">
          <div class="note-head">
            <span class="note-caller">${escapeHtml(row.soittaja)}</span>
            <span class="note-time">${formatDateTime(row.created_at)}</span>
          </div>
          <p class="note-customer">Asiakas: ${escapeHtml(row.asiakas)}</p>
          <p class="note-comment">${escapeHtml(row.kommentti)}</p>
          <div class="note-actions">
            <button type="button" class="danger-button delete-note-button" data-note-id="${row.id}">
              Poista merkintä
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  notesList.querySelectorAll(".delete-note-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const noteId = button.getAttribute("data-note-id");
      if (!noteId || !selectedEvent) return;
      const confirmed = window.confirm(
        "Haluatko varmasti poistaa tämän merkinnän?"
      );
      if (!confirmed) return;
      await deleteNote(noteId, selectedEvent);
    });
  });
}

function renderHistory() {
  if (!isSupabaseConfigured()) {
    historyStatus.textContent = "Historia näkyy, kun Supabase on käytössä.";
    historyList.innerHTML =
      '<div class="empty-notes">Aseta SUPABASE_URL ja SUPABASE_ANON_KEY nähdäksesi historian.</div>';
    return;
  }

  const now = Date.now();
  const historyEntries = [];

  notesByEventKey.forEach((notes, key) => {
    const first = notes[0];
    if (!first) return;
    const startDateValue = new Date(first.start_date).getTime();
    if (Number.isNaN(startDateValue) || startDateValue >= now) return;
    historyEntries.push({
      key,
      location: first.location,
      start_date: first.start_date,
      notes,
      count: notes.length,
    });
  });

  historyEntries.sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  historyStatus.textContent = `${historyEntries.length} tapahtumaa historiassa`;
  if (historyEntries.length === 0) {
    historyList.innerHTML =
      '<div class="empty-notes">Ei vielä historiallisia merkintöjä.</div>';
    return;
  }

  historyList.innerHTML = historyEntries
    .slice(0, 10)
    .map((entry) => {
      const latestComment = entry.notes[0];
      return `
      <article class="history-item">
        <div class="history-top">
          <h3 class="history-title">
            ${escapeHtml(entry.location)}
            <span class="count-badge">${entry.count}</span>
          </h3>
          <span class="history-date">${formatDateOnly(entry.start_date)}</span>
        </div>
        <p class="history-comment">
          Viimeisin: ${escapeHtml(latestComment.soittaja)} - ${escapeHtml(
        latestComment.kommentti
      )}
        </p>
      </article>
    `;
    })
    .join("");
}

async function refreshAllNotesData() {
  const client = getSupabase();
  if (!client) {
    notesByEventKey = new Map();
    noteCountsByEventKey = new Map();
    renderHistory();
    return;
  }

  const { data, error } = await client
    .from("event_notes")
    .select(
      "id, event_key, location, start_date, soittaja, asiakas, kommentti, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    historyStatus.textContent = `Historian lataus epäonnistui: ${error.message}`;
    historyList.innerHTML = '<div class="empty-notes">Historiaa ei voitu ladata.</div>';
    return;
  }

  const { grouped, counts } = groupNotesByEventKey(data ?? []);
  notesByEventKey = grouped;
  noteCountsByEventKey = counts;
  renderHistory();
}

async function loadNotesForEvent(event) {
  const client = getSupabase();
  if (!client) {
    notesList.innerHTML =
      '<div class="empty-notes">Supabase ei ole vielä käytössä. Aseta ympäristömuuttujat SUPABASE_URL ja SUPABASE_ANON_KEY (Netlify tai paikallinen .env) ja tee uusi build.</div>';
    return;
  }

  notesList.innerHTML = '<div class="empty-notes">Ladataan merkintöjä...</div>';
  await refreshAllNotesData();
  renderNoteCards(notesByEventKey.get(eventKey(event)) ?? []);
}

async function deleteNote(noteId, event) {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client.from("event_notes").delete().eq("id", noteId);
  if (error) {
    alert(`Poisto epäonnistui: ${error.message}`);
    return;
  }
  await refreshAllNotesData();
  renderTable();
  if (selectedEvent) {
    renderNoteCards(notesByEventKey.get(eventKey(selectedEvent)) ?? []);
  } else if (event) {
    renderNoteCards(notesByEventKey.get(eventKey(event)) ?? []);
  }
}

function renderDrawer(event) {
  drawerTitle.textContent = event.title;
  drawerMeta.innerHTML = `
    <div class="meta-row"><span class="meta-label">Sijainti</span><span class="meta-value">${escapeHtml(event.location)}</span></div>
    <div class="meta-row"><span class="meta-label">Päivä ja aika</span><span class="meta-value">${formatDateTime(
      event.startDate
    )}</span></div>
    <div class="meta-row"><span class="meta-label">Varattu yhteensä</span><span class="meta-value">${
      event.bookedTotal
    }</span></div>
    <div class="meta-row"><span class="meta-label">Testivaraukset</span><span class="meta-value">${
      event.bookedFake
    }</span></div>
    <div class="meta-row"><span class="meta-label">Oikeat varaukset</span><span class="meta-value">${
      event.bookedReal
    }</span></div>
    <div class="meta-row"><span class="meta-label">Vapaita paikkoja</span><span class="meta-value">${
      event.remainingReal
    }</span></div>
  `;
  void loadNotesForEvent(event);
}

function openDrawer(event) {
  selectedEvent = event;
  noteForm.classList.add("hidden");
  noteForm.reset();
  renderDrawer(event);
  overlay.classList.remove("hidden");
  eventDrawer.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  eventDrawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  selectedEvent = null;
  overlay.classList.add("hidden");
  eventDrawer.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  eventDrawer.setAttribute("aria-hidden", "true");
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = allEvents.filter((event) => {
    const text = `${event.title} ${event.location}`.toLowerCase();
    return text.includes(query);
  });

  if (filtered.length === 0) {
    eventsBody.innerHTML = `
      <tr>
        <td colspan="7">Ei tuloksia valitulla haulla.</td>
      </tr>
    `;
    statusText.textContent = "Ei tapahtumia näytettävänä.";
    return;
  }

  const rows = filtered
    .map((event, index) => {
      const noteCount = noteCountsByEventKey.get(eventKey(event)) ?? 0;
      return `
      <tr class="clickable-row" data-event-index="${index}" title="Avaa tapahtuman tiedot">
        <td>${escapeHtml(event.title)} <span class="count-badge">${noteCount}</span></td>
        <td>${escapeHtml(event.location)}</td>
        <td>${formatDateOnly(event.startDate)}</td>
        <td>${event.bookedTotal}</td>
        <td>${event.bookedFake}</td>
        <td>${event.bookedReal}</td>
        <td><span class="${getRemainingPillClass(event.remainingReal)}">${event.remainingReal}</span></td>
      </tr>
      `;
    })
    .join("");

  eventsBody.innerHTML = rows;
  statusText.textContent = `Näytetään ${filtered.length} / ${allEvents.length} tapahtumaa.`;

  eventsBody.querySelectorAll(".clickable-row").forEach((row) => {
    row.addEventListener("click", () => {
      const index = Number(row.getAttribute("data-event-index"));
      const event = filtered[index];
      if (event) openDrawer(event);
    });
  });
}

async function loadData() {
  if (!appStarted) return;
  statusText.textContent = "Päivitetään tietoja...";

  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP virhe: ${response.status}`);
    }

    const data = await response.json();
    if (!data.ok || !Array.isArray(data.events)) {
      throw new Error("Vastaus oli virheellisessa muodossa.");
    }

    generatedAt = data.generatedAt ? new Date(data.generatedAt) : new Date();
    allEvents = [...data.events].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );

    await refreshAllNotesData();
    renderTable();
    updatedText.textContent = `Lähde päivitetty: ${formatDateTime(generatedAt)}`;

    if (selectedEvent) {
      const updatedEvent = allEvents.find(
        (event) =>
          event.location === selectedEvent.location &&
          event.startDate === selectedEvent.startDate
      );
      if (updatedEvent) {
        selectedEvent = updatedEvent;
        renderDrawer(updatedEvent);
      } else {
        closeDrawer();
      }
    }
  } catch (error) {
    statusText.textContent = `Virhe datan haussa: ${error.message}`;
    updatedText.textContent = "Yritetään uudelleen automaattisesti.";
    eventsBody.innerHTML = `
      <tr>
        <td colspan="7">Datan haku epäonnistui. Tarkista yhteys ja yritä uudelleen.</td>
      </tr>
    `;
  }
}

searchInput.addEventListener("input", renderTable);
refreshButton.addEventListener("click", () => {
  if (!appStarted) return;
  void loadData();
});
overlay.addEventListener("click", closeDrawer);
closeDrawerButton.addEventListener("click", closeDrawer);
addNoteButton.addEventListener("click", () => {
  if (!isSupabaseConfigured()) return;
  noteForm.classList.toggle("hidden");
  if (!noteForm.classList.contains("hidden")) callerInput.focus();
});

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedEvent) return;

  const client = getSupabase();
  if (!client) return;

  const caller = callerInput.value.trim();
  const customer = customerInput.value.trim();
  const comment = commentInput.value.trim();
  if (!caller || !customer || !comment) return;

  saveNoteButton.disabled = true;

  const { error } = await client.from("event_notes").insert({
    event_key: eventKey(selectedEvent),
    location: selectedEvent.location,
    start_date: selectedEvent.startDate,
    soittaja: caller,
    asiakas: customer,
    kommentti: comment,
  });

  saveNoteButton.disabled = false;

  if (error) {
    alert(`Tallennus epäonnistui: ${error.message}`);
    return;
  }

  noteForm.reset();
  noteForm.classList.add("hidden");
  await refreshAllNotesData();
  renderTable();
  await loadNotesForEvent(selectedEvent);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !eventDrawer.classList.contains("hidden")) {
    closeDrawer();
  }
});

updateNotesFormAvailability();

function startDashboard() {
  if (appStarted) return;
  appStarted = true;
  sessionStorage.setItem(PIN_SESSION_KEY, "1");
  document.body.classList.remove("pin-locked");
  if (pinGate) pinGate.classList.add("hidden");
  void loadData();
  setInterval(loadData, REFRESH_MS);
}

function tryUnlockWithPin() {
  if (!pinInput || !pinError) return;
  const entered = pinInput.value.replace(/\D/g, "").trim();
  if (entered.length !== 4) {
    pinError.textContent = "PIN-koodin pitää olla 4 numeroa.";
    pinError.classList.remove("hidden");
    return;
  }
  if (entered === DASHBOARD_PIN) {
    pinError.classList.add("hidden");
    startDashboard();
  } else {
    pinError.textContent = "Virheellinen PIN-koodi.";
    pinError.classList.remove("hidden");
    pinInput.value = "";
    pinInput.focus();
  }
}

if (pinForm) {
  pinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    tryUnlockWithPin();
  });
}

if (pinSubmitButton) {
  pinSubmitButton.addEventListener("click", (event) => {
    event.preventDefault();
    tryUnlockWithPin();
  });
}

if (pinInput) {
  pinInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      tryUnlockWithPin();
    }
  });

  pinInput.addEventListener("input", () => {
    pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 4);
    if (pinError) pinError.classList.add("hidden");
  });
}

const pinUiAvailable = Boolean(pinGate && pinForm && pinInput && pinError);
if (!pinUiAvailable) {
  // Dev/hot-reload fallback: avoid lock if HTML and JS are momentarily mismatched.
  startDashboard();
} else if (sessionStorage.getItem(PIN_SESSION_KEY) === "1") {
  startDashboard();
} else if (pinInput) {
  pinInput.focus();
}
