import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowRight, Bell, CalendarDays, Check, ChevronRight, CircleHelp, Compass, ExternalLink, Heart, HeartHandshake, Home as HomeIcon, LifeBuoy, LockKeyhole, MessageCircleHeart, Pause, Play, RotateCcw, Send, ShieldCheck, Sparkles, Trash2, Wind, X } from 'lucide-react';

type MoodEntry = { mood: string; note: string; date: string };
type ChatMessage = { role: 'user' | 'bot'; text: string; id: string };
type ReminderMap = Record<string, string>;
type CommunityEvent = {
  id: string;
  title: string;
  date: string | null;
  dateLabel: string;
  time: string;
  recurrence?: string;
  place: string;
  cost: string;
  details: string;
  contactPhone?: string;
};
type StoreProps = {
  moods: MoodEntry[];
  setMoods: (items: MoodEntry[]) => void;
  chat: ChatMessage[];
  setChat: (items: ChatMessage[]) => void;
  rsvps: string[];
  setRsvps: (items: string[]) => void;
  reminders: ReminderMap;
  setReminders: (items: ReminderMap) => void;
  toast: (text: string) => void;
};

const STORE = {
  moods: 'calm-harbor-moods',
  chat: 'calm-harbor-chat',
  rsvps: 'calm-harbor-rsvps',
  reminders: 'calm-harbor-reminders',
};
const moods = ['Steady', 'Okay', 'Mixed', 'Tense', 'Heavy'];
const moodLines: Record<string, string> = {
  Steady: 'A little steadiness is worth noticing.',
  Okay: 'Showing up as you are is enough for today.',
  Mixed: 'More than one feeling can be true at once.',
  Tense: 'You do not have to untangle everything right now.',
  Heavy: 'You deserve support, even if you do not know what to ask for.',
};
const formatEventDate = (value: string) => new Date(value).toLocaleDateString(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const formatEventTime = (value: string) => new Date(value).toLocaleTimeString(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});
const localDateTimeValue = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};
const nextWednesdaySession = () => {
  const now = new Date();
  const date = new Date(now);
  const daysUntilWednesday = (3 - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + daysUntilWednesday);
  date.setHours(11, 0, 0, 0);
  if (date.getTime() <= now.getTime()) date.setDate(date.getDate() + 7);
  return date.toISOString();
};
const getCommunityEvents = (): CommunityEvent[] => [
  {
    id: 'vyuha',
    title: 'VYUHA',
    date: null,
    dateLabel: 'Next week',
    time: 'Exact time to be confirmed',
    place: 'Venue to be confirmed',
    cost: 'Ask the organizer',
    details: 'Are you excited for VYUHA? Message the organizer if you would like to participate. Confirm the exact date, time, venue, and any registration fee before attending.',
    contactPhone: '6303723248',
  },
  {
    id: 'sr-clubs',
    title: 'SR University Clubs',
    date: nextWednesdaySession(),
    dateLabel: '',
    time: '11:00 AM–3:30 PM',
    recurrence: 'Every Wednesday',
    place: 'SR University',
    cost: 'Not provided; please confirm',
    details: 'Explore singing, dance, indoor games, and gym activities during the weekly club time.',
  },
];
const crisisPattern = /\b(kill myself|suicid(?:e|al)|end my life|want to die|not worth living|better off dead|hurt myself|harm myself|self[- ]harm|can't go on|cannot go on|overdose|kill someone|hurt someone)\b/i;
const uuid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const dateLabel = (value: string) => new Date(value).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function readStored<T,>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}
function useStored<T,>(key: string, fallback: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => readStored(key, fallback));
  const update = (next: T) => {
    setValue(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Storage may be unavailable in private browsing. */ }
  };
  return [value, update];
}

function Shell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const nav = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/chat', label: 'Talk it through', icon: MessageCircleHeart },
    { href: '/events', label: 'Gatherings', icon: CalendarDays },
    { href: '/activities', label: 'Small resets', icon: Sparkles },
  ];
  return <div className="shell">
    <header className="topbar">
      <div className="top-inner">
        <Link href="/" className="brand" data-testid="link-brand"><span className="brand-mark"><Wind size={19} /></span><span>calm harbor</span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="nav-link" aria-current={path === href ? 'page' : undefined} data-testid={`link-nav-${href === '/' ? 'home' : href.slice(1)}`}><Icon size={16} aria-hidden="true" /> {label}</Link>)}
        </nav>
        <Link href="/support" className="nav-link nav-support" aria-current={path === '/support' ? 'page' : undefined} data-testid="link-nav-support"><LifeBuoy size={16} /> Support</Link>
      </div>
    </header>
    <main className="main">{children}</main>
    <footer className="footer">
      <span>Calm Harbor is a gentle companion, not a substitute for professional or emergency care.</span>
      <span><LockKeyhole size={13} style={{ verticalAlign: '-2px' }} /> Your check-ins stay in this browser. <Link href="/support" data-testid="link-footer-support">Find support</Link></span>
    </footer>
  </div>;
}

function PageIntro({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <div style={{ marginBottom: 30 }}><div className="eyebrow">{label}</div><h1 className="page-title">{title}</h1><p className="lead">{children}</p></div>;
}

function HomePage({ store }: { store: StoreProps }) {
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');
  const latest = store.moods[0];
  const save = () => {
    if (!selected) { store.toast('Choose a feeling first, if you like.'); return; }
    store.setMoods([{ mood: selected, note: note.trim(), date: new Date().toISOString() }, ...store.moods].slice(0, 30));
    setSelected(''); setNote('');
    store.toast('Your check-in was saved on this device.');
  };
  return <div>
    <section className="grid-two" style={{ alignItems: 'stretch', marginBottom: 24 }}>
      <div style={{ padding: '20px 0 22px' }}>
        <div className="eyebrow">A softer place to land</div>
        <h1 className="page-title" style={{ fontSize: 'clamp(2.7rem,6vw,4.6rem)', maxWidth: 620 }}>You can take this<br /><em style={{ color: '#bb8763' }}>one breath at a time.</em></h1>
        <p className="lead">A quiet corner to notice how you feel, talk something through, or choose one small next step. No fixing required.</p>
        <div className="pill-row" style={{ marginTop: 24 }}>
          <Link href="/chat" className="button button-primary" data-testid="button-start-chat">Talk it through <ArrowRight size={16} /></Link>
          <Link href="/activities" className="button button-soft" data-testid="button-find-reset">Find a small reset</Link>
        </div>
      </div>
      <div className="card" style={{ background: 'linear-gradient(145deg,#e3ece1,#f7f3e8)', borderColor: '#d7e1d5', minHeight: 285, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="eyebrow">A note for this moment</div>
        <div style={{ maxWidth: 390, fontFamily: 'var(--app-font-serif)', fontSize: 'clamp(1.8rem,3vw,2.5rem)', lineHeight: 1.2, color: '#31584e' }}>“You are allowed to begin again, gently.”</div>
        <div className="muted small">No perfect words needed. Just start where you are.</div>
      </div>
    </section>
    <div className="grid-two">
      <section className="card" aria-labelledby="checkin-title">
        <div className="section-head"><div><div className="eyebrow">A quick check-in</div><h2 id="checkin-title" style={{ margin: '7px 0 0', fontFamily: 'var(--app-font-serif)', fontSize: '1.8rem', color: '#31584e' }}>How are you arriving?</h2></div><Heart size={21} color="#7d9c84" /></div>
        <p className="muted">Pick the closest fit. You can change your mind anytime.</p>
        <div className="mood-options" role="group" aria-label="Choose a mood">
          {moods.map((m, i) => <button type="button" key={m} className="mood-option" aria-pressed={selected === m} onClick={() => setSelected(m)} data-testid={`button-mood-${m.toLowerCase()}`}><span className="mood-dot" aria-hidden="true" /><strong>{m}</strong></button>)}
        </div>
        {selected && <p className="small muted" aria-live="polite" data-testid="text-mood-reflection">{moodLines[selected]}</p>}
        <label htmlFor="checkin-note" className="small muted" style={{ display: 'block', marginBottom: 8 }}>Anything you want to remember? <span>(optional)</span></label>
        <textarea id="checkin-note" className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="A word, a sentence, or nothing at all…" data-testid="input-mood-note" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, gap: 12 }}>
          <span className="small muted">Saved only on this device</span><button className="button button-primary" onClick={save} data-testid="button-save-checkin">Save check-in <Check size={16} /></button>
        </div>
      </section>
      <aside className="stack">
        <section className="card">
          <div className="eyebrow">Your recent check-ins</div>
          {store.moods.length ? <div style={{ marginTop: 12 }}>{store.moods.slice(0, 4).map((entry, i) => <div className="history-item" key={`${entry.date}-${i}`} data-testid={`item-mood-history-${i}`}><span className="history-dot" /><div style={{ flex: 1 }}><strong>{entry.mood}</strong>{entry.note && <div className="small muted">{entry.note}</div>}</div><span className="small muted">{dateLabel(entry.date)}</span></div>)}</div> : <div className="notice" style={{ marginTop: 16 }}><strong>A gentle beginning.</strong><br />Your check-ins will appear here when you choose to save one.</div>}
        </section>
        <section className="card" style={{ background: '#f5e9dc', borderColor: '#ead8c6' }}>
          <div style={{ display: 'flex', gap: 14 }}><span className="brand-mark" style={{ flex: 'none' }}><HeartHandshake size={19} /></span><div><h3 style={{ margin: '2px 0 6px', color: '#5e5548' }}>You don't have to carry it alone.</h3><p className="small muted" style={{ margin: '0 0 12px' }}>Browse a few made-up community gathering examples, or find human support.</p><Link href="/events" className="test-link" data-testid="link-home-events">See sample gatherings <ChevronRight size={14} style={{ verticalAlign: '-3px' }} /></Link></div></div>
        </section>
      </aside>
    </div>
  </div>;
}

function botReply(text: string, turnIndex: number): string {
  const lower = text.toLowerCase();
  const choose = (replies: string[]) => replies[turnIndex % replies.length];
  if (/\b(vyuha)\b/.test(lower)) return choose([
    'VYUHA is listed for next week, but its exact date, time, venue, and fee still need confirmation. If you want to participate, message 6303723248 and ask the organizer for those details.',
    'Interested in VYUHA? The app has the participation contact as 6303723248. A quick message can confirm how to join and the event schedule.',
  ]);
  if (/\b(sr university|university clubs?|singing|songs|dance|dancing|indoor games|gym|wednesday)\b/.test(lower)) return choose([
    'SR University clubs are listed every Wednesday from 11:00 AM to 3:30 PM, with singing, dance, indoor games, and gym activities. The exact room and any fee were not provided, so please confirm with the university.',
    'If you want an in-person change of scene, the SR University club time is Wednesdays, 11:00 AM–3:30 PM. You can explore singing, dance, indoor games, or the gym; confirm venue and cost first.',
  ]);
  if (/\b(exam|exams|test|tests|studying|study|revision|result|marks|grades)\b/.test(lower)) return choose([
    'Exam pressure can make everything feel urgent. Would a five-minute reset help before the next small study step? The quick trivia game or a short video in Small resets can give your mind a change of pace.',
    'It sounds like exams are taking up a lot of headspace. You could choose one manageable study task, then take a short break without needing to earn it. What feels hardest right now: starting, remembering, or the pressure?',
    'When studying feels crowded, try setting the books aside for a few minutes. Small resets has a no-score brain game and video ideas if you want a gentle distraction before returning.',
  ]);
  if (/\b(anxious|anxiety|panic|overwhelm|stressed|stress|nervous|worried|worry)\b/.test(lower)) return choose([
    'That sounds like a lot to hold at once. You do not have to make it disappear to take care of yourself. Would a slow breath or naming what feels most pressing help right now?',
    'I hear that this feels heavy right now. If it is comfortable, notice your feet on the floor and let your shoulders soften. What is one part of the situation you want to focus on first?',
    'Stress can make the whole day feel like one big problem. We can slow it down: what is happening in this moment, and what can wait until later?',
  ]);
  if (/\b(bored|boring|fun|funny|game|games|video|videos|distraction)\b/.test(lower)) return choose([
    'A change of focus can be welcome. Small resets has quick trivia, a noticing game, funny video searches, and educational video ideas. Which kind of break sounds good?',
    'Want a light brain break? You can try the trivia or noticing game, look up a short comedy clip, or explore a quick learning video in Small resets.',
  ]);
  if (/\b(lonely|alone|friend|relationship|family|argument|partner)\b/.test(lower)) return choose([
    'Feeling disconnected can weigh on a person. Reaching out to someone you trust may help too. Is there one person who feels safe to contact?',
    'That sounds lonely to carry. You deserve support that can respond to you, not just an app. Would sending a simple “Could we talk for a few minutes?” message feel possible?',
  ]);
  if (/\b(work|boss|deadline|busy|job|meeting|career)\b/.test(lower)) return choose([
    'It can be hard when work demands keep stacking up. We can make this smaller without solving it all. What is one thing that truly needs your attention today?',
    'Work pressure can follow you even when you stop working. Would it help to name the next manageable task, or would you rather take a short reset first?',
  ]);
  if (/\b(tired|sleep|exhaust|energy|rest|fatigue)\b/.test(lower)) return choose([
    'It makes sense that everything feels harder when you are worn down. Rest does not have to be earned. What is the gentlest version of a pause you could take?',
    'If you are running low on energy, a small pause may be enough for now. Would quiet, a stretch, or a short funny video feel most comfortable?',
  ]);
  if (/\b(angry|mad|frustrat|irritat)\b/.test(lower)) return choose([
    'There may be something important underneath that frustration. You do not have to act on it immediately. What part of this feels most unfair or important to you?',
    'That sounds frustrating. If you can, take a moment before responding to anyone involved. What would you want them to understand about how this affected you?',
  ]);
  if (/\b(sad|down|low|upset|crying|hopeless)\b/.test(lower)) return choose([
    'I am sorry this is a hard moment. You do not need to force yourself to feel better right away. Would it help to tell me what has been weighing on you, or to try a small grounding activity?',
    'You deserve kindness even when the day feels low. Is there one gentle thing you can do for yourself in the next few minutes, even if it is very small?',
  ]);
  if (/\b(thank|helpful|thanks)\b/.test(lower)) return choose([
    'You are welcome. I am glad this moment has a little more room in it. What would feel supportive as a next step?',
    'I am glad you reached out. We can keep this simple: would you like to talk more, try a small reset, or look at an event?',
  ]);
  if (/\b(breath|ground|calm down|settle)\b/.test(lower)) return choose([
    'Try letting your shoulders drop a little. Notice the surface holding you, then name one thing you can see and one sound you can hear. What do you notice first?',
    'If it feels okay, take an unhurried breath out. Find one color around you and one point of contact with the chair or floor. You can stop whenever you want.',
  ]);
  return choose([
    'Thanks for telling me. I may not know the full story, but we can take one part at a time. What feels most important about it right now?',
    'I hear you. Would you like to say a little more about what happened, or would you prefer a small distraction from Small resets?',
    'That sounds like it matters to you. What would feel most helpful right now: being heard, thinking through one next step, or taking a short break?',
  ]);
}
function ChatPage({ store }: { store: StoreProps }) {
  const [draft, setDraft] = useState('');
  const [crisis, setCrisis] = useState(false);
  const messages = store.chat.length ? store.chat : [{ id: 'welcome', role: 'bot' as const, text: 'Hi. I can offer a listening ear and a few gentle ideas. I am a scripted companion, not a therapist or emergency service. What has been on your mind?' }];
  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const userMessage: ChatMessage = { id: uuid(), role: 'user', text };
    if (crisisPattern.test(text)) {
      setCrisis(true);
      store.setChat([...store.chat, userMessage, { id: uuid(), role: 'bot', text: 'I am really sorry things feel this intense. Your safety matters, and this app is not emergency care. If you may act on these thoughts or someone is in immediate danger, call your local emergency number or go to the nearest emergency department now. If you can, move near another person you trust and tell them plainly what is happening. You can find crisis resources on the Support page.' }]);
    } else {
      const turnIndex = store.chat.filter(message => message.role === 'user').length;
      store.setChat([...store.chat, userMessage, { id: uuid(), role: 'bot', text: botReply(text, turnIndex) }]);
    }
    setDraft('');
  };
  return <div>
    <PageIntro label="A supportive conversation" title="Talk it through">A private-to-this-browser space to put something into words. Replies are scripted and supportive—not professional care.</PageIntro>
    <div className="grid-two" style={{ gridTemplateColumns: 'minmax(0,1.45fr) minmax(245px,.55fr)', alignItems: 'start' }}>
      <section className="card chat-box" aria-label="Supportive chat">
        {crisis && <div className="notice notice-crisis" role="alert" data-testid="alert-crisis-chat"><strong>Immediate human support is important.</strong> This app is not emergency care. <Link className="test-link" href="/support" data-testid="link-chat-crisis-support">Open urgent support options</Link></div>}
        <div className="chat-log" role="log" aria-live="polite" data-testid="chat-message-list">
          {messages.map(message => <div className={`bubble ${message.role === 'user' ? 'bubble-user' : 'bubble-bot'}`} key={message.id} data-testid={`message-${message.role}-${message.id}`}>{message.text}</div>)}
        </div>
        <form className="chat-form" onSubmit={send}>
          <label className="sr-only" htmlFor="chat-input">Write a message</label>
          <input id="chat-input" className="input" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write whatever feels okay…" data-testid="input-chat-message" />
          <button className="button button-primary" type="submit" aria-label="Send message" data-testid="button-send-chat" disabled={!draft.trim()}><Send size={17} /><span className="small">Send</span></button>
        </form>
        <div className="small muted" style={{ marginTop: 10 }}>Messages remain in this browser until you clear them. Avoid sharing identifying or highly sensitive details.</div>
        {store.chat.length > 0 && <button className="button button-outline" style={{ alignSelf: 'flex-start', marginTop: 12 }} onClick={() => { store.setChat([]); setCrisis(false); store.toast('Chat history cleared.'); }} data-testid="button-clear-chat"><Trash2 size={15} /> Clear conversation</button>}
      </section>
      <aside className="stack">
        <section className="card"><div className="eyebrow">A small practice</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e' }}>Come back to here</h2><p className="muted small">Notice your feet against the floor. Let your next exhale be unhurried. No special breathing pattern is required.</p><Link href="/activities" className="button button-soft" data-testid="link-chat-activities">Try a guided reset <ArrowRight size={15} /></Link></section>
        <section className="notice"><strong>Need more than a script?</strong><br />A trusted person or qualified professional can offer care this chat cannot. <Link href="/support" className="test-link" data-testid="link-chat-support">See support options</Link>.</section>
      </aside>
    </div>
  </div>;
}

function EventsPage({ store }: { store: StoreProps }) {
  const [reminderDialog, setReminderDialog] = useState<string | null>(null);
  const [reminderAt, setReminderAt] = useState('');
  const [noticeStatus, setNoticeStatus] = useState('');
  const events = getCommunityEvents();
  const myEvents = events.filter(event => store.rsvps.includes(event.id));
  const toggleRsvp = (id: string) => {
    const isGoing = store.rsvps.includes(id);
    store.setRsvps(isGoing ? store.rsvps.filter(item => item !== id) : [...store.rsvps, id]);
    if (isGoing && store.reminders[id]) {
      const remaining = { ...store.reminders };
      delete remaining[id];
      store.setReminders(remaining);
    }
    store.toast(isGoing ? 'Saved interest removed.' : 'Interest saved on this device; it was not sent to the university.');
  };
  const saveReminder = (eventId: string) => {
    const event = events.find(item => item.id === eventId);
    if (!reminderAt || new Date(reminderAt).getTime() <= Date.now()) { store.toast('Choose a reminder time in the future.'); return; }
    if (!event?.date) { store.toast('The event schedule needs to be confirmed before setting a reminder.'); return; }
    if (new Date(reminderAt).getTime() >= new Date(event.date).getTime()) { store.toast('Choose a reminder before the event starts.'); return; }
    store.setReminders({ ...store.reminders, [eventId]: reminderAt });
    setReminderDialog(null);
    store.toast('Reminder saved. It will appear while this app is open.');
  };
  const browserNotify = async () => {
    if (!('Notification' in window)) { setNoticeStatus('This browser does not support notifications. Your in-app reminder is still saved.'); return; }
    if (Notification.permission === 'denied') { setNoticeStatus('Notifications are blocked in browser settings. You can still use the in-app reminder.'); return; }
    try {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      setNoticeStatus(permission === 'granted' ? 'Permission granted. Due reminders can show a browser notification while this app is open. Delivery is not guaranteed if the tab closes, the browser pauses, or the device is offline.' : 'Permission was not granted. In-app reminders remain available while this app is open.');
    } catch {
      setNoticeStatus('Browser notifications are unavailable here. In-app reminders remain available while this app is open.');
    }
  };
  return <div>
    <PageIntro label="Campus activities" title="Find a gathering">A campus event can offer a change of scene, a little connection, or something fun to look forward to.</PageIntro>
    <div className="notice" style={{ marginBottom: 24 }} data-testid="notice-event-details"><strong>Please confirm event details before attending.</strong> VYUHA is listed for next week, but its exact date, time, venue, and fee were not provided. The SR University club schedule is shown as shared and may change.</div>
    <div className="event-list">
      {events.map(event => <article className="card event-card" key={event.id} data-testid={`card-event-${event.id}`}>
        <div className="event-date"><CalendarDays size={18} /><strong>{event.date ? formatEventDate(event.date) : event.dateLabel}</strong><span>{event.time}</span>{event.recurrence && <span className="small muted">{event.recurrence}</span>}</div>
        <h3>{event.title}</h3><p className="muted small">{event.details}</p>
        <div className="stat-line small"><span className="muted">Place</span><strong>{event.place}</strong></div>
        <div className="stat-line small"><span className="muted">Registration fee</span><strong>{event.cost}</strong></div>
        {event.contactPhone ? <div className="event-footer">
          <span className="mini-tag">Ask organizer to confirm</span>
          <div className="pill-row">
            <a className="button button-primary" href={`sms:+91${event.contactPhone}?body=${encodeURIComponent('Hi, I am interested in participating in VYUHA. Could you share the exact date, time, venue, and registration fee?')}`} data-testid="link-vyuha-message">Message to participate</a>
            <a className="button button-outline" href={`tel:+91${event.contactPhone}`} data-testid="link-vyuha-call">Call {event.contactPhone}</a>
          </div>
        </div> : <div className="event-footer">
          <span className="mini-tag">Schedule shared by user</span>
          <button className={`button ${store.rsvps.includes(event.id) ? 'button-soft' : 'button-primary'}`} onClick={() => toggleRsvp(event.id)} data-testid={`button-interest-${event.id}`}>{store.rsvps.includes(event.id) ? <><Check size={15} /> Interested · Remove</> : 'Save my interest'}</button>
        </div>}
        {store.rsvps.includes(event.id) && <p className="small muted" data-testid={`status-interest-${event.id}`}>Your interest is saved only in this browser; it is not a registration.</p>}
        {event.date && <div className="pill-row" style={{ marginTop: 12 }}><span className="small muted">{store.reminders[event.id] ? `Reminder: ${dateLabel(store.reminders[event.id])}` : 'Reminder for the next club session'}</span><button className="button button-outline small" onClick={() => { setReminderDialog(event.id); setReminderAt(store.reminders[event.id] ? store.reminders[event.id].slice(0, 16) : ''); }} data-testid={`button-reminder-${event.id}`}><Bell size={14} /> {store.reminders[event.id] ? 'Change reminder' : 'Add reminder'}</button></div>}
      </article>)}
    </div>
    {myEvents.length > 0 && <section className="card" style={{ marginTop: 22 }}><div className="eyebrow">Your saved interest</div><p className="muted small">Stored only in this browser; this does not register you with the university.</p><div className="pill-row">{myEvents.map(e => <span className="mini-tag" key={e.id} data-testid={`status-interest-summary-${e.id}`}>{e.title}</span>)}</div></section>}
    <section className="card" style={{ marginTop: 22 }}><div className="section-head"><div><div className="eyebrow">Browser reminders</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e', marginBottom: 0 }}>Keep it simple</h2></div><Bell size={19} color="#648578" /></div><p className="muted small">Due reminders appear in the app while this tab is open. Browser notifications require permission and may not arrive if the tab closes, the browser pauses, or the device is offline.</p><button className="button button-soft" onClick={browserNotify} data-testid="button-enable-notifications">Allow browser notifications</button>{noticeStatus && <p role="status" className="small muted" data-testid="status-notification">{noticeStatus}</p>}</section>
    {reminderDialog && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setReminderDialog(null); }}><section className="card modal" role="dialog" aria-modal="true" aria-labelledby="reminder-title"><div className="section-head"><h2 id="reminder-title" style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e' }}>Save a reminder</h2><button className="button button-outline" aria-label="Close" onClick={() => setReminderDialog(null)} data-testid="button-close-reminder"><X size={16} /></button></div><p className="small muted">This reminder stays in the app on this device; it is not sent to a calendar.</p><label className="small muted" htmlFor="reminder-datetime">Remind me at</label><input id="reminder-datetime" className="input" type="datetime-local" min={localDateTimeValue(new Date().toISOString())} max={localDateTimeValue(events.find(event => event.id === reminderDialog)?.date ?? new Date().toISOString())} value={reminderAt} onChange={e => setReminderAt(e.target.value)} data-testid="input-reminder-time" /><div className="pill-row" style={{ marginTop: 18 }}><button className="button button-primary" onClick={() => saveReminder(reminderDialog)} data-testid="button-save-reminder">Save reminder</button><button className="button button-outline" onClick={() => setReminderDialog(null)} data-testid="button-cancel-reminder">Cancel</button></div></section></div>}
  </div>;
}

function ActivitiesPage({ store }: { store: StoreProps }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [groundStep, setGroundStep] = useState(0);
  const [gameCount, setGameCount] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaChoice, setTriviaChoice] = useState<string | null>(null);
  const steps = ['Name 5 things you can see.', 'Notice 4 things you can feel.', 'Listen for 3 things you can hear.', 'Find 2 things you can smell, or like the idea of.', 'Name 1 small thing you want to give yourself.'];
  const trivia = [
    { question: 'Which planet is known as the Red Planet?', choices: ['Mars', 'Venus', 'Mercury', 'Neptune'], answer: 'Mars', fact: 'Mars looks reddish because of iron minerals in its soil.' },
    { question: 'Which is the largest ocean on Earth?', choices: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 'Pacific', fact: 'The Pacific Ocean is larger than all of Earth’s land area combined.' },
    { question: 'Which number is prime?', choices: ['9', '15', '17', '21'], answer: '17', fact: 'A prime number has exactly two positive factors: one and itself.' },
  ];
  const currentTrivia = trivia[triviaIndex];
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds(value => {
      if (value <= 1) { window.clearInterval(timer); setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const startBreath = () => { if (seconds === 0) setSeconds(60); setRunning(true); };
  return <div>
    <PageIntro label="Small, optional resets" title="A little room to breathe">Nothing here needs to be completed perfectly. Choose a short practice, a low-pressure game, or a video idea to explore.</PageIntro>
    <div className="grid-two" style={{ alignItems: 'start' }}>
      <section className="card">
        <div className="eyebrow">Guided pause · 1 minute</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e' }}>Breathe at your own pace</h2>
        <p className="muted small">Follow the circle only if it feels comfortable. Let breathing stay natural; stop if you feel lightheaded or uncomfortable.</p>
        <div className={`timer-circle ${running ? 'is-active' : ''}`} aria-live="polite" data-testid="status-breath-timer">{seconds === 0 ? 'Done' : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</div>
        <div className="pill-row" style={{ justifyContent: 'center' }}>
          {!running ? <button className="button button-primary" onClick={startBreath} data-testid="button-start-breath"><Play size={15} /> {seconds === 0 ? 'Start again' : 'Begin pause'}</button> : <button className="button button-soft" onClick={() => setRunning(false)} data-testid="button-pause-breath"><Pause size={15} /> Pause</button>}
          <button className="button button-outline" onClick={() => { setRunning(false); setSeconds(60); }} data-testid="button-reset-breath"><RotateCcw size={15} /> Reset</button>
        </div>
      </section>
      <section className="card">
        <div className="eyebrow">Grounding · 5 senses</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e' }}>Notice what is here</h2>
        <p className="muted small">Skip anything that does not feel right. You can take as much time as you like.</p>
        <div style={{ background: '#edf1e8', padding: 22, borderRadius: 18, margin: '22px 0', minHeight: 110, display: 'grid', placeItems: 'center', textAlign: 'center' }}><strong style={{ color: '#31584e', fontSize: '1.2rem' }} data-testid="text-grounding-prompt">{steps[groundStep]}</strong></div>
        <div className="pill-row"><button className="button button-primary" onClick={() => setGroundStep((groundStep + 1) % steps.length)} data-testid="button-next-grounding">{groundStep === steps.length - 1 ? 'Begin again' : 'Next prompt'} <ArrowRight size={15} /></button><span className="small muted">Step {groundStep + 1} of {steps.length}</span></div>
      </section>
    </div>
    <section className="card" style={{ marginTop: 22 }}>
      <div className="section-head"><div><div className="eyebrow">A tiny game</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e', marginBottom: 0 }}>Pocket noticing</h2></div><Compass color="#648578" /></div>
      <p className="muted">Look around and choose something ordinary with an interesting detail. No score, no timer, no wrong answer.</p>
      <div className="pill-row">
        {['A color you like', 'A pleasing shape', 'Something that has helped you', 'A detail you had not noticed'].map((option, i) => <button key={option} className="button button-soft" onClick={() => { setGameCount(gameCount + 1); store.toast(`Nice noticing. ${gameCount + 1} small moments saved this session.`); }} data-testid={`button-noticing-${i}`}>{option}</button>)}
      </div>
      <p className="small muted" data-testid="text-noticing-count">{gameCount ? `${gameCount} noticing ${gameCount === 1 ? 'moment' : 'moments'} this session` : 'A moment of attention is enough.'}</p>
    </section>
    <section className="card" style={{ marginTop: 22 }}>
      <div className="section-head"><div><div className="eyebrow">A playful brain break</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e', marginBottom: 0 }}>Quick trivia</h2></div><Compass color="#648578" /></div>
      <p className="muted" data-testid="text-trivia-question">{currentTrivia.question}</p>
      <div className="pill-row">
        {currentTrivia.choices.map(choice => <button key={choice} className={`button ${triviaChoice === choice ? 'button-primary' : 'button-soft'}`} onClick={() => setTriviaChoice(choice)} disabled={triviaChoice !== null} aria-pressed={triviaChoice === choice} data-testid={`button-trivia-${choice.toLowerCase()}`}>{choice}</button>)}
      </div>
      {triviaChoice && <p className="notice" role="status" data-testid="status-trivia-answer">{triviaChoice === currentTrivia.answer ? 'That’s right. ' : `The answer is ${currentTrivia.answer}. `}{currentTrivia.fact}</p>}
      <button className="button button-outline" style={{ marginTop: 14 }} onClick={() => { setTriviaIndex((triviaIndex + 1) % trivia.length); setTriviaChoice(null); }} data-testid="button-next-trivia">Another question <ArrowRight size={15} /></button>
    </section>
    <section className="card" style={{ marginTop: 22 }}>
      <div className="section-head"><div><div className="eyebrow">A lighter detour</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e', marginBottom: 0 }}>Funny, encouraging & educational videos</h2></div><Sparkles color="#648578" /></div>
      <p className="muted small">These open YouTube search results, not curated or endorsed videos. Preview content and use your own judgment.</p>
      {[
        ['Funny', 'Short animal bloopers', 'A small laugh, no context required.', 'funny animal bloopers short videos'],
        ['Funny', 'Clean stand-up clips', 'A little humor for a quiet break.', 'clean stand up comedy short clips'],
        ['Encouragement', 'A kind pep talk', 'Search for encouragement without pressure to feel upbeat.', 'gentle motivational talk self compassion'],
        ['Learn', 'Everyday science', 'Short explanations of curious science questions.', 'everyday science explained short educational videos'],
        ['Learn', 'History in a few minutes', 'Explore a short history topic that interests you.', 'history explained short educational videos'],
        ['Learn', 'Try a practical skill', 'Find beginner-friendly lessons and how-to videos.', 'beginner practical skills educational videos'],
      ].map(([category, title, description, query], i) => <div className="video-row" key={title} data-testid={`item-video-${i}`}><div><span className="mini-tag">{category}</span><strong style={{ display: 'block', marginTop: 6 }}>{title}</strong><div className="small muted">{description}</div></div><a className="button button-outline" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" data-testid={`link-video-${i}`}>Explore <ExternalLink size={14} /></a></div>)}
    </section>
  </div>;
}

function SupportPage({ onReset }: { onReset: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  return <div>
    <PageIntro label="People and help matter" title="Support for harder moments">Calm Harbor is not crisis care, a diagnosis, or a substitute for a qualified professional. If you are in immediate danger, seek urgent human help now.</PageIntro>
    <div className="grid-two" style={{ alignItems: 'start' }}>
      <div className="stack">
        <section className="card" style={{ borderColor: '#e9c9bd', background: '#fff8f2' }}>
          <div className="eyebrow" style={{ color: '#a75443' }}>If danger feels immediate</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#6f4037' }}>Please reach a person now.</h2>
          <p className="muted">Call your local emergency-services number or go to the nearest emergency department. If possible, move near someone you trust and tell them what is happening. If calling feels difficult, ask someone nearby to call with you.</p>
          <div className="notice notice-crisis" data-testid="notice-emergency-advice"><strong>Do not wait for this app.</strong> Calm Harbor is not monitored and cannot send help.</div>
        </section>
        <section className="card"><div className="eyebrow">Crisis resources</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e' }}>Options depend on where you are</h2>
          <div className="stat-line"><div><strong>United States & territories</strong><div className="small muted">Call or text 988 for the Suicide & Crisis Lifeline. In immediate danger, call 911.</div></div><a className="button button-soft" href="tel:988" data-testid="link-call-988">Call 988</a></div>
          <div className="stat-line"><div><strong>Outside the U.S.</strong><div className="small muted">Use your local emergency number or a crisis line in your country. Find a verified directory by country.</div></div><a className="button button-outline" href="https://findahelpline.com/" target="_blank" rel="noreferrer" data-testid="link-international-crisis">Find local help <ExternalLink size={14} /></a></div>
          <p className="small muted" style={{ marginTop: 15 }}>International directory link is provided as a starting point; availability and services vary. If you may be in immediate danger, contact local emergency services.</p>
        </section>
        <section className="card"><div className="eyebrow">Ongoing support</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e' }}>Finding a professional</h2><p className="muted">A primary-care clinician, licensed therapist, counselor, or community health service may help you explore options. Ask about cost, language, accessibility, and whether they feel like a good fit. You can bring someone you trust to help make the first call.</p></section>
      </div>
      <div className="stack">
        <section className="card"><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><ShieldCheck color="#527b69" /><div><div className="eyebrow">Privacy, plainly</div><strong>Your data stays in this browser</strong></div></div><p className="small muted">Mood check-ins, chat history, RSVPs, and reminder settings are saved in local browser storage on this device. They are not sent to a server by this demo. Anyone with access to this browser profile may be able to see them. Clearing site data or changing browsers may remove them.</p><div className="notice">This is a standalone demo. It has no account, backend, or AI service.</div></section>
        <section className="card"><div className="eyebrow">A fresh start</div><h2 style={{ fontFamily: 'var(--app-font-serif)', color: '#31584e' }}>Delete local data</h2><p className="small muted">Remove all saved check-ins, chat messages, RSVPs, and in-app reminders from this browser.</p>
          {!confirmDelete ? <button className="button button-danger" onClick={() => setConfirmDelete(true)} data-testid="button-open-reset"><Trash2 size={15} /> Delete my local data</button> : <div role="alert"><p className="small">This cannot be undone. Delete everything saved by Calm Harbor here?</p><div className="pill-row"><button className="button button-danger" onClick={() => { onReset(); setConfirmDelete(false); setDeleted(true); }} data-testid="button-confirm-reset">Yes, delete data</button><button className="button button-outline" onClick={() => setConfirmDelete(false)} data-testid="button-cancel-reset">Keep my data</button></div></div>}
          {deleted && <p className="small muted" role="status" data-testid="status-data-deleted">Local Calm Harbor data deleted.</p>}
        </section>
        <section className="card"><CircleHelp color="#648578" /><h3 style={{ color: '#31584e' }}>Need a different kind of help?</h3><p className="small muted">For non-urgent emotional support, reach out to someone you trust or a qualified local professional. You deserve care that can respond to your situation.</p></section>
      </div>
    </div>
  </div>;
}

function MissingPage() {
  return <div className="card" style={{ textAlign: 'center', padding: 50 }}><div className="eyebrow">Not found</div><h1 className="page-title">This path is quiet.</h1><p className="lead" style={{ margin: 'auto auto 20px' }}>The page you were looking for is not here.</p><Link href="/" className="button button-primary" data-testid="link-not-found-home">Return home <HomeIcon size={16} /></Link></div>;
}

function AppContent() {
  const [moodsValue, setMoods] = useStored<MoodEntry[]>(STORE.moods, []);
  const [chatValue, setChat] = useStored<ChatMessage[]>(STORE.chat, []);
  const [rsvpValue, setRsvps] = useStored<string[]>(STORE.rsvps, []);
  const [reminderValue, setReminders] = useStored<ReminderMap>(STORE.reminders, {});
  const [toastText, setToastText] = useState('');
  const toast = (text: string) => { setToastText(text); window.setTimeout(() => setToastText(''), 2800); };
  useEffect(() => {
    const checkReminders = () => {
      const saved = readStored<ReminderMap>(STORE.reminders, {});
      const due = Object.entries(saved).filter(([, time]) => new Date(time).getTime() <= Date.now());
      if (!due.length) return;
      const remaining = { ...saved };
      due.forEach(([eventId]) => {
        const event = getCommunityEvents().find(item => item.id === eventId);
        const title = event ? `Your event reminder: ${event.title}` : 'A reminder you saved is due.';
        toast(title);
        if ('Notification' in window && Notification.permission === 'granted') {
          const details = event
            ? `${event.title} · ${event.date ? formatEventDate(event.date) : event.dateLabel} · ${event.time} · ${event.place} · Fee: ${event.cost}`
            : title;
          try { new Notification('Calm Harbor event reminder', { body: details }); } catch { /* Browser notifications may be unavailable. */ }
        }
        delete remaining[eventId];
      });
      setReminders(remaining);
    };
    checkReminders();
    const interval = window.setInterval(checkReminders, 15_000);
    return () => window.clearInterval(interval);
  }, []);
  const store: StoreProps = { moods: moodsValue, setMoods, chat: chatValue, setChat, rsvps: rsvpValue, setRsvps, reminders: reminderValue, setReminders, toast };
  const reset = () => {
    setMoods([]); setChat([]); setRsvps([]); setReminders({});
    Object.values(STORE).forEach(key => localStorage.removeItem(key));
  };
  return <>
    <Switch>
      <Route path="/"><Shell><HomePage store={store} /></Shell></Route>
      <Route path="/chat"><Shell><ChatPage store={store} /></Shell></Route>
      <Route path="/events"><Shell><EventsPage store={store} /></Shell></Route>
      <Route path="/activities"><Shell><ActivitiesPage store={store} /></Shell></Route>
      <Route path="/support"><Shell><SupportPage onReset={reset} /></Shell></Route>
      <Route><Shell><MissingPage /></Shell></Route>
    </Switch>
    {toastText && <div role="status" className="toast" data-testid="status-toast">{toastText}</div>}
  </>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppContent /></WouterRouter>;
}

export default App;
