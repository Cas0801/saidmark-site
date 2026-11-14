const labels = {
  eyebrow: '为 AirPods 打造的私人语音助理',
  headline: '那些话，', headlineEnd: '还能回听。', intro: '用 AirPods 录下对话。几天后，凭记得的一句话，就能找到并回听原声。',
  try: '试听示例', audioLanguage: '英文原声', sample: '示例录音', promise: '答应了什么', deadline: '什么时候交',
  play: '播放录音原话', steps: '聊了很久。<br>想找的就那一句。',
  capture: '录下对话', captureBody: '将 AirPods 连上 iPhone，选择麦克风，在需要时主动开始录音。',
  find: '找回原话', findBody: '在 iPhone 上转写录音，搜索短语或直接提问。点开引用即可回听原声。',
  keep: '留下重要片段', keepBody: '剪下录音中值得保留的一段，保存后随时回听。',
  privateTitle: '录音档案保存在 iPhone 上。',
  privateBody: '外部 AI 是可选功能。经你授权后，Saidmark 可向你配置的服务商发送问题和选定的转写片段。',
  policy: '隐私政策 ↗', support: '技术支持 ↗', audioError: '无法播放录音，请重试。'
};
const examples = {
  promise: { en: ['What did I promise Alex?', 'You promised Alex you’d send the project draft.'], zh: ['我答应了 Alex 什么？', '你答应把项目初稿发给 Alex。'] },
  deadline: { en: ['When is the draft due?', 'The draft is due Friday at 3:00 p.m.'], zh: ['初稿什么时候交？', '初稿要在周五下午 3 点前发出。'] }
};
const translated = [...document.querySelectorAll('[data-text]')];
const english = new Map(translated.map(element => [element, element.innerHTML]));
const audio = document.querySelector('#source');
const play = document.querySelector('#play');
const language = document.querySelector('#language');
let locale = 'en';
let selected = 'promise';
const wave = document.querySelector('.wave');
const levels = [12, 19, 26, 15, 32, 61, 75, 46, 25, 10, 13, 22, 39, 59, 81, 64, 39, 72, 92, 66, 48, 24, 10, 17, 29, 46, 62, 43, 20, 34, 18, 9, 14, 29, 43, 55, 39, 23, 12, 8];
for (const [index, level] of levels.entries()) {
  const bar = document.createElement('i');
  bar.style.setProperty('--height', level + '%');
  bar.style.setProperty('--delay', (index % 7) * -95 + 'ms');
  wave.append(bar);
}

function renderExample() {
  const [question, answer] = examples[selected][locale];
  document.querySelector('#prompt').textContent = question;
  document.querySelector('#answer').textContent = answer;
}
function renderAudio() {
  const playing = !audio.paused && !audio.ended;
  wave.classList.toggle('is-playing', playing);
  document.querySelector('#playIcon').textContent = playing ? 'Ⅱ' : '▶';
  document.querySelector('#playLabel').textContent = playing
    ? (locale === 'zh' ? '暂停播放' : 'Pause audio')
    : (locale === 'zh' ? labels.play : 'Play original audio');
}
language.addEventListener('click', () => {
  locale = locale === 'en' ? 'zh' : 'en';
  document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
  document.title = locale === 'zh' ? 'Saidmark · AirPods 私人语音助理' : 'Saidmark — Hear what was said';
  language.lang = locale === 'zh' ? 'en' : 'zh-Hans';
  language.textContent = locale === 'zh' ? 'English' : '简体中文';
  language.setAttribute('aria-label', locale === 'zh' ? 'Switch to English' : '切换到简体中文');
  document.querySelector('nav').setAttribute('aria-label', locale === 'zh' ? '网站导航' : 'Site navigation');
  document.querySelector('.choices').setAttribute('aria-label', locale === 'zh' ? '示例问题' : 'Sample questions');
  for (const element of translated) {
    const translation = labels[element.dataset.text];
    element.innerHTML = locale === 'zh' && translation ? translation : english.get(element);
  }
  renderExample();
  renderAudio();
});
const choices = [...document.querySelectorAll('[data-question]')];
for (const button of choices) {
  button.addEventListener('click', () => {
    selected = button.dataset.question;
    for (const choice of choices) choice.setAttribute('aria-pressed', String(choice === button));
    renderExample();
  });
}
play.addEventListener('click', async () => {
  if (!audio.paused) {
    audio.pause();
    return;
  }
  try {
    document.querySelector('#audioError').hidden = true;
    if (audio.currentTime < 1 || audio.ended) audio.currentTime = 1;
    await audio.play();
  } catch {
    document.querySelector('#audioError').hidden = false;
  }
});
for (const event of ['play', 'pause', 'ended']) audio.addEventListener(event, renderAudio);
audio.addEventListener('timeupdate', () => {
  const seconds = Math.floor(audio.currentTime);
  document.querySelector('#time').textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
});
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause(); });
