// ALL network calls live here. Flip USE_MOCK to false to talk to FastAPI.
export const USE_MOCK = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));

/* ---------------- real API ---------------- */
async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

/* ---------------- mock data (in memory) ---------------- */
let nextTaskId = 3;
let nextSubId = 20;

const mk = (
  id,
  taskId,
  n,
  description,
  estimated_minutes,
  is_completed = false,
) => ({
  id,
  task_id: taskId,
  step_number: n,
  description,
  estimated_minutes,
  is_completed,
});

const store = [
  {
    id: 2,
    title: "Study for chemistry quiz",
    original_prompt: "Study for chemistry quiz",
    is_completed: false,
    created_at: "2026-10-25T18:10:00",
    subtasks: [
      mk(
        11,
        2,
        1,
        "Gather your notes and textbook on one clear surface",
        5,
        true,
      ),
      mk(
        12,
        2,
        2,
        "Skim the chapter headings and write down 5 key terms",
        10,
        true,
      ),
      mk(13, 2, 3, "Explain each key term out loud in your own words", 15),
      mk(14, 2, 4, "Try 5 practice questions and check the answers", 15),
    ],
  },
  {
    id: 1,
    title: "Reply to emails",
    original_prompt: "Reply to emails",
    is_completed: false,
    created_at: "2026-10-24T09:00:00",
    subtasks: [
      mk(
        1,
        1,
        1,
        "Open your inbox and star the three most important emails",
        5,
      ),
      mk(2, 1, 2, "Reply to the quickest one in two sentences", 5),
      mk(3, 1, 3, "Draft replies to the other two", 10),
    ],
  },
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function templateFor(prompt) {
  const p = prompt.toLowerCase();
  if (/(clean|room|tidy|laundry|declutter)/.test(p))
    return [
      ["Pick up clothes from the floor and put them in a basket", 10],
      ["Throw away trash and wrappers", 5],
      ["Make the bed", 5],
      ["Wipe the desk and put things back in place", 15],
    ];
  if (/(study|exam|quiz|revise|learn)/.test(p))
    return [
      ["Clear one surface and gather your notes", 5],
      ["Skim the headings and pick 5 key ideas", 10],
      ["Explain each idea out loud in your own words", 15],
      ["Try a few practice questions", 15],
    ];
  if (/(write|essay|report|assignment|paper|project)/.test(p))
    return [
      ["Open a blank page and write the main point in one sentence", 5],
      ["List three things you want to say about it", 10],
      ["Write a rough first paragraph. Messy is fine", 15],
      ["Take a pause, then read it once and fix one thing", 10],
    ];
  return [
    ["Write down what 'done' would look like, in one sentence", 5],
    ["Gather anything you need within arm's reach", 5],
    ["Do just the first small piece, nothing more", 15],
    ["Take a breath, then decide the next tiny step", 5],
  ];
}

const rewrites = {
  polite:
    "Hi! I'm so sorry, but I won't be able to make it tomorrow. Thank you for understanding, and I really appreciate your flexibility.",
  professional:
    "Unfortunately I won't be able to attend tomorrow. Apologies for the inconvenience.",
  direct: "I can't make it tomorrow.",
};

/* ---------------- public functions ---------------- */
export async function createTask(prompt) {
  if (!USE_MOCK) return request("POST", "/api/tasks", { prompt });
  await sleep(600);
  const id = nextTaskId++;
  const task = {
    id,
    title: cap(prompt.trim()),
    original_prompt: prompt.trim(),
    is_completed: false,
    created_at: new Date().toISOString().slice(0, 19),
    subtasks: templateFor(prompt).map(([d, m], i) =>
      mk(nextSubId++, id, i + 1, d, m),
    ),
  };
  store.unshift(task);
  return clone(task);
}

export async function listTasks() {
  if (!USE_MOCK) return request("GET", "/api/tasks");
  await sleep(300);
  return clone(store);
}

export async function toggleSubtask(id, is_completed) {
  if (!USE_MOCK)
    return request("PATCH", `/api/subtasks/${id}`, { is_completed });
  await sleep(150);
  for (const t of store) {
    const s = t.subtasks.find((x) => x.id === id);
    if (s) {
      s.is_completed = is_completed;
      t.is_completed = t.subtasks.every((x) => x.is_completed);
      return clone(s);
    }
  }
  throw new Error("Not found");
}

export async function communicate(text, tone) {
  if (!USE_MOCK) return request("POST", "/api/communicate", { text, tone });
  await sleep(600);
  return { rewritten: rewrites[tone] || rewrites.polite };
}

// Optional endpoint. Never throws, never blocks the UI.
export async function logFocusSession(subtask_id, minutes) {
  try {
    if (USE_MOCK) return null;
    return await request("POST", "/api/focus-sessions", {
      subtask_id,
      minutes,
    });
  } catch {
    return null;
  }
}
