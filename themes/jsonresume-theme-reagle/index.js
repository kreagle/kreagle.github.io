const US_STATE_ABBREV = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  'District of Columbia': 'DC',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return escapeHtml(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateRange(startDate, endDate) {
  const start = formatMonthYear(startDate);
  if (!start) return '';
  const end = endDate ? formatMonthYear(endDate) : 'Present';
  return `${start} - ${end}`;
}

function formatCountry(countryCode) {
  if (!countryCode) return '';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode);
  } catch {
    return countryCode;
  }
}

function formatRegion(region, countryCode) {
  if (!region) return '';
  if (countryCode === 'US') {
    return US_STATE_ABBREV[region] || region;
  }
  return region;
}

function formatLocation(location = {}) {
  const city = location.city ? escapeHtml(location.city) : '';
  const region = formatRegion(location.region, location.countryCode);
  const country = formatCountry(location.countryCode);

  if (city && region && country) {
    return `${city}, ${region} ${country}`;
  }

  return [city, region, country].filter(Boolean).join(', ');
}

function stripUrlProtocol(url) {
  return String(url || '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

function findProfile(profiles = [], network) {
  return profiles.find(
    (profile) => profile.network && profile.network.toLowerCase() === network.toLowerCase()
  );
}

function renderContactLine(basics = {}) {
  const { email, phone, location, profiles = [] } = basics;
  const locationText = formatLocation(location);
  const linkedIn = findProfile(profiles, 'LinkedIn');

  const lineOne = [locationText, phone ? escapeHtml(phone) : '']
    .filter(Boolean)
    .join(' | ');

  const lineTwoParts = [];
  if (email) {
    lineTwoParts.push(
      `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`
    );
  }
  if (linkedIn?.url) {
    const display = stripUrlProtocol(linkedIn.url);
    lineTwoParts.push(
      `<a href="${escapeHtml(linkedIn.url)}">${escapeHtml(display)}</a>`
    );
  }

  return { lineOne, lineTwo: lineTwoParts.join(' | ') };
}

function flattenSkills(skills = []) {
  const seen = new Set();
  const items = [];

  for (const group of skills) {
    if (group.name) {
      const name = group.name.trim();
      const key = name.toLowerCase();
      if (name && !seen.has(key)) {
        seen.add(key);
        items.push(name);
      }
    }

    for (const keyword of group.keywords || []) {
      const trimmed = keyword.trim();
      const key = trimmed.toLowerCase();
      if (trimmed && !seen.has(key)) {
        seen.add(key);
        items.push(trimmed);
      }
    }
  }

  return items;
}

function renderToolingLines(meta = {}) {
  const tooling = meta.tooling;
  if (!Array.isArray(tooling) || tooling.length === 0) return '';

  return tooling
    .map((line) => `<p class="tooling-line">${escapeHtml(line)}</p>`)
    .join('');
}

function renderSkills(skills = []) {
  const items = flattenSkills(skills);
  if (items.length === 0) return '';

  return `
    <section class="section skills-section">
      <h2 class="section-title">Skills</h2>
      <p class="skills-list">${items.map(escapeHtml).join(' | ')}</p>
    </section>
  `;
}

function renderWorkEntry(entry = {}) {
  const {
    name,
    position,
    location,
    startDate,
    endDate,
    summary,
    highlights = [],
  } = entry;

  const companyParts = [name ? escapeHtml(name).toUpperCase() : ''];
  if (location) {
    companyParts.push(escapeHtml(location));
  }
  const companyLine = companyParts.filter(Boolean).join(', ');
  const dates = formatDateRange(startDate, endDate);

  const bullets =
    highlights.length > 0
      ? `<ul class="highlights">${highlights
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')}</ul>`
      : '';

  const summaryHtml = summary
    ? `<p class="job-summary">${escapeHtml(summary)}</p>`
    : '';

  return `
    <article class="job">
      <div class="job-header">
        <div class="job-company">${companyLine}</div>
        ${dates ? `<div class="job-dates">${escapeHtml(dates)}</div>` : ''}
      </div>
      ${position ? `<div class="job-title">${escapeHtml(position)}</div>` : ''}
      ${summaryHtml}
      ${bullets}
    </article>
  `;
}

function renderWork(work = []) {
  if (work.length === 0) return '';

  return `
    <section class="section work-section">
      <h2 class="section-title">Work</h2>
      ${work.map(renderWorkEntry).join('')}
    </section>
  `;
}

function renderEducation(education = []) {
  if (education.length === 0) return '';

  const entries = education
    .map((entry) => {
      const institution = entry.institution
        ? escapeHtml(entry.institution).toUpperCase()
        : '';
      const dates = formatDateRange(entry.startDate, entry.endDate);
      const degree = [entry.studyType, entry.area].filter(Boolean).join(', ');

      return `
        <article class="job">
          <div class="job-header">
            <div class="job-company">${institution}</div>
            ${dates ? `<div class="job-dates">${escapeHtml(dates)}</div>` : ''}
          </div>
          ${degree ? `<div class="job-title">${escapeHtml(degree)}</div>` : ''}
        </article>
      `;
    })
    .join('');

  return `
    <section class="section education-section">
      <h2 class="section-title">Education</h2>
      ${entries}
    </section>
  `;
}

const CSS = `
  :root {
    color-scheme: light;
    --text: #000;
    --background: #fff;
    --max-width: 8.5in;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 11pt;
  }

  body {
    background: var(--background);
    color: var(--text);
    font-family: Helvetica, Arial, sans-serif;
    line-height: 1.35;
    margin: 0 auto;
    max-width: var(--max-width);
    padding: 0.25in 0.4in 0.4in;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .header {
    margin-bottom: 1.1rem;
    text-align: center;
  }

  .name {
    font-size: 18pt;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1.15;
    margin-bottom: 0.35rem;
    text-transform: uppercase;
  }

  .contact-line {
    font-size: 10pt;
    line-height: 1.45;
    margin-bottom: 0.15rem;
  }

  .label {
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.03em;
    margin-top: 0.55rem;
    text-transform: uppercase;
  }

  .summary {
    margin-bottom: 0.55rem;
    text-align: left;
  }

  .tooling-line {
    font-size: 10pt;
    line-height: 1.45;
    margin-bottom: 0.15rem;
    text-align: left;
  }

  .section {
    margin-top: 1rem;
  }

  .section-title {
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 0.55rem;
    text-align: center;
    text-transform: uppercase;
  }

  .skills-list {
    line-height: 1.45;
    text-align: center;
  }

  .job + .job {
    margin-top: 0.85rem;
  }

  .job-header {
    align-items: baseline;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-bottom: 0.15rem;
  }

  .job-company,
  .job-dates {
    font-weight: 700;
  }

  .job-company {
    flex: 1 1 auto;
    text-transform: uppercase;
  }

  .job-dates {
    flex: 0 0 auto;
    text-align: right;
    white-space: nowrap;
  }

  .job-title {
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .job-summary {
    margin-bottom: 0.25rem;
  }

  .highlights {
    list-style-type: disc;
    margin-left: 1rem;
    padding-left: 0.2rem;
  }

  .highlights li + li {
    margin-top: 0.15rem;
  }

  @media print {
    body {
      padding: 0;
    }

    a {
      color: inherit;
    }
  }
`;

function render(resume = {}) {
  const { basics = {}, work = [], education = [], skills = [], meta = {} } = resume;
  const contact = renderContactLine(basics);
  const summary = basics.summary
    ? `<p class="summary">${escapeHtml(basics.summary)}</p>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(basics.name || 'Resume')}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(basics.summary || '')}" />
    <style>${CSS}</style>
  </head>
  <body>
    <header class="header">
      ${basics.name ? `<h1 class="name">${escapeHtml(basics.name)}</h1>` : ''}
      ${contact.lineOne ? `<div class="contact-line">${contact.lineOne}</div>` : ''}
      ${contact.lineTwo ? `<div class="contact-line">${contact.lineTwo}</div>` : ''}
      ${basics.label ? `<div class="label">${escapeHtml(basics.label)}</div>` : ''}
    </header>
    ${summary}
    ${renderToolingLines(meta)}
    ${renderSkills(skills)}
    ${renderWork(work)}
    ${renderEducation(education)}
  </body>
</html>`;
}

export { render };
