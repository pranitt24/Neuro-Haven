import llm


def make_task(client, prompt="Clean my room"):
    r = client.post("/api/tasks", json={"prompt": prompt})
    assert r.status_code == 200, r.text
    return r.json()


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_create_task_matches_contract(client):
    task = make_task(client)
    assert set(task) == {"id", "title", "original_prompt", "is_completed", "created_at", "subtasks"}
    assert task["original_prompt"] == "Clean my room"
    assert task["is_completed"] is False
    assert 3 <= len(task["subtasks"]) <= 5
    assert [s["step_number"] for s in task["subtasks"]] == list(range(1, len(task["subtasks"]) + 1))
    for s in task["subtasks"]:
        assert set(s) == {"id", "task_id", "step_number", "description", "estimated_minutes", "is_completed"}
        assert s["task_id"] == task["id"]
        assert s["estimated_minutes"] > 0
        assert s["is_completed"] is False


def test_empty_or_blank_prompt_rejected(client):
    assert client.post("/api/tasks", json={"prompt": ""}).status_code == 422
    assert client.post("/api/tasks", json={"prompt": "   "}).status_code == 422
    assert client.post("/api/tasks", json={}).status_code == 422


def test_too_long_prompt_rejected(client):
    assert client.post("/api/tasks", json={"prompt": "x" * 501}).status_code == 422


def test_list_tasks_newest_first(client):
    first = make_task(client, "Study for exams")
    second = make_task(client, "Write my essay")
    tasks = client.get("/api/tasks").json()
    assert [t["id"] for t in tasks] == [second["id"], first["id"]]
    assert all("subtasks" in t for t in tasks)


def test_toggle_subtask_updates_parent_task(client):
    task = make_task(client)
    ids = [s["id"] for s in task["subtasks"]]

    for sid in ids:
        r = client.patch(f"/api/subtasks/{sid}", json={"is_completed": True})
        assert r.status_code == 200
        assert r.json()["is_completed"] is True

    tasks = client.get("/api/tasks").json()
    assert tasks[0]["is_completed"] is True

    client.patch(f"/api/subtasks/{ids[0]}", json={"is_completed": False})
    assert client.get("/api/tasks").json()[0]["is_completed"] is False


def test_unknown_subtask_is_404(client):
    r = client.patch("/api/subtasks/9999", json={"is_completed": True})
    assert r.status_code == 404


def test_communicate_all_tones(client):
    for tone in ("polite", "professional", "direct"):
        r = client.post("/api/communicate", json={"text": "i cant make it tmrw", "tone": tone})
        assert r.status_code == 200
        assert r.json()["rewritten"].strip()


def test_communicate_invalid_tone_rejected(client):
    r = client.post("/api/communicate", json={"text": "hello", "tone": "angry"})
    assert r.status_code == 422


def test_focus_session_logged(client):
    task = make_task(client)
    sid = task["subtasks"][0]["id"]
    r = client.post("/api/focus-sessions", json={"subtask_id": sid, "minutes": 25})
    assert r.status_code == 200
    assert r.json()["minutes"] == 25
    assert client.post("/api/focus-sessions", json={"minutes": 0}).status_code == 422


# ---- LLM layer (no network: llm_json is faked) ----------------------------------------------


def test_llm_output_is_cleaned(client, monkeypatch):
    fake = {
        "title": "Plan my week",
        "steps": [
            {"description": "Open your calendar", "estimated_minutes": 1},
            {"description": "List what is due", "estimated_minutes": 99},
            {"description": "Pick the top three", "estimated_minutes": "12"},
            {"description": "Block time for each", "estimated_minutes": None},
            {"description": "Close the calendar", "estimated_minutes": 5},
            {"description": "This sixth step must be dropped", "estimated_minutes": 5},
        ],
    }
    monkeypatch.setattr(llm, "llm_json", lambda system, user: fake)
    task = make_task(client, "Plan my week")
    assert task["title"] == "Plan my week"
    assert len(task["subtasks"]) == 5
    assert [s["estimated_minutes"] for s in task["subtasks"]] == [2, 30, 12, 10, 5]


def test_bad_llm_output_falls_back(client, monkeypatch):
    monkeypatch.setattr(llm, "llm_json", lambda system, user: {"steps": [{"description": "only one"}]})
    task = make_task(client, "Do my taxes")
    assert 3 <= len(task["subtasks"]) <= 5


def test_llm_failure_falls_back(client, monkeypatch):
    def boom(system, user):
        raise llm.LLMError("rate limited")

    monkeypatch.setattr(llm, "llm_json", boom)
    assert 3 <= len(make_task(client, "Read a chapter")["subtasks"]) <= 5
    r = client.post("/api/communicate", json={"text": "ugh", "tone": "polite"})
    assert r.status_code == 200 and r.json()["rewritten"]


def test_llm_rewrite_used_when_available(client, monkeypatch):
    monkeypatch.setattr(llm, "llm_json", lambda system, user: {"rewritten": "  I am unable to attend tomorrow.  "})
    r = client.post("/api/communicate", json={"text": "cant come", "tone": "professional"})
    assert r.json()["rewritten"] == "I am unable to attend tomorrow."


def test_extract_json_handles_code_fences():
    assert llm._extract_json('```json\n{"a": 1}\n```') == {"a": 1}
    assert llm._extract_json('Sure! {"a": 2} hope that helps') == {"a": 2}
