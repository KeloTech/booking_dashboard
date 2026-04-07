import { createClient } from "@supabase/supabase-js";

const API_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMXci3_5NkPy0FS_ddSHbzMfeKYyNEXAnA107MsKtOgkoFYt6sLwndImsrlpSIwstTsMfrIrjS7yc2OadtiuyCfIDMzbjaPvMv6Gc-H9n5smZeN0itJyD7X9PW4WkmqzTkz4DD7Yo_al2QJ3EwZ9X17lmYHDZnTmJioPlK0wo4-UnVnW15zBXIK7ubNmNNbJeV1jB3HiPMWH9dUbyLfCSnGEH1Zr5JfBUjUfjCxFBkSfrcgP-LSldLFKHiCCMBIqnqUhuGK5iNpDaHC1fzXhnCREj4ila6IOw5KBDpRt&lib=MfFvjvB14MTaUuGb9I0ppQ7vDcWBALqSa";

const REFRESH_MS = 60000;

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
const noteForm = document.getElementById("noteForm");
const callerInput = document.getElementById("callerInput");
const customerInput = document.getElementById("customerInput");
const commentInput = document.getElementById("commentInput");
const saveNoteButton = document.getElementById("saveNoteButton");
const notesList = document.getElementById("notesList");

let allEvents = [];
let generatedAt = null;
let selectedEvent = null;
let supabaseClient = null;

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

function updateNotesFormAvailability() {
  const ok = isSupabaseConfigured();
  addNoteButton.disabled = !ok;
  saveNoteButton.disabled = !ok;
  callerInput.disabled = !ok;
  customerInput.disabled = !ok;
  commentInput.disabled = !ok;
}

function renderNoteCards(rows) {
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
        </article>
      `;
    })
    .join("");
}

async function loadNotesForEvent(event) {
  const client = getSupabase();
  if (!client) {
    notesList.innerHTML =
      '<div class="empty-notes">Supabase ei ole vielä käytössä. Aseta ympäristömuuttujat SUPABASE_URL ja SUPABASE_ANON_KEY (Netlify tai paikallinen .env) ja tee uusi build.</div>';
    return;
  }

  notesList.innerHTML =
    '<div class="empty-notes">Ladataan merkintöjä...</div>';

  const { data, error } = await client
    .from("event_notes")
    .select("id, soittaja, asiakas, kommentti, created_at")
    .eq("event_key", eventKey(event))
    .order("created_at", { ascending: false });

  if (error) {
    notesList.innerHTML = `<div class="empty-notes">Merkintöjen lataus epäonnistui: ${escapeHtml(error.message)}</div>`;
    return;
  }

  renderNoteCards(data ?? []);
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
      return `
      <tr class="clickable-row" data-event-index="${index}" title="Avaa tapahtuman tiedot">
        <td>${escapeHtml(event.title)}</td>
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
refreshButton.addEventListener("click", loadData);
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
  await loadNotesForEvent(selectedEvent);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !eventDrawer.classList.contains("hidden")) {
    closeDrawer();
  }
});

updateNotesFormAvailability();
loadData();
setInterval(loadData, REFRESH_MS);
