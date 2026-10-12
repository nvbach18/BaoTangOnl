const translations = {
  en: {
    startAria: 'Start exploration',
    startEyebrow: 'A PLACE TO ARRIVE',
    startTitle: 'VIRTUAL<br /><em>MUSEUM</em>',
    startSubtitle: 'A journey through history begins here.',
    startButton: 'START EXPLORATION',
    startControls: 'WASD TO MOVE <i>·</i> MOUSE TO LOOK AROUND',
    arrival: 'THE ARRIVAL',
    garden: 'HERITAGE GARDEN',
    status: 'Exploration status',
    journey: 'THE WAY TO THE MUSEUM',
    move: 'MOVE',
    sprint: 'SPRINT',
    approach: 'THE MUSEUM IS JUST AHEAD',
    enter: 'ENTER THE MUSEUM',
    pauseAria: 'Paused',
    pauseEyebrow: 'TAKE YOUR TIME',
    paused: 'PAUSED',
    pauseSubtitle: 'Continue your walk to the museum.',
    resume: 'RESUME EXPLORATION',
    pauseControls: 'WASD MOVE <i>·</i> SHIFT SPRINT <i>·</i> SPACE JUMP <i>·</i> ESC PAUSE',
    settings: 'SETTINGS',
    theme: 'TIME OF DAY',
    day: 'DAY',
    night: 'NIGHT',
    language: 'LANGUAGE',
    english: 'ENGLISH',
    vietnamese: 'TIẾNG VIỆT',
    errorTitle: 'Unable to open the museum grounds',
    reload: 'RELOAD',
    fatalFallback: 'Your browser could not create a WebGL context.',
    interiorNotice: 'The museum interior will open in a later chapter.',
    elevatorPrompt: 'USE THE ELEVATOR',
    exitMuseumPrompt: 'EXIT THE MUSEUM',
    elevatorTitle: 'MUSEUM ELEVATOR',
    elevatorSubtitle: 'Choose a floor to visit.',
    elevatorClose: 'CLOSE',
    floorStatus: 'FLOOR {floor} OF 4',
  },
  vi: {
    startAria: 'Bắt đầu tham quan',
    startEyebrow: 'ĐIỂM KHỞI ĐẦU',
    startTitle: 'BẢO TÀNG<br /><em>ẢO</em>',
    startSubtitle: 'Hành trình khám phá lịch sử bắt đầu từ đây.',
    startButton: 'BẮT ĐẦU THAM QUAN',
    startControls: 'WASD ĐỂ DI CHUYỂN <i>·</i> CHUỘT ĐỂ QUAN SÁT',
    arrival: 'ĐIỂM ĐẾN',
    garden: 'KHU VƯỜN DI SẢN',
    status: 'Trạng thái tham quan',
    journey: 'ĐƯỜNG ĐẾN BẢO TÀNG',
    move: 'DI CHUYỂN',
    sprint: 'CHẠY NHANH',
    approach: 'BẢO TÀNG Ở NGAY PHÍA TRƯỚC',
    enter: 'VÀO BẢO TÀNG',
    pauseAria: 'Đang tạm dừng',
    pauseEyebrow: 'THƯ THẢ KHÁM PHÁ',
    paused: 'TẠM DỪNG',
    pauseSubtitle: 'Tiếp tục hành trình đến bảo tàng.',
    resume: 'TIẾP TỤC THAM QUAN',
    pauseControls: 'WASD DI CHUYỂN <i>·</i> SHIFT CHẠY NHANH <i>·</i> SPACE NHẢY <i>·</i> ESC TẠM DỪNG',
    settings: 'CÀI ĐẶT',
    theme: 'THỜI GIAN',
    day: 'BAN NGÀY',
    night: 'BAN ĐÊM',
    language: 'NGÔN NGỮ',
    english: 'ENGLISH',
    vietnamese: 'TIẾNG VIỆT',
    errorTitle: 'Không thể mở khuôn viên bảo tàng',
    reload: 'TẢI LẠI',
    fatalFallback: 'Trình duyệt không thể khởi tạo WebGL.',
    interiorNotice: 'Không gian bên trong bảo tàng sẽ mở ở chương tiếp theo.',
    elevatorPrompt: 'SỬ DỤNG THANG MÁY',
    exitMuseumPrompt: 'RA KHỎI BẢO TÀNG',
    elevatorTitle: 'THANG MÁY BẢO TÀNG',
    elevatorSubtitle: 'Chọn tầng muốn tham quan.',
    elevatorClose: 'ĐÓNG',
    floorStatus: 'TẦNG {floor} / 4',
  },
};

export function createInterface() {
  const root = document.querySelector('#ui-root');
  root.innerHTML = `
    <div class="vignette" aria-hidden="true"></div>
    <section class="start-screen" id="start-screen" aria-label="Start exploration">
      <div class="start-panel">
        <div class="eyebrow"><span></span><span data-i18n="startEyebrow">A PLACE TO ARRIVE</span></div>
        <h1 id="start-title">VIRTUAL<br /><em>MUSEUM</em></h1>
        <p class="start-subtitle" data-i18n="startSubtitle">A journey through history begins here.</p>
        <button class="start-button" id="start-button" type="button">
          <span data-i18n="startButton">START EXPLORATION</span><span class="button-arrow" aria-hidden="true">↗</span>
        </button>
        <p class="start-controls" data-i18n="startControls">WASD TO MOVE <i>·</i> MOUSE TO LOOK AROUND</p>
      </div>
      <div class="start-caption"><span>01</span><span data-i18n="arrival">THE ARRIVAL</span><span data-i18n="garden">HERITAGE GARDEN</span></div>
      <div class="start-rule" aria-hidden="true"></div>
    </section>
    <div class="crosshair" id="crosshair" aria-hidden="true"><i></i><b></b></div>
    <aside class="hud" id="hud" aria-label="Exploration status">
      <div class="hud-brand"><span class="brand-mark">V</span><span>VIRTUAL MUSEUM<small>THE ARRIVAL</small></span></div>
      <div class="journey"><div class="journey-label"><span data-i18n="journey">THE WAY TO THE MUSEUM</span><strong id="progress-value">0%</strong></div><div class="progress-track"><span id="progress-fill"></span></div></div>
      <div class="control-hint"><span class="keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span data-i18n="move">MOVE</span><kbd class="key-shift">SHIFT</kbd><span data-i18n="sprint">SPRINT</span></div>
    </aside>
    <div class="approach-notice" id="approach-notice" data-i18n="approach">THE MUSEUM IS JUST AHEAD</div>
    <div class="interaction-prompt" id="interaction-prompt"><kbd>E</kbd><span data-i18n="enter">ENTER THE MUSEUM</span></div>
    <div class="toast" id="toast" role="status"></div>
    <section class="elevator-screen is-hidden" id="elevator-screen" aria-label="Museum elevator">
      <div class="elevator-panel">
        <div class="eyebrow"><span></span><span data-i18n="elevatorTitle">MUSEUM ELEVATOR</span></div>
        <p data-i18n="elevatorSubtitle">Choose a floor to visit.</p>
        <div class="elevator-floor-list">
          <button type="button" class="elevator-floor" data-floor="3"><strong>04</strong><span data-floor-label="4">FLOOR 4</span></button>
          <button type="button" class="elevator-floor" data-floor="2"><strong>03</strong><span data-floor-label="3">FLOOR 3</span></button>
          <button type="button" class="elevator-floor" data-floor="1"><strong>02</strong><span data-floor-label="2">FLOOR 2</span></button>
          <button type="button" class="elevator-floor" data-floor="0"><strong>01</strong><span data-floor-label="1">FLOOR 1 · EXIT</span></button>
        </div>
        <button class="elevator-close" type="button" id="elevator-close" data-i18n="elevatorClose">CLOSE</button>
      </div>
    </section>
    <section class="pause-screen is-hidden" id="pause-screen" aria-label="Paused">
      <div class="pause-panel">
        <div class="eyebrow"><span></span><span data-i18n="pauseEyebrow">TAKE YOUR TIME</span></div>
        <h2 data-i18n="paused">PAUSED</h2>
        <p data-i18n="pauseSubtitle">Continue your walk to the museum.</p>
        <button class="start-button" id="resume-button" type="button"><span data-i18n="resume">RESUME EXPLORATION</span><span class="button-arrow" aria-hidden="true">↗</span></button>
        <div class="settings">
          <h3 data-i18n="settings">SETTINGS</h3>
          <div class="setting-row">
            <span class="setting-label" data-i18n="theme">TIME OF DAY</span>
            <div class="setting-options" role="group" aria-label="Time of day">
              <button type="button" class="setting-option is-selected" data-time="day" aria-pressed="true" data-i18n="day">DAY</button>
              <button type="button" class="setting-option" data-time="night" aria-pressed="false" data-i18n="night">NIGHT</button>
            </div>
          </div>
          <div class="setting-row">
            <span class="setting-label" data-i18n="language">LANGUAGE</span>
            <div class="setting-options" role="group" aria-label="Language">
              <button type="button" class="setting-option" data-language="en" aria-pressed="false" data-i18n="english">ENGLISH</button>
              <button type="button" class="setting-option is-selected" data-language="vi" aria-pressed="true" data-i18n="vietnamese">TIẾNG VIỆT</button>
            </div>
          </div>
        </div>
        <p class="pause-controls" data-i18n="pauseControls">WASD MOVE <i>·</i> SHIFT SPRINT <i>·</i> SPACE JUMP <i>·</i> ESC PAUSE</p>
      </div>
    </section>
    <div class="error-screen is-hidden" id="error-screen" role="alert"><h2 data-i18n="errorTitle">Unable to open the museum grounds</h2><p id="error-message"></p><button id="reload-button" type="button" data-i18n="reload">RELOAD</button></div>
  `;

  const startScreen = root.querySelector('#start-screen');
  const pauseScreen = root.querySelector('#pause-screen');
  const hud = root.querySelector('#hud');
  const crosshair = root.querySelector('#crosshair');
  const toast = root.querySelector('#toast');
  const elevatorScreen = root.querySelector('#elevator-screen');
  let toastTimer;
  let language = 'en';
  let timeOfDay = 'day';
  let lastNotice;
  let museumFloor = null;

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    const dictionary = translations[language];
    root.querySelectorAll('[data-i18n]').forEach((element) => {
      const translation = dictionary[element.dataset.i18n];
      if (translation !== undefined) element.innerHTML = translation;
    });
    root.querySelector('#start-screen').setAttribute('aria-label', dictionary.startAria);
    root.querySelector('#hud').setAttribute('aria-label', dictionary.status);
    root.querySelector('#pause-screen').setAttribute('aria-label', dictionary.pauseAria);
    elevatorScreen.setAttribute('aria-label', dictionary.elevatorTitle);
    root.querySelector('[data-time]').parentElement.setAttribute('aria-label', dictionary.theme);
    root.querySelector('[data-language]').parentElement.setAttribute('aria-label', dictionary.language);
    root.querySelectorAll('[data-floor-label]').forEach((label) => {
      const floor = label.dataset.floorLabel;
      label.textContent = language === 'vi' ? `TẦNG ${floor}${floor === '1' ? ' · RA NGOÀI' : ''}` : `FLOOR ${floor}${floor === '1' ? ' · EXIT' : ''}`;
    });
    root.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
      button.classList.toggle('is-selected', button.dataset.language === language);
    });
    if (museumFloor !== null) {
      root.querySelector('[data-i18n="journey"]').textContent =
        dictionary.floorStatus.replace('{floor}', String(museumFloor + 1));
    }
    if (lastNotice) showNotice(lastNotice);
  }

  return {
    bind({ onStart, onResume, onTimeOfDayChange, onLanguageChange, onSelectFloor, onCloseElevator }) {
      root.querySelector('#start-button').addEventListener('click', onStart);
      root.querySelector('#resume-button').addEventListener('click', onResume);
      root.querySelector('#reload-button').addEventListener('click', () => window.location.reload());
      root.querySelectorAll('[data-time]').forEach((button) => {
        button.addEventListener('click', () => {
          timeOfDay = button.dataset.time;
          root.querySelectorAll('[data-time]').forEach((option) => {
            const selected = option.dataset.time === timeOfDay;
            option.classList.toggle('is-selected', selected);
            option.setAttribute('aria-pressed', String(selected));
          });
          onTimeOfDayChange(timeOfDay);
        });
      });
      root.querySelectorAll('[data-language]').forEach((button) => {
        button.addEventListener('click', () => {
          setLanguage(button.dataset.language);
          onLanguageChange(button.dataset.language);
        });
      });
      root.querySelectorAll('[data-floor]').forEach((button) => {
        button.addEventListener('click', () => {
          elevatorScreen.classList.add('is-hidden');
          onSelectFloor(Number(button.dataset.floor));
        });
      });
      root.querySelector('#elevator-close').addEventListener('click', () => {
        elevatorScreen.classList.add('is-hidden');
        onCloseElevator();
      });
      setLanguage(language);
    },
    setPlaying(playing) {
      if (!playing && !elevatorScreen.classList.contains('is-hidden')) return;
      startScreen.classList.toggle('is-hidden', playing || root.dataset.hasStarted === 'true');
      if (playing) {
        root.dataset.hasStarted = 'true';
        startScreen.classList.add('is-hidden');
        pauseScreen.classList.add('is-hidden');
        hud.classList.remove('is-hidden');
        crosshair.classList.add('is-visible');
      } else if (root.dataset.hasStarted === 'true') {
        pauseScreen.classList.remove('is-hidden');
        hud.classList.add('is-hidden');
        crosshair.classList.remove('is-visible');
      }
    },
    setEntranceNear(near, atDoor) {
      root.querySelector('#approach-notice').classList.toggle('is-visible', near && !atDoor);
      root.querySelector('#interaction-prompt').classList.toggle('is-visible', atDoor);
    },
    setInteraction(promptKey, visible) {
      const prompt = root.querySelector('#interaction-prompt');
      const label = prompt.querySelector('span');
      label.dataset.i18n = promptKey;
      label.textContent = translations[language][promptKey];
      prompt.classList.toggle('is-visible', visible);
    },
    setMuseumFloor(floor) {
      const label = root.querySelector('[data-i18n="journey"]');
      museumFloor = floor;
      if (floor === null) {
        label.textContent = translations[language].journey;
        return;
      }
      label.textContent = translations[language].floorStatus.replace('{floor}', String(floor + 1));
      root.querySelector('#progress-value').textContent = `${Math.round((floor + 1) / 4 * 100)}%`;
      root.querySelector('#progress-fill').style.width = `${(floor + 1) / 4 * 100}%`;
    },
    showElevator(currentFloor) {
      root.querySelectorAll('[data-floor]').forEach((button) => {
        const selected = Number(button.dataset.floor) === currentFloor;
        button.classList.toggle('is-current', selected);
      });
      pauseScreen.classList.add('is-hidden');
      hud.classList.add('is-hidden');
      crosshair.classList.remove('is-visible');
      elevatorScreen.classList.remove('is-hidden');
    },
    setProgress(progress) {
      root.querySelector('#progress-value').textContent = `${progress}%`;
      root.querySelector('#progress-fill').style.width = `${progress}%`;
    },
    showNotice(message) {
      lastNotice = message;
      toast.textContent = translations[language][message] || message;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
    },
    showFatalError(error) {
      const panel = root.querySelector('#error-screen');
      root.querySelector('#error-message').textContent = error?.message || translations[language].fatalFallback;
      panel.classList.remove('is-hidden');
    },
  };
}
