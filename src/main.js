import { createClient } from "@supabase/supabase-js";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzQ82vjhyLdRBmgNwujIteR-XYttANTIbSgNIuHRafg5tf5AmOhn-S_OqYLJc_p6Ant/exec";

const BOOKERS_API_URL = API_URL.includes("?") ? `${API_URL}&mode=bookers_ghl` : `${API_URL}?mode=bookers_ghl`;

/** API:n testivaraukset (isTest) piilotetaan listasta */
const HIDE_TEST_API_BOOKINGS = true;

/**
 * Päänäkymän tavoite-/tilasto-osiot (kuten kuvassa): kaavion alateksti
 * ("Vielä X varausta…"), viikkotavoite ma–to, Putki ja Viikon paras.
 * Aseta `true` näyttääksesi ne uudelleen.
 */
const DASHBOARD_SHOW_WEEK_GOALS_AND_CHART_CAPTION = true;

/** false = piilottaa manuaalisen päivitysnapin (tausta päivittää automaattisesti). */
const SHOW_MANUAL_REFRESH_BUTTON = false;

/** false = piilottaa kalenterinäkymän ja sen linkin sivupalkista. */
const SHOW_CALENDAR_NAV_AND_VIEW = false;

/** false = piilottaa toimipiste (yksityisarviointi) -osion päänäkymästä. */
const SHOW_OFFICE_VISITS_SECTION = false;

const REFRESH_MS = 60000;
const PIN_VERIFY_FUNCTION_NAME = "verify-pin";
const PIN_SESSION_KEY = "dashboardPinUnlocked";
const TODAY_TARGET = 12;
const CHART_START_HOUR = 7;
const CHART_END_HOUR = 23;
/** Viikon varauspalkit: lineaarinen korkeus per varaus (ei suhteuteta viikon maksimiin). */
const WEEKLY_PULSE_BASE_HEIGHT_PCT = 5;
const WEEKLY_PULSE_HEIGHT_PER_BOOKING_PCT = 6;
const WEEKLY_PULSE_MAX_HEIGHT_PCT = 92;
const HOME_VISITS_STORAGE_KEY = "localHomeVisits";
const BOOKINGS_STORAGE_KEY = "localBookings";
const BOOKING_OWNER_PROFILES_STORAGE_KEY = "localBookingOwnerProfiles";

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
const navItems = document.querySelectorAll(".nav-item[data-view]");
const dashboardView = document.getElementById("dashboardView");
const calendarView = document.getElementById("calendarView");
const homeVisitsView = document.getElementById("homeVisitsView");
const bookingsView = document.getElementById("bookingsView");
const historyView = document.getElementById("historyView");
const historyPanelBookings = document.getElementById("historyPanelBookings");
const historyPanelPastHomeVisits = document.getElementById("historyPanelPastHomeVisits");
const historyModeTabs = document.querySelectorAll(".history-mode-tab[data-history-mode]");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const calendarTabs = document.querySelectorAll(".calendar-tab[data-calendar-mode]");
const toggleHomeVisitFormButton = document.getElementById("toggleHomeVisitFormButton");
const homeVisitForm = document.getElementById("homeVisitForm");
const hvNickname = document.getElementById("hvNickname");
const addHomeVisitProfileButton = document.getElementById("addHomeVisitProfileButton");
const deleteHomeVisitProfileButton = document.getElementById("deleteHomeVisitProfileButton");
const hvVisitDate = document.getElementById("hvVisitDate");
const hvVisitTime = document.getElementById("hvVisitTime");
const hvDetails = document.getElementById("hvDetails");
const saveHomeVisitButton = document.getElementById("saveHomeVisitButton");
const todayHomeVisitsList = document.getElementById("todayHomeVisitsList");
const pastHomeVisitsList = document.getElementById("pastHomeVisitsList");
const futureHomeVisitsList = document.getElementById("futureHomeVisitsList");
const toggleBookingFormButton = document.getElementById("toggleBookingFormButton");
const bookingForm = document.getElementById("bookingForm");
const bookingCustomerName = document.getElementById("bookingCustomerName");
const bookingPhone = document.getElementById("bookingPhone");
const bookingEmail = document.getElementById("bookingEmail");
const bookingDate = document.getElementById("bookingDate");
const bookingTime = document.getElementById("bookingTime");
const bookingEventSelect = document.getElementById("bookingEventSelect");
const bookingOwner = document.getElementById("bookingOwner");
const addBookingOwnerProfileButton = document.getElementById("addBookingOwnerProfileButton");
const deleteBookingOwnerProfileButton = document.getElementById("deleteBookingOwnerProfileButton");
const bookingStatus = document.getElementById("bookingStatus");
const bookingDetails = document.getElementById("bookingDetails");
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
const weeklyPulseBars = document.getElementById("weeklyPulseBars");
const weeklyPulseValue = document.getElementById("weeklyPulseValue");
const dashboardWeekMetricsSection = document.getElementById("dashboardWeekMetricsSection");
const weeklyBookersDonut = document.getElementById("weeklyBookersDonut");
const weeklyBookersLegend = document.getElementById("weeklyBookersLegend");
const weeklyBookersWeekLabel = document.getElementById("weeklyBookersWeekLabel");
const weeklyBookersTopName = document.getElementById("weeklyBookersTopName");
const weeklyBookersTopValue = document.getElementById("weeklyBookersTopValue");
const weeklyBookersTotal = document.getElementById("weeklyBookersTotal");

const WEEKLY_PULSE_DAY_LABELS = ["MA", "TI", "KE", "TO", "PE", "LA", "SU"];
let weeklyPulseTodayCount = 0;

/** 20 hyvin erottuvaa, kerma-/kultateemaan sopivaa väriä bookkaajien donut-paloille */
const BOOKER_COLOR_PALETTE = [
  "#b88b3d",
  "#1e9d78",
  "#c66a3c",
  "#6e7fc9",
  "#b34f7a",
  "#5fa6a1",
  "#d4a82e",
  "#8e5cb4",
  "#d65c5c",
  "#3e8c4a",
  "#4b6a93",
  "#9d6b3f",
  "#6da8d1",
  "#b78ec4",
  "#5b8a3a",
  "#cc5f95",
  "#2b8b8b",
  "#d68a51",
  "#7567a3",
  "#c5993f",
];

function applyDashboardOptionalBlocksVisibility() {
  const show = DASHBOARD_SHOW_WEEK_GOALS_AND_CHART_CAPTION;
  chartCaption?.classList.toggle("hidden", !show);
  dashboardWeekMetricsSection?.classList.toggle("hidden", !show);
}

applyDashboardOptionalBlocksVisibility();

const calendarNavItem = document.querySelector('.nav-item[data-view="calendar"]');
const appMainHeader = document.querySelector("main.container > header.header");

function applyOptionalChromeVisibility() {
  if (!SHOW_MANUAL_REFRESH_BUTTON) {
    refreshButton?.classList.add("hidden");
    appMainHeader?.classList.add("hidden");
  } else {
    refreshButton?.classList.remove("hidden");
    appMainHeader?.classList.remove("hidden");
  }
  if (!SHOW_CALENDAR_NAV_AND_VIEW) {
    calendarNavItem?.classList.add("hidden");
  } else {
    calendarNavItem?.classList.remove("hidden");
  }
}

applyOptionalChromeVisibility();

const pinGate = document.getElementById("pinGate");
const pinForm = document.getElementById("pinForm");
const pinInput = document.getElementById("pinInput");
const pinError = document.getElementById("pinError");
const pinSubmitButton = document.getElementById("pinSubmitButton");
const dailyBookingsList = document.getElementById("dailyBookingsList");
const dailyBookingsContext = document.getElementById("dailyBookingsContext");
const dailyEventSwitch = document.getElementById("dailyEventSwitch");
const dailyViewTabs = document.querySelectorAll(".daily-view-tab[data-daily-mode]");
const dailySourceTabs = document.querySelectorAll(".daily-source-tab[data-daily-source]");

let allEvents = [];
let generatedAt = null;
let selectedEvent = null;
let supabaseClient = null;
let notesByEventKey = new Map();
let noteCountsByEventKey = new Map();
let appStarted = false;
let apiCapacityPerEvent = 32;
let homeVisits = [];
let editingHomeVisitId = null;
let activeView = "dashboard";
/** Historia-näkymän välilehti: tapahtumavaraukset tai menneet kotikäynnit */
let historyPanelMode = "bookings";
let calendarMode = "all";
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let bookings = [];
let bookingOwnerProfiles = [];
let editingBookingId = null;
let showAllEvents = false;
/** Päänäkymän "Päivän varaukset" -osion tapahtuma (eventKey) */
let focusedEventKeyForDaily = null;
let dailyBookingsViewMode = "day";
/** Päänäkymän varauslista: API-tapahtumavaraukset tai kotikäynnit */
let dailyBookingsSourceMode = "bookings";
/** Toimipiste-lohkon tarkka aikataulu auki */
let officeVisitsExpanded = false;

const OFFICE_VISITS_COMPACT_MAX = 4;

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

const OFFICE_VISIT_LABEL = "Toimipiste";

function getOfficeEventHaystack(event) {
  return `${event?.title ?? ""} ${event?.location ?? ""}`.toLowerCase();
}

function getBookingClassificationHaystack(norm, event) {
  return `${getOfficeEventHaystack(event)} ${norm?.orderName ?? ""} ${norm?.service ?? ""}`.toLowerCase();
}

function isTestCalendarEvent(event) {
  return getOfficeEventHaystack(event).includes("testi kalenteri");
}

/** Oma toimipiste: kultamyynti.fi yksityisarviointi -varaukset */
function isOfficePrivateEvaluationEvent(event) {
  if (isTestCalendarEvent(event)) return false;
  const hay = getOfficeEventHaystack(event);
  return (
    hay.includes("yksityisarviointi") ||
    hay.includes("kultamyynti.fi") ||
    (hay.includes("kultamyynti") && (hay.includes("yksityis") || hay.includes("arviointi")))
  );
}

function isOfficePrivateEvaluationBooking(norm, event) {
  if (isTestCalendarEvent(event)) return false;
  if (isOfficePrivateEvaluationEvent(event)) return true;
  const hay = getBookingClassificationHaystack(norm, event);
  return (
    hay.includes("yksityisarviointi") ||
    hay.includes("kultamyynti.fi") ||
    (hay.includes("kultamyynti") && (hay.includes("yksityis") || hay.includes("arviointi")))
  );
}

function shouldHideEventFromBookingsViews(event) {
  return isTestCalendarEvent(event) || isOfficePrivateEvaluationEvent(event);
}

function mapApiBookingRow(raw, event) {
  const norm = normalizeApiBookingRow(raw);
  if (HIDE_TEST_API_BOOKINGS && norm.isTest) return null;
  const sourceStart = norm.startDate || norm.bookingDate;
  let instant = parseApiBookingInstant(sourceStart, event.startDate);
  if (Number.isNaN(instant.getTime())) return null;
  instant = alignBookingInstantToEventDay(instant, event.startDate);
  const createdAt = parseApiBookingInstant(norm.bookingDate, event.startDate);
  return {
    kind: "booking",
    norm,
    event,
    instant,
    createdAt: Number.isNaN(createdAt.getTime()) ? null : createdAt,
  };
}

function sortBookingRows(a, b) {
  const dt = a.instant.getTime() - b.instant.getTime();
  if (dt !== 0) return dt;
  const aCreated = a.createdAt ? a.createdAt.getTime() : 0;
  const bCreated = b.createdAt ? b.createdAt.getTime() : 0;
  if (aCreated !== bCreated) return aCreated - bCreated;
  const aAppointmentId = String(a.norm?.appointmentId ?? "").trim();
  const bAppointmentId = String(b.norm?.appointmentId ?? "").trim();
  if (aAppointmentId && bAppointmentId && aAppointmentId !== bAppointmentId) {
    return aAppointmentId.localeCompare(bAppointmentId);
  }
  const aEventStart = a.event ? new Date(a.event.startDate).getTime() : 0;
  const bEventStart = b.event ? new Date(b.event.startDate).getTime() : 0;
  return aEventStart - bEventStart;
}

function formatWeekdayShort(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fi-FI", { weekday: "short" }).format(date);
}

function getOfficeBookingEndInstant(row) {
  const norm = row.norm;
  const event = row.event;
  if (!norm?.endDate) return null;
  let end = parseApiBookingInstant(norm.endDate, event.startDate);
  if (Number.isNaN(end.getTime())) return null;
  end = alignBookingInstantToEventDay(end, event.startDate);
  if (end <= row.instant) return null;
  return end;
}

function formatOfficeVisitCompactWhen(instant) {
  const weekday = formatWeekdayShort(instant);
  const date = formatDateOnly(instant);
  const time = formatBookingTimeFi(instant);
  return `${weekday} ${date} · ${time}`;
}

function formatOfficeVisitDetailWhen(row) {
  const start = row.instant;
  const end = getOfficeBookingEndInstant(row);
  const weekday = formatWeekdayShort(start);
  const date = formatDateOnly(start);
  const startTime = formatBookingTimeFi(start);
  const endTime = end ? formatBookingTimeFi(end) : "";
  const range = endTime ? `${startTime}–${endTime}` : startTime;
  return `${weekday} ${date} klo ${range}`;
}

function renderOfficeVisitsBlock(rows, isWeek) {
  if (!rows.length) return "";
  const sorted = [...rows].sort(sortBookingRows);
  const expanded = officeVisitsExpanded;
  const now = Date.now();
  const nextUpcoming = sorted.find((row) => row.instant.getTime() >= now - 5 * 60 * 1000);
  const nextLine = nextUpcoming
    ? `<p class="office-visits-next"><span class="office-visits-next-label">Seuraava</span> ${escapeHtml(
        formatOfficeVisitCompactWhen(nextUpcoming.instant)
      )}${nextUpcoming.norm?.name ? ` · ${escapeHtml(String(nextUpcoming.norm.name).trim())}` : ""}</p>`
    : "";

  const compactItems = sorted
    .slice(0, OFFICE_VISITS_COMPACT_MAX)
    .map((row) => {
      const name = String(row.norm?.name || "—").trim() || "—";
      return `<li class="office-visits-item"><span class="office-visits-when">${escapeHtml(
        formatOfficeVisitCompactWhen(row.instant)
      )}</span><span class="office-visits-name">${escapeHtml(name)}</span></li>`;
    })
    .join("");

  const detailItems = sorted
    .map((row) => {
      const name = String(row.norm?.name || "—").trim() || "—";
      const phone = String(row.norm?.phone || "").trim();
      const phoneHtml = phone
        ? `<p class="office-visits-detail-phone">Puh. ${escapeHtml(phone)}</p>`
        : "";
      return `<li class="office-visits-detail-item">
          <p class="office-visits-detail-when">${escapeHtml(formatOfficeVisitDetailWhen(row))}</p>
          <p class="office-visits-detail-name">${escapeHtml(name)}</p>
          ${phoneHtml}
        </li>`;
    })
    .join("");

  const hiddenCount = sorted.length - OFFICE_VISITS_COMPACT_MAX;
  const moreHint =
    !expanded && hiddenCount > 0
      ? `<p class="office-visits-more">+ ${hiddenCount} muuta varausta</p>`
      : "";

  const toggleLabel = expanded ? "Piilota ajat" : "Näytä kaikki ajat";

  return `
    <div id="officeVisitsBlock" class="office-visits-block${expanded ? " is-expanded" : ""}">
      <div class="office-visits-head">
        <div class="office-visits-head-text">
          <span class="office-visits-label">${OFFICE_VISIT_LABEL}</span>
          <span class="office-visits-meta">${isWeek ? "Yksityisarviointi" : "Yksityisarviointi · seuraavat 7 pv"}</span>
        </div>
        <div class="office-visits-head-actions">
          <span class="office-visits-count">${sorted.length} kpl</span>
          <button
            type="button"
            class="office-visits-toggle"
            data-office-visits-toggle
            aria-expanded="${expanded ? "true" : "false"}"
          >${toggleLabel}</button>
        </div>
      </div>
      ${nextLine}
      <ul class="office-visits-list office-visits-list--compact" aria-label="${OFFICE_VISIT_LABEL}">${compactItems}</ul>
      <ul class="office-visits-list office-visits-list--detail" aria-label="${OFFICE_VISIT_LABEL}, tarkat ajat">${detailItems}</ul>
      ${moreHint}
    </div>`;
}

function collectOfficeBookingRows(focusEvent, isWeek, query) {
  const { rangeStart, rangeEnd } = getOfficeBookingsRange(focusEvent.startDate, isWeek);
  const officeRows = [];
  const seenAppointmentIds = new Set();

  for (const ev of allEvents) {
    if (isTestCalendarEvent(ev)) continue;
    const evText = `${ev.title ?? ""} ${ev.location} ${formatDateOnly(ev.startDate)}`
      .toLowerCase()
      .trim();

    for (const raw of getApiBookingsFromEvent(ev)) {
      if (!isApiBookingRealOccupancy(raw)) continue;
      const norm = normalizeApiBookingRow(raw);
      if (!isOfficePrivateEvaluationBooking(norm, ev)) continue;

      const mapped = mapApiBookingRow(raw, ev);
      if (!mapped) continue;
      if (mapped.instant < rangeStart || mapped.instant >= rangeEnd) continue;

      const appointmentId = String(mapped.norm?.appointmentId ?? "").trim();
      if (appointmentId) {
        if (seenAppointmentIds.has(appointmentId)) continue;
        seenAppointmentIds.add(appointmentId);
      }

      const hay = `${mapped.norm.name} ${mapped.norm.phone} ${mapped.norm.orderName} ${mapped.norm.service} ${evText}`
        .toLowerCase()
        .trim();
      if (query && !hay.includes(query)) continue;

      officeRows.push(mapped);
    }
  }

  officeRows.sort(sortBookingRows);
  return officeRows;
}

function renderOfficeVisitsEmpty(isWeek, focusEvent) {
  const focusDay = startOfDay(new Date(focusEvent.startDate));
  const rangeStart = isWeek
    ? new Date(
        focusDay.getFullYear(),
        focusDay.getMonth(),
        focusDay.getDate() - ((focusDay.getDay() + 6) % 7)
      )
    : focusDay;
  const period = `${formatDateOnly(rangeStart)}${isWeek ? " · viikko" : ""}`;
  return `
    <div id="officeVisitsBlock" class="office-visits-block office-visits-block--empty">
      <div class="office-visits-head">
        <div class="office-visits-head-text">
          <span class="office-visits-label">${OFFICE_VISIT_LABEL}</span>
          <span class="office-visits-meta">Yksityisarviointi</span>
        </div>
        <span class="office-visits-count">0 kpl</span>
      </div>
      <p class="office-visits-empty">Ei varauksia (${escapeHtml(period)}).</p>
    </div>`;
}

/** Sama paikka voi toistua useana tapahtumana — erottele päivä ja kello */
function formatEventDayAndTime(startDateRaw) {
  const d = new Date(startDateRaw ?? "");
  if (Number.isNaN(d.getTime())) return formatDateOnly(startDateRaw);
  return `${formatDateOnly(d)} klo ${formatBookingTimeFi(d)}`;
}

function formatEventSelectLabel(event) {
  const loc = String(event?.location ?? "").trim() || "Tapahtuma";
  return `${loc} · ${formatEventDayAndTime(event.startDate)}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getFilteredDashboardEvents() {
  const query = searchInput.value.trim().toLowerCase();
  return allEvents.filter((event) => {
    if (isTestCalendarEvent(event)) return false;
    const start = new Date(event.startDate ?? "");
    const dateKey = Number.isNaN(start.getTime()) ? "" : formatIsoDateKey(start);
    const text = `${event.title ?? ""} ${event.location} ${formatDateOnly(
      event.startDate
    )} ${dateKey}`.toLowerCase();
    return text.includes(query);
  });
}

function getApiBookingsFromEvent(event) {
  const raw = event?.bookings;
  return Array.isArray(raw) ? raw : [];
}

/** API voi lähettää isTest merkkijonona "false" — Boolean("false") olisi virheellisesti true */
function parseApiBooleanFlag(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;
  if (typeof value === "string") {
    const s = value.toLowerCase().trim();
    if (s === "true" || s === "1" || s === "yes") return true;
    return false;
  }
  return Boolean(value);
}

function normalizeApiBookingRow(raw) {
  const first = String(raw.firstName ?? raw.first_name ?? "").trim();
  const last = String(raw.lastName ?? raw.last_name ?? "").trim();
  const fromParts = [first, last].filter(Boolean).join(" ").trim();
  const name =
    String(raw.name ?? raw.customer_name ?? "")
      .trim() || fromParts;
  const orderName = String(raw.orderName ?? raw.order_name ?? "").trim();
  const bookingDateRaw =
    raw.bookingDate ??
    raw.booking_date ??
    raw.startTime ??
    raw.slotStart ??
    raw.startDateTime ??
    raw.dateTime ??
    raw.datetime ??
    "";
  const bookingStartRaw = raw.startDate ?? raw.start_date ?? "";
  const bookingEndRaw = raw.endDate ?? raw.end_date ?? "";
  const appointmentId = String(raw.appointmentId ?? raw.appointment_id ?? "").trim();
  const contactId = String(raw.contactId ?? raw.contact_id ?? "").trim();
  return {
    appointmentId,
    contactId,
    bookingDate: bookingDateRaw,
    startDate: bookingStartRaw,
    endDate: bookingEndRaw,
    name,
    firstName: first,
    lastName: last,
    phone: String(raw.phone ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    status: raw.status ?? "",
    isTest: parseApiBooleanFlag(raw.isTest ?? raw.is_test),
    orderName,
    service: String(
      raw.service ??
        raw.serviceType ??
        raw.type ??
        raw.bookingType ??
        raw.notes ??
        ""
    ).trim(),
  };
}

function parseFiniteNonNegativeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
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
/** Koko päivän 15 min slotit mahtuvat (esim. 10–18 ≈ 32 riviä) */
const DRAWER_SLOT_MAX_ROWS = 128;
const DRAWER_VISIBLE_START_HOUR = 10;
const DRAWER_VISIBLE_END_HOUR = 19;
const BOOKING_BREAK_RANGES = [
  { start: "11:30", end: "11:45" },
  { start: "13:00", end: "14:00" },
  { start: "16:00", end: "16:15" },
  { start: "18:00", end: "18:15" },
];

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

function timeToMinutes(timeValue) {
  const [hhRaw, mmRaw] = String(timeValue || "").split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return NaN;
  return hh * 60 + mm;
}

function isBreakSlot(slotStart, slotEnd) {
  if (!(slotStart instanceof Date) || !(slotEnd instanceof Date)) return false;
  const startMinutes = slotStart.getHours() * 60 + slotStart.getMinutes();
  const endMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes();
  return BOOKING_BREAK_RANGES.some((range) => {
    const breakStart = timeToMinutes(range.start);
    const breakEnd = timeToMinutes(range.end);
    if (!Number.isFinite(breakStart) || !Number.isFinite(breakEnd)) return false;
    return breakStart < endMinutes && breakEnd > startMinutes;
  });
}

function parseApiBookingInstant(bookingDateRaw, fallbackEventStart) {
  if (bookingDateRaw === null || bookingDateRaw === undefined || bookingDateRaw === "") {
    return new Date(fallbackEventStart);
  }
  if (typeof bookingDateRaw === "number" && Number.isFinite(bookingDateRaw)) {
    const ms = bookingDateRaw < 1e12 ? bookingDateRaw * 1000 : bookingDateRaw;
    return new Date(ms);
  }
  if (typeof bookingDateRaw === "object" && bookingDateRaw !== null) {
    const sec = Number(
      bookingDateRaw.seconds ?? bookingDateRaw._seconds ?? bookingDateRaw.sec
    );
    if (Number.isFinite(sec)) return new Date(sec * 1000);
  }
  const str = String(bookingDateRaw).trim();
  if (/^\d{10,13}$/.test(str)) {
    const n = Number(str);
    const ms = n < 1e12 ? n * 1000 : n;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d;
  }
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

/** Aseta varauksen kellonaika tapahtuman paikalliselle kalenteripäivälle (UTC-ISO voi siirtää päivää) */
function alignBookingInstantToEventDay(inst, eventStartRaw) {
  const ev = new Date(eventStartRaw ?? "");
  if (Number.isNaN(inst.getTime()) || Number.isNaN(ev.getTime())) return inst;
  return new Date(
    ev.getFullYear(),
    ev.getMonth(),
    ev.getDate(),
    inst.getHours(),
    inst.getMinutes(),
    inst.getSeconds(),
    inst.getMilliseconds()
  );
}

function formatBookingTimeFi(instant) {
  if (Number.isNaN(instant.getTime())) return "—";
  return new Intl.DateTimeFormat("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(instant);
}

/** Päänäkymän kotikäyntirivi: asiakas/sijainti details-kentästä, varaaja erikseen. */
function getDailyHomeVisitDisplay(visit) {
  const booker = String(visit.nickname || "").trim();
  const details = String(visit.details || "").trim();
  const detailLines = details
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const addr = String(visit.address || "").trim();
  const locationFromAddr = addr && addr !== "-" ? addr : "";
  const storedCustomer = String(visit.customer_name || "").trim();

  let customer = "";
  let location = locationFromAddr;

  if (storedCustomer && storedCustomer !== booker) {
    customer = storedCustomer;
    if (!location && detailLines.length > 0) {
      location = detailLines.join(" · ");
    }
  } else if (detailLines.length >= 2) {
    customer = detailLines[0];
    location = location || detailLines.slice(1).join(" · ");
  } else if (detailLines.length === 1) {
    customer = detailLines[0];
  } else if (storedCustomer) {
    customer = storedCustomer;
  } else {
    customer = "Kotikäynti";
  }

  return {
    booker,
    customer,
    location,
  };
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

/** Päivä = anchorin kalenteripäivä; viikko = sen maanantai–sunnuntai. */
function getDayOrWeekRangeAroundAnchor(anchorDate, isWeek) {
  const focusDay = startOfDay(new Date(anchorDate));
  const rangeStart = isWeek
    ? new Date(
        focusDay.getFullYear(),
        focusDay.getMonth(),
        focusDay.getDate() - ((focusDay.getDay() + 6) % 7)
      )
    : focusDay;
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeStart.getDate() + (isWeek ? 7 : 1));
  return { rangeStart, rangeEnd };
}

/** Toimipiste: päivänäkymässä näytetään valitusta päivästä eteenpäin 7 pv (ei vain yksi päivä). */
function getOfficeBookingsRange(anchorDate, isWeek) {
  if (isWeek) return getDayOrWeekRangeAroundAnchor(anchorDate, true);
  const rangeStart = startOfDay(new Date(anchorDate));
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + 7);
  return { rangeStart, rangeEnd };
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
  if (isWeek) {
    const loc = String(eventRow.location ?? "").trim();
    const day = formatDateOnly(eventRow.startDate);
    const ctx = [loc, day].filter(Boolean).join(" · ");
    line = line ? `${line} · ${ctx}` : ctx;
  } else if (!line) {
    line = String(eventRow.location ?? "").trim();
  }
  return escapeHtml(line);
}

function renderDailyEventSwitch(focusEvent, events, isWeek) {
  if (!dailyEventSwitch) return;
  if (isWeek) {
    dailyEventSwitch.innerHTML = "";
    return;
  }
  const focusDate = new Date(focusEvent?.startDate ?? "");
  if (Number.isNaN(focusDate.getTime())) {
    dailyEventSwitch.innerHTML = "";
    return;
  }
  const focusKey = formatIsoDateKey(startOfDay(focusDate));
  const dayEvents = events
    .filter((ev) => {
      if (shouldHideEventFromBookingsViews(ev)) return false;
      const d = new Date(ev.startDate ?? "");
      if (Number.isNaN(d.getTime())) return false;
      return formatIsoDateKey(startOfDay(d)) === focusKey;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  if (dayEvents.length <= 1) {
    dailyEventSwitch.innerHTML = "";
    return;
  }
  const locationCounts = new Map();
  dayEvents.forEach((ev) => {
    const key = String(ev.location ?? "").trim().toLowerCase();
    if (!key) return;
    locationCounts.set(key, (locationCounts.get(key) ?? 0) + 1);
  });
  const locationOrder = new Map();
  dailyEventSwitch.innerHTML = dayEvents
    .map((ev) => {
      const key = eventKey(ev);
      const active = key === focusedEventKeyForDaily;
      const baseLabel = String(ev.location ?? "").trim() || "Tapahtuma";
      const locationKey = baseLabel.toLowerCase();
      const duplicateCount = locationCounts.get(locationKey) ?? 0;
      const idx = (locationOrder.get(locationKey) ?? 0) + 1;
      locationOrder.set(locationKey, idx);
      const label = duplicateCount > 1 ? `${baseLabel} (${idx})` : baseLabel;
      return `<button type="button" class="daily-event-switch-btn${active ? " active" : ""}" data-daily-event-key="${escapeHtml(
        key
      )}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(label)}</button>`;
    })
    .join("");
  dailyEventSwitch.querySelectorAll("[data-daily-event-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("data-daily-event-key");
      if (!key || key === focusedEventKeyForDaily) return;
      focusedEventKeyForDaily = key;
      renderDailyBookings();
    });
  });
}

function syncDailySourceTabsUi() {
  if (!dailySourceTabs || dailySourceTabs.length === 0) return;
  dailySourceTabs.forEach((tab) => {
    const mode = tab.dataset.dailySource || "bookings";
    const active = mode === dailyBookingsSourceMode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function renderDailyBookings() {
  syncDailySourceTabsUi();
  if (!dailyBookingsList) return;

  const filtered = getFilteredDashboardEvents();
  const isWeek = dailyBookingsViewMode === "week";

  if (filtered.length === 0 && dailyBookingsSourceMode !== "homeVisits") {
    dailyBookingsList.innerHTML = `<div class="empty-daily-bookings">Ei tapahtumia.</div>`;
    if (dailyBookingsContext) dailyBookingsContext.textContent = "";
    if (dailyEventSwitch) dailyEventSwitch.innerHTML = "";
    return;
  }

  let focusEvent;
  if (filtered.length === 0) {
    focusEvent = { startDate: startOfDay(new Date()).toISOString(), location: "", title: "" };
    if (dailyEventSwitch) dailyEventSwitch.innerHTML = "";
  } else {
    if (
      !focusedEventKeyForDaily ||
      !filtered.some((e) => eventKey(e) === focusedEventKeyForDaily)
    ) {
      const preferredFocus =
        filtered.find((event) => !shouldHideEventFromBookingsViews(event)) ?? filtered[0];
      focusedEventKeyForDaily = eventKey(preferredFocus);
    }
    focusEvent =
      filtered.find((e) => eventKey(e) === focusedEventKeyForDaily) ?? filtered[0];
    if (
      dailyBookingsSourceMode === "bookings" &&
      !isWeek &&
      shouldHideEventFromBookingsViews(focusEvent)
    ) {
      const focusDayKey = formatIsoDateKey(startOfDay(new Date(focusEvent.startDate)));
      const fieldOnDay = filtered.find((ev) => {
        if (shouldHideEventFromBookingsViews(ev)) return false;
        const d = new Date(ev.startDate ?? "");
        if (Number.isNaN(d.getTime())) return false;
        return formatIsoDateKey(startOfDay(d)) === focusDayKey;
      });
      if (fieldOnDay) {
        focusedEventKeyForDaily = eventKey(fieldOnDay);
        focusEvent = fieldOnDay;
      }
    }
    if (dailyBookingsSourceMode === "bookings") {
      renderDailyEventSwitch(focusEvent, filtered, isWeek);
    } else if (dailyEventSwitch) {
      dailyEventSwitch.innerHTML = "";
    }
  }

  const query = searchInput.value.trim().toLowerCase();
  let rows = [];

  if (dailyBookingsSourceMode === "bookings") {
    if (isWeek) {
      const weekKeys = getIsoWeekDateKeys(new Date(focusEvent.startDate));
      for (const ev of allEvents) {
        if (!weekKeys.includes(formatIsoDateKey(new Date(ev.startDate)))) continue;
        if (shouldHideEventFromBookingsViews(ev)) continue;
        const wkStart = new Date(ev.startDate ?? "");
        const wkKey = Number.isNaN(wkStart.getTime()) ? "" : formatIsoDateKey(wkStart);
        const text = `${ev.title ?? ""} ${ev.location} ${formatDateOnly(ev.startDate)} ${wkKey}`
          .toLowerCase()
          .trim();
        if (query && !text.includes(query)) continue;
        for (const raw of getApiBookingsFromEvent(ev)) {
          const mapped = mapApiBookingRow(raw, ev);
          if (mapped) rows.push(mapped);
        }
      }
    } else if (!shouldHideEventFromBookingsViews(focusEvent)) {
      for (const raw of getApiBookingsFromEvent(focusEvent)) {
        const mapped = mapApiBookingRow(raw, focusEvent);
        if (mapped) rows.push(mapped);
      }
    }
  }

  const focusDay = startOfDay(new Date(focusEvent.startDate));
  const rangeStart = isWeek
    ? new Date(
        focusDay.getFullYear(),
        focusDay.getMonth(),
        focusDay.getDate() - ((focusDay.getDay() + 6) % 7)
      )
    : focusDay;
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeStart.getDate() + (isWeek ? 7 : 1));

  if (dailyBookingsSourceMode === "homeVisits") {
    rows = homeVisits
      .filter((visit) => {
        const status = String(visit.status || "").toLowerCase();
        if (status !== "sovittu" && status !== "valmis") return false;
        const ts = visit.visit_time ?? visit.visit_date;
        if (!ts) return false;
        const visitTime = new Date(ts);
        if (Number.isNaN(visitTime.getTime())) return false;
        return visitTime >= rangeStart && visitTime < rangeEnd;
      })
      .map((visit) => ({
        kind: "home",
        visit,
        instant: new Date(visit.visit_time ?? visit.visit_date),
      }));
    if (query) {
      rows = rows.filter(({ visit }) => {
        const hay = `${visit.customer_name ?? ""} ${visit.nickname ?? ""} ${visit.details ?? ""} ${visit.address ?? ""}`
          .toLowerCase()
          .trim();
        return hay.includes(query);
      });
    }
  }

  rows.sort(sortBookingRows);

  if (dailyBookingsContext) {
    if (dailyBookingsSourceMode === "homeVisits") {
      dailyBookingsContext.textContent = `${formatDateOnly(rangeStart)}${isWeek ? " · viikko" : ""}`;
    } else {
      const loc = String(focusEvent.location ?? "").trim();
      dailyBookingsContext.textContent = loc
        ? `${loc} · ${formatDateOnly(focusEvent.startDate)}${isWeek ? " · viikko" : ""}`
        : `${formatDateOnly(focusEvent.startDate)}${isWeek ? " · viikko" : ""}`;
    }
  }

  const emptyMsg = dailyBookingsSourceMode === "homeVisits" ? "Ei kotikäyntejä." : "Ei varauksia.";
  if (rows.length === 0) {
    dailyBookingsList.innerHTML = `<div class="empty-daily-bookings">${emptyMsg}</div>`;
    return;
  }

  const html = rows
    .map((row) => {
      if (row.kind === "home") {
        const visit = row.visit;
        const timeStr = formatBookingTimeFi(row.instant);
        const { booker, customer, location } = getDailyHomeVisitDisplay(visit);
        const weekDate = isWeek
          ? `<p class="daily-booking-home-date">${escapeHtml(formatDateOnly(row.instant))}</p>`
          : "";
        const locationHtml = location
          ? `<p class="daily-booking-home-location">${escapeHtml(location)}</p>`
          : "";
        const bookerHtml = booker
          ? `<p class="daily-booking-home-booker">${escapeHtml(booker)}</p>`
          : "";
        return `
        <div class="daily-booking-row daily-booking-row--home">
          <div class="daily-booking-time daily-booking-time--home">${escapeHtml(timeStr)}</div>
          <div class="daily-booking-main daily-booking-main--home">
            ${weekDate}
            <p class="daily-booking-name daily-booking-name--home">${escapeHtml(customer)}</p>
            ${locationHtml}
            ${bookerHtml}
          </div>
        </div>`;
      }
      const { norm, event, instant } = row;
      const timeStr = formatBookingTimeFi(instant);
      const sub = buildBookingSubtitle(norm, event, isWeek);
      const phone = String(norm.phone || "").trim() || "-";
      return `
        <div class="daily-booking-row">
          <div class="daily-booking-time">${escapeHtml(timeStr)}</div>
          <div class="daily-booking-main">
            <p class="daily-booking-name">${escapeHtml(norm.name || "—")}</p>
            <p class="daily-booking-sub">${sub}</p>
            <p class="daily-booking-phone">Puh. ${escapeHtml(phone)}</p>
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

function getManualActiveEventBookingCountByKey(bookingsList = bookings) {
  const map = new Map();
  bookingsList.forEach((entry) => {
    if (!isActiveEventBooking(entry)) return;
    const key = String(entry.event_key || "").trim();
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return map;
}

function getDashboardEventMetrics(event, manualCountMap = null) {
  const manualMap = manualCountMap ?? getManualActiveEventBookingCountByKey();
  const manualCount = manualMap.get(eventKey(event)) ?? 0;
  const activeBookings = getApiBookingsFromEvent(event).filter(
    (raw) => !isCancelledApiBookingStatus(raw?.status)
  );
  const fallbackBookedReal = activeBookings.reduce(
    (sum, raw) => sum + (isApiBookingRealOccupancy(raw) ? 1 : 0),
    0
  );
  const fallbackBookedTotal = activeBookings.length;
  const fallbackBookedFake = Math.max(fallbackBookedTotal - fallbackBookedReal, 0);

  const apiBookedReal = parseFiniteNonNegativeNumber(event.bookedReal);
  const apiBookedTotal = parseFiniteNonNegativeNumber(event.bookedTotal);
  const apiBookedFake = parseFiniteNonNegativeNumber(event.bookedFake);
  const apiRemainingReal = parseFiniteNonNegativeNumber(event.remainingReal);
  const perEventCapacity = parseFiniteNonNegativeNumber(event.capacityPerEvent) ?? apiCapacityPerEvent;

  const bookedReal = apiBookedReal ?? fallbackBookedReal;
  const bookedTotal = apiBookedTotal ?? fallbackBookedTotal;
  const bookedFake = apiBookedFake ?? Math.max(bookedTotal - bookedReal, fallbackBookedFake, 0);
  const remainingReal = apiRemainingReal ?? Math.max(perEventCapacity - bookedReal, 0);
  const target = Math.max(bookedReal + remainingReal, 1);
  return {
    bookedReal,
    bookedTotal,
    bookedFake,
    remainingReal,
    target,
    manualCount,
  };
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

function applyHistoryPanelMode() {
  const isBookings = historyPanelMode === "bookings";
  historyPanelBookings?.classList.toggle("hidden", !isBookings);
  historyPanelPastHomeVisits?.classList.toggle("hidden", isBookings);
  historyModeTabs.forEach((tab) => {
    const mode = tab.dataset.historyMode;
    const active = mode === historyPanelMode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function switchView(view) {
  if (!SHOW_CALENDAR_NAV_AND_VIEW && view === "calendar") view = "dashboard";
  activeView = view;
  dashboardView?.classList.toggle("hidden", view !== "dashboard");
  calendarView?.classList.toggle(
    "hidden",
    !SHOW_CALENDAR_NAV_AND_VIEW || view !== "calendar"
  );
  homeVisitsView?.classList.toggle("hidden", view !== "homeVisits");
  bookingsView?.classList.toggle("hidden", view !== "bookings");
  historyView?.classList.toggle("hidden", view !== "history");
  setActiveNav(view);
  if (view === "calendar") renderCalendar();
  if (view === "homeVisits") renderHomeVisits();
  if (view === "bookings") renderBookings();
  if (view === "history") {
    applyHistoryPanelMode();
    renderHistory();
    renderHomeVisits();
  }
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

function getLocalBookingOwnerProfiles() {
  try {
    const raw = localStorage.getItem(BOOKING_OWNER_PROFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalBookingOwnerProfiles(entries) {
  localStorage.setItem(BOOKING_OWNER_PROFILES_STORAGE_KEY, JSON.stringify(entries));
}

function normalizeOwnerName(value) {
  return String(value || "").trim();
}

/** Estää tyhjän tai valintatekstin tallentumisen profiiliksi (vanhat virheelliset rivit suodatetaan pois). */
function isReservedOwnerProfileLabel(name) {
  const n = normalizeOwnerName(name).toLowerCase();
  if (!n) return true;
  return n === "valitse tekijä";
}

function getKnownOwnerNames() {
  const names = bookingOwnerProfiles
    .map((item) => normalizeOwnerName(item.name))
    .filter((n) => n && !isReservedOwnerProfileLabel(n));
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, "fi"));
}

function syncOwnerProfileActionState(selectElement, deleteButton) {
  if (!selectElement || !deleteButton) return;
  deleteButton.disabled = !normalizeOwnerName(selectElement.value);
}

function renderOwnerProfileSelect(selectElement, preferredOwner = "", placeholder = "Valitse tekijä") {
  if (!selectElement) return;
  const current = normalizeOwnerName(preferredOwner || selectElement.value);
  const names = getKnownOwnerNames();
  const hasCurrentOutsideProfiles = current && !names.includes(current);
  selectElement.innerHTML = [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...(hasCurrentOutsideProfiles
      ? [`<option value="${escapeHtml(current)}">${escapeHtml(current)} (ei profiilia)</option>`]
      : []),
    ...names.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`),
  ].join("");
  if (current && names.includes(current)) {
    selectElement.value = current;
  } else if (names.length === 1) {
    selectElement.value = names[0];
  }
}

function renderBookingOwnerOptions(preferredOwner = "", preferredHomeOwner = "") {
  renderOwnerProfileSelect(bookingOwner, preferredOwner, "Valitse tekijä");
  renderOwnerProfileSelect(hvNickname, preferredHomeOwner, "Valitse tekijä");
  syncOwnerProfileActionState(bookingOwner, deleteBookingOwnerProfileButton);
  syncOwnerProfileActionState(hvNickname, deleteHomeVisitProfileButton);
}

function sanitizeBookingOwnerProfilesList(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((row) => ({
      id: String(row.id || ""),
      name: normalizeOwnerName(row.name),
    }))
    .filter((row) => row.name && !isReservedOwnerProfileLabel(row.name));
}

async function loadBookingOwnerProfiles() {
  const client = getSupabase();
  if (!client) {
    bookingOwnerProfiles = sanitizeBookingOwnerProfilesList(getLocalBookingOwnerProfiles());
    setLocalBookingOwnerProfiles(bookingOwnerProfiles);
    renderBookingOwnerOptions();
    return;
  }
  const { data, error } = await client
    .from("booking_profiles")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) {
    bookingOwnerProfiles = sanitizeBookingOwnerProfilesList(getLocalBookingOwnerProfiles());
    setLocalBookingOwnerProfiles(bookingOwnerProfiles);
    renderBookingOwnerOptions();
    return;
  }
  bookingOwnerProfiles = sanitizeBookingOwnerProfilesList(data ?? []);
  setLocalBookingOwnerProfiles(bookingOwnerProfiles);
  renderBookingOwnerOptions();
}

async function createBookingOwnerProfile(nameRaw) {
  const name = normalizeOwnerName(nameRaw);
  if (!name) return { ok: false, message: "Nimi puuttuu." };
  if (isReservedOwnerProfileLabel(name)) {
    return { ok: false, message: "Valitse jokin muu profiilin nimi." };
  }
  const duplicateExists = getKnownOwnerNames().some(
    (candidate) => candidate.toLowerCase() === name.toLowerCase()
  );
  if (duplicateExists) {
    renderBookingOwnerOptions(name);
    return { ok: true };
  }

  const client = getSupabase();
  if (!client) {
    bookingOwnerProfiles = [...bookingOwnerProfiles, { id: crypto.randomUUID(), name }];
    setLocalBookingOwnerProfiles(bookingOwnerProfiles);
    renderBookingOwnerOptions(name);
    return { ok: true };
  }

  const { data, error } = await client
    .from("booking_profiles")
    .insert({ name })
    .select("id, name")
    .single();

  if (error) {
    bookingOwnerProfiles = [...bookingOwnerProfiles, { id: crypto.randomUUID(), name }];
    setLocalBookingOwnerProfiles(bookingOwnerProfiles);
    renderBookingOwnerOptions(name);
    return {
      ok: true,
      message: "Supabase-profiilien tallennus ei onnistunut. Profiili tallennettiin paikallisesti.",
    };
  }

  bookingOwnerProfiles = [...bookingOwnerProfiles, data]
    .map((row) => ({ id: String(row.id || ""), name: normalizeOwnerName(row.name) }))
    .filter((row) => row.name);
  setLocalBookingOwnerProfiles(bookingOwnerProfiles);
  renderBookingOwnerOptions(name);
  return { ok: true };
}

async function deleteBookingOwnerProfile(nameRaw) {
  const name = normalizeOwnerName(nameRaw);
  if (!name) return { ok: false, message: "Valitse poistettava profiili." };

  const client = getSupabase();
  if (!client) {
    bookingOwnerProfiles = bookingOwnerProfiles.filter(
      (item) => normalizeOwnerName(item.name).toLowerCase() !== name.toLowerCase()
    );
    setLocalBookingOwnerProfiles(bookingOwnerProfiles);
    renderBookingOwnerOptions("");
    return { ok: true };
  }

  const { error } = await client.from("booking_profiles").delete().eq("name", name);
  if (error) {
    bookingOwnerProfiles = bookingOwnerProfiles.filter(
      (item) => normalizeOwnerName(item.name).toLowerCase() !== name.toLowerCase()
    );
    setLocalBookingOwnerProfiles(bookingOwnerProfiles);
    renderBookingOwnerOptions("");
    return {
      ok: true,
      message: "Supabase-poisto ei onnistunut. Profiili poistettiin paikallisesta listasta.",
    };
  }

  bookingOwnerProfiles = bookingOwnerProfiles.filter(
    (item) => normalizeOwnerName(item.name).toLowerCase() !== name.toLowerCase()
  );
  setLocalBookingOwnerProfiles(bookingOwnerProfiles);
  renderBookingOwnerOptions("");
  return { ok: true };
}

function getEventsForDate(dateValue) {
  if (!dateValue) return [];
  return allEvents.filter((event) => formatIsoDateKey(new Date(event.startDate)) === dateValue);
}

function updateBookingEventOptions(preferredEventKey = "", preferredTimeValue = "") {
  if (!bookingDate || !bookingEventSelect) return;
  const previousTimeValue = bookingTime?.value || "";
  const events = getEventsForDate(bookingDate.value);
  if (events.length === 0) {
    bookingEventSelect.innerHTML = '<option value="">Ei tapahtumia</option>';
    bookingEventSelect.value = "";
    buildBookingTimeOptions(null);
    return;
  }
  const locationCounts = new Map();
  events.forEach((event) => {
    const key = String(event.location ?? "").trim().toLowerCase();
    if (!key) return;
    locationCounts.set(key, (locationCounts.get(key) ?? 0) + 1);
  });
  const locationOrder = new Map();
  bookingEventSelect.innerHTML = events
    .map((event) => {
      const baseLabel =
        String(event.location ?? "").trim() ||
        stripHistoryEventNamePrefix(event.title ?? "") ||
        "Tapahtuma";
      const locationKey = String(event.location ?? "").trim().toLowerCase();
      const duplicateCount = locationKey ? locationCounts.get(locationKey) ?? 0 : 0;
      const idx = locationKey ? (locationOrder.get(locationKey) ?? 0) + 1 : 0;
      if (locationKey) locationOrder.set(locationKey, idx);
      const label = duplicateCount > 1 ? `${baseLabel} (${idx})` : baseLabel;
      return `<option value="${escapeHtml(eventKey(event))}">${escapeHtml(label)}</option>`;
    })
    .join("");
  if (preferredEventKey && events.some((event) => eventKey(event) === preferredEventKey)) {
    bookingEventSelect.value = preferredEventKey;
  } else if (events.length === 1) {
    bookingEventSelect.value = eventKey(events[0]);
  }
  const selected = events.find((event) => eventKey(event) === bookingEventSelect.value) ?? events[0];
  buildBookingTimeOptions(selected, preferredTimeValue || previousTimeValue);
}

function getStatusLabel(status) {
  if (status === "vahvistettu") return "Vahvistettu";
  if (status === "peruttu") return "Peruttu";
  return "Odottaa";
}

function getEventLocationLabel(entry) {
  const raw = String(entry.event_name || "").trim();
  if (!raw) return "Ei tapahtumaa";
  const withoutPrefix = stripHistoryEventNamePrefix(raw);
  return stripEventDateTimeSuffix(withoutPrefix);
}

/** Historia-rivi: älä näytä toistuvaa tapahtumatyyppi-etuliitettä */
function stripHistoryEventNamePrefix(raw) {
  return String(raw || "")
    .trim()
    .replace(/^\s*kultamyyntitapahtuma\s*-\s*/i, "")
    .trim();
}

function stripEventDateTimeSuffix(raw) {
  const value = String(raw || "").trim();
  if (!value) return "Ei tapahtumaa";
  const cleaned = value
    .replace(/\s*[·-]\s*\d{1,2}\.\d{1,2}\.\d{2,4}\s*klo\s*\d{1,2}[.:]\d{2}\s*$/i, "")
    .replace(/\s*[·-]\s*\d{1,2}\.\d{1,2}\.\d{2,4}\s*$/i, "")
    .trim();
  return cleaned || value;
}

function formatEventBookingName(event) {
  if (!event || typeof event !== "object") return "";
  const location = String(event.location ?? "").trim();
  if (location) return location;
  const title = stripHistoryEventNamePrefix(event.title ?? "");
  return stripEventDateTimeSuffix(title);
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

function formatSelectTimeValue(d) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getApiBookingRangesForEvent(event) {
  const ranges = [];
  for (const raw of getApiBookingsFromEvent(event)) {
    if (!isApiBookingRealOccupancy(raw)) continue;
    const norm = normalizeApiBookingRow(raw);
    const startRaw = norm.startDate || norm.bookingDate;
    if (!startRaw) continue;
    let start = parseApiBookingInstant(startRaw, event.startDate);
    if (Number.isNaN(start.getTime())) continue;
    start = alignBookingInstantToEventDay(start, event.startDate);
    let end = norm.endDate ? parseApiBookingInstant(norm.endDate, event.startDate) : null;
    if (!end || Number.isNaN(end.getTime())) {
      end = addMinutesToDate(start, DRAWER_SLOT_STEP_MIN);
    } else {
      end = alignBookingInstantToEventDay(end, event.startDate);
    }
    if (end <= start) end = addMinutesToDate(start, DRAWER_SLOT_STEP_MIN);
    ranges.push({ start, end });
  }
  return ranges;
}

function getManualBookingRangesForEvent(event, options = {}) {
  const ranges = [];
  const key = eventKey(event);
  const excludeBookingId = String(options.excludeBookingId || "").trim();
  const eventStart = new Date(event?.startDate ?? "");
  if (!key || Number.isNaN(eventStart.getTime())) return ranges;

  bookings.forEach((entry) => {
    if (!isActiveEventBooking(entry)) return;
    if (String(entry.event_key || "").trim() !== key) return;
    if (excludeBookingId && String(entry.id || "").trim() === excludeBookingId) return;
    const timeValue = String(entry.booking_time || "").trim();
    if (!/^\d{1,2}:\d{2}$/.test(timeValue)) return;
    const [hh, mm] = timeValue.split(":").map((value) => Number(value));
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return;
    const start = new Date(
      eventStart.getFullYear(),
      eventStart.getMonth(),
      eventStart.getDate(),
      hh,
      mm,
      0,
      0
    );
    if (Number.isNaN(start.getTime())) return;
    const end = addMinutesToDate(start, DRAWER_SLOT_STEP_MIN);
    ranges.push({ start, end });
  });

  return ranges;
}

function getCombinedBookingRangesForEvent(event, options = {}) {
  return [
    ...getApiBookingRangesForEvent(event),
    ...getManualBookingRangesForEvent(event, options),
  ];
}

function buildBookingTimeOptions(selectedEvent = null, preferredTime = "") {
  if (!bookingTime) return;
  if (!selectedEvent) {
    bookingTime.innerHTML = '<option value="">Valitse ensin päivän tapahtuma</option>';
    return;
  }
  const eventStart = new Date(selectedEvent.startDate ?? "");
  if (Number.isNaN(eventStart.getTime())) {
    bookingTime.innerHTML = '<option value="">Tapahtuman aikaa ei voitu lukea</option>';
    return;
  }

  const rangeStart = new Date(
    eventStart.getFullYear(),
    eventStart.getMonth(),
    eventStart.getDate(),
    DRAWER_VISIBLE_START_HOUR,
    0,
    0,
    0
  );
  const rangeEnd = new Date(
    eventStart.getFullYear(),
    eventStart.getMonth(),
    eventStart.getDate(),
    DRAWER_VISIBLE_END_HOUR,
    0,
    0,
    0
  );
  const excludeBookingId = editingBookingId ? String(editingBookingId).trim() : "";
  const bookingRanges = getCombinedBookingRangesForEvent(selectedEvent, {
    excludeBookingId,
  });
  const options = ['<option value="">Valitse aika</option>'];
  let firstFreeValue = "";
  let preferredExists = false;

  for (
    let slotStart = new Date(rangeStart.getTime());
    slotStart < rangeEnd;
    slotStart = addMinutesToDate(slotStart, DRAWER_SLOT_STEP_MIN)
  ) {
    const slotEnd = addMinutesToDate(slotStart, DRAWER_SLOT_STEP_MIN);
    const value = formatSelectTimeValue(slotStart);
    const inBreak = isBreakSlot(slotStart, slotEnd);
    const isTaken = bookingRanges.some((range) => range.start < slotEnd && range.end > slotStart);
    const isUnavailable = isTaken || inBreak;
    const isPreferred = preferredTime === value;
    if (!isUnavailable && !firstFreeValue) firstFreeValue = value;
    if (isPreferred) preferredExists = true;
    const marker = isUnavailable ? "🔴" : "🟢";
    const suffix = inBreak ? "Tauko" : isTaken ? "Varattu" : "Vapaa";
    const selectedAttr = isPreferred ? ' selected="selected"' : "";
    const disabledAttr = isUnavailable && !isPreferred ? ' disabled="disabled"' : "";
    const styleAttr = isUnavailable
      ? ' style="color:#8b1e2d;background:#fde8eb;"'
      : ' style="color:#1f5f2a;background:#e8f7e9;"';
    options.push(
      `<option value="${value}"${selectedAttr}${disabledAttr}${styleAttr}>${marker} ${value} (${suffix})</option>`
    );
  }

  if (preferredTime && !preferredExists) {
    options.splice(
      1,
      0,
      `<option value="${escapeHtml(preferredTime)}" selected="selected">${escapeHtml(
        preferredTime
      )} (nykyinen valinta)</option>`
    );
  }

  bookingTime.innerHTML = options.join("");
  if (!preferredTime && firstFreeValue) {
    bookingTime.value = firstFreeValue;
  }
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
        `${entry.customer_name} ${entry.phone ?? ""} ${entry.email ?? ""} ${entry.booking_type ?? ""} ${entry.owner ?? ""} ${entry.event_name ?? ""} ${entry.details ?? ""}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => {
      const aCreated = new Date(a.created_at || `${a.booking_date}T${a.booking_time || "00:00"}:00`);
      const bCreated = new Date(b.created_at || `${b.booking_date}T${b.booking_time || "00:00"}:00`);
      return bCreated - aCreated;
    });

  if (filtered.length === 0) {
    bookingsBody.innerHTML = '<tr><td colspan="8">Ei varauksia.</td></tr>';
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
      const detailsText = String(entry.details ?? "").trim();
      const detailsHtml = detailsText
        ? `<p class="home-visit-note booking-list-details">${escapeHtml(detailsText)}</p>`
        : "";
      return `
        <tr>
          <td>
            <div class="event-cell-main">${escapeHtml(entry.customer_name)}</div>
            ${detailsHtml}
          </td>
          <td>
            <div class="event-cell-main">${escapeHtml(locationLabel)}</div>
            <div class="event-cell-meta">${escapeHtml(eventMeta)}</div>
          </td>
          <td>${escapeHtml(createdAtLabel)}</td>
          <td>${escapeHtml(entry.phone || "-")}</td>
          <td>${escapeHtml(entry.email?.trim() ? entry.email.trim() : "-")}</td>
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
    renderBookingOwnerOptions();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    renderTable();
    if (selectedEvent) renderDrawer(selectedEvent);
    return;
  }

  const { data, error } = await client
    .from("bookings")
    .select(
      "id, customer_name, phone, email, booking_type, booking_date, booking_time, event_key, event_name, status, owner, details, created_at"
    )
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });

  if (error) {
    bookings = getLocalBookings();
    renderBookings();
    renderBookingOwnerOptions();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    renderTable();
    if (selectedEvent) renderDrawer(selectedEvent);
    return;
  }
  bookings = data ?? [];
  renderBookings();
  renderBookingOwnerOptions();
  renderOverviewStats(bookings);
  renderCalendar();
  renderHistory();
  renderTable();
  if (selectedEvent) renderDrawer(selectedEvent);
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
    renderBookingOwnerOptions();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    renderTable();
    if (selectedEvent) renderDrawer(selectedEvent);
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
    renderBookingOwnerOptions();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    renderTable();
    if (selectedEvent) renderDrawer(selectedEvent);
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
    renderBookingOwnerOptions();
    renderOverviewStats(bookings);
    renderCalendar();
    renderHistory();
    renderTable();
    if (selectedEvent) renderDrawer(selectedEvent);
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
  if (bookingStatus) bookingStatus.value = "odottaa";
  renderBookingOwnerOptions();
}

function startBookingEdit(entry) {
  if (!bookingForm || !bookingCustomerName || !bookingDate || !bookingTime) return;
  editingBookingId = entry.id;
  bookingForm.classList.remove("hidden");
  bookingCustomerName.value = entry.customer_name || "";
  if (bookingPhone) bookingPhone.value = entry.phone || "";
  if (bookingEmail) bookingEmail.value = entry.email || "";
  bookingDate.value = entry.booking_date || "";
  updateBookingEventOptions(entry.event_key || "", entry.booking_time || "");
  renderBookingOwnerOptions(entry.owner || "");
  if (bookingStatus) bookingStatus.value = entry.status || "odottaa";
  if (bookingDetails) bookingDetails.value = entry.details || "";
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

async function deleteHomeVisit(id) {
  const client = getSupabase();
  if (!client) {
    homeVisits = homeVisits.filter((visit) => visit.id !== id);
    setLocalHomeVisits(homeVisits);
    renderOverviewStats();
    renderCalendar();
    renderHomeVisits();
    renderDailyBookings();
    return { ok: true };
  }
  const { error } = await client.from("home_visits").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  await loadHomeVisits();
  renderDailyBookings();
  return { ok: true };
}

function resetHomeVisitFormState() {
  editingHomeVisitId = null;
  if (saveHomeVisitButton) saveHomeVisitButton.textContent = "Tallenna kotikäynti";
  if (toggleHomeVisitFormButton) toggleHomeVisitFormButton.textContent = "+ Uusi kotikäynti";
  renderBookingOwnerOptions(bookingOwner?.value || "", "");
}

function startHomeVisitEdit(item) {
  if (!homeVisitForm || !hvNickname || !hvVisitDate || !hvVisitTime || !hvDetails) {
    return;
  }
  if (activeView !== "homeVisits") switchView("homeVisits");
  editingHomeVisitId = item.id;
  homeVisitForm.classList.remove("hidden");
  renderBookingOwnerOptions(bookingOwner?.value || "", item.nickname || "");
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
  hvVisitDate.focus();
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
    container.innerHTML = '<div class="empty-notes">Ei merkintöjä.</div>';
    return;
  }
  container.innerHTML = items
    .map((item) => {
      const status = item.status || "sovittu";
      const nicknameText = item.nickname?.trim();
      const timeLabel = formatDateTime(item.visit_time);
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
              </p>
              <p class="home-visit-note">${escapeHtml(item.details)}</p>
            </div>
            <div class="home-visit-actions">
              <button type="button" class="table-edit-button" data-home-visit-edit-id="${item.id}">
                Muokkaa
              </button>
              <button
                type="button"
                class="table-edit-button danger-button"
                data-home-visit-delete-id="${item.id}"
              >
                Poista
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

  container.querySelectorAll("[data-home-visit-delete-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-home-visit-delete-id");
      if (!id) return;
      const confirmed = window.confirm("Haluatko varmasti poistaa tämän kotikäynnin?");
      if (!confirmed) return;
      button.disabled = true;
      const result = await deleteHomeVisit(id);
      button.disabled = false;
      if (!result.ok) {
        alert(`Kotikäynnin poisto epäonnistui: ${result.message}`);
      }
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

  /* API: yksi tapahtuma = yksi päivä — lasketaan tapahtuman paikalliseen päivään, ei bookingDate-ISO:n
   * UTC-käännökseen (muuten luvut voivat siirtyä väärälle kuukausisolulle). */
  for (const ev of allEvents) {
    const eventStart = new Date(ev.startDate ?? "");
    if (Number.isNaN(eventStart.getTime())) continue;
    const eventDayKey = formatIsoDateKey(startOfDay(eventStart));

    for (const raw of getApiBookingsFromEvent(ev)) {
      if (!isApiBookingRealOccupancy(raw)) continue;
      bookingMap.set(eventDayKey, (bookingMap.get(eventDayKey) ?? 0) + 1);
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
  const todayKey = formatIsoDateKey(startOfDay(new Date()));

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
    const isToday = key === todayKey;
    const bookingClass = calendarMode === "bookings" ? "emphasis" : "";
    const homeClass = calendarMode === "homeVisits" ? "emphasis" : "";
    cells.push(`
      <article class="calendar-cell ${isCurrentMonth ? "" : "muted-day"} ${isToday ? "today" : ""}">
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

  const smoothPath = visiblePoints.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    return `${path} L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
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

function weeklyPulseBarHeightPct(count) {
  const height =
    WEEKLY_PULSE_BASE_HEIGHT_PCT + count * WEEKLY_PULSE_HEIGHT_PER_BOOKING_PCT;
  return Math.min(height, WEEKLY_PULSE_MAX_HEIGHT_PCT);
}

function renderWeeklyPulse(counts, todayIdx) {
  if (!weeklyPulseBars || !weeklyPulseValue) return;

  weeklyPulseBars.innerHTML = counts
    .map((count, idx) => {
      const heightPct = weeklyPulseBarHeightPct(count);
      const isToday = idx === todayIdx;
      return `
        <div class="weekly-pulse-col${isToday ? " is-today" : ""}" role="listitem" data-count="${count}">
          <div class="weekly-pulse-tooltip">${count} kpl</div>
          <div class="weekly-pulse-bar" style="height: ${heightPct.toFixed(2)}%"></div>
          <span class="weekly-pulse-day">${WEEKLY_PULSE_DAY_LABELS[idx]}</span>
        </div>
      `;
    })
    .join("");

  weeklyPulseValue.textContent = String(weeklyPulseTodayCount);
}

if (weeklyPulseBars && weeklyPulseValue) {
  weeklyPulseBars.addEventListener("mouseover", (event) => {
    const col = event.target.closest(".weekly-pulse-col");
    if (!col || !weeklyPulseBars.contains(col)) return;
    const value = Number(col.getAttribute("data-count")) || 0;
    weeklyPulseValue.textContent = String(value);
  });
  weeklyPulseBars.addEventListener("mouseleave", () => {
    weeklyPulseValue.textContent = String(weeklyPulseTodayCount);
  });
}

function getIsoWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target) / (7 * 24 * 3600 * 1000));
}

function getBookerColor(name, index) {
  if (index < BOOKER_COLOR_PALETTE.length) return BOOKER_COLOR_PALETTE[index];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 48%)`;
}

function getWeeklyBookerEntries(bookingsList = bookings) {
  const eventEntries = bookingsList.filter(isActiveEventBooking).map((entry) => ({
    owner: entry.owner,
    created_at: entry.created_at,
  }));
  const homeEntries = homeVisits
    .filter((visit) => {
      const status = String(visit.status || "").toLowerCase();
      return status === "sovittu" || status === "valmis";
    })
    .map((visit) => ({
      owner: visit.nickname || "",
      created_at: visit.created_at || visit.visit_time,
    }));
  return [...eventEntries, ...homeEntries];
}

function aggregateBookingsByOwner(activeBookings, weekStart, weekEnd) {
  const map = new Map();
  activeBookings.forEach((entry) => {
    const createdAt = new Date(entry.created_at);
    if (Number.isNaN(createdAt.getTime())) return;
    if (createdAt < weekStart || createdAt >= weekEnd) return;
    const rawOwner = normalizeOwnerName(entry.owner);
    const name = rawOwner || "Ei tekijää";
    map.set(name, (map.get(name) ?? 0) + 1);
  });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "fi"));
}

let weeklyBookersActiveLabel = null;
let weeklyBookersSegments = [];

function formatWeeklyBookerCountLabel(count) {
  const n = Math.round(Number(count));
  if (!Number.isFinite(n) || n <= 0) return "0 VARAUSTA";
  if (n === 1) return "1 VARAUS";
  return `${n} VARAUSTA`;
}

function getFirstPlaceBookers(segments) {
  if (!segments.length) return [];
  const topValue = segments[0].value;
  return segments.filter((seg) => seg.value === topValue).map((seg) => seg.name);
}

function renderWeeklyTopNamesHtml(names) {
  if (!names.length) {
    return '<span class="weekly-bookers-top-name">—</span>';
  }
  return names
    .map((name) => `<span class="weekly-bookers-top-name">${escapeHtml(name)}</span>`)
    .join("");
}

function setWeeklyBookersCenterDisplay(names, count) {
  if (weeklyBookersTopName) {
    weeklyBookersTopName.innerHTML = renderWeeklyTopNamesHtml(names);
  }
  if (weeklyBookersTopValue) {
    weeklyBookersTopValue.textContent =
      count === "—" ? "—" : formatWeeklyBookerCountLabel(count);
  }
}

function renderWeeklyBookers(activeBookings, weekStart, weekEnd) {
  if (!weeklyBookersDonut || !weeklyBookersLegend) return;

  weeklyBookersSegments = aggregateBookingsByOwner(activeBookings, weekStart, weekEnd).map(
    (entry, idx) => ({
      ...entry,
      color: getBookerColor(entry.name, idx),
      label: entry.name,
    })
  );
  const segments = weeklyBookersSegments;
  const totalValue = segments.reduce((sum, seg) => sum + seg.value, 0);

  if (weeklyBookersWeekLabel) {
    weeklyBookersWeekLabel.textContent = "👑";
  }

  if (weeklyBookersTotal) {
    weeklyBookersTotal.innerHTML = `<span class="weekly-bookers-count-label">${formatWeeklyBookerCountLabel(
      totalValue
    )}</span>`;
  }

  const radius = 80;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  if (totalValue === 0 || segments.length === 0) {
    weeklyBookersDonut.innerHTML = `
      <circle class="donut-track" cx="${cx}" cy="${cy}" r="${radius}" stroke-width="${strokeWidth}"></circle>
    `;
    setWeeklyBookersCenterDisplay(["Ei varauksia"], "—");
    weeklyBookersLegend.innerHTML =
      '<li class="weekly-bookers-empty">Tällä viikolla ei vielä varauksia.</li>';
    weeklyBookersActiveLabel = null;
    return;
  }

  let cumulative = 0;
  const arcs = segments
    .map((seg) => {
      const pct = seg.value / totalValue;
      const dash = pct * circumference;
      const offset = -cumulative * circumference;
      cumulative += pct;
      return `
        <circle
          class="donut-segment"
          data-label="${escapeAttr(seg.label)}"
          cx="${cx}"
          cy="${cy}"
          r="${radius}"
          stroke="${seg.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${dash.toFixed(2)} ${circumference.toFixed(2)}"
          stroke-dashoffset="${offset.toFixed(2)}"
          style="color: ${seg.color}; transform: rotate(-90deg); transform-origin: ${cx}px ${cy}px;"
        ></circle>
      `;
    })
    .join("");

  weeklyBookersDonut.innerHTML = `
    <circle class="donut-track" cx="${cx}" cy="${cy}" r="${radius}" stroke-width="${strokeWidth}"></circle>
    ${arcs}
  `;

  const top = segments[0];
  setWeeklyBookersCenterDisplay(getFirstPlaceBookers(segments), top.value);

  weeklyBookersLegend.innerHTML = segments
    .map((seg) => {
      const pct = totalValue === 0 ? 0 : Math.round((seg.value / totalValue) * 100);
      return `
        <li class="weekly-bookers-legend-item" data-label="${escapeAttr(seg.label)}">
          <span class="weekly-bookers-legend-dot" style="background:${seg.color};"></span>
          <span class="weekly-bookers-legend-name" title="${escapeAttr(seg.name)}">${escapeHtml(seg.name)}</span>
          <span class="weekly-bookers-legend-count">${seg.value} · ${pct}%</span>
        </li>
      `;
    })
    .join("");

  setWeeklyBookersActive(weeklyBookersActiveLabel);
}

function setWeeklyBookersActive(label) {
  const segments = weeklyBookersSegments;
  const top = segments[0] ?? null;
  const segs = weeklyBookersDonut?.querySelectorAll(".donut-segment") ?? [];
  const legendItems = weeklyBookersLegend?.querySelectorAll(".weekly-bookers-legend-item") ?? [];
  const exists =
    !label || segments.some((seg) => seg.label === label);
  const effective = exists ? label : null;
  weeklyBookersActiveLabel = effective;

  segs.forEach((el) => {
    const isMatch = effective && el.getAttribute("data-label") === effective;
    el.classList.toggle("is-active", Boolean(isMatch));
    el.classList.toggle("is-dimmed", Boolean(effective) && !isMatch);
  });
  legendItems.forEach((el) => {
    const isMatch = effective && el.getAttribute("data-label") === effective;
    el.classList.toggle("is-active", Boolean(isMatch));
  });

  if (top) {
    const showSeg = effective
      ? segments.find((seg) => seg.label === effective)
      : null;
    if (showSeg) {
      setWeeklyBookersCenterDisplay([showSeg.name], showSeg.value);
    } else {
      setWeeklyBookersCenterDisplay(getFirstPlaceBookers(segments), top.value);
    }
  }
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

if (weeklyBookersDonut) {
  weeklyBookersDonut.addEventListener("mouseover", (event) => {
    const seg = event.target.closest(".donut-segment");
    if (!seg) return;
    setWeeklyBookersActive(seg.getAttribute("data-label"));
  });
  weeklyBookersDonut.addEventListener("mouseleave", () => {
    setWeeklyBookersActive(null);
  });
}

if (weeklyBookersLegend) {
  weeklyBookersLegend.addEventListener("mouseover", (event) => {
    const item = event.target.closest(".weekly-bookers-legend-item");
    if (!item) return;
    setWeeklyBookersActive(item.getAttribute("data-label"));
  });
  weeklyBookersLegend.addEventListener("mouseleave", () => {
    setWeeklyBookersActive(null);
  });
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
    chartCaption.textContent = `+${todayCount - TODAY_TARGET}`;
  } else {
    chartCaption.textContent = `${TODAY_TARGET - todayCount} vajaa`;
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

  const monday = startOfDay(now);
  const dayOfWeek = monday.getDay();
  const shift = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - shift);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  const weekDates = Array.from({ length: 7 }, (_, idx) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + idx);
    return day;
  });
  const weekCounts = weekDates.map((date) => dayCountMap.get(formatIsoDateKey(date)) ?? 0);
  const todayIdx = shift;
  weeklyPulseTodayCount = weekCounts[todayIdx] ?? 0;

  renderWeeklyPulse(weekCounts, todayIdx);
  renderWeeklyBookers(getWeeklyBookerEntries(bookingsList), monday, sunday);
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
    notesList.innerHTML = '<div class="empty-notes">Ei merkintöjä.</div>';
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
  if (eventBookings.length === 0) {
    historyList.innerHTML = '<div class="empty-notes">Ei varauksia.</div>';
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
      const eventLine = getEventLocationLabel(entry);
      return `
      <article class="history-item">
        <div class="history-top">
          <h3 class="history-title">${escapeHtml(entry.customer_name || "Asiakas")}</h3>
          <span class="history-date">${formatDateOnly(entry.booking_date)}</span>
        </div>
        <p class="history-comment">
          ${escapeHtml(eventLine)} - ${escapeHtml(
        entry.booking_time || "--:--"
      )} - ${getStatusLabel(entry.status)}
        </p>
        ${
          entry.details
            ? `<p class="history-comment history-comment--details">${escapeHtml(entry.details)}</p>`
            : ""
        }
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
      '<div class="empty-notes">Supabase ei käytössä (puuttuvat URL / avain).</div>';
    return;
  }

  notesList.innerHTML = '<div class="empty-notes">Ladataan…</div>';
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
    drawerSlotList.innerHTML = '<p class="drawer-slots-empty">Aikaa ei saatu.</p>';
    return;
  }

  const rangeStart = new Date(
    eventStart.getFullYear(),
    eventStart.getMonth(),
    eventStart.getDate(),
    DRAWER_VISIBLE_START_HOUR,
    0,
    0,
    0
  );
  const rangeEnd = new Date(
    eventStart.getFullYear(),
    eventStart.getMonth(),
    eventStart.getDate(),
    DRAWER_VISIBLE_END_HOUR,
    0,
    0,
    0
  );
  if (rangeEnd <= rangeStart) {
    drawerSlotList.innerHTML = '<p class="drawer-slots-empty">Ei aikoja.</p>';
    return;
  }

  const realRanges = getCombinedBookingRangesForEvent(event);

  const slotStarts = [];
  for (
    let cursor = new Date(rangeStart.getTime());
    cursor < rangeEnd && slotStarts.length < DRAWER_SLOT_MAX_ROWS;
    cursor = addMinutesToDate(cursor, DRAWER_SLOT_STEP_MIN)
  ) {
    slotStarts.push(new Date(cursor.getTime()));
  }

  if (slotStarts.length === 0) {
    drawerSlotList.innerHTML = '<p class="drawer-slots-empty">Ei aikoja.</p>';
    return;
  }

  drawerSlotList.innerHTML = slotStarts
    .map((slotStart) => {
      const slotEnd = addMinutesToDate(slotStart, DRAWER_SLOT_STEP_MIN);
      const inBreak = isBreakSlot(slotStart, slotEnd);
      const taken = realRanges.some(
        (bookingRange) => bookingRange.start < slotEnd && bookingRange.end > slotStart
      );
      const unavailable = taken || inBreak;
      const label = `${formatBookingTimeFi(slotStart)} - ${formatBookingTimeFi(slotEnd)}`;
      const rowClass = unavailable ? "drawer-slot-row drawer-slot-row--busy" : "drawer-slot-row";
      const badgeClass = unavailable
        ? "drawer-slot-badge drawer-slot-badge--busy"
        : "drawer-slot-badge drawer-slot-badge--free";
      const badgeText = inBreak ? "Tauko" : taken ? "Varattu" : "Vapaa";
      return `
      <div class="${rowClass}">
        <span class="drawer-slot-time">${escapeHtml(label)}</span>
        <span class="${badgeClass}">${badgeText}</span>
      </div>`;
    })
    .join("");
}

function renderDrawer(event) {
  const metrics = getDashboardEventMetrics(event);
  drawerTitle.textContent = event.title;
  drawerMeta.innerHTML = `
    <div class="meta-row"><span class="meta-label">Paikka</span><span class="meta-value">${escapeHtml(event.location)}</span></div>
    <div class="meta-row"><span class="meta-label">Aika</span><span class="meta-value">${formatDateTime(
      event.startDate
    )}</span></div>
    <div class="meta-row"><span class="meta-label">Yhteensä</span><span class="meta-value">${
      metrics.bookedTotal
    }</span></div>
    <div class="meta-row"><span class="meta-label">Dummy</span><span class="meta-value">${
      metrics.bookedFake
    }</span></div>
    <div class="meta-row"><span class="meta-label">Varatut</span><span class="meta-value">${
      metrics.bookedReal
    }</span></div>
    <div class="meta-row"><span class="meta-label">Vapaana</span><span class="meta-value">${
      metrics.remainingReal
    }</span></div>
    <div class="meta-row"><span class="meta-label">Käsintehty</span><span class="meta-value">${
      metrics.manualCount
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
  const manualCountMap = getManualActiveEventBookingCountByKey();

  if (filtered.length === 0) {
    eventsBody.innerHTML = `
      <div class="empty-notes">Ei osumia.</div>
    `;
    if (toggleEventsButton) toggleEventsButton.classList.add("hidden");
    statusText.textContent = "Ei tapahtumia.";
    focusedEventKeyForDaily = null;
    renderDailyBookings();
    syncDailyViewTabsUi();
    syncDailySourceTabsUi();
    return;
  }

  if (
    !focusedEventKeyForDaily ||
    !filtered.some((e) => eventKey(e) === focusedEventKeyForDaily)
  ) {
    const preferredFocus =
      filtered.find((event) => !shouldHideEventFromBookingsViews(event)) ?? filtered[0];
    focusedEventKeyForDaily = eventKey(preferredFocus);
  }

  const fieldEvents = filtered.filter((event) => !shouldHideEventFromBookingsViews(event));
  const visibleFieldEvents = showAllEvents ? fieldEvents : fieldEvents.slice(0, 4);
  let officeSectionHtml = "";
  if (SHOW_OFFICE_VISITS_SECTION) {
    const focusEventForOffice =
      filtered.find((event) => eventKey(event) === focusedEventKeyForDaily) ??
      fieldEvents[0] ??
      filtered[0];
    const isWeek = dailyBookingsViewMode === "week";
    const officeQuery = searchInput.value.trim().toLowerCase();
    const officeRows = collectOfficeBookingRows(focusEventForOffice, isWeek, officeQuery);
    officeSectionHtml = officeRows.length ? renderOfficeVisitsBlock(officeRows, isWeek) : "";
  }
  const rows = visibleFieldEvents
    .map((event, index) => {
      const { bookedReal, bookedTotal, bookedFake, remainingReal, target, manualCount } =
        getDashboardEventMetrics(event, manualCountMap);
      const progressPct = Math.min((bookedReal / target) * 100, 100);
      const goalMarkPct = Math.min(100, Math.max(0, (TODAY_TARGET / target) * 100));
      const progressClass = getBookingColorClass(bookedReal);
      const focusClass =
        eventKey(event) === focusedEventKeyForDaily ? " event-progress-item--focus" : "";
      return `
      <article class="event-progress-item${focusClass}" data-event-index="${index}" title="${escapeHtml(
        formatEventSelectLabel(event)
      )}">
        <div class="event-progress-head">
          <div>
            <p class="event-progress-location">${escapeHtml(event.location)}</p>
            <p class="event-progress-date">${escapeHtml(formatEventDayAndTime(event.startDate))}</p>
          </div>
          <p class="event-progress-value"><span>${bookedReal}</span> / ${target}</p>
        </div>
        <div class="event-progress-bar" role="img" aria-label="${bookedReal} / ${target}, tavoiteviiva 12">
          <div class="event-progress-fill ${progressClass}" style="width: ${progressPct.toFixed(1)}%"></div>
          <span class="event-progress-goal-marker" style="left: ${goalMarkPct.toFixed(2)}%;" title="12 / pv"></span>
          <span class="event-progress-target">${target}</span>
        </div>
        <div class="event-progress-meta">
          <span>Yht. ${bookedTotal}</span>
          <span>Dummy ${bookedFake}</span>
          ${manualCount > 0 ? `<span>Käs. ${manualCount}</span>` : ""}
          <span>Vap. ${remainingReal}</span>
          <span class="event-progress-arrow">›</span>
        </div>
      </article>
      `;
    })
    .join("");

  eventsBody.innerHTML = officeSectionHtml + rows;
  if (toggleEventsButton) {
    if (fieldEvents.length > 4) {
      toggleEventsButton.classList.remove("hidden");
      toggleEventsButton.textContent = showAllEvents ? "Vain 4" : `Kaikki (${fieldEvents.length})`;
    } else {
      toggleEventsButton.classList.add("hidden");
    }
  }
  const visibleCount = visibleFieldEvents.length + (officeSectionHtml ? 1 : 0);
  statusText.textContent = `${visibleCount} / ${filtered.length}`;

  eventsBody.querySelectorAll(".event-progress-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = Number(item.getAttribute("data-event-index"));
      const event = visibleFieldEvents[index];
      if (!event) return;
      focusedEventKeyForDaily = eventKey(event);
      openDrawer(event);
      renderTable();
    });
  });

  renderDailyBookings();
  syncDailyViewTabsUi();
  syncDailySourceTabsUi();
}

async function loadData() {
  if (!appStarted) return;
  statusText.textContent = "Ladataan…";

  try {
    const response = await fetch(BOOKERS_API_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.ok || !Array.isArray(data.events)) {
      throw new Error("Virheellinen vastaus.");
    }

    generatedAt = data.generatedAt ? new Date(data.generatedAt) : new Date();
    apiCapacityPerEvent = parseFiniteNonNegativeNumber(data.capacityPerEvent) ?? apiCapacityPerEvent;
    allEvents = [...data.events].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );

    await refreshAllNotesData();
    renderTable();
    renderCalendar();
    updateBookingEventOptions();
    renderBookings();
    updatedText.textContent = formatDateTime(generatedAt);

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
    statusText.textContent = `Virhe: ${error.message}`;
    updatedText.textContent = "";
    eventsBody.innerHTML = `
      <div class="empty-notes">Lataus epäonnistui.</div>
    `;
  }
}

searchInput.addEventListener("input", renderTable);

dailyViewTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    dailyBookingsViewMode = tab.dataset.dailyMode === "week" ? "week" : "day";
    syncDailyViewTabsUi();
    renderTable();
  });
});

dailySourceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const next = tab.dataset.dailySource;
    if (!next || next === dailyBookingsSourceMode) return;
    dailyBookingsSourceMode = next;
    renderDailyBookings();
  });
});

if (SHOW_OFFICE_VISITS_SECTION && eventsBody && !eventsBody.dataset.officeToggleBound) {
  eventsBody.dataset.officeToggleBound = "1";
  eventsBody.addEventListener("click", (event) => {
    if (!event.target.closest("[data-office-visits-toggle]")) return;
    officeVisitsExpanded = !officeVisitsExpanded;
    renderTable();
  });
}

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
if (bookingEventSelect) {
  bookingEventSelect.addEventListener("change", () => {
    const selected = getEventsForDate(bookingDate?.value || "").find(
      (item) => eventKey(item) === bookingEventSelect.value
    );
    buildBookingTimeOptions(selected, bookingTime?.value || "");
  });
}
if (addBookingOwnerProfileButton) {
  addBookingOwnerProfileButton.addEventListener("click", async () => {
    const input = window.prompt("Anna uuden profiilin nimi");
    const name = normalizeOwnerName(input);
    if (!name) return;
    addBookingOwnerProfileButton.disabled = true;
    const result = await createBookingOwnerProfile(name);
    addBookingOwnerProfileButton.disabled = false;
    if (!result.ok) {
      alert(result.message || "Profiilin luonti epäonnistui.");
      return;
    }
    if (result.message) {
      alert(result.message);
    }
    if (bookingOwner) bookingOwner.value = name;
  });
}
if (deleteBookingOwnerProfileButton) {
  deleteBookingOwnerProfileButton.addEventListener("click", async () => {
    const selectedName = normalizeOwnerName(bookingOwner?.value);
    if (!selectedName) {
      alert("Valitse ensin poistettava profiili.");
      return;
    }
    const confirmed = window.confirm(`Haluatko varmasti poistaa profiilin "${selectedName}"?`);
    if (!confirmed) return;
    deleteBookingOwnerProfileButton.disabled = true;
    const result = await deleteBookingOwnerProfile(selectedName);
    deleteBookingOwnerProfileButton.disabled = false;
    if (!result.ok) {
      alert(result.message || "Profiilin poisto epäonnistui.");
      return;
    }
    if (result.message) {
      alert(result.message);
    }
  });
}
if (addHomeVisitProfileButton) {
  addHomeVisitProfileButton.addEventListener("click", async () => {
    const input = window.prompt("Anna uuden profiilin nimi");
    const name = normalizeOwnerName(input);
    if (!name) return;
    addHomeVisitProfileButton.disabled = true;
    const result = await createBookingOwnerProfile(name);
    addHomeVisitProfileButton.disabled = false;
    if (!result.ok) {
      alert(result.message || "Profiilin luonti epäonnistui.");
      return;
    }
    if (result.message) {
      alert(result.message);
    }
    if (hvNickname) hvNickname.value = name;
    syncOwnerProfileActionState(hvNickname, deleteHomeVisitProfileButton);
  });
}
if (deleteHomeVisitProfileButton) {
  deleteHomeVisitProfileButton.addEventListener("click", async () => {
    const selectedName = normalizeOwnerName(hvNickname?.value);
    if (!selectedName) {
      alert("Valitse ensin poistettava profiili.");
      return;
    }
    const confirmed = window.confirm(`Haluatko varmasti poistaa profiilin "${selectedName}"?`);
    if (!confirmed) return;
    deleteHomeVisitProfileButton.disabled = true;
    const result = await deleteBookingOwnerProfile(selectedName);
    deleteHomeVisitProfileButton.disabled = false;
    if (!result.ok) {
      alert(result.message || "Profiilin poisto epäonnistui.");
      return;
    }
    if (result.message) {
      alert(result.message);
    }
  });
}
if (bookingOwner) {
  bookingOwner.addEventListener("change", () =>
    syncOwnerProfileActionState(bookingOwner, deleteBookingOwnerProfileButton)
  );
}
if (hvNickname) {
  hvNickname.addEventListener("change", () =>
    syncOwnerProfileActionState(hvNickname, deleteHomeVisitProfileButton)
  );
}
buildBookingTimeOptions();
renderBookingOwnerOptions();
buildHomeVisitTimeOptions();
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const view = item.dataset.view;
    if (!view) return;
    switchView(view);
  });
});

historyModeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const mode = tab.dataset.historyMode;
    if (!mode || mode === historyPanelMode) return;
    historyPanelMode = mode;
    applyHistoryPanelMode();
    if (mode === "pastHomeVisits") renderHomeVisits();
    if (mode === "bookings") renderHistory();
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
    if (!hvNickname || !hvVisitDate || !hvVisitTime || !hvDetails) return;
    const nickname = normalizeOwnerName(hvNickname.value);
    const visitDate = hvVisitDate.value;
    const visitTime = hvVisitTime.value;
    const details = hvDetails.value.trim();
    if (!nickname || !visitDate || !visitTime || !details) return;

    const existing = editingHomeVisitId
      ? homeVisits.find((v) => v.id === editingHomeVisitId)
      : null;
    const preservedPhone = String(existing?.phone ?? "").trim();
    const preservedAddr = String(existing?.address ?? "").trim();

    if (saveHomeVisitButton) saveHomeVisitButton.disabled = true;
    const payload = {
      customer_name: nickname,
      nickname,
      phone: preservedPhone,
      address: preservedAddr || "-",
      visit_time: new Date(`${visitDate}T${visitTime}:00`).toISOString(),
      details,
      status: existing?.status ?? "sovittu",
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
    const email = bookingEmail?.value.trim() ?? "";
    const status = bookingStatus?.value || "odottaa";
    const owner = bookingOwner?.value.trim() ?? "";
    const details = bookingDetails?.value.trim() ?? "";
    const selectedKey = bookingEventSelect?.value ?? "";
    const eventOfDay = getEventsForDate(date).find((item) => eventKey(item) === selectedKey);
    const eventName = formatEventBookingName(eventOfDay);

    if (!customerName || !date || !selectedTime) {
      alert("Valitse aika listasta.");
      return;
    }
    if (eventOfDay) {
      const [hhRaw, mmRaw] = selectedTime.split(":");
      const hh = Number(hhRaw);
      const mm = Number(mmRaw);
      if (Number.isFinite(hh) && Number.isFinite(mm)) {
        const eventStart = new Date(eventOfDay.startDate ?? "");
        if (!Number.isNaN(eventStart.getTime())) {
          const slotStart = new Date(
            eventStart.getFullYear(),
            eventStart.getMonth(),
            eventStart.getDate(),
            hh,
            mm,
            0,
            0
          );
          const slotEnd = addMinutesToDate(slotStart, DRAWER_SLOT_STEP_MIN);
          if (isBreakSlot(slotStart, slotEnd)) {
            alert("Valittu aika osuu taukoon. Valitse toinen aika.");
            buildBookingTimeOptions(eventOfDay, selectedTime);
            return;
          }
          const excludeBookingId = editingBookingId ? String(editingBookingId).trim() : "";
          const isTaken = getCombinedBookingRangesForEvent(eventOfDay, {
            excludeBookingId,
          }).some((range) => range.start < slotEnd && range.end > slotStart);
          if (isTaken) {
            alert("Valittu aika on jo varattu. Valitse toinen aika.");
            buildBookingTimeOptions(eventOfDay, selectedTime);
            return;
          }
        }
      }
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
      details: details || null,
    };
    if (email) {
      payload.email = email;
    }
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

if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    if (!appStarted) return;
    void loadData();
  });
}
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
  void loadBookingOwnerProfiles();
  void loadHomeVisits();
  void loadBookings();
  void loadData();
  setInterval(() => {
    void loadBookingOwnerProfiles();
    void loadHomeVisits();
    void loadBookings();
    void loadData();
  }, REFRESH_MS);
}

let pinVerifyInFlight = false;

async function verifyPinViaSupabase(pin) {
  const client = getSupabase();
  if (!client) {
    console.warn("[verify-pin] Supabase client ei ole konfiguroitu (.env puuttuu?).");
    return { ok: false, error: "supabase_not_configured" };
  }
  try {
    const { data, error } = await client.functions.invoke(
      PIN_VERIFY_FUNCTION_NAME,
      { body: { pin } }
    );
    if (error) {
      console.error("[verify-pin] Supabase invoke error:", error);
      return { ok: false, error: error.message || "network_error" };
    }
    if (data && typeof data === "object") {
      return {
        ok: Boolean(data.ok),
        error: typeof data.error === "string" ? data.error : null,
      };
    }
    console.error("[verify-pin] Odottamaton vastaus:", data);
    return { ok: false, error: "invalid_response" };
  } catch (err) {
    console.error("[verify-pin] Kutsu kaatui:", err);
    return { ok: false, error: err?.message || "network_error" };
  }
}

async function tryUnlockWithPin() {
  if (!pinInput || !pinError) return;
  if (pinVerifyInFlight) return;
  const entered = pinInput.value.trim();
  if (!entered) {
    pinError.textContent = "Anna salasana.";
    pinError.classList.remove("hidden");
    return;
  }

  pinVerifyInFlight = true;
  const originalSubmitLabel = pinSubmitButton?.textContent ?? "";
  if (pinSubmitButton) {
    pinSubmitButton.disabled = true;
    pinSubmitButton.textContent = "Tarkistetaan…";
  }
  if (pinInput) pinInput.disabled = true;
  pinError.classList.add("hidden");

  const result = await verifyPinViaSupabase(entered);

  pinVerifyInFlight = false;
  if (pinSubmitButton) {
    pinSubmitButton.disabled = false;
    pinSubmitButton.textContent = originalSubmitLabel || "Sisään";
  }
  if (pinInput) pinInput.disabled = false;

  if (result.ok) {
    pinError.classList.add("hidden");
    startDashboard();
    return;
  }

  let message = "Väärä salasana. Yritä uudelleen.";
  if (result.error === "supabase_not_configured") {
    message = "Salasanan tarkistus ei ole käytettävissä (Supabase puuttuu).";
  } else if (result.error === "server_secret_missing") {
    message = "Salasanaa ei ole määritetty palvelimella.";
  } else if (result.error === "pin_required") {
    message = "Anna salasana.";
  } else if (
    result.error === "network_error" ||
    result.error === "invalid_response" ||
    result.error === "invalid_json"
  ) {
    message = "Yhteysvirhe palvelimeen. Yritä uudelleen.";
  }
  pinError.textContent = message;
  pinError.classList.remove("hidden");
  pinInput.value = "";
  pinInput.focus();
}

if (pinForm) {
  pinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void tryUnlockWithPin();
  });
}

if (pinSubmitButton) {
  pinSubmitButton.addEventListener("click", (event) => {
    event.preventDefault();
    void tryUnlockWithPin();
  });
}

if (pinInput) {
  pinInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void tryUnlockWithPin();
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
