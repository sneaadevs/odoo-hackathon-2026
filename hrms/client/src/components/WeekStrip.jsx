const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// Returns the Monday..Sunday dates for the week containing `reference`.
function getWeekDates(reference = new Date()) {
  const d = new Date(reference);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return dt;
  });
}

/**
 * statusByDate: optional { "YYYY-MM-DD": "Present" | "Absent" | "Half-day" | "Leave" }
 * onLight: render variant for use on a white card instead of the dark hero panel
 */
export default function WeekStrip({ statusByDate = {}, onLight = false }) {
  const todayStr = toDateStr(new Date());
  const week = getWeekDates();

  return (
    <div className={`week-strip${onLight ? " on-light" : ""}`}>
      {week.map((date, i) => {
        const dateStr = toDateStr(date);
        const isToday = dateStr === todayStr;
        const status = statusByDate[dateStr];

        return (
          <div key={dateStr} className={`day-cell${isToday ? " today" : ""}`}>
            <span className="dow">{DOW[i]}</span>
            <span className="num">{date.getDate()}</span>
            <span className={`bar${status ? ` status-${status}` : ""}`} />
          </div>
        );
      })}
    </div>
  );
}
