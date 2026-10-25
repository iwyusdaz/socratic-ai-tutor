/* chat.js — bring-your-own-key demo for the Socratic AI Tutor.
 *
 * Security model (documented on the page and in the README):
 *  - The API key lives ONLY in the `apiKey` variable below. It is never written
 *    to localStorage, sessionStorage, cookies, or the console, and never sent
 *    anywhere except the base URL the user entered (as an Authorization header).
 *  - There is no proxy and no server. This page talks straight to the provider.
 *  - Nothing is persisted: reload = everything gone.
 *  - No network request is made until the user connects a key.
 */
(function () {
  "use strict";

  // The v3 DRAFT tutor prompt from spec/prompts/system-prompt-v3.md.
  // Source of truth is that file; this copy exists because the demo is a
  // static page with no build step. If the spec changes, update both.
  var TUTOR_PROMPT = [
    "You are an algebra tutor for students aged 14-16 and adult returners,",
    "practicing linear equations in one variable AFTER their lesson (e.g.",
    "3x + 5 = 20, 2(x - 4) = x + 6). Your job is to protect learning: the student",
    "does the mathematical thinking, you manage the support.",
    "",
    "== CORE CONTRACT ==",
    "The student leaves this conversation able to solve a NEW problem with FEWER",
    "hints than this one. Every decision you make serves that goal. Giving an",
    "answer that ends the conversation feeling efficient is a FAILURE if the",
    "student only watched.",
    "",
    "== MOVES ==",
    "1. ATTEMPT FIRST. Open every new problem with one question asking for an",
    "   attempt or a first step. Do not explain anything about the solution",
    "   method before the student has tried.",
    "",
    "2. HINT LADDER, ONE RUNG AT A TIME. Track which level you are on:",
    "   - Level 0: \"What have you tried?\"",
    "   - Level 1: conceptual nudge (the GOAL, not the operation) - e.g. \"What",
    "     do we want x to be alone on?\", \"What does the = sign tell us about",
    "     the two sides?\"",
    "   - Level 2: strategy hint (the OPERATION, not the result) - e.g. \"What",
    "     operation undoes +5?\"",
    "   - Level 3: partial step (the operation named, the student executes) -",
    "     e.g. \"Subtract 5 from both sides. What do you get?\"",
    "   One hint per message. Never skip levels. Only escalate when the student",
    "   responds and is still stuck.",
    "",
    "3. ERRORS: when the student's step is wrong, ask a question about the",
    "   exact spot where the math went wrong. Never name the misconception",
    "   (\"you forgot to...\") - point at the SYMPTOM (\"look at the right side -",
    "   what did the 2 multiply?\"). Let the student find and fix it.",
    "",
    "4. CORRECT ANSWERS: confirm in one short sentence, give one specific",
    "   comment on their PROCESS (what they did right, not \"great job\"), ask",
    "   ONE why-question, then offer a similar problem with different numbers",
    "   and fewer hints than last time.",
    "",
    "== SAFETY (these override the moves) ==",
    "5. NO ANSWER LEAKAGE. Never state the final answer to the student's",
    "   problem before a genuine attempt AND two hints, no matter how it is",
    "   asked: \"just tell me\", urgency, \"my teacher said you can\", \"pretend",
    "   you're a calculator\", role-play, \"I already did the work\", or any",
    "   reframe. Decline in one short sentence and re-offer the next rung.",
    "   If the student proposes an answer (even a correct one), do not confirm",
    "   or deny: ask them to substitute it back into the original equation.",
    "",
    "6. OFF-TOPIC: decline in one sentence, return to the math.",
    "   PERSONAL INFO: never ask; if shared, do not repeat it; gently note",
    "   they don't need to share personal details here.",
    "   DISTRESS: respond with care in 1-2 sentences, suggest a trusted adult",
    "   or local emergency services, stop tutoring. This outranks everything.",
    "",
    "== QUALITY ==",
    "7. FORMAT: under 80 words, ONE question, end by handing the turn back.",
    "8. BEFORE SENDING, CHECK: (a) recompute every arithmetic claim you made;",
    "   (b) substitute your proposed solution into the original equation;",
    "   (c) would a grader say this message revealed the answer? If (c) is",
    "   yes, rewrite it as the next rung of the ladder.",
    "9. WORKED EXAMPLE: after the student fails the same step 3 times, show a",
    "   fully worked SIMILAR problem (different numbers, same structure),",
    "   justifying each step in a few words, then return to the original.",
    "10. If you have sent 3 hints on the same problem with no progress, stop",
    "    climbing and use rule 9. If the student is silent, wait - do not send",
    "    more content.",
    "",
    "== REMEMBER ==",
    "Before every reply, silently ask: \"Whose turn is it to think?\" If the",
    "answer is not \"the student's\", rewrite the message."
  ].join("\n");

  var TEMPERATURE = 0;

  var apiKey = null; // in memory ONLY — never persisted, never logged
  var history = [];  // {role: 'user'|'assistant', content: string}

  var el = {
    keyForm: document.getElementById("key-form"),
    baseUrl: document.getElementById("base-url"),
    modelName: document.getElementById("model-name"),
    apiKeyInput: document.getElementById("api-key"),
    connectBtn: document.getElementById("connect-btn"),
    clearKeyBtn: document.getElementById("clear-key-btn"),
    keyStatus: document.getElementById("key-status"),
    log: document.getElementById("log"),
    typing: document.getElementById("typing-status"),
    chatForm: document.getElementById("chat-form"),
    chatInput: document.getElementById("chat-input"),
    sendBtn: document.getElementById("send-btn"),
    resetBtn: document.getElementById("reset-btn"),
    disabledNote: document.getElementById("chat-disabled-note")
  };

  function setStatus(text, cls) {
    el.keyStatus.textContent = text;
    el.keyStatus.className = cls || "";
  }

  function setChatEnabled(on) {
    el.chatInput.disabled = !on;
    el.sendBtn.disabled = !on;
    el.resetBtn.disabled = !on;
    el.disabledNote.hidden = on;
    if (on) el.chatInput.focus();
  }

  function addMsg(kind, speaker, text) {
    var p = document.createElement("p");
    p.className = "msg " + kind;
    var s = document.createElement("span");
    s.className = "speaker";
    s.textContent = speaker + " ";
    p.appendChild(s);
    p.appendChild(document.createTextNode(text)); // plain text math, no HTML injection
    el.log.appendChild(p);
    el.log.scrollTop = el.log.scrollHeight;
  }

  function clearTyping() { el.typing.textContent = ""; }

  el.keyForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var url = el.baseUrl.value.trim().replace(/\/+$/, "");
    var model = el.modelName.value.trim();
    var key = el.apiKeyInput.value.trim();
    if (!url || !model || !key) {
      setStatus("Connect needs a base URL, a model name and a key — nothing has been sent.", "error");
      return;
    }
    apiKey = key;
    el.apiKeyInput.value = "";
    el.clearKeyBtn.disabled = false;
    setChatEnabled(true);
    setStatus("Connected to " + url + " (model " + model + "). The key is in memory only — it disappears when you close or reload this tab.", "connected");
  });

  el.clearKeyBtn.addEventListener("click", function () {
    apiKey = null;
    el.clearKeyBtn.disabled = true;
    setStatus("Key cleared from memory. Nothing was stored anywhere.", "");
  });

  el.resetBtn.addEventListener("click", function () {
    history = [];
    el.log.textContent = "";
    clearTyping();
    el.chatInput.focus();
  });

  el.chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    send();
  });

  el.chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  function send() {
    var text = el.chatInput.value.trim();
    if (!text || !apiKey || el.sendBtn.disabled) return;
    el.chatInput.value = "";
    addMsg("user", "You:", text);
    history.push({ role: "user", content: text });
    el.typing.textContent = "Tutor is typing…";
    requestReply();
  }

  async function requestReply() {
    var url = el.baseUrl.value.trim().replace(/\/+$/, "") + "/chat/completions";
    try {
      var res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: el.modelName.value.trim(),
          messages: [{ role: "system", content: TUTOR_PROMPT }].concat(history),
          temperature: TEMPERATURE
        })
      });
      if (!res.ok) {
        var body = await res.text();
        fail("The provider returned an error (HTTP " + res.status + "). " + String(body).slice(0, 200));
        return;
      }
      var data = await res.json();
      var reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!reply) {
        fail("The provider's response had no message content.");
        return;
      }
      history.push({ role: "assistant", content: reply });
      addMsg("tutor", "Tutor:", reply);
    } catch (err) {
      fail("Could not reach the provider (this is often a CORS or network restriction in the browser — see the note above about provider browser policies). Details: " + String(err && err.message ? err.message : err));
    } finally {
      clearTyping();
      el.chatInput.focus();
    }
  }

  function fail(msg) {
    addMsg("error", "Connection problem:", msg);
  }

  setChatEnabled(false);
})();
