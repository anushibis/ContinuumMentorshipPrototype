import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Mentor = {
  name: string;
  role: string;
  fit: string;
  expertise: string;
  language: string;
  availability: string;
  length: string;
  price: string;
};

const mentors: Mentor[] = [
  {
    name: "Meera Iyer",
    role: "Former HR Director, IT services · 28 years",
    fit: "A thoughtful match for building confidence and leading a growing team.",
    expertise: "Leadership transitions, difficult conversations",
    language: "English, Hindi, Tamil",
    availability: "This week",
    length: "45 minutes",
    price: "₹1,500",
  },
  {
    name: "Rajesh Khanna",
    role: "Retired VP Operations, manufacturing · 33 years",
    fit: "May suit you if you prefer practical frameworks and direct feedback.",
    expertise: "New managers, team culture, operations",
    language: "English, Hindi, Punjabi",
    availability: "From Monday",
    length: "45 minutes",
    price: "₹1,800",
  },
  {
    name: "Anita Deshmukh",
    role: "Former NGO Chief Executive · 26 years",
    fit: "A warm, reflective mentor for values-led leadership and career change.",
    expertise: "Leadership, purpose, career change",
    language: "English, Hindi, Marathi",
    availability: "Next week",
    length: "60 minutes",
    price: "₹2,200",
  },
  {
    name: "Suresh Nair",
    role: "Retired General Manager, public sector bank · 34 years",
    fit: "Well suited to finance careers, stakeholder confidence and stepping into senior roles.",
    expertise: "Banking, finance leadership, governance",
    language: "English, Malayalam, Hindi",
    availability: "This week",
    length: "45 minutes",
    price: "₹1,700",
  },
  {
    name: "Dr. Kavita Rao",
    role: "Former Professor and Dean, engineering college · 30 years",
    fit: "A patient guide for academic careers, research direction and teaching practice.",
    expertise: "Academia, research careers, mentoring students",
    language: "English, Kannada, Hindi",
    availability: "From Tuesday",
    length: "45 minutes",
    price: "₹1,600",
  },
  {
    name: "Arvind Banerjee",
    role: "Retired Chief Engineer, infrastructure · 35 years",
    fit: "Practical advice on moving from technical work into management or starting your own firm.",
    expertise: "Engineering management, entrepreneurship, projects",
    language: "English, Bengali, Hindi",
    availability: "Next week",
    length: "60 minutes",
    price: "₹2,000",
  },
];

const fields = [
  "Technology & product",
  "Finance & accounting",
  "Healthcare & life sciences",
  "Education & research",
  "Creative & media",
  "Business & entrepreneurship",
  "Government & nonprofit",
  "Engineering & skilled trades",
  "Another professional field",
];

const followUps: Record<string, string[]> = {
  "Technology & product": ["Move into product leadership", "Lead an engineering team", "Plan my next career stage"],
  "Finance & accounting": ["Step into senior leadership", "Move into a different role", "Build stakeholder confidence"],
  "Healthcare & life sciences": ["Develop as a clinical leader", "Move beyond frontline practice", "Plan a career transition"],
  "Education & research": ["Move into academic leadership", "Change roles or sectors", "Develop my teaching practice"],
  "Creative & media": ["Build a sustainable career", "Lead creative teams", "Move from freelance to in-house"],
  "Business & entrepreneurship": ["Validate a business idea", "Grow and lead a small team", "Plan my next business move"],
  "Government & nonprofit": ["Lead through change", "Move into senior leadership", "Increase my impact"],
  "Engineering & skilled trades": ["Move into management", "Start an independent business", "Plan my next qualification"],
  "Another professional field": ["Progress in my field", "Change professional direction", "Describe something specific"],
};

const slots = ["Thu 22 May · 6:00 pm", "Fri 23 May · 12:30 pm", "Mon 26 May · 5:30 pm"];

type Btn = { id: string; label: string };
type Msg = {
  id: string;
  from: "bot" | "user" | "mentor" | "chip";
  tone?: "date" | "notice";
  text: string;
  time: string;
  sender?: string;
  status?: "sent" | "delivered" | "read";
  buttons?: Btn[];
  list?: { kind: "field" | "mentor"; button: string; title: string; options: { id: string; label: string; desc?: string }[] };
  cta?: { label: string; action: "pay" | "join"; done?: boolean };
  answered?: string | true;
};
type Draft = Omit<Msg, "id" | "time" | "from"> & { from?: "bot" | "mentor" };

const CANCEL = Symbol("cancel");
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const first = (name: string) => name.split(" ")[0];

const menuButtons: Btn[] = [
  { id: "start", label: "Get started" },
  { id: "question", label: "I have a question" },
  { id: "human", label: "Talk to a person" },
];

let uid = 0;
const nextId = () => `${Date.now().toString(36)}-${++uid}`;

function seed(): Msg[] {
  const time = clock();
  const m = (x: Omit<Msg, "id" | "time">): Msg => ({ ...x, id: nextId(), time });
  return [
    m({ from: "chip", tone: "date", text: "TODAY" }),
    m({ from: "chip", tone: "notice", text: "This is a clickable prototype of the Continuum WhatsApp experience. No real messages are sent." }),
    m({ from: "chip", tone: "notice", text: "This business uses a secure service from Meta to manage this chat. Tap to learn more." }),
    m({ from: "user", text: "Hi", status: "read" }),
    m({ from: "bot", text: "Welcome to *Continuum*." }),
    m({ from: "bot", text: "We help you find experienced retired mentors for career decisions, personal growth, or a skill you want to develop." }),
    m({
      from: "bot",
      text: "I’ll ask a few short questions, then suggest people who may fit. You stay in control. How can I help today?",
      buttons: menuButtons,
    }),
  ];
}

function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
  switch (name) {
    case "back":
      return <svg {...common} strokeWidth={2.6}><path d="M15 5l-7 7 7 7" /></svg>;
    case "video":
      return <svg {...common}><rect x="3" y="6.500" width="12" height="11" rx="2.500" /><path d="M15 11l5.500-3.500v9L15 13" /></svg>;
    case "phone":
      return <svg {...common}><path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>;
    case "plus":
      return <svg {...common} strokeWidth={2}><path d="M12 4v16M4 12h16" /></svg>;
    case "sticker":
      return <svg {...common}><path d="M20 12.500V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4h4.500z" /><path d="M20 12.500a7.500 7.500 0 00-7.500 7.500M8.500 10.500v.01M15.500 10.500v.01M9 14.500q3 2 6 0" /></svg>;
    case "camera":
      return <svg {...common}><path d="M4 8h3l1.500-2.500h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" /><circle cx="12" cy="13" r="3.500" /></svg>;
    case "mic":
      return <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.500 11.500a6.500 6.500 0 0013 0M12 18v3" /></svg>;
    case "send":
      return <svg {...common} fill="currentColor" stroke="none"><path d="M3.400 20.400l17.400-7.800a.7.7 0 000-1.300L3.400 3.500a.7.7 0 00-1 .8L4 10.500l9 1.500-9 1.500-1.600 6.100a.7.7 0 001 .8z" /></svg>;
    case "list":
      return <svg {...common}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>;
    case "link":
      return <svg {...common}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" /></svg>;
    case "close":
      return <svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "lock":
      return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>;
    case "check":
      return <svg {...common} strokeWidth={3}><path d="M5 12.500l4.500 4.500L19 7.500" /></svg>;
    default:
      return null;
  }
}

function Ticks({ status }: { status: "sent" | "delivered" | "read" }) {
  const color = status === "read" ? "#53bdeb" : "#8696a0";
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-label={status}>
      <path d="M1 5.500l3 3L10 1.500" />
      {status !== "sent" && <path d="M6 8l.8.8L13 1.500" />}
    </svg>
  );
}

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? <strong key={i} className="font-semibold">{part.slice(1, -1)}</strong> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

function Meta({ time, status }: { time: string; status?: "sent" | "delivered" | "read" }) {
  return (
    <span className="float-right -mb-0.5 ml-3 mt-2.5 inline-flex items-center gap-1 text-[11px] leading-none text-wa-meta">
      {time}
      {status && <Ticks status={status} />}
    </span>
  );
}

const replyRow =
  "flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-center text-[15px] leading-tight text-wa-blue shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] transition active:bg-neutral-100";

export default function App() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [sheet, setSheet] = useState<Msg | null>(null);
  const [picked, setPicked] = useState("");
  const [checkout, setCheckout] = useState(false);
  const [info, setInfo] = useState(false);
  const [toast, setToast] = useState("");

  const run = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const ctx = useRef({ field: "", goal: "", mentor: 0, slot: "", relayN: 0, batch: 0, awaiting: null as null | "goal" | "relay" });

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const activeId = [...messages].reverse().find((m) => (m.buttons || m.list) && !m.answered)?.id;

  const wait = async (ms: number) => {
    const token = run.current;
    await sleep(ms);
    if (token !== run.current) throw CANCEL;
  };

  const push = (m: Omit<Msg, "id" | "time">) => {
    const id = nextId();
    setMessages((ms) => [...ms, { ...m, id, time: clock() }]);
    return id;
  };

  const patch = (id: string, change: Partial<Msg>) =>
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...change } : m)));

  const consume = (choice: string | true = true) =>
    setMessages((ms) => {
      const idx = [...ms].reverse().findIndex((m) => (m.buttons || m.list) && !m.answered);
      if (idx === -1) return ms;
      const at = ms.length - 1 - idx;
      return ms.map((m, i) => (i === at ? { ...m, answered: choice } : m));
    });

  const userSay = (text: string) => {
    const token = run.current;
    const id = push({ from: "user", text, status: "sent" });
    setTimeout(() => token === run.current && patch(id, { status: "delivered" }), 350);
    setTimeout(() => token === run.current && patch(id, { status: "read" }), 1000);
  };

  const say = async (drafts: Draft[]) => {
    for (const d of drafts) {
      await wait(400);
      setTyping(true);
      await wait(550 + Math.min(d.text.length * 7, 1100));
      setTyping(false);
      push({ ...d, from: d.from ?? "bot" });
    }
  };

  const act = async (fn: () => Promise<void>) => {
    const token = run.current;
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      if (e !== CANCEL) throw e;
    } finally {
      if (token === run.current) setBusy(false);
    }
  };

  const restart = () => {
    run.current++;
    ctx.current = { field: "", goal: "", mentor: 0, slot: "", relayN: 0, batch: 0, awaiting: null };
    setTyping(false);
    setBusy(false);
    setSheet(null);
    setCheckout(false);
    setInfo(false);
    setDraft("");
    setMessages(seed());
  };

  const mentor = () => mentors[ctx.current.mentor];

  const askGoal = (lead: string) => {
    ctx.current.awaiting = "goal";
    const options = followUps[ctx.current.field] ?? followUps["Another professional field"];
    return say([
      {
        text: `${lead}What would you like help with in ${ctx.current.field.toLowerCase()}?\n\nChoose an option, or type your own goal in the message box.`,
        buttons: options.map((label, i) => ({ id: i === 2 && ctx.current.field === "Another professional field" ? "describe" : `goal:${i}`, label })),
      },
    ]);
  };

  const showMentors = async (intro: string) => {
    ctx.current.awaiting = null;
    const batch = ctx.current.batch % 2;
    const shown = mentors.slice(batch * 3, batch * 3 + 3);
    await say([
      { text: intro },
      ...shown.map((m) => ({
        text: `*${m.name}*\n${m.role}\n\n${m.fit}\n\n• Expertise: ${m.expertise}\n• Languages: ${m.language}\n• Available: ${m.availability}\n• Session: ${m.length} · ${m.price} (sample price, incl. GST)`,
      })),
      {
        text: "Who would you like to meet? You can also ask to see different mentors.",
        list: {
          kind: "mentor",
          button: "Choose a mentor",
          title: "Mentors for you",
          options: [
            ...shown.map((m) => ({ id: `mentor:${mentors.indexOf(m)}`, label: m.name, desc: m.role })),
            { id: "others", label: "Show me other mentors", desc: "See a different set of suggestions" },
          ],
        },
      },
    ]);
  };

  const chooseGoal = async (goal: string) => {
    ctx.current.goal = goal;
    ctx.current.awaiting = null;
    if (/quantum/i.test(goal)) {
      await say([
        {
          text: "*I couldn’t find a close match yet.*\nYour request is quite specific. You can broaden it, choose another field, or ask our team to look manually.",
          buttons: [
            { id: "refine", label: "Refine my answer" },
            { id: "fields", label: "Choose another field" },
            { id: "human", label: "Talk to a person" },
          ],
        },
      ]);
      return;
    }
    await say([{ text: "Thanks, that’s really helpful. Looking for mentors who may fit…" }]);
    await showMentors("I found three mentors who may fit. Take your time. Choosing someone is not a commitment to book.");
  };

  const relayReply = async (text: string) => {
    ctx.current.awaiting = "relay";
    const n = ctx.current.relayN++;
    const m = mentor();
    await say([
      {
        from: "mentor",
        sender: m.name,
        text:
          n === 0
            ? `${text.length < 40 ? "That’s a good, specific place to start." : "Thank you for sharing that."} We could work through a real conversation and make a plan you’re comfortable with. Shall we find a time?`
            : "Thanks, noted. Whenever you’re ready, we can pick a time that suits you.",
        buttons: [
          { id: "times", label: "View session times" },
          { id: "end", label: "Meet someone else" },
        ],
      },
    ]);
  };

  const route = async (id: string, label: string) => {
    const [k, arg] = id.split(":");
    const c = ctx.current;
    switch (k) {
      case "menu":
        c.awaiting = null;
        await say([{ text: "Of course. What would you like to do?", buttons: menuButtons }]);
        break;
      case "question":
        await say([
          {
            text: "Happy to help. Continuum matches you with experienced retired mentors for one-to-one video sessions.\n\nYou’ll see the full price before you book, and you can cancel or reschedule free up to 24 hours before a session.",
            buttons: [
              { id: "start", label: "Get started" },
              { id: "human", label: "Talk to a person" },
            ],
          },
        ]);
        break;
      case "human":
        c.awaiting = null;
        await say([
          { text: "Of course. I’ve asked a member of the Continuum team to join this chat. They usually reply within one working day." },
          { text: "_Prototype note: no one will actually join._\n\nContinuum doesn’t provide urgent or emergency support. If you’re in danger, please call *112* (India’s emergency number).", buttons: [{ id: "menu", label: "Back to menu" }] },
        ]);
        break;
      case "concern":
        c.awaiting = null;
        await say([
          { text: "I’m sorry to hear that. I’ve paused contact with any mentor and flagged this conversation for our safety team. Someone will review it and get in touch with you here.", buttons: [{ id: "menu", label: "Back to menu" }] },
        ]);
        break;
      case "start":
        await say([
          {
            text: "*Before we begin, your privacy matters.*\n\nMentors won’t see your phone number or email. Continuum uses your WhatsApp account details only to deliver messages and run the service.\n\nIntroductions happen in separate private chats, with Continuum relaying messages between you.\n\nDo you agree to continue?",
            buttons: [
              { id: "agree", label: "I agree, continue" },
              { id: "decline", label: "Not now" },
            ],
          },
        ]);
        break;
      case "decline":
        await say([{ text: "No problem. Nothing has been saved. Message us whenever you’re ready.", buttons: [{ id: "start", label: "Start again" }] }]);
        break;
      case "agree":
      case "fields":
        await say([
          {
            text:
              k === "agree"
                ? "Thank you. Which professional field would you like guidance in?\n\nChoose the closest match. You can add detail next."
                : "Of course. Which professional field would you like guidance in?",
            list: { kind: "field", button: "Choose a field", title: "Professional fields", options: fields.map((f) => ({ id: f, label: f })) },
          },
        ]);
        break;
      case "goal":
        await chooseGoal((followUps[c.field] ?? [])[Number(arg)] ?? label);
        break;
      case "describe":
        c.awaiting = "goal";
        await say([{ text: "Please type your current role and what you’d like help with in the message box below. A sentence or two is plenty.\n\n_For example: I’m a senior nurse in Pune considering a move into hospital administration._" }]);
        break;
      case "refine":
        await askGoal("No problem. ");
        break;
      case "rematch":
        await showMentors("Here are the mentors again. Choose whoever feels right.");
        break;
      case "others":
        c.batch++;
        await showMentors("Of course. Here are three other mentors who may fit.");
        break;
      case "mentor": {
        c.mentor = Number(arg);
        c.relayN = 0;
        c.awaiting = "relay";
        const m = mentor();
        await say([
          { text: `*Private introduction started*\n\nYou and ${first(m.name)} are each messaging Continuum in separate private chats. I’ll relay your messages. Neither of you can see the other’s phone number or email.` },
          {
            from: "mentor",
            sender: m.name,
            text: "Hi, thanks for reaching out. I’ve helped many people find their footing. What feels most uncertain at the moment?",
            buttons: [
              { id: "relay:0", label: "Giving clear feedback" },
              { id: "relay:1", label: "Building team trust" },
              { id: "end", label: "Meet someone else" },
            ],
          },
        ]);
        break;
      }
      case "relay":
        await relayReply(label);
        break;
      case "end":
        c.awaiting = null;
        c.batch++;
        await say([{ text: `No problem. I’ve let ${first(mentor().name)} know politely. No booking was made and there’s nothing to pay.` }]);
        await showMentors("Here are some other mentors who may fit.");
        break;
      case "finish":
        await say([{ text: "Thanks for stopping by. Message *hi* any time to pick up again.", buttons: [{ id: "menu", label: "Back to menu" }] }]);
        break;
      case "times": {
        c.awaiting = null;
        const m = mentor();
        await say([
          {
            text: `Here are ${first(m.name)}’s available one-to-one times, shown in Indian Standard Time (IST).\n\n*Session:* ${m.length}, private video call\n*Price:* ${m.price} (sample amount, incl. GST)\n\nFree cancellation or rescheduling up to 24 hours before the session.`,
            buttons: slots.map((s, i) => ({ id: `slot:${i}`, label: s })),
          },
        ]);
        break;
      }
      case "slot": {
        const m = mentor();
        c.slot = slots[Number(arg)];
        await say([
          { text: `Lovely. That’s *${c.slot} IST* with ${m.name}.\n\nTo confirm, please pay *${m.price}* on our secure external payment page using UPI, card or net banking. Continuum will never ask for your UPI PIN, OTP or card details in WhatsApp.`, cta: { label: "Pay securely", action: "pay" } },
        ]);
        break;
      }
      case "cancel":
        setMessages((ms) => ms.map((m) => (m.cta?.action === "join" ? { ...m, cta: { ...m.cta, done: true } } : m)));
        await say([
          {
            text: "*Your sample booking is cancelled.*\nThe session link is no longer active. In the real service, any eligible refund would return to your original payment method, such as your UPI-linked bank account, within 5 to 7 working days.",
            buttons: [
              { id: "times", label: "Book another time" },
              { id: "menu", label: "Start over" },
            ],
          },
        ]);
        break;
    }
  };

  const onReply = (msg: Msg, btn: Btn) => {
    if (busy || msg.id !== activeId) return;
    patch(msg.id, { answered: btn.id });
    act(async () => {
      userSay(btn.label);
      await route(btn.id, btn.label);
    });
  };

  const onPickOption = () => {
    if (!picked || !sheet?.list || busy) return;
    const opt = sheet.list.options.find((o) => o.id === picked);
    if (!opt) return;
    const kind = sheet.list.kind;
    setSheet(null);
    setPicked("");
    consume();
    act(async () => {
      if (kind === "field") {
        ctx.current.field = opt.label;
        userSay(opt.label);
        await askGoal("");
      } else {
        userSay(opt.id === "others" ? opt.label : `Meet ${first(opt.label)}`);
        await route(opt.id, opt.label);
      }
    });
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    act(async () => {
      const awaiting = ctx.current.awaiting;
      userSay(text);
      if (awaiting !== "relay" && /\b(help|agent|human|person)\b/i.test(text)) {
        consume();
        await route("human", text);
      } else if (awaiting === "goal") {
        consume();
        await chooseGoal(text);
      } else if (awaiting === "relay") {
        consume();
        await relayReply(text);
      } else if (/^(hi|hello|hey|menu|start)\b/i.test(text)) {
        consume();
        await route("menu", text);
      } else {
        await say([{ text: "Sorry, I didn’t catch that. Please choose one of the options above, or type *help* to reach our team." }]);
      }
    });
  };

  const onCta = (msg: Msg) => {
    if (!msg.cta || msg.cta.done) {
      if (msg.cta?.done) setToast("This link is no longer active");
      return;
    }
    if (msg.cta.action === "pay") setCheckout(true);
    else setToast("Prototype only: no video call will open");
  };

  const payNow = (payMsg: Msg | undefined) => {
    setCheckout(false);
    if (payMsg) patch(payMsg.id, { cta: { ...payMsg.cta!, done: true } });
    const m = mentor();
    const slot = ctx.current.slot;
    act(async () => {
      await say([
        { text: `*Payment received* ✓\n${m.price} (sample amount, incl. GST) · paid via UPI · ${m.name}` },
        { text: `*Your session is booked*\n\n${m.name}\n${slot} IST\n${m.length} · private video call\n\nChanges are free until 24 hours before the session.` },
        {
          text: `*Private session link*\ncontinuum.example/session/8PK2\n\nExpires 30 minutes after your session ends. ${first(m.name)} received their own link in their separate Continuum chat.`,
          cta: { label: "Open session link", action: "join" },
        },
        {
          text: "Need to change anything?",
          buttons: [
            { id: "times", label: "Reschedule" },
            { id: "cancel", label: "Cancel booking" },
            { id: "human", label: "Talk to a person" },
          ],
        },
      ]);
    });
  };

  const closeCheckout = () => {
    setCheckout(false);
    act(async () => {
      await say([
        {
          text: "It looks like the payment wasn’t completed. Nothing has been charged.",
          buttons: [
            { id: "times", label: "Change time" },
            { id: "human", label: "Talk to a person" },
          ],
        },
      ]);
    });
  };

  const payMsg = [...messages].reverse().find((m) => m.cta?.action === "pay" && !m.cta.done);
  const m = mentors[ctx.current.mentor];

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center sm:p-5">
      <div className="mb-3 hidden w-full max-w-[27rem] items-center justify-between px-1 text-xs text-neutral-500 sm:flex">
        <span>Continuum · clickable WhatsApp prototype</span>
        <button onClick={restart} className="font-medium text-neutral-700 underline-offset-2 hover:underline">Restart</button>
      </div>

      <section
        aria-label="Continuum WhatsApp conversation prototype"
        className="relative flex h-dvh w-full max-w-[27rem] flex-col overflow-hidden bg-wa-wall sm:h-[min(50rem,calc(100dvh-5.5rem))] sm:rounded-[1.75rem] sm:shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:ring-1 sm:ring-black/10"
      >
        <header className="z-10 flex shrink-0 items-center gap-1 border-b border-black/10 bg-wa-bar px-2 py-2 text-wa-blue">
          <button onClick={restart} aria-label="Restart conversation" className="flex h-9 w-8 items-center justify-center">
            <Icon name="back" className="h-6 w-6" />
          </button>
          <button onClick={() => setInfo(true)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7d6b] to-[#1b4f43] text-base font-semibold text-white">C</span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-[16px] font-medium leading-tight text-wa-ink">
                Continuum
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-label="Verified business"><circle cx="8" cy="8" r="8" fill="#1b8cf0" /><path d="M4.500 8.200l2.300 2.300 4.700-4.700" stroke="#fff" strokeWidth="1.700" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="block truncate text-[12.5px] leading-tight text-neutral-500">{typing ? "typing…" : "online"}</span>
            </span>
          </button>
          <button onClick={() => setToast("Calls aren’t available in this prototype")} aria-label="Video call" className="flex h-9 w-10 items-center justify-center"><Icon name="video" /></button>
          <button onClick={() => setToast("Calls aren’t available in this prototype")} aria-label="Voice call" className="flex h-9 w-9 items-center justify-center"><Icon name="phone" /></button>
        </header>

        <div ref={scroller} className="wallpaper flex-1 overflow-y-auto px-3 py-3" role="log" aria-live="polite">
          <div className="flex min-h-full flex-col">
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const side = msg.from === "user" ? "out" : "in";
              const groupStart = !prev || prev.from === "chip" || (prev.from === "user" ? "out" : "in") !== side || prev.sender !== msg.sender || prev.from !== msg.from;

              if (msg.from === "chip") {
                return msg.tone === "date" ? (
                  <div key={`${i}-${msg.id}`} className="my-2 self-center rounded-lg bg-white/90 px-3 py-1 text-[12px] font-medium text-neutral-500 shadow-sm">{msg.text}</div>
                ) : (
                  <div key={`${i}-${msg.id}`} className="my-1.5 max-w-[88%] self-center rounded-lg bg-[#fdf3c8] px-3 py-1.5 text-center text-[12px] leading-snug text-[#5b5230] shadow-sm">{msg.text}</div>
                );
              }

              const active = msg.id === activeId && !busy;
              const out = side === "out";
              return (
                <div key={`${i}-${msg.id}`} className={`msg-in flex flex-col ${out ? "items-end" : "items-start"} ${groupStart ? "mt-2" : "mt-[3px]"}`}>
                  <div className={`flex max-w-[84%] flex-col items-stretch ${msg.buttons || msg.list || msg.cta ? "min-w-[15rem]" : ""}`}>
                    <div
                      className={`relative rounded-lg px-2.5 pb-1.5 pt-1.5 text-[16px] leading-[1.32] text-wa-ink shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] ${
                        out ? "bg-wa-out" : "bg-white"
                      } ${groupStart ? (out ? "tail-out rounded-tr-none" : "tail-in rounded-tl-none") : ""}`}
                    >
                      {msg.sender && (
                        <div className="mb-0.5 text-[13.5px] font-medium leading-tight text-wa-teal">
                          {msg.sender}
                          <span className="ml-1.5 text-[11px] font-normal text-wa-meta">via Continuum</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words">
                        {msg.text.split("\n").map((line, li, arr) => {
                          const italic = /^_.*_$/.test(line);
                          return (
                            <span key={li} className={italic ? "italic text-neutral-500" : ""}>
                              <Rich text={italic ? line.slice(1, -1) : line} />
                              {li < arr.length - 1 ? "\n" : ""}
                            </span>
                          );
                        })}
                      </div>
                      <Meta time={msg.time} status={out ? msg.status : undefined} />
                      <span className="clear-both block" />
                    </div>

                    {msg.buttons && (
                      <div className="mt-[3px] flex flex-col gap-[3px]">
                        {msg.buttons.map((b) => {
                          const chosen = msg.answered === b.id;
                          return (
                            <button
                              key={b.id}
                              disabled={!active}
                              onClick={() => onReply(msg, b)}
                              className={`${replyRow} ${chosen ? "!text-neutral-400" : ""} ${!active ? "cursor-default active:!bg-white" : ""}`}
                            >
                              {b.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {msg.list && (
                      <div className="mt-[3px]">
                        <button
                          disabled={!active}
                          onClick={() => { setPicked(""); setSheet(msg); }}
                          className={`${replyRow} ${!active ? "cursor-default !text-neutral-400 active:!bg-white" : ""}`}
                        >
                          <Icon name="list" className="h-[18px] w-[18px]" />
                          {msg.list.button}
                        </button>
                      </div>
                    )}

                    {msg.cta && (
                      <div className="mt-[3px]">
                        <button onClick={() => onCta(msg)} className={`${replyRow} ${msg.cta.done ? "!text-neutral-400" : ""}`}>
                          <Icon name="link" className="h-[18px] w-[18px]" />
                          {msg.cta.label}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="msg-in mt-2 self-start">
                <div className="tail-in relative flex items-center gap-1 rounded-lg rounded-tl-none bg-white px-3.5 py-3 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]" aria-label="Continuum is typing">
                  <span className="typing-dot h-[7px] w-[7px] rounded-full bg-neutral-400" />
                  <span className="typing-dot h-[7px] w-[7px] rounded-full bg-neutral-400" />
                  <span className="typing-dot h-[7px] w-[7px] rounded-full bg-neutral-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="z-10 flex shrink-0 items-center gap-2 border-t border-black/10 bg-wa-bar px-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 text-wa-blue"
        >
          <button type="button" aria-label="Attach" onClick={() => setToast("Attachments aren’t available in this prototype")} className="flex h-9 w-8 items-center justify-center">
            <Icon name="plus" className="h-7 w-7" />
          </button>
          <div className="flex min-w-0 flex-1 items-center rounded-full border border-black/15 bg-white pl-3.5 pr-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={busy ? "" : "Message"}
              aria-label="Message"
              className="min-w-0 flex-1 bg-transparent py-[7px] text-[16px] text-wa-ink outline-none placeholder:text-neutral-400"
            />
            <Icon name="sticker" className="h-6 w-6 shrink-0 text-wa-blue" />
          </div>
          {draft.trim() ? (
            <button type="submit" aria-label="Send" disabled={busy} className="flex h-9 w-9 items-center justify-center rounded-full bg-wa-blue text-white disabled:opacity-50">
              <Icon name="send" className="h-[18px] w-[18px]" />
            </button>
          ) : (
            <>
              <button type="button" aria-label="Camera" onClick={() => setToast("Camera isn’t available in this prototype")} className="flex h-9 w-8 items-center justify-center"><Icon name="camera" className="h-7 w-7" /></button>
              <button type="button" aria-label="Voice message" onClick={() => setToast("Voice notes aren’t available in this prototype")} className="flex h-9 w-8 items-center justify-center"><Icon name="mic" className="h-7 w-7" /></button>
            </>
          )}
        </form>

        {toast && (
          <div className="pointer-events-none absolute inset-x-0 bottom-20 z-50 flex justify-center px-6">
            <div className="msg-in rounded-full bg-neutral-800/90 px-4 py-2 text-center text-[13px] text-white shadow-lg">{toast}</div>
          </div>
        )}

        {sheet?.list && (
          <div className="absolute inset-0 z-30 flex items-end bg-black/45" onClick={() => setSheet(null)}>
            <div className="sheet-in flex max-h-[85%] w-full flex-col rounded-t-2xl bg-white" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={sheet.list.title}>
              <div className="flex items-center justify-between px-4 py-3.5">
                <h2 className="m-0 text-[17px] font-semibold">{sheet.list.title}</h2>
                <button onClick={() => setSheet(null)} aria-label="Close" className="text-neutral-500"><Icon name="close" className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto border-t border-neutral-200">
                {sheet.list.options.map((o) => (
                  <button key={o.id} onClick={() => setPicked(o.id)} className="flex w-full items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3.5 text-left text-[16px]">
                    <span className="min-w-0">
                      {o.label}
                      {o.desc && <span className="block text-[13px] leading-tight text-neutral-500">{o.desc}</span>}
                    </span>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${picked === o.id ? "border-wa-blue bg-wa-blue text-white" : "border-neutral-300"}`}>
                      {picked === o.id && <Icon name="check" className="h-3 w-3" />}
                    </span>
                  </button>
                ))}
              </div>
              <div className="p-3">
                <button onClick={onPickOption} disabled={!picked} className="w-full rounded-full bg-wa-blue py-3 text-[16px] font-medium text-white disabled:bg-neutral-300">Send</button>
              </div>
            </div>
          </div>
        )}

        {info && (
          <div className="absolute inset-0 z-30 flex items-end bg-black/45" onClick={() => setInfo(false)}>
            <div className="sheet-in w-full rounded-t-2xl bg-[#f2f2f7] p-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Business info">
              <div className="flex flex-col items-center py-2 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7d6b] to-[#1b4f43] text-2xl font-semibold text-white">C</span>
                <h2 className="m-0 mt-2 text-lg font-semibold">Continuum</h2>
                <p className="m-0 text-sm text-neutral-500">Business account · Mentorship across India</p>
              </div>
              <p className="my-3 rounded-xl bg-white p-3 text-[13px] leading-snug text-neutral-600">
                This is a prototype. No real WhatsApp messages are sent, and no payment is taken. In the service, you can ask our team to step in at any time. Continuum does not provide urgent or emergency support.
              </p>
              <div className="overflow-hidden rounded-xl bg-white text-[16px]">
                <button disabled={busy} onClick={() => { setInfo(false); consume(); act(async () => { userSay("Talk to a person"); await route("human", ""); }); }} className="block w-full border-b border-neutral-100 px-4 py-3 text-left text-wa-blue disabled:opacity-40">Talk to a person</button>
                <button disabled={busy} onClick={() => { setInfo(false); consume(); act(async () => { userSay("Report a concern"); await route("concern", ""); }); }} className="block w-full border-b border-neutral-100 px-4 py-3 text-left text-[#e0453a] disabled:opacity-40">Report a concern</button>
                <button onClick={restart} className="block w-full px-4 py-3 text-left text-wa-blue">Restart prototype</button>
              </div>
              <button onClick={() => setInfo(false)} className="mt-3 w-full rounded-xl bg-white py-3 text-[16px] font-medium text-wa-blue">Close</button>
            </div>
          </div>
        )}

        {checkout && (
          <div className="sheet-in absolute inset-0 z-40 flex flex-col bg-white">
            <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-100 px-3 py-2.5">
              <button onClick={closeCheckout} aria-label="Close payment page" className="text-neutral-600"><Icon name="close" className="h-5 w-5" /></button>
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-1.5 text-[13px] text-neutral-600">
                <Icon name="lock" className="h-3.5 w-3.5" />
                pay.continuum.example
              </div>
              <span className="w-5" />
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">External page · simulation</p>
              <h2 className="mb-1 mt-2 text-2xl font-semibold">Confirm your session</h2>
              <p className="m-0 text-sm text-neutral-500">{m.name} · {m.length}<br />{ctx.current.slot} IST</p>
              <div className="my-5 flex items-center justify-between border-y border-neutral-200 py-3.5 text-[15px]">
                <span className="text-neutral-500">Total</span>
                <strong className="text-lg">{m.price}</strong>
              </div>
              <div className="rounded-lg bg-neutral-100 p-3.5 text-center text-xs text-neutral-500">UPI, card and net banking options would appear here</div>
              <button onClick={() => payNow(payMsg)} className="mt-5 w-full rounded-lg bg-neutral-900 py-3.5 text-[15px] font-medium text-white">Simulate successful payment</button>
              <button onClick={closeCheckout} className="mt-3 w-full py-2 text-sm text-neutral-500">Cancel and return to chat</button>
              <p className="mt-6 text-center text-[11px] text-neutral-400">Prototype only. No payment is taken.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
