/**
 * Writes the calendar files both editions offer for download.
 *
 * One script for both languages so the instant, the venues and the UID cannot
 * drift apart: only the wording differs. Run after changing the date or venues.
 *
 * The UID is shared on purpose. It is one event, so a guest who happens to add
 * both files ends up with a single entry that the second import updates, rather
 * than two engagements in their calendar.
 *
 * Usage: node scripts/build-ics.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

/* 1 October 2026, 19:00 in Cairo. Egypt observes summer time until the last
   Thursday of October, so the offset that day is +03:00 and 19:00 local is
   16:00Z. Stored as UTC so no client has to resolve a timezone name. */
const START_UTC = '20261001T160000Z';
const END_UTC = '20261001T210000Z';
const UID = 'engagement-2026-10-01@youssefg7.github.io';
const STAMP = '20260908T000000Z';

const editions = [
  {
    file: 'assets/engagement.ics',
    prodid: '-//Youssef and Lara//Engagement//EN',
    summary: "Youssef & Lara's Engagement",
    description:
      'Ceremony at St. Anthony Church, Maadi at 7 PM, then the reception at Revana Wedding Venue.',
    location: 'St. Anthony Church, Maadi, Cairo, Egypt',
    url: 'https://youssefg7.github.io/engagement/',
  },
  {
    file: 'assets/engagement-ar.ics',
    prodid: '-//Youssef and Lara//Engagement//AR',
    summary: 'خطوبة يوسف ولارا',
    description:
      'الخطوبة في كنيسة الأنبا أنطونيوس بالمعادي الساعة ٧ مساءً، وبعدها الاحتفال في قاعة ريفانا.',
    location: 'كنيسة الأنبا أنطونيوس، المعادي، القاهرة، مصر',
    url: 'https://youssefg7.github.io/engagement/ar/',
  },
];

/* RFC 5545: escape the separators that carry meaning in a property value. */
const escapeText = (value) =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/**
 * RFC 5545 line folding: no line may exceed 75 octets, and a continuation
 * starts with a single space. Arabic is two octets per letter here, so the
 * measurement has to be in octets, and a fold must never land inside a
 * character's byte sequence or the file arrives as mojibake.
 */
function fold(line) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const out = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // step back off a continuation byte so a code point stays whole
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    out.push(bytes.subarray(start, end).toString('utf8'));
    start = end;
    limit = 74; // continuation lines spend one octet on the leading space
  }
  return out.join('\r\n ');
}

for (const e of editions) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${e.prodid}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${UID}`,
    `DTSTAMP:${STAMP}`,
    `DTSTART:${START_UTC}`,
    `DTEND:${END_UTC}`,
    `SUMMARY:${escapeText(e.summary)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    `LOCATION:${escapeText(e.location)}`,
    `URL:${e.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(fold);

  /* CRLF throughout, and a trailing CRLF, as the spec requires. */
  const body = lines.join('\r\n') + '\r\n';
  const target = path.join(ROOT, e.file);
  fs.writeFileSync(target, body, 'utf8');
  const bytes = Buffer.byteLength(body, 'utf8');
  const longest = Math.max(...body.split('\r\n').map((l) => Buffer.byteLength(l, 'utf8')));
  console.log(`  ${e.file.padEnd(28)} ${String(bytes).padStart(5)} bytes, longest line ${longest} octets`);
}
