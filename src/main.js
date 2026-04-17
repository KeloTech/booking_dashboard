import { createClient } from "@supabase/supabase-js";

const API_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMXci3_5NkPy0FS_ddSHbzMfeKYyNEXAnA107MsKtOgkoFYt6sLwndImsrlpSIwstTsMfrIrjS7yc2OadtiuyCfIDMzbjaPvMv6Gc-H9n5smZeN0itJyD7X9PW4WkmqzTkz4DD7Yo_al2QJ3EwZ9X17lmYHDZnTmJioPlK0wo4-UnVnW15zBXIK7ubNmNNbJeV1jB3HiPMWH9dUbyLfCSnGEH1Zr5JfBUjUfjCxFBkSfrcgP-LSldLFKHiCCMBIqnqUhuGK5iNpDaHC1fzXhnCREj4ila6IOw5KBDpRt&lib=MfFvjvB14MTaUuGb9I0ppQ7vDcWBALqSa";

const BOOKERS_API_URL = API_URL.includes("?") ? `${API_URL}&mode=bookers` : `${API_URL}?mode=bookers`;

/** API:n testivaraukset (isTest) piilotetaan listasta */
const HIDE_TEST_API_BOOKINGS = true;

const REFRESH_MS = 60000;
const DASHBOARD_PIN = "3105Ranta!4601";
const PIN_SESSION_KEY = "dashboardPinUnlocked";
const TODAY_TARGET = 12;
const WEEKDAY_TARGET = 12;
const WEEK_TARGET_HEADROOM = 1.35;
const CHART_START_HOUR = 7;
const CHART_END_HOUR = 23;
const HOME_VISITS_STORAGE_KEY = "localHomeVisits";
const BOOKINGS_STORAGE_KEY = "localBookings";

/* Netlify / .env: SUPABASE_URL, SUPABASE_ANON_KEY (vite.config: envPrefix SUPABASE_) */
const supabaseUrl = import.meta.env.SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY ?? "";

const eventsBody = document.getElementById("eventsBody");
const toggleEventsButton = document.getElementById("toggleEventsButton");
const searchInput = document.getElementById("searchInput");
const statusText = document.getElementById("statusText");
const updatedText = document.getElementById("updatedText");
const refreshButton = document.getElementById("refreshButton");
const overlay = document.getElementById("overlay");
const eventDrawer = document.getElementById("eventDrawer");
const closeDrawerButton = document.getElementById("closeDrawerButton");
const drawerTitle = document.getElementById("drawerTitle");
const drawerMeta = document.getElementById("drawerMeta");
const drawerSlotList = document.getElementById("drawerSlotList");
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
const navItems = document.querySelectorAll(".nav-item[data-view]");
const dashboardView = document.getElementById("dashboardView");
const calendarView = document.getElementById("calendarView");
const homeVisitsView = document.getElementById("homeVisitsView");
const bookingsView = document.getElementById("bookingsView");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const calendarTabs = document.querySelectorAll(".calendar-tab[data-calendar-mode]");
const toggleHomeVisitFormButton = document.getElementById("toggleHomeVisitFormButton");
const homeVisitForm = document.getElementById("homeVisitForm");
const hvCustomerName = document.getElementById("hvCustomerName");
const hvNickname = document.getElementById("hvNickname");
const hvPhone = document.getElementById("hvPhone");
const hvAddress = document.getElementById("hvAddress");
const hvVisitDate = document.getElementById("hvVisitDate");
const hvVisitTime = document.getElementById("hvVisitTime");
const hvDetails = document.getElementById("hvDetails");
const saveHomeVisitButton = document.getElementById("saveHomeVisitButton");
const todayHomeVisitsList = document.getElementById("todayHomeVisitsList");
const pastHomeVisitsList = document.getElementById("pastHomeVisitsList");
const futureHomeVisitsList = document.getElementById("futureHomeVisitsList");
const bookingsSubtitle = document.getElementById("bookingsSubtitle");
const toggleBookingFormButton = document.getElementById("toggleBookingFormButton");
const bookingForm = document.getElementById("bookingForm");
const bookingCustomerName = document.getElementById("bookingCustomerName");
const bookingPhone = document.getElementById("bookingPhone");
const bookingDate = document.getElementById("bookingDate");
const bookingTime = document.getElementById("bookingTime");
const bookingEventSelect = document.getElementById("bookingEventSelect");
const bookingOwner = document.getElementById("bookingOwner");
const bookingStatus = document.getElementById("bookingStatus");
const deleteBookingButton = document.getElementById("deleteBookingButton");
const saveBookingButton = document.getElementById("saveBookingButton");
const bookingSearchInput = document.getElementById("bookingSearchInput");
const bookingsBody = document.getElementById("bookingsBody");
const todayBookedValue = document.getElementById("todayBookedValue");
const todayTargetValue = document.getElementById("todayTargetValue");
const chartCaption = document.getElementById("chartCaption");
const chartLine = document.getElementById("chartLine");
const chartArea = document.getElementById("chartArea");
const chartDots = document.getElementById("chartDots");
const chartTargetLine = document.getElementById("chartTargetLine");
const chartTargetLabel = document.getElementById("chartTargetLabel");
const chartXAxisLabels = document.getElementById("chartXAxisLabels");
const chartYAxisLabels = document.getElementById("chartYAxisLabels");
const streakValue = document.getElementById("streakValue");
const streakLabel = document.getElementById("streakLabel");
const weekBestValue = document.getElementById("weekBestValue");
const weekBestLabel = document.getElementById("weekBestLabel");
const weekTotalText = document.getElementById("weekTotalText");
const weekProgressText = document.getElementById("weekProgressText");
const weekMonVal = document.getElementById("weekMonVal");
const weekTueVal = document.getElementById("weekTueVal");
const weekWedVal = document.getElementById("weekWedVal");
const weekThuVal = document.getElementById("weekThuVal");
const weekMonBar = document.getElementById("weekMonBar");
const weekTueBar = document.getElementById("weekTueBar");
const weekWedBar = document.getElementById("weekWedBar");
const weekThuBar = document.getElementById("weekThuBar");
const weeklyWrapCard = document.getElementById("weeklyWrapCard");
const weekTargetLine = document.getElementById("weekTargetLine");
const pinGate = document.getElementById("pinGate");
const pinForm = document.getElementById("pinForm");
const pinInput = document.getElementById("pinInput");
const pinError = document.getElementById("pinError");
const pinSubmitButton = document.getElementById("pinSubmitButton");
const dailyBookingsList = document.getElementById("dailyBookingsList");
const dailyBookingsContext = document.getElementById("dailyBookingsContext");
const dailyViewTabs = document.querySelectorAll(".daily-view-tab[data-daily-mode]");

let allEvents = [];
let generatedAt = null;
let selectedEvent = null;
let supabaseClient = null;
let notesByEventKey = new Map();
let noteCountsByEventKey = new Map();
let appStarted = false;
let homeVisits = [];
let editingHomeVisitId = null;
let activeView = "dashboard";
let calendarMode = "all";
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let bookings = [];
let editingBookingId = null;
let showAllEvents = false;
/** Päänäkymän "Päivän varaukset" -osion tapahtuma (eventKey) */
let focusedEventKeyForDaily = null;
let dailyBookingsViewMode = "day";

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

function getBookingColorClass(count) {
  if (count >= 12) return "is-good";
  if (count >= 6) return "is-warn";
  return "is-low";
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

function getFilteredDashboardEvents() {
  const query = searchInput.value.trim().toLowerCase();
  return allEvents.filter((event) => {
    const text = `${event.title ?? ""} ${event.location}`.toLowerCase();
    return text.includes(query);
  });
}

function getApiBookingsFromEvent(event) {
  const raw = event?.bookings;
  return Array.isArray(raw) ? raw : [];
}

function normalizeApiBookingRow(raw) {
  return {
    bookingDate: raw.bookingDate ?? raw.booking_date ?? "",
    name: String(raw.name ?? raw.customer_name ?? "").trim(),
    phone: String(raw.phone ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    status: raw.status ?? "",
    isTest: Boolean(raw.isTest ?? raw.is_test),
    service: String(
      raw.service ?? raw.serviceType ?? raw.type ?? raw.bookingType ?? raw.notes ?? ""
    ).trim(),
  };
}

/** Varattavuusruudukko: oikea varaus, ei dummy/testi/peruttu */
function isApiBookingRealOccupancy(raw) {
  if (!raw || typeof raw !== "object") return false;
  const norm = normalizeApiBookingRow(raw);
  if (norm.isTest) return false;
  if (
    Boolean(raw.isDummy ?? raw.is_dummy ?? raw.dummy ?? raw.isFake ?? raw.fake ?? raw.is_fake)
  ) {
    return false;
  }
  const typeHint = String(
    raw.bookingType ?? raw.booking_type ?? raw.type ?? ""
  )
    .toLowerCase()
    .trim();
  if (typeHint === "dummy" || typeHint === "fake" || typeHint === "test") return false;
  if (isCancelledApiBookingStatus(norm.status)) return false;
  return true;
}

const DRAWER_SLOT_STEP_MIN = 15;
const DRAWER_SLOT_MAX_ROWS = 64;

function addMinutesToDate(d, mins) {
  const x = new Date(d.getTime());
  x.setMinutes(x.getMinutes() + mins);
  return x;
}

function floorToQuarterHour(d) {
  const x = new Date(d.getTime());
  const mins = x.getMinutes();
  x.setMinutes(Math.floor(mins / DRAWER_SLOT_STEP_MIN) * DRAWER_SLOT_STEP_MIN, 0, 0);
  return x;
}

function ceilToQuarterHour(d) {
  const x = new Date(d.getTime());
  let mins = x.getMinutes();
  const extra = x.getSeconds() + x.getMilliseconds() / 1000;
  if (mins % DRAWER_SLOT_STEP_MIN === 0 && extra === 0) return x;
  mins = Math.ceil(mins / DRAWER_SLOT_STEP_MIN) * DRAWER_SLOT_STEP_MIN;
  if (mins >= 60) {
    x.setHours(x.getHours() + 1, 0, 0, 0);
    return x;
  }
  x.setMinutes(mins, 0, 0);
  return x;
}

function parseApiBookingInstant(bookingDateRaw, fallbackEventStart) {
  if (!bookingDateRaw) return new Date(fallbackEventStart);
  const str = String(bookingDateRaw).trim();
  const direct = new Date(str);
  if (!Number.isNaN(direct.getTime())) return direct;
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const base = new Date(fallbackEventStart);
    const [hh, mm] = str.split(":").map((n) => Number(n));
    base.setHours(hh, mm, 0, 0);
    return base;
  }
  return new Date(fallbackEventStart);
}

function formatBookingTimeFi(instant) {
  if (Number.isNaN(instant.getTime())) return "—";
  return new Intl.DateTimeFormat("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(instant);
}

function getIsoWeekDateKeys(anchorDate) {
  const d = new Date(anchorDate);
  const mondayOffset = (d.getDay() + 6) % 7;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - mondayOffset);
  const keys = [];
  for (let i = 0; i < 7; i += 1) {
    const x = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    keys.push(formatIsoDateKey(x));
  }
  return keys;
}

function mapApiBookingStatusBadge(statusRaw) {
  const s = String(statusRaw || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  if (s === "booked" || s === "vahvistettu" || s === "confirmed" || s === "confirmé") {
    return { label: "Vahvistettu", variant: "confirmed", icon: "check", strikeName: false };
  }
  if (
    s === "completed" ||
    s === "valmis" ||
    s === "done" ||
    s === "finished" ||
    s === "paid"
  ) {
    return { label: "Valmis", variant: "done", icon: "check", strikeName: true };
  }
  if (s === "pending" || s === "odottaa" || s === "waiting" || s === "new") {
    return { label: "Odottaa", variant: "pending", icon: "clock", strikeName: false };
  }
  if (s === "tentative" || s === "alustava" || s === "hold" || s === "provisional") {
    return { label: "Alustava", variant: "tentative", icon: "question", strikeName: false };
  }
  if (s === "cancelled" || s === "canceled" || s === "peruttu") {
    return { label: "Peruttu", variant: "cancelled", icon: "none", strikeName: false };
  }
  if (s) {
    const label = s
      .split("_")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");
    return { label: label || "Tuntematon", variant: "neutral", icon: "none", strikeName: false };
  }
  return { label: "Odottaa", variant: "pending", icon: "clock", strikeName: false };
}

function bookingBadgeIconMarkup(icon) {
  if (icon === "check") return `<span class="daily-badge-icon" aria-hidden="true">✓</span>`;
  if (icon === "clock") return `<span class="daily-badge-icon" aria-hidden="true">⏱</span>`;
  if (icon === "question") return `<span class="daily-badge-icon" aria-hidden="true">?</span>`;
  return "";
}

function buildBookingSubtitle(norm, eventRow, isWeek) {
  let line = "";
  if (norm.service) line = norm.service;
  else {
    const contact = [norm.phone, norm.email].filter(Boolean).join(" · ");
    line = contact || String(eventRow.location ?? "").trim();
  }
  if (isWeek) {
    const suffix = formatDateOnly(eventRow.startDate);
    line = line ? `${line} · ${suffix}` : suffix;
  }
  return escapeHtml(line);
}

function renderDailyBookings() {
  if (!dailyBookingsList) return;

  const filtered = getFilteredDashboardEvents();
  if (filtered.length === 0) {
    dailyBookingsList.innerHTML = `<div class="empty-daily-bookings">Ei tapahtumia — varauslistaa ei näytetä.</div>`;
    if (dailyBookingsContext) dailyBookingsContext.textContent = "";
    return;
  }

  if (
    !focusedEventKeyForDaily ||
    !filtered.some((e) => eventKey(e) === focusedEventKeyForDaily)
  ) {
    focusedEventKeyForDaily = eventKey(filtered[0]);
  }

  const focusEvent =
    filtered.find((e) => eventKey(e) === focusedEventKeyForDaily) ?? filtered[0];
  const isWeek = dailyBookingsViewMode === "week";

  const query = searchInput.value.trim().toLowerCase();
  let rows = [];
  if (isWeek) {
    const weekKeys = getIsoWeekDateKeys(new Date(focusEvent.startDate));
    for (const ev of allEvents) {
      if (!weekKeys.includes(formatIsoDateKey(new Date(ev.startDate)))) continue;
      const text = `${ev.title ?? ""} ${ev.location}`.toLowerCase();
      if (query && !text.includes(query)) continue;
      for (const raw of getApiBookingsFromEvent(ev)) {
        rows.push({ raw, event: ev });
      }
    }
  } else {
    for (const raw of getApiBookingsFromEvent(focusEvent)) {
      rows.push({ raw, event: focusEvent });
    }
  }

  rows = rows
    .map(({ raw, event }) => {
      const norm = normalizeApiBookingRow(raw);
      if (HIDE_TEST_API_BOOKINGS && norm.isTest) return null;
      const instant = parseApiBookingInstant(norm.bookingDate, event.startDate);
      return { norm, event, instant };
    })
    .filter(Boolean);

  rows.sort((a, b) => a.instant.getTime() - b.instant.getTime());

  if (dailyBookingsContext) {
    dailyBookingsContext.textContent = `${focusEvent.location ?? ""} · ${formatDateOnly(
      focusEvent.startDate
    )}${isWeek ? " (koko viikko)" : ""}`;
  }

  if (rows.length === 0) {
    dailyBookingsList.innerHTML = `<div class="empty-daily-bookings">Ei varauksia${
      isWeek ? " tällä viikolla" : " tälle päivälle"
    }.</div>`;
    return;
  }

  const html = rows
    .map(({ norm, event, instant }) => {
      const badge = mapApiBookingStatusBadge(norm.status);
      const timeStr = formatBookingTimeFi(instant);
      const sub = buildBookingSubtitle(norm, event, isWeek);
      const nameClass = badge.strikeName ? "daily-booking-name is-done" : "daily-booking-name";
      return `
        <div class="daily-booking-row">
          <div class="daily-booking-time">${escapeHtml(timeStr)}</div>
          <div class="daily-booking-main">
            <p class="${nameClass}">${escapeHtml(norm.name || "—")}</p>
            <p class="daily-booking-sub">${sub}</p>
          </div>
          <div>
            <span class="daily-booking-badge badge-${badge.variant}">
              ${bookingBadgeIconMarkup(badge.icon)}
              ${escapeHtml(badge.label)}
            </span>
          </div>
        </div>`;
    })
    .join("");

  dailyBookingsList.innerHTML = html;
}

function syncDailyViewTabsUi() {
  if (!dailyViewTabs || dailyViewTabs.length === 0) return;
  dailyViewTabs.forEach((tab) => {
    const mode = tab.dataset.dailyMode || "day";
    const active = mode === dailyBookingsViewMode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatIsoDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getBookingDateTime(entry) {
  return new Date(`${entry.booking_date}T${entry.booking_time || "00:00"}:00`);
}

function getDayCountMap(bookingsList) {
  const map = new Map();
  bookingsList.forEach((entry) => {
    if (!entry.booking_date) return;
    const date = new Date(`${entry.booking_date}T00:00:00`);
    if (Number.isNaN(date.getTime())) return;
    const key = formatIsoDateKey(date);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return map;
}

function getCreatedDayCountMap(bookingsList) {
  const map = new Map();
  bookingsList.forEach((entry) => {
    const createdAt = new Date(entry.created_at || entry.booking_date);
    if (Number.isNaN(createdAt.getTime())) return;
    const key = formatIsoDateKey(createdAt);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return map;
}

function isConfirmedBooking(entry) {
  const status = String(entry.status || "").toLowerCase();
  return status === "vahvistettu";
}

function isEventBooking(entry) {
  const type = String(entry.booking_type || "").toLowerCase();
  return type === "tapahtumavaraus" || Boolean(entry.event_key);
}

function isActiveEventBooking(entry) {
  const status = String(entry.status || "").toLowerCase();
  return isEventBooking(entry) && status !== "peruttu";
}

function getCurrentStreak(dayCountMap) {
  let streak = 0;
  const cursor = startOfDay(new Date());
  while (true) {
    const key = formatIsoDateKey(cursor);
    if ((dayCountMap.get(key) ?? 0) <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatMonthYearFi(date) {
  return new Intl.DateTimeFormat("fi-FI", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function setActiveNav(view) {
  navItems.forEach((item) => {
    const isActive = item.dataset.view === view;
    item.classList.toggle("active", isActive);
  });
}

function switchView(view) {
  activeView = view;
  dashboardView?.classList.toggle("hidden", view !== "dashboard");
  calendarView?.classList.toggle("hidden", view !== "calendar");
  homeVisitsView?.classList.toggle("hidden", view !== "homeVisits");
  bookingsView?.classList.toggle("hidden", view !== "bookings");
  setActiveNav(view);
  if (view === "calendar") renderCalendar();
  if (view === "homeVisits") renderHomeVisits();
  if (view === "bookings") renderBookings();
}

function getLocalHomeVisits() {
  try {
    const raw = localStorage.getItem(HOME_VISITS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalHomeVisits(entries) {
  localStorage.setItem(HOME_VISITS_STORAGE_KEY, JSON.stringify(entries));
}

function getLocalBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalBookings(entries) {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(entries));
}

function getEventsForDate(dateValue) {
  if (!dateValue) return [];
  return allEvents.filter((event) => formatIsoDateKey(new Date(event.startDate)) === dateValue);
}

function updateBookingEventOptions(preferredEventKey = "") {
  if (!bookingDate || !bookingEventSelect) return;
  const events = getEventsForDate(bookingDate.value);
  if (events.length === 0) {
    bookingEventSelect.innerHTML = '<option value="">Ei tapahtumia valitulla päivällä</option>';
    bookingEventSelect.value = "";
    return;
  }
  bookingEventSelect.innerHTML = events
    .map((event) => {
      const label = event.location;
      return `<option value="${escapeHtml(eventKey(event))}">${escapeHtml(label)}</option>`;
    })
    .join("");
  if (preferredEventKey && events.some((event) => eventKey(event) === preferredEventKey)) {
    bookingEventSelect.value = preferredEventKey;
  } else if (events.length === 1) {
    bookingEventSelect.value = eventKey(events[0]);
  }
}

function getStatusLabel(status) {
  if (status === "vahvistettu") return "Vahvistettu";
  if (status === "peruttu") return "Peruttu";
  return "Odottaa";
}

function getEventLocationLabel(entry) {
  const raw = String(entry.event_name || "").trim();
  if (!raw) return "Ei tapahtumaa";
  if (raw.includes(" - ")) return raw.split(" - ").at(-1)?.trim() || raw;
  return raw;
}

function populateTimeOptions(selectElement) {
  if (!selectElement) return;
  const options = ['<option value="">Valitse aika</option>'];
  for (let hour = 5; hour <= 23; hour += 1) {
    const hh = String(hour).padStart(2, "0");
    options.push(`<option value="${hh}:00">${hh}:00</option>`);
    options.push(`<option value="${hh}:15">${hh}:15</option>`);
    options.push(`<option value="${hh}:30">${hh}:30</option>`);
    options.push(`<option value="${hh}:45">${hh}:45</option>`);
  }
  selectElement.innerHTML = options.join("");
}

function buildBookingTimeOptions() {
  populateTimeOptions(bookingTime);
}

function buildHomeVisitTimeOptions() {
  populateTimeOptions(hvVisitTime);
}

function renderBookings() {
  if (!bookingsBody) return;
  const query = bookingSearchInput?.value.trim().toLowerCase() ?? "";
  const filtered = bookings
    .filter(isEventBooking)
    .filter((entry) => {
      const haystack =
        `${entry.customer_name} ${entry.phone ?? ""} ${entry.booking_type ?? ""} ${entry.owner ?? ""} ${entry.event_name ?? ""}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => {
      const aCreated = new Date(a.created_at || `${a.booking_date}T${a.booking_time || "00:00"}:00`);
      const bCreated = new Date(b.created_at || `${b.booking_date}T${b.booking_time || "00:00"}:00`);
      return bCreated - aCreated;
    });

  if (bookingsSubtitle) {
    bookingsSubtitle.textContent = `Hallinnoi ja merkitse tapahtumavarauksia. Sinulla on ${filtered.length} merkintää.`;
  }

  if (filtered.length === 0) {
    bookingsBody.innerHTML = '<tr><td colspan="7">Ei varauksia näytettäväksi.</td></tr>';
    return;
  }

  bookingsBody.innerHTML = filtered
    .map((entry) => {
      const statusClass = `status-${entry.status || "odottaa"}`;
      const ownerText = entry.owner?.trim() || "-";
      const ownerClass = entry.owner?.trim() ? "" : "empty";
      const locationLabel = getEventLocationLabel(entry);
      const eventMeta = `${formatDateOnly(entry.booking_date)} klo ${entry.booking_time || "--:--"}`;
      const createdAtLabel = entry.created_at ? formatDateTime(entry.created_at) : "-";
      return `
        <tr>
          <td>${escapeHtml(entry.customer_name)}</td>
          <td>
            <div class="event-cell-main">${escapeHtml(locationLabel)}</div>
            <div class="event-cell-meta">${escapeHtml(eventMeta)}</div>
          </td>
          <td>${escapeHtml(createdAtLabel)}</td>
          <td>${escapeHtml(entry.phone || "-")}</td>
          <td><span class="status-pill ${statusClass}">${getStatusLabel(entry.status)}</span></td>
          <td><span class="name-chip ${ownerClass}" title="${escapeHtml(
        ownerText
      )}">${escapeHtml(ownerText)}</span></td>
          <td><button type="button" class="table-edit-button" data-booking-edit-id="${entry.id}">Muokkaa</button></td>
        </tr>
      `;
    })
    .join("");

  bookingsBody.querySelectorAll("[data-booking-edit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-booking-edit-id");
      if (!id) return;
      const entry = bookings.find((candidate) => candidate.id === id);
      if (!entry) return;
      startBookingEdit(entry);
    });
  });
}

async function loadBookings() {
  const client = getSupabase();
  if (!client) {
    bookings = getLocalBookings();
    renderBookings();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    return;
  }

  const { data, error } = await client
    .from("bookings")
    .select(
      "id, customer_name, phone, booking_type, booking_date, booking_time, event_key, event_name, status, owner, created_at"
    )
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });

  if (error) {
    bookings = getLocalBookings();
    renderBookings();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    return;
  }
  bookings = data ?? [];
  renderBookings();
  renderOverviewStats(bookings);
  renderCalendar();
  renderHistory();
}

async function saveBooking(entry) {
  const client = getSupabase();
  if (!client) {
    const next = [
      ...bookings,
      { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...entry },
    ];
    bookings = next;
    setLocalBookings(next);
    renderBookings();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    return { ok: true };
  }
  const { error } = await client.from("bookings").insert(entry);
  if (error) return { ok: false, message: error.message };
  await loadBookings();
  return { ok: true };
}

async function updateBooking(id, entry) {
  const client = getSupabase();
  if (!client) {
    bookings = bookings.map((item) => (item.id === id ? { ...item, ...entry } : item));
    setLocalBookings(bookings);
    renderBookings();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    return { ok: true };
  }
  const { error } = await client.from("bookings").update(entry).eq("id", id);
  if (error) return { ok: false, message: error.message };
  await loadBookings();
  return { ok: true };
}

async function deleteBooking(id) {
  const client = getSupabase();
  if (!client) {
    bookings = bookings.filter((item) => item.id !== id);
    setLocalBookings(bookings);
    renderBookings();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    return { ok: true };
  }
  const { error } = await client.from("bookings").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  await loadBookings();
  return { ok: true };
}

function resetBookingFormState() {
  editingBookingId = null;
  if (saveBookingButton) saveBookingButton.textContent = "Tallenna varaus";
  if (toggleBookingFormButton) toggleBookingFormButton.textContent = "+ Uusi varaus";
  if (deleteBookingButton) deleteBookingButton.classList.add("hidden");
}

function startBookingEdit(entry) {
  if (!bookingForm || !bookingCustomerName || !bookingDate || !bookingTime) return;
  editingBookingId = entry.id;
  bookingForm.classList.remove("hidden");
  bookingCustomerName.value = entry.customer_name || "";
  if (bookingPhone) bookingPhone.value = entry.phone || "";
  bookingDate.value = entry.booking_date || "";
  buildBookingTimeOptions();
  bookingTime.value = entry.booking_time || "";
  updateBookingEventOptions(entry.event_key || "");
  if (bookingOwner) bookingOwner.value = entry.owner || "";
  if (bookingStatus) bookingStatus.value = entry.status || "odottaa";
  if (saveBookingButton) saveBookingButton.textContent = "Tallenna muutokset";
  if (toggleBookingFormButton) toggleBookingFormButton.textContent = "Peruuta muokkaus";
  if (deleteBookingButton) deleteBookingButton.classList.remove("hidden");
  bookingCustomerName.focus();
}

async function loadHomeVisits() {
  const client = getSupabase();
  if (!client) {
    homeVisits = getLocalHomeVisits();
    renderOverviewStats();
    renderCalendar();
    renderHomeVisits();
    return;
  }
  const { data, error } = await client
    .from("home_visits")
    .select("id, customer_name, nickname, phone, address, visit_time, details, status, created_at")
    .order("visit_time", { ascending: true });

  if (error) {
    homeVisits = getLocalHomeVisits();
    renderOverviewStats();
    renderCalendar();
    renderHomeVisits();
    return;
  }
  homeVisits = data ?? [];
  renderOverviewStats();
  renderCalendar();
  renderHomeVisits();
}

async function saveHomeVisit(entry) {
  const client = getSupabase();
  if (!client) {
    const next = [
      ...homeVisits,
      { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...entry },
    ];
    homeVisits = next;
    setLocalHomeVisits(next);
    renderOverviewStats();
    renderCalendar();
    renderHomeVisits();
    return { ok: true };
  }

  const { error } = await client.from("home_visits").insert(entry);
  if (error) return { ok: false, message: error.message };
  await loadHomeVisits();
  return { ok: true };
}

async function updateHomeVisit(id, entry) {
  const client = getSupabase();
  if (!client) {
    homeVisits = homeVisits.map((visit) => (visit.id === id ? { ...visit, ...entry } : visit));
    setLocalHomeVisits(homeVisits);
    renderOverviewStats();
    renderCalendar();
    renderHomeVisits();
    return { ok: true };
  }
  const { error } = await client.from("home_visits").update(entry).eq("id", id);
  if (error) return { ok: false, message: error.message };
  await loadHomeVisits();
  return { ok: true };
}

function resetHomeVisitFormState() {
  editingHomeVisitId = null;
  if (saveHomeVisitButton) saveHomeVisitButton.textContent = "Tallenna kotikäynti";
  if (toggleHomeVisitFormButton) toggleHomeVisitFormButton.textContent = "+ Uusi kotikäynti";
}

function startHomeVisitEdit(item) {
  if (!homeVisitForm || !hvCustomerName || !hvAddress || !hvVisitDate || !hvVisitTime || !hvDetails) {
    return;
  }
  editingHomeVisitId = item.id;
  homeVisitForm.classList.remove("hidden");
  hvCustomerName.value = item.customer_name || "";
  if (hvNickname) hvNickname.value = item.nickname || "";
  if (hvPhone) hvPhone.value = item.phone || "";
  hvAddress.value = item.address || "";
  const dateObj = new Date(item.visit_time);
  if (!Number.isNaN(dateObj.getTime())) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    hvVisitDate.value = `${yyyy}-${mm}-${dd}`;
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    hvVisitTime.value = `${hh}:${min}`;
  } else {
    hvVisitDate.value = "";
    hvVisitTime.value = "";
  }
  hvDetails.value = item.details || "";
  if (saveHomeVisitButton) saveHomeVisitButton.textContent = "Tallenna muutokset";
  if (toggleHomeVisitFormButton) toggleHomeVisitFormButton.textContent = "Peruuta muokkaus";
  hvCustomerName.focus();
}

async function updateHomeVisitStatus(id, status) {
  const client = getSupabase();
  if (!client) {
    homeVisits = homeVisits.map((visit) => (visit.id === id ? { ...visit, status } : visit));
    setLocalHomeVisits(homeVisits);
    renderOverviewStats();
    renderHomeVisits();
    return;
  }
  const { error } = await client.from("home_visits").update({ status }).eq("id", id);
  if (!error) await loadHomeVisits();
}

function renderHomeVisitItems(items, container) {
  if (!container) return;
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-notes">Ei merkintöjä tässä näkymässä.</div>';
    return;
  }
  container.innerHTML = items
    .map((item) => {
      const status = item.status || "sovittu";
      const nicknameText = item.nickname?.trim();
      const timeLabel = formatDateTime(item.visit_time);
      const phoneLabel = item.phone?.trim() ? item.phone : "-";
      return `
        <article class="home-visit-item">
          <div class="home-visit-head">
            <div>
              <h4 class="home-visit-title">
              ${escapeHtml(item.customer_name)}
              ${
                nicknameText
                  ? `<span class="name-chip" title="${escapeHtml(nicknameText)}">${escapeHtml(
                      nicknameText
                    )}</span>`
                  : ""
              }
              </h4>
              <p class="home-visit-meta-line">
                <span><strong>Aika:</strong> ${escapeHtml(timeLabel)}</span>
                <span><strong>Osoite:</strong> ${escapeHtml(item.address)}</span>
                <span><strong>Puhelin:</strong> ${escapeHtml(phoneLabel)}</span>
              </p>
              <p class="home-visit-note">${escapeHtml(item.details)}</p>
            </div>
            <div class="home-visit-actions">
              <button type="button" class="table-edit-button" data-home-visit-edit-id="${item.id}">
                Muokkaa
              </button>
              <select class="home-visit-select home-visit-status-select" data-home-visit-status-id="${item.id}">
                <option value="sovittu" ${status === "sovittu" ? "selected" : ""}>Sovittu</option>
                <option value="valmis" ${status === "valmis" ? "selected" : ""}>Valmis</option>
              </select>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll("[data-home-visit-edit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-home-visit-edit-id");
      if (!id) return;
      const item = homeVisits.find((visit) => visit.id === id);
      if (!item) return;
      startHomeVisitEdit(item);
    });
  });

  container.querySelectorAll("[data-home-visit-status-id]").forEach((select) => {
    select.addEventListener("change", async () => {
      const id = select.getAttribute("data-home-visit-status-id");
      if (!id) return;
      await updateHomeVisitStatus(id, select.value);
      renderCalendar();
    });
  });
}

function renderHomeVisits() {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const todayItems = homeVisits.filter((item) => {
    const visitTime = new Date(item.visit_time);
    return visitTime >= today && visitTime < tomorrow;
  }).sort((a, b) => new Date(a.visit_time) - new Date(b.visit_time));
  const pastItems = homeVisits
    .filter((item) => new Date(item.visit_time) < today)
    .sort((a, b) => new Date(b.visit_time) - new Date(a.visit_time));
  const futureItems = homeVisits
    .filter((item) => new Date(item.visit_time) >= tomorrow)
    .sort((a, b) => new Date(a.visit_time) - new Date(b.visit_time));
  renderHomeVisitItems(futureItems, futureHomeVisitsList);
  renderHomeVisitItems(todayItems, todayHomeVisitsList);
  renderHomeVisitItems(pastItems, pastHomeVisitsList);
}

function isCancelledApiBookingStatus(statusRaw) {
  const s = String(statusRaw || "")
    .toLowerCase()
    .trim();
  return s === "peruttu" || s === "cancelled" || s === "canceled";
}

function getCalendarDailyCountMaps() {
  const bookingMap = new Map();

  bookings.filter(isActiveEventBooking).forEach((entry) => {
    if (!entry.booking_date) return;
    const date = new Date(`${entry.booking_date}T12:00:00`);
    if (Number.isNaN(date.getTime())) return;
    const key = formatIsoDateKey(startOfDay(date));
    bookingMap.set(key, (bookingMap.get(key) ?? 0) + 1);
  });

  for (const ev of allEvents) {
    for (const raw of getApiBookingsFromEvent(ev)) {
      const norm = normalizeApiBookingRow(raw);
      if (HIDE_TEST_API_BOOKINGS && norm.isTest) continue;
      if (isCancelledApiBookingStatus(norm.status)) continue;
      const instant = parseApiBookingInstant(norm.bookingDate, ev.startDate);
      if (Number.isNaN(instant.getTime())) continue;
      const key = formatIsoDateKey(startOfDay(instant));
      bookingMap.set(key, (bookingMap.get(key) ?? 0) + 1);
    }
  }

  const homeMap = new Map();
  homeVisits.forEach((visit) => {
    const status = String(visit.status || "").toLowerCase();
    if (status !== "sovittu" && status !== "valmis") return;
    const visitTs = visit.visit_time ?? visit.visit_date;
    if (!visitTs) return;
    const date = new Date(visitTs);
    if (Number.isNaN(date.getTime())) return;
    const key = formatIsoDateKey(startOfDay(date));
    homeMap.set(key, (homeMap.get(key) ?? 0) + 1);
  });
  return { bookingMap, homeMap };
}

function renderCalendar() {
  if (!calendarGrid || !calendarMonthLabel) return;
  const monthStart = startOfMonth(calendarCursor);
  calendarMonthLabel.textContent = formatMonthYearFi(monthStart);

  const first = new Date(monthStart);
  const firstWeekDay = first.getDay() === 0 ? 7 : first.getDay();
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - (firstWeekDay - 1));
  const { bookingMap, homeMap } = getCalendarDailyCountMaps();
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    const key = formatIsoDateKey(day);
    const bookingCount = bookingMap.get(key) ?? 0;
    const homeCount = homeMap.get(key) ?? 0;
    const isCurrentMonth = day.getMonth() === monthStart.getMonth();
    const bookingClass = calendarMode === "bookings" ? "emphasis" : "";
    const homeClass = calendarMode === "homeVisits" ? "emphasis" : "";
    cells.push(`
      <article class="calendar-cell ${isCurrentMonth ? "" : "muted-day"}">
        <span class="calendar-day">${day.getDate()}</span>
        <div class="calendar-metrics">
          <span class="day-badge booking ${bookingClass}">Varaukset: ${bookingCount}</span>
          <span class="day-badge home ${homeClass}">Kotikäynnit: ${homeCount}</span>
        </div>
      </article>
    `);
  }
  calendarGrid.innerHTML = cells.join("");
}

function drawTodayChart(hourlyCounts, target, yAxisMax) {
  if (
    !chartLine ||
    !chartDots ||
    !chartArea ||
    !chartTargetLine ||
    !chartTargetLabel ||
    !chartXAxisLabels ||
    !chartYAxisLabels
  ) {
    return;
  }
  const width = 680;
  const height = 260;
  const left = 42;
  const right = width - 12;
  const bottom = height - 30;
  const top = 22;
  const steps = hourlyCounts.length - 1;
  const maxValue = Math.max(yAxisMax, target, ...hourlyCounts, 1);
  const points = hourlyCounts.map((count, index) => {
    const x = left + ((right - left) * index) / Math.max(steps, 1);
    const y = bottom - ((bottom - top) * count) / maxValue;
    return { x, y, count };
  });
  const now = new Date();
  const nextWholeHour =
    now.getHours() + (now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0 ? 1 : 0);
  const visibleHour = Math.min(CHART_END_HOUR, Math.max(CHART_START_HOUR, nextWholeHour));
  const visibleIndex = Math.min(points.length - 1, Math.max(0, visibleHour - CHART_START_HOUR));
  const visiblePoints = points.slice(0, visibleIndex + 1);

  const smoothPath = visiblePoints.reduce((path, point, index, arr) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    const prev = arr[index - 1];
    const midX = ((prev.x + point.x) / 2).toFixed(1);
    return `${path} Q ${midX} ${prev.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, "");
  chartDots.innerHTML = "";
  const lastVisiblePoint = visiblePoints[visiblePoints.length - 1] || points[0];
  chartArea.setAttribute(
    "d",
    `${smoothPath} L ${lastVisiblePoint.x.toFixed(1)} ${bottom.toFixed(
      1
    )} L ${left.toFixed(1)} ${bottom.toFixed(1)} Z`
  );
  chartLine.setAttribute("d", smoothPath);
  const targetY = bottom - ((bottom - top) * target) / maxValue;
  chartTargetLine.setAttribute("x1", String(left));
  chartTargetLine.setAttribute("x2", String(right));
  chartTargetLine.setAttribute("y1", targetY.toFixed(1));
  chartTargetLine.setAttribute("y2", targetY.toFixed(1));
  chartTargetLabel.setAttribute("x", String(right - 45));
  chartTargetLabel.setAttribute("y", String(Math.max(targetY - 8, 12)));

  const xLabels = [];
  for (let hour = CHART_START_HOUR; hour <= CHART_END_HOUR; hour += 2) {
    const index = hour - CHART_START_HOUR;
    const x = left + ((right - left) * index) / Math.max(steps, 1);
    xLabels.push(`<text x="${x.toFixed(1)}" y="${height - 8}">${hour}:00</text>`);
  }
  chartXAxisLabels.innerHTML = xLabels.join("");

  const yLabels = [];
  const yValues = yAxisMax <= 15 ? [0, 4, 8, 12, 15] : [0, 6, 12, 18, 24, 30];
  yValues.forEach((value) => {
    const y = bottom - ((bottom - top) * value) / yAxisMax;
    yLabels.push(`<text x="${left - 6}" y="${(y + 3).toFixed(1)}">${value}</text>`);
  });
  chartYAxisLabels.innerHTML = yLabels.join("");
}

function renderOverviewStats(bookingsList = bookings) {
  if (!todayBookedValue || !todayTargetValue || !chartCaption) return;
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeEventBookings = bookingsList.filter(isActiveEventBooking);
  const manualHomeVisits = homeVisits.filter((visit) => {
    const status = String(visit.status || "").toLowerCase();
    return status === "sovittu" || status === "valmis";
  });
  const manualEntries = [
    ...activeEventBookings.map((entry) => ({ created_at: entry.created_at, status: entry.status })),
    ...manualHomeVisits.map((visit) => ({ created_at: visit.created_at || visit.visit_time, status: visit.status })),
  ];

  const todayEntries = manualEntries.filter((entry) => {
    const createdAt = new Date(entry.created_at);
    return createdAt >= todayStart && createdAt < tomorrow;
  });
  const todayCount = todayEntries.length;
  todayBookedValue.textContent = String(todayCount);
  todayTargetValue.textContent = String(TODAY_TARGET);

  if (todayCount >= TODAY_TARGET) {
    chartCaption.textContent = `Tavoite ylitetty ${todayCount - TODAY_TARGET} varauksella`;
  } else {
    chartCaption.textContent = `Vielä ${TODAY_TARGET - todayCount} varausta tavoitteeseen`;
  }

  const rangeLength = CHART_END_HOUR - CHART_START_HOUR + 1;
  const hourly = Array.from({ length: rangeLength }, () => 0);
  todayEntries.forEach((entry) => {
    const createdAt = new Date(entry.created_at);
    const decimalHour =
      createdAt.getHours() +
      createdAt.getMinutes() / 60 +
      createdAt.getSeconds() / 3600 +
      createdAt.getMilliseconds() / 3600000;
    const bucketHour = Math.ceil(decimalHour);
    if (bucketHour < CHART_START_HOUR) {
      hourly[0] += 1;
    } else if (bucketHour > CHART_END_HOUR) {
      hourly[rangeLength - 1] += 1;
    } else {
      hourly[bucketHour - CHART_START_HOUR] += 1;
    }
  });
  const cumulative = [];
  let sum = 0;
  hourly.forEach((value) => {
    sum += value;
    cumulative.push(sum);
  });
  const yAxisMax = todayCount >= TODAY_TARGET ? 30 : 15;
  drawTodayChart(cumulative, TODAY_TARGET, yAxisMax);

  const dayCountMap = getCreatedDayCountMap(
    manualEntries.map((entry) => ({ created_at: entry.created_at }))
  );
  if (streakValue && streakLabel) {
    const streak = getCurrentStreak(dayCountMap);
    streakValue.textContent = String(streak);
    streakLabel.textContent =
      streak === 1 ? "peräkkäinen päivä varauksia" : "peräkkäistä päivää varauksia";
  }

  if (
    !weekTotalText ||
    !weekProgressText ||
    !weekMonVal ||
    !weekTueVal ||
    !weekWedVal ||
    !weekThuVal ||
    !weekMonBar ||
    !weekTueBar ||
    !weekWedBar ||
    !weekThuBar
  ) {
    return;
  }

  const monday = startOfDay(now);
  const dayOfWeek = monday.getDay();
  const shift = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - shift);
  const dates = Array.from({ length: 4 }, (_, idx) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + idx);
    return day;
  });
  const counts = dates.map((date) => dayCountMap.get(formatIsoDateKey(date)) ?? 0);
  const weekTotal = counts.reduce((acc, value) => acc + value, 0);
  const weekTarget = WEEKDAY_TARGET * 4;
  weekTotalText.textContent = `${weekTotal} / ${weekTarget}`;
  weekProgressText.textContent =
    weekTotal >= weekTarget
      ? `Viikkotavoite ylitetty ${weekTotal - weekTarget} varauksella`
      : `${weekTarget - weekTotal} varausta viikkotavoitteeseen`;
  weekMonVal.textContent = String(counts[0]);
  weekTueVal.textContent = String(counts[1]);
  weekWedVal.textContent = String(counts[2]);
  weekThuVal.textContent = String(counts[3]);

  const chartMax = Math.max(...counts, Math.ceil(WEEKDAY_TARGET * WEEK_TARGET_HEADROOM), 1);
  const heights = counts.map((count) => {
    if (count <= 0) return "0%";
    const pct = (count / chartMax) * 100;
    return `max(6px, ${pct.toFixed(2)}%)`;
  });
  weekMonBar.style.height = heights[0];
  weekTueBar.style.height = heights[1];
  weekWedBar.style.height = heights[2];
  weekThuBar.style.height = heights[3];
  [weekMonBar, weekTueBar, weekWedBar, weekThuBar].forEach((bar, idx) => {
    bar.classList.remove("is-low", "is-warn", "is-good");
    bar.classList.add(getBookingColorClass(counts[idx]));
  });

  const targetPct = Math.min((WEEKDAY_TARGET / chartMax) * 100, 100);
  if (weekTargetLine) {
    weekTargetLine.style.top = `${100 - targetPct}%`;
  }
  if (weeklyWrapCard) {
    weeklyWrapCard.style.setProperty("--week-target-pct", String(100 - targetPct));
  }

  if (weekBestValue && weekBestLabel) {
    const best = Math.max(...counts, 0);
    weekBestValue.textContent = String(best);
    weekBestLabel.textContent = "varauksen päiväkohtainen ennätys";
  }
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
  const eventBookings = bookings.filter(isEventBooking);
  historyStatus.textContent = `${eventBookings.length} tapahtumavarausta historiassa`;
  if (eventBookings.length === 0) {
    historyList.innerHTML = '<div class="empty-notes">Ei vielä tapahtumavarauksia.</div>';
    return;
  }
  const sorted = [...eventBookings].sort((a, b) => {
    const aTime = new Date(a.created_at || `${a.booking_date}T${a.booking_time || "00:00"}:00`);
    const bTime = new Date(b.created_at || `${b.booking_date}T${b.booking_time || "00:00"}:00`);
    return bTime - aTime;
  });

  historyList.innerHTML = sorted
    .slice(0, 10)
    .map((entry) => {
      return `
      <article class="history-item">
        <div class="history-top">
          <h3 class="history-title">${escapeHtml(entry.customer_name || "Asiakas")}</h3>
          <span class="history-date">${formatDateOnly(entry.booking_date)}</span>
        </div>
        <p class="history-comment">
          ${escapeHtml(entry.event_name || "Ei tapahtumaa")} - ${escapeHtml(
        entry.booking_time || "--:--"
      )} - ${getStatusLabel(entry.status)}
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
    return;
  }

  const { grouped, counts } = groupNotesByEventKey(data ?? []);
  notesByEventKey = grouped;
  noteCountsByEventKey = counts;
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

function renderDrawerSlotGrid(event) {
  if (!drawerSlotList) return;

  const eventStart = new Date(event?.startDate ?? "");
  if (Number.isNaN(eventStart.getTime())) {
    drawerSlotList.innerHTML =
      '<p class="drawer-slots-empty">Tapahtuman alkuaikaa ei voitu tulkita.</p>';
    return;
  }

  const eventDayKey = formatIsoDateKey(startOfDay(eventStart));
  const realInstants = [];
  for (const raw of getApiBookingsFromEvent(event)) {
    if (!isApiBookingRealOccupancy(raw)) continue;
    const norm = normalizeApiBookingRow(raw);
    const t = parseApiBookingInstant(norm.bookingDate, event.startDate);
    if (Number.isNaN(t.getTime())) continue;
    if (formatIsoDateKey(startOfDay(t)) !== eventDayKey) continue;
    realInstants.push(t);
  }

  let rangeEndDefault = new Date(
    eventStart.getFullYear(),
    eventStart.getMonth(),
    eventStart.getDate(),
    18,
    0,
    0,
    0
  );
  if (event.endDate) {
    const endFromApi = new Date(event.endDate);
    if (!Number.isNaN(endFromApi.getTime()) && endFromApi > eventStart) {
      rangeEndDefault = endFromApi;
    }
  }
  if (rangeEndDefault <= eventStart) {
    rangeEndDefault = addMinutesToDate(eventStart, 8 * 60);
  }

  let rangeStart = floorToQuarterHour(eventStart);
  let rangeEnd = ceilToQuarterHour(rangeEndDefault);

  for (const t of realInstants) {
    if (t < rangeStart) rangeStart = floorToQuarterHour(t);
    const slotStart = floorToQuarterHour(t);
    const slotEnd = addMinutesToDate(slotStart, DRAWER_SLOT_STEP_MIN);
    if (slotEnd > rangeEnd) rangeEnd = slotEnd;
  }

  if (rangeEnd <= rangeStart) {
    rangeEnd = addMinutesToDate(rangeStart, DRAWER_SLOT_STEP_MIN * 8);
  }

  const slotStarts = [];
  for (
    let cursor = new Date(rangeStart.getTime());
    cursor < rangeEnd && slotStarts.length < DRAWER_SLOT_MAX_ROWS;
    cursor = addMinutesToDate(cursor, DRAWER_SLOT_STEP_MIN)
  ) {
    slotStarts.push(new Date(cursor.getTime()));
  }

  if (slotStarts.length === 0) {
    drawerSlotList.innerHTML = '<p class="drawer-slots-empty">Ei näytettäviä aikoja.</p>';
    return;
  }

  drawerSlotList.innerHTML = slotStarts
    .map((slotStart) => {
      const slotEnd = addMinutesToDate(slotStart, DRAWER_SLOT_STEP_MIN);
      const taken = realInstants.some((inst) => inst >= slotStart && inst < slotEnd);
      const label = `${formatBookingTimeFi(slotStart)} - ${formatBookingTimeFi(slotEnd)}`;
      const rowClass = taken ? "drawer-slot-row drawer-slot-row--busy" : "drawer-slot-row";
      const badgeClass = taken
        ? "drawer-slot-badge drawer-slot-badge--busy"
        : "drawer-slot-badge drawer-slot-badge--free";
      const badgeText = taken ? "EI SAATAVILLA" : "VAPAA";
      return `
      <div class="${rowClass}">
        <span class="drawer-slot-time">${escapeHtml(label)}</span>
        <span class="${badgeClass}">${badgeText}</span>
      </div>`;
    })
    .join("");
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
    <div class="meta-row"><span class="meta-label">Dummy-varaukset</span><span class="meta-value">${
      event.bookedFake
    }</span></div>
    <div class="meta-row"><span class="meta-label">Oikeat varaukset</span><span class="meta-value">${
      event.bookedReal
    }</span></div>
    <div class="meta-row"><span class="meta-label">Vapaita paikkoja</span><span class="meta-value">${
      event.remainingReal
    }</span></div>
  `;
  renderDrawerSlotGrid(event);
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
  const filtered = getFilteredDashboardEvents();

  if (filtered.length === 0) {
    eventsBody.innerHTML = `
      <div class="empty-notes">Ei tuloksia valitulla haulla.</div>
    `;
    if (toggleEventsButton) toggleEventsButton.classList.add("hidden");
    statusText.textContent = "Ei tapahtumia näytettävänä.";
    focusedEventKeyForDaily = null;
    renderDailyBookings();
    syncDailyViewTabsUi();
    return;
  }

  if (
    !focusedEventKeyForDaily ||
    !filtered.some((e) => eventKey(e) === focusedEventKeyForDaily)
  ) {
    focusedEventKeyForDaily = eventKey(filtered[0]);
  }

  const visibleEvents = showAllEvents ? filtered : filtered.slice(0, 4);
  const rows = visibleEvents
    .map((event, index) => {
      const bookedReal = Number(event.bookedReal) || 0;
      const bookedTotal = Number(event.bookedTotal) || 0;
      const bookedFake = Number(event.bookedFake) || 0;
      const remainingReal = Number(event.remainingReal) || 0;
      const target = Math.max(bookedReal + remainingReal, 1);
      const progressPct = Math.min((bookedReal / target) * 100, 100);
      const progressClass = getBookingColorClass(bookedReal);
      const focusClass =
        eventKey(event) === focusedEventKeyForDaily ? " event-progress-item--focus" : "";
      return `
      <article class="event-progress-item${focusClass}" data-event-index="${index}" title="Avaa tapahtuman tiedot">
        <div class="event-progress-head">
          <div>
            <p class="event-progress-location">${escapeHtml(event.location)}</p>
            <p class="event-progress-date">${formatDateOnly(event.startDate)}</p>
          </div>
          <p class="event-progress-value"><span>${bookedReal}</span> / ${target}</p>
        </div>
        <div class="event-progress-bar" role="img" aria-label="Oikeat varaukset ${bookedReal} / ${target}">
          <div class="event-progress-fill ${progressClass}" style="width: ${progressPct.toFixed(1)}%"></div>
          <span class="event-progress-target">Tavoite ${target}</span>
        </div>
        <div class="event-progress-meta">
          <span>Yhteensä ${bookedTotal}</span>
          <span>Dummy-varaukset ${bookedFake}</span>
          <span>Vapaita ${remainingReal}</span>
          <span class="event-progress-arrow">›</span>
        </div>
      </article>
      `;
    })
    .join("");

  eventsBody.innerHTML = rows;
  if (toggleEventsButton) {
    if (filtered.length > 4) {
      toggleEventsButton.classList.remove("hidden");
      toggleEventsButton.textContent = showAllEvents
        ? "Näytä vain 4 ylimpää"
        : `Katso kaikki (${filtered.length})`;
    } else {
      toggleEventsButton.classList.add("hidden");
    }
  }
  statusText.textContent = `Näytetään ${visibleEvents.length} / ${filtered.length} tapahtumaa.`;

  eventsBody.querySelectorAll(".event-progress-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = Number(item.getAttribute("data-event-index"));
      const event = visibleEvents[index];
      if (!event) return;
      focusedEventKeyForDaily = eventKey(event);
      openDrawer(event);
      renderTable();
    });
  });

  renderDailyBookings();
  syncDailyViewTabsUi();
}

async function loadData() {
  if (!appStarted) return;
  statusText.textContent = "Päivitetään tietoja...";

  try {
    const response = await fetch(BOOKERS_API_URL, { cache: "no-store" });
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
    renderCalendar();
    updateBookingEventOptions();
    renderBookings();
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
      <div class="empty-notes">Datan haku epäonnistui. Tarkista yhteys ja yritä uudelleen.</div>
    `;
  }
}

searchInput.addEventListener("input", renderTable);

dailyViewTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    dailyBookingsViewMode = tab.dataset.dailyMode === "week" ? "week" : "day";
    syncDailyViewTabsUi();
    renderDailyBookings();
  });
});
if (toggleEventsButton) {
  toggleEventsButton.addEventListener("click", () => {
    showAllEvents = !showAllEvents;
    renderTable();
  });
}
if (bookingSearchInput) {
  bookingSearchInput.addEventListener("input", renderBookings);
}

if (bookingDate) {
  bookingDate.addEventListener("change", updateBookingEventOptions);
}

buildBookingTimeOptions();
buildHomeVisitTimeOptions();
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const view = item.dataset.view;
    if (!view) return;
    switchView(view);
  });
});

if (calendarPrev) {
  calendarPrev.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    renderCalendar();
  });
}

if (calendarNext) {
  calendarNext.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    renderCalendar();
  });
}

calendarTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    calendarMode = tab.dataset.calendarMode || "all";
    calendarTabs.forEach((candidate) =>
      candidate.classList.toggle("active", candidate === tab)
    );
    renderCalendar();
  });
});

if (toggleHomeVisitFormButton && homeVisitForm) {
  toggleHomeVisitFormButton.addEventListener("click", () => {
    const willOpen = homeVisitForm.classList.contains("hidden");
    if (willOpen) {
      buildHomeVisitTimeOptions();
      resetHomeVisitFormState();
      homeVisitForm.classList.remove("hidden");
      return;
    }
    homeVisitForm.classList.add("hidden");
    homeVisitForm.reset();
    buildHomeVisitTimeOptions();
    resetHomeVisitFormState();
  });
}

if (homeVisitForm) {
  homeVisitForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!hvCustomerName || !hvAddress || !hvVisitDate || !hvVisitTime || !hvDetails) return;
    const customerName = hvCustomerName.value.trim();
    const nickname = hvNickname?.value.trim() ?? "";
    const address = hvAddress.value.trim();
    const phone = hvPhone?.value.trim() ?? "";
    const visitDate = hvVisitDate.value;
    const visitTime = hvVisitTime.value;
    const details = hvDetails.value.trim();
    if (!customerName || !address || !visitDate || !visitTime || !details) return;

    if (saveHomeVisitButton) saveHomeVisitButton.disabled = true;
    const payload = {
      customer_name: customerName,
      nickname,
      phone,
      address,
      visit_time: new Date(`${visitDate}T${visitTime}:00`).toISOString(),
      details,
      status: "sovittu",
    };
    const result = editingHomeVisitId
      ? await updateHomeVisit(editingHomeVisitId, payload)
      : await saveHomeVisit(payload);
    if (saveHomeVisitButton) saveHomeVisitButton.disabled = false;
    if (!result.ok) {
      alert(`Kotikäynnin tallennus epäonnistui: ${result.message}`);
      return;
    }
    homeVisitForm.reset();
    homeVisitForm.classList.add("hidden");
    buildHomeVisitTimeOptions();
    resetHomeVisitFormState();
  });
}

if (toggleBookingFormButton && bookingForm) {
  toggleBookingFormButton.addEventListener("click", () => {
    const willOpen = bookingForm.classList.contains("hidden");
    if (willOpen) {
      buildBookingTimeOptions();
      resetBookingFormState();
      bookingForm.classList.remove("hidden");
      updateBookingEventOptions();
      return;
    }
    bookingForm.classList.add("hidden");
    bookingForm.reset();
    resetBookingFormState();
  });
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!bookingCustomerName || !bookingDate || !bookingTime) return;
    const customerName = bookingCustomerName.value.trim();
    const date = bookingDate.value;
    const selectedTime = bookingTime.value;
    const type = "Tapahtumavaraus";
    const phone = bookingPhone?.value.trim() ?? "";
    const status = bookingStatus?.value || "odottaa";
    const owner = bookingOwner?.value.trim() ?? "";
    const selectedKey = bookingEventSelect?.value ?? "";
    const eventOfDay = getEventsForDate(date).find((item) => eventKey(item) === selectedKey);
    const eventName = eventOfDay ? eventOfDay.location : "";

    if (!customerName || !date || !selectedTime) {
      alert("Valitse aika listasta.");
      return;
    }
    if (saveBookingButton) saveBookingButton.disabled = true;
    const payload = {
      customer_name: customerName,
      phone,
      booking_type: type,
      booking_date: date,
      booking_time: selectedTime,
      event_key: selectedKey || null,
      event_name: eventName || null,
      status,
      owner,
    };
    const result = editingBookingId
      ? await updateBooking(editingBookingId, payload)
      : await saveBooking(payload);
    if (saveBookingButton) saveBookingButton.disabled = false;
    if (!result.ok) {
      alert(`Varauksen tallennus epäonnistui: ${result.message}`);
      return;
    }
    bookingForm.reset();
    bookingForm.classList.add("hidden");
    resetBookingFormState();
    buildBookingTimeOptions();
    updateBookingEventOptions();
  });
}

if (deleteBookingButton) {
  deleteBookingButton.addEventListener("click", async () => {
    if (!editingBookingId) return;
    const confirmed = window.confirm("Haluatko varmasti poistaa tämän varauksen?");
    if (!confirmed) return;
    deleteBookingButton.disabled = true;
    const result = await deleteBooking(editingBookingId);
    deleteBookingButton.disabled = false;
    if (!result.ok) {
      alert(`Varauksen poisto epäonnistui: ${result.message}`);
      return;
    }
    if (bookingForm) {
      bookingForm.reset();
      bookingForm.classList.add("hidden");
    }
    resetBookingFormState();
    buildBookingTimeOptions();
    updateBookingEventOptions();
  });
}

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
  switchView(activeView);
  void loadHomeVisits();
  void loadBookings();
  void loadData();
  setInterval(() => {
    void loadHomeVisits();
    void loadBookings();
    void loadData();
  }, REFRESH_MS);
}

function tryUnlockWithPin() {
  if (!pinInput || !pinError) return;
  const entered = pinInput.value.trim();
  if (!entered) {
    pinError.textContent = "Anna salasana.";
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
