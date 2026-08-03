// ---------- State ----------
let currentPaper = null;       // '2022' | '2024'
let questions = [];
let answers = [];              // parallel array, null | 'A'|'B'|'C'|'D'
let currentIndex = 0;
let submitted = false;
let startTime = null;
let timerInterval = null;

const el = (id) => document.getElementById(id);

// ---------- Cover screen ----------
function extractPaperCode(examLabel){
  const match = examLabel && examLabel.match(/\(([^)]+)\)/);
  return match ? match[1] : examLabel;
}

function buildCover(){
  const wrap = el('booklets');
  wrap.innerHTML = '';
  const years = Object.keys(QUIZ_DATA).sort((a,b) => b.localeCompare(a)); // newest first

  years.forEach(year => {
    const list = QUIZ_DATA[year];
    const examLabel = list.length ? list[0].exam : `CGPSC ${year}`;

    const btn = document.createElement('button');
    btn.className = 'booklet';
    btn.type = 'button';
    btn.innerHTML = `
      <div class="booklet-code">${extractPaperCode(examLabel)}</div>
      <div class="booklet-year">${year}</div>
      <div class="booklet-meta">
        <span><b>${list.length}</b> Questions</span>
        <span><b>2</b> Marks each</span>
      </div>
      <span class="booklet-cta">Open Booklet →</span>
    `;
    btn.addEventListener('click', () => startPaper(year));
    wrap.appendChild(btn);
  });
}

function startPaper(paperKey){
  currentPaper = paperKey;
  questions = QUIZ_DATA[paperKey];
  answers = new Array(questions.length).fill(null);
  currentIndex = 0;
  submitted = false;
  startTime = Date.now();

  el('cover-screen').classList.add('hidden');
  el('result-screen').classList.add('hidden');
  el('quiz-screen').classList.remove('hidden');

  el('paper-label').textContent = questions[0].exam;
  el('roll-total').textContent = questions.length;

  buildOmrGrid();
  renderQuestion();
  startTimer();
}

function startTimer(){
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if(submitted) return;
    const secs = Math.floor((Date.now() - startTime)/1000);
    const m = String(Math.floor(secs/60)).padStart(2,'0');
    const s = String(secs%60).padStart(2,'0');
    el('timer').textContent = `${m}:${s}`;
  }, 1000);
}

// ---------- OMR grid ----------
function buildOmrGrid(){
  const grid = el('omr-grid');
  grid.innerHTML = '';
  questions.forEach((q, i) => {
    const b = document.createElement('button');
    b.className = 'omr-bubble';
    b.textContent = i+1;
    b.setAttribute('aria-label', `Question ${i+1}`);
    b.addEventListener('click', () => { currentIndex = i; renderQuestion(); });
    grid.appendChild(b);
  });
  refreshOmrGrid();
}

function refreshOmrGrid(){
  const bubbles = el('omr-grid').children;
  for(let i=0;i<bubbles.length;i++){
    const b = bubbles[i];
    b.classList.remove('answered','current','correct','wrong');
    if(i === currentIndex && !submitted) b.classList.add('current');
    if(submitted){
      if(answers[i] === null){ /* skipped, leave plain */ }
      else if(answers[i] === questions[i].correct) b.classList.add('correct');
      else b.classList.add('wrong');
    } else if(answers[i] !== null){
      b.classList.add('answered');
    }
  }
}

// ---------- Question rendering ----------
function renderQuestion(){
  const q = questions[currentIndex];
  el('q-index').textContent = currentIndex+1;
  el('q-subject').textContent = q.subject;
  el('q-text').textContent = q.q;

  const optWrap = el('options');
  optWrap.innerHTML = '';
  ['A','B','C','D'].forEach(letter => {
    const opt = document.createElement('div');
    opt.className = 'option';
    opt.setAttribute('role','button');
    opt.tabIndex = 0;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = letter;

    const text = document.createElement('div');
    text.className = 'option-text';
    text.textContent = q.options[letter];

    opt.appendChild(bubble);
    opt.appendChild(text);

    if(!submitted){
      if(answers[currentIndex] === letter) opt.classList.add('selected');
      opt.addEventListener('click', () => selectAnswer(letter));
      opt.addEventListener('keydown', (e) => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selectAnswer(letter);} });
    } else {
      if(letter === q.correct) opt.classList.add('reveal-correct');
      else if(letter === answers[currentIndex]) opt.classList.add('reveal-wrong');
    }
    optWrap.appendChild(opt);
  });

  const explain = el('explain');
  if(submitted){
    explain.classList.add('show');
    explain.innerHTML = `<b>Explanation:</b> ${q.explanation}`;
  } else {
    explain.classList.remove('show');
    explain.innerHTML = '';
  }

  el('prev-btn').disabled = currentIndex === 0;
  el('next-btn').textContent = currentIndex === questions.length-1 ? 'Finish' : 'Next →';
  el('submit-btn').classList.toggle('hidden', submitted);

  refreshOmrGrid();
  updateRollBox();
}

function selectAnswer(letter){
  if(submitted) return;
  answers[currentIndex] = letter;
  renderQuestion();
}

function updateRollBox(){
  const answeredCount = answers.filter(a => a !== null).length;
  el('answered-count').textContent = answeredCount;
}

// ---------- Navigation ----------
function nextQuestion(){
  if(currentIndex < questions.length-1){
    currentIndex++;
    renderQuestion();
  } else {
    tryFinish();
  }
}
function prevQuestion(){
  if(currentIndex > 0){ currentIndex--; renderQuestion(); }
}

function tryFinish(){
  const unanswered = answers.filter(a => a===null).length;
  if(unanswered > 0){
    const proceed = confirm(`${unanswered} question(s) unanswered. Submit anyway?`);
    if(!proceed) return;
  }
  submitQuiz();
}

function submitQuiz(){
  submitted = true;
  clearInterval(timerInterval);
  el('submit-btn').classList.add('hidden');
  showResult();
}

// ---------- Result ----------
function showResult(){
  el('quiz-screen').classList.add('hidden');
  el('result-screen').classList.remove('hidden');

  let correct=0, wrong=0, skipped=0;
  questions.forEach((q,i) => {
    if(answers[i]===null) skipped++;
    else if(answers[i]===q.correct) correct++;
    else wrong++;
  });

  el('score-correct').textContent = correct;
  el('score-total').textContent = questions.length;
  el('stat-correct').textContent = correct;
  el('stat-wrong').textContent = wrong;
  el('stat-skipped').textContent = skipped;

  const pct = Math.round((correct/questions.length)*100);
  el('result-sub').textContent = `${pct}% score · ${questions[0].exam}`;

  buildReviewList();
}

function buildReviewList(){
  const wrap = el('review-list');
  wrap.innerHTML = '';
  questions.forEach((q,i) => {
    const status = answers[i]===null ? 'skipped' : (answers[i]===q.correct ? 'correct':'wrong');
    const item = document.createElement('div');
    item.className = 'review-item';
    const yourAns = answers[i] ? `${answers[i]}. ${q.options[answers[i]]}` : '— not answered —';
    const correctAns = `${q.correct}. ${q.options[q.correct]}`;
    item.innerHTML = `
      <div class="q-text">${i+1}. ${q.q} <span class="review-tag ${status}">${status}</span></div>
      <div style="font-size:0.88rem; color:var(--ink-soft); margin-bottom:6px;">Your answer: ${yourAns}</div>
      ${status!=='correct' ? `<div style="font-size:0.88rem; color:var(--success); margin-bottom:6px;">Correct answer: ${correctAns}</div>` : ''}
      <div style="font-size:0.85rem; color:var(--graphite);"><b>Why:</b> ${q.explanation}</div>
    `;
    wrap.appendChild(item);
  });
}

function restartToChoice(){
  el('result-screen').classList.add('hidden');
  el('quiz-screen').classList.add('hidden');
  el('cover-screen').classList.remove('hidden');
}

function retrySamePaper(){
  startPaper(currentPaper);
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  buildCover();
  el('prev-btn').addEventListener('click', prevQuestion);
  el('next-btn').addEventListener('click', nextQuestion);
  el('submit-btn').addEventListener('click', tryFinish);
  el('review-toggle-cover').addEventListener('click', restartToChoice);
  el('retry-btn').addEventListener('click', retrySamePaper);
  el('choose-other-btn').addEventListener('click', restartToChoice);
});
