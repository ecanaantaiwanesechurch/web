const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDateString(dateStr) {
  // Handle arrow format (cross-month): "1/30/2026 -> 2/2/2026"
  if (dateStr.includes('->')) {
    const [startStr, endStr] = dateStr.split('->').map(s => s.trim());
    const [startMonth, startDay, startYear] = startStr.split('/').map(s => parseInt(s));
    const [endMonth, endDay, endYear] = endStr.split('/').map(s => parseInt(s));

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    return {
      startDate,
      endDate,
      display: `${startDay}-${endDay}`,
      dayOfWeek: `${shortDayNames[startDate.getDay()]}-${shortDayNames[endDate.getDay()]}`,
      sortKey: startDate,
      month: startMonth,
      year: startYear
    };
  }

  // Parse simple or dash format
  const [month, dayPart, year] = dateStr.split('/');
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  // Handle dash format (same month): "18-19"
  if (dayPart.includes('-')) {
    const [startDay, endDay] = dayPart.split('-').map(d => parseInt(d));
    const startDate = new Date(yearNum, monthNum - 1, startDay);
    const endDate = new Date(yearNum, monthNum - 1, endDay);

    return {
      startDate,
      endDate,
      display: dayPart,
      dayOfWeek: `${shortDayNames[startDate.getDay()]}-${shortDayNames[endDate.getDay()]}`,
      sortKey: startDate,
      month: monthNum,
      year: yearNum
    };
  }

  // Single day
  const day = parseInt(dayPart);
  const date = new Date(yearNum, monthNum - 1, day);

  return {
    startDate: date,
    endDate: date,
    display: dayPart,
    dayOfWeek: dayNames[date.getDay()],
    sortKey: date,
    month: monthNum,
    year: yearNum
  };
}

function groupEventsByMonth(events) {
  const grouped = {};

  events.forEach(event => {
    const parsed = parseDateString(event.date);
    const key = `${monthNames[parsed.month - 1]} ${parsed.year}`;

    if (!grouped[key]) {
      grouped[key] = {
        month: monthNames[parsed.month - 1],
        year: parsed.year,
        sortKey: parsed.sortKey,
        events: []
      };
    }
    grouped[key].events.push({ ...event, parsed });
  });

  // Sort events within each month
  Object.values(grouped).forEach(g => {
    g.events.sort((a, b) => a.parsed.sortKey - b.parsed.sortKey);
  });

  // Return sorted array of month groups
  return Object.values(grouped).sort((a, b) => a.sortKey - b.sortKey);
}

function eventCardHtml(event, type = 'ministry') {
  if (type === 'fellowship') {
    return fellowshipEventCardHtml(event);
  }

  // Ministry event card
  const hasDetails = event.details && event.details.trim();
  const hasTime = event.time && event.time.trim();
  const styleClass = event.style ? event.style.trim() : '';

  return `
    <div class="card bg-white shadow-lg hover:shadow-xl transition-shadow">
      <div class="card-body">
        <div class="flex items-start justify-between mb-3">
          <div class="badge badge-lg bg-[#5d3881] text-white border-0">${event.parsed.display}</div>
          <div class="text-xs uppercase" style="color: #37352F; opacity: 0.5">${event.parsed.dayOfWeek}</div>
        </div>
        <h3 class="card-title text-lg mb-2 ${styleClass}" style="color: #37352F">${event.eventName}</h3>
        ${hasDetails ? `<p class="text-sm mb-3" style="color: #37352F; opacity: 0.7">${event.details.replace(/\n/g, '<br>')}</p>` : ''}
        ${hasTime ? `
          <div class="flex items-center text-sm" style="color: #37352F; opacity: 0.6">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ${event.time}
          </div>
        ` : ''}
      </div>
    </div>
  `.trim();
}

function fellowshipEventCardHtml(event) {
  const hasFellowshipActivity = event.fellowshipActivity && event.fellowshipActivity.trim();
  const hasLeader = event.leader && event.leader.trim();
  const hasDetail = event.detail && event.detail.trim();

  // Use Church Activity as main title, Fellowship Activity as subtitle
  const mainTitle = event.churchActivity || event.fellowshipActivity || 'Event';
  const subtitle = event.churchActivity && hasFellowshipActivity ? event.fellowshipActivity : '';

  return `
    <div class="card bg-white shadow-lg hover:shadow-xl transition-shadow">
      <div class="card-body">
        <div class="flex items-start justify-between mb-3">
          <div class="badge badge-lg bg-[#5d3881] text-white border-0">${event.parsed.display}</div>
          <div class="text-xs uppercase" style="color: #37352F; opacity: 0.5">${event.parsed.dayOfWeek}</div>
        </div>
        <h3 class="card-title text-lg mb-2" style="color: #37352F">${mainTitle}</h3>
        ${subtitle ? `<p class="text-sm mb-3 italic" style="color: #37352F; opacity: 0.6">${subtitle}</p>` : ''}
        ${(hasLeader || hasDetail) ? `
          <div class="space-y-2">
            ${hasLeader ? `
              <div class="flex items-start text-sm">
                <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style="color: #37352F; opacity: 0.4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span style="color: #37352F; opacity: 0.7"><strong>Leader:</strong> ${event.leader}</span>
              </div>
            ` : ''}
            ${hasDetail ? `
              <div class="flex items-start text-sm">
                <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style="color: #37352F; opacity: 0.4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span style="color: #37352F; opacity: 0.7">${event.detail}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `.trim();
}

function monthSectionHtml(month, year, events, monthNote, type = 'ministry') {
  const eventCards = events.map(event => eventCardHtml(event, type)).join('\n        ');
  const noteHtml = monthNote ? ` <span class="text-xl" style="color: #37352F; opacity: 0.6">(${monthNote})</span>` : '';

  return `
  <div class="mb-12">
    <h2 class="text-2xl font-semibold mb-6 border-b-2 border-[#462a6f] pb-2" style="color: #37352F">${month} ${year}${noteHtml}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${eventCards}
    </div>
  </div>
  `.trim();
}

function filterUpcomingEvents(events) {
  const today = new Date();
  // Get first day of current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  return events.filter(event => {
    const parsed = parseDateString(event.date);
    // Use endDate for ranges, or single date for single-day events
    const compareDate = parsed.endDate || parsed.startDate;
    return compareDate >= firstDayOfMonth;
  });
}

function calendarHtml(events, metadata, type = 'ministry') {
  const mode = metadata.mode || 'all';

  // Filter events based on mode
  let filteredEvents = events;
  if (mode === 'upcoming') {
    filteredEvents = filterUpcomingEvents(events);
    console.log(`Filtered to ${filteredEvents.length} upcoming events (from ${events.length} total)`);
  }

  const grouped = groupEventsByMonth(filteredEvents);
  const monthNotes = metadata.monthNotes || {};

  const monthSections = grouped.map(g => {
    const monthKey = `${g.month} ${g.year}`;
    const note = monthNotes[monthKey];
    return monthSectionHtml(g.month, g.year, g.events, note, type);
  }).join('\n\n  ');

  // Only add auto-scroll script for "all" mode
  const scrollScript = mode === 'all' ? `
<script>
(function() {
  'use strict';
  try {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIndex = today.getMonth();

    // Find all month headers
    const headers = Array.from(document.querySelectorAll('h2'));
    if (!headers.length) return;

    // Find the current or next month section
    const targetHeader = headers.find(function(h) {
      const text = h.textContent.trim();
      const match = text.match(/^(\\w+)\\s+(\\d{4})/);
      if (!match) return false;

      const month = match[1];
      const year = parseInt(match[2]);
      const monthIndex = monthNames.indexOf(month);

      if (monthIndex === -1) return false;

      const headerDate = new Date(year, monthIndex, 1);
      const currentDate = new Date(currentYear, currentMonthIndex, 1);

      return headerDate >= currentDate;
    });

    // Scroll to the section with smooth behavior
    if (targetHeader && typeof targetHeader.scrollIntoView === 'function') {
      setTimeout(function() {
        targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  } catch (e) {
    // Silently fail if there's any error
    console.error('Calendar scroll error:', e);
  }
})();
</script>` : '';

  const hasSubtitle = metadata.subtitle && metadata.subtitle.trim();
  const padding = metadata.padding || 'default';
  const paddingClass = padding === 'none' ? '' : 'mx-auto px-4 sm:px-6 lg:px-8 py-8';

  return `
<main class="${paddingClass}">
  <div class="mb-8">
    <h1 class="mb-2" style="font-size: 2.2rem; font-weight: 600; color: #37352F">${metadata.title}</h1>
    ${hasSubtitle ? `<p style="color: #37352F">${metadata.subtitle}</p>` : ''}
  </div>

  ${monthSections}

  <div class="mt-12 mb-16 text-center">
    <p class="text-sm" style="color: #37352F; opacity: 0.5">${metadata.created && metadata.created !== 'N/A' ? `Created on ${metadata.created} | ` : ''}Updated on ${metadata.updated}</p>
  </div>
</main>
${scrollScript}
  `.trim();
}

export { calendarHtml };
