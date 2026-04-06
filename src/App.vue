<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

type RegistrationType = 'individual' | 'team';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

type RegistrationForm = {
  fullName: string;
  subcity: string;
  phoneNumber: string;
  age: string;
};

type WebAppLike = {
  expand?: () => void;
  requestFullscreen?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
  isFullscreen?: boolean;
  MainButton?: {
    setText?: (text: string) => void;
    show?: () => void;
    hide?: () => void;
    enable?: () => void;
    disable?: () => void;
    showProgress?: (leaveActive?: boolean) => void;
    hideProgress?: () => void;
  };
  onEvent?: (event: string, handler: (payload?: unknown) => void) => void;
  offEvent?: (event: string, handler: (payload?: unknown) => void) => void;
  safeAreaInset?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
  contentSafeAreaInset?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: WebAppLike;
    };
  }
}

const FORM_ENDPOINT = 'https://formspree.io/f/xgopdvog';

const competitionOpen = ref(false);
const activeForm = ref<RegistrationType | null>(null);

const forms = reactive<Record<RegistrationType, RegistrationForm>>({
  individual: {
    fullName: '',
    subcity: '',
    phoneNumber: '',
    age: '',
  },
  team: {
    fullName: '',
    subcity: '',
    phoneNumber: '',
    age: '',
  },
});

const submitStates = reactive<Record<RegistrationType, SubmitState>>({
  individual: 'idle',
  team: 'idle',
});

const submitMessages = reactive<Record<RegistrationType, string>>({
  individual: '',
  team: '',
});

const isViewportStable = ref(true);

const webApp = computed(() => window.Telegram?.WebApp);

function getFormTitle(type: RegistrationType): string {
  return type === 'individual' ? 'Individual Registration' : 'Team Application';
}

function getMainButtonText(type: RegistrationType): string {
  return type === 'individual' ? 'Submit Individual Registration' : 'Submit Team Application';
}

function isFormValid(type: RegistrationType): boolean {
  const form = forms[type];
  const age = Number(form.age);
  return (
    form.fullName.trim().length > 1 &&
    form.subcity.trim().length > 1 &&
    form.phoneNumber.trim().length >= 7 &&
    Number.isFinite(age) &&
    age > 0
  );
}

function resetForm(type: RegistrationType): void {
  forms[type].fullName = '';
  forms[type].subcity = '';
  forms[type].phoneNumber = '';
  forms[type].age = '';
}

function toggleCompetition(): void {
  competitionOpen.value = !competitionOpen.value;
  if (!competitionOpen.value) {
    activeForm.value = null;
  }
}

function openForm(type: RegistrationType): void {
  if (!competitionOpen.value) {
    competitionOpen.value = true;
  }
  activeForm.value = activeForm.value === type ? null : type;
}

function setCssVar(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value);
}

function applySafeAreaInsets(): void {
  const app = webApp.value;
  if (!app) {
    return;
  }

  const insets = app.safeAreaInset ?? app.contentSafeAreaInset;
  if (!insets) {
    return;
  }

  setCssVar('--tg-safe-top', `${insets.top ?? 0}px`);
  setCssVar('--tg-safe-right', `${insets.right ?? 0}px`);
  setCssVar('--tg-safe-bottom', `${insets.bottom ?? 0}px`);
  setCssVar('--tg-safe-left', `${insets.left ?? 0}px`);
}

function applyNativeTheme(): void {
  const app = webApp.value;
  if (!app) {
    return;
  }

  app.setHeaderColor?.('bg_color');

  const computed = getComputedStyle(document.documentElement);
  const bg = computed.getPropertyValue('--tg-theme-bg-color').trim();
  if (bg) {
    app.setBackgroundColor?.(bg);
  }
}

function applyViewportMetrics(force = false): void {
  const app = webApp.value;
  if (!app) {
    return;
  }

  if (!force && !isViewportStable.value) {
    return;
  }

  const stableHeight = app.viewportStableHeight ?? app.viewportHeight;
  if (stableHeight && Number.isFinite(stableHeight)) {
    setCssVar('--tg-app-height', `${stableHeight}px`);
  }
}

function handleViewportChanged(payload?: unknown): void {
  const next = payload as { isStateStable?: boolean } | undefined;
  isViewportStable.value = next?.isStateStable ?? true;
  applyViewportMetrics();
}

async function submitRegistration(type: RegistrationType): Promise<void> {
  if (!isFormValid(type) || submitStates[type] === 'submitting') {
    return;
  }

  submitStates[type] = 'submitting';
  submitMessages[type] = '';
  syncMainButton();

  const form = forms[type];
  const payload = new URLSearchParams({
    registration_type: type,
    full_name: form.fullName.trim(),
    subcity: form.subcity.trim(),
    phone_number: form.phoneNumber.trim(),
    age: form.age.trim(),
  });

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    if (!response.ok) {
      throw new Error(`Form submission failed with status ${response.status}`);
    }

    submitStates[type] = 'success';
    submitMessages[type] = 'Registration submitted successfully.';
    resetForm(type);
  } catch {
    submitStates[type] = 'error';
    submitMessages[type] = 'Could not submit right now. Please try again.';
  } finally {
    syncMainButton();
  }
}

function syncMainButton(): void {
  const app = webApp.value;
  const button = app?.MainButton;
  if (!button) {
    return;
  }

  const currentType = activeForm.value;
  if (!currentType) {
    button.hide?.();
    button.hideProgress?.();
    return;
  }

  button.show?.();
  button.setText?.(getMainButtonText(currentType));

  if (submitStates[currentType] === 'submitting') {
    button.disable?.();
    button.showProgress?.(false);
    return;
  }

  button.hideProgress?.();
  if (isFormValid(currentType)) {
    button.enable?.();
  } else {
    button.disable?.();
  }
}

function onMainButtonPressed(): void {
  if (!activeForm.value) {
    return;
  }
  void submitRegistration(activeForm.value);
}

function registerTelegramEvents(): void {
  const app = webApp.value;
  if (!app?.onEvent) {
    return;
  }

  app.onEvent('mainButtonClicked', onMainButtonPressed);
  app.onEvent('main_button_pressed', onMainButtonPressed);
  app.onEvent('viewportChanged', handleViewportChanged);
  app.onEvent('viewport_changed', handleViewportChanged);
  app.onEvent('safeAreaChanged', applySafeAreaInsets);
  app.onEvent('safe_area_changed', applySafeAreaInsets);
  app.onEvent('contentSafeAreaChanged', applySafeAreaInsets);
  app.onEvent('content_safe_area_changed', applySafeAreaInsets);
  app.onEvent('themeChanged', applyNativeTheme);
  app.onEvent('theme_changed', applyNativeTheme);
}

function unregisterTelegramEvents(): void {
  const app = webApp.value;
  if (!app?.offEvent) {
    return;
  }

  app.offEvent('mainButtonClicked', onMainButtonPressed);
  app.offEvent('main_button_pressed', onMainButtonPressed);
  app.offEvent('viewportChanged', handleViewportChanged);
  app.offEvent('viewport_changed', handleViewportChanged);
  app.offEvent('safeAreaChanged', applySafeAreaInsets);
  app.offEvent('safe_area_changed', applySafeAreaInsets);
  app.offEvent('contentSafeAreaChanged', applySafeAreaInsets);
  app.offEvent('content_safe_area_changed', applySafeAreaInsets);
  app.offEvent('themeChanged', applyNativeTheme);
  app.offEvent('theme_changed', applyNativeTheme);
}

onMounted(() => {
  const app = webApp.value;

  if (app) {
    app.expand?.();
    app.requestFullscreen?.();
    applySafeAreaInsets();
    applyViewportMetrics(true);
    applyNativeTheme();
    registerTelegramEvents();
    syncMainButton();
  }
});

onBeforeUnmount(() => {
  unregisterTelegramEvents();
});

watch(
  () => [
    activeForm.value,
    forms.individual.fullName,
    forms.individual.subcity,
    forms.individual.phoneNumber,
    forms.individual.age,
    forms.team.fullName,
    forms.team.subcity,
    forms.team.phoneNumber,
    forms.team.age,
    submitStates.individual,
    submitStates.team,
  ],
  () => {
    syncMainButton();
  },
);
</script>

<template>
  <main class="app-shell">
    <section class="hero">
      <div class="hero__logo">Logo Placeholder</div>
      <h1 class="hero__title">Welcome to ETHCHESS</h1>
      <p class="hero__subtitle">Under 20's Chess Competition Registration</p>
    </section>

    <button class="card card--primary" type="button" @click="toggleCompetition">
      <span>Register for the Under 20's Chess Competition</span>
      <span>{{ competitionOpen ? 'Hide' : 'Open' }}</span>
    </button>

    <section v-if="competitionOpen" class="options">
      <article class="card option-card">
        <div class="option-card__image">Individual Image Placeholder</div>
        <div class="option-card__body">
          <h2>{{ getFormTitle('individual') }}</h2>
          <button class="option-card__toggle" type="button" @click="openForm('individual')">
            {{ activeForm === 'individual' ? 'Close Form' : 'Open Form' }}
          </button>
        </div>

        <form
          v-if="activeForm === 'individual'"
          class="registration-form"
          action="https://formspree.io/f/xgopdvog"
          method="POST"
          @submit.prevent="submitRegistration('individual')"
        >
          <input type="hidden" name="registration_type" value="individual" />

          <label>
            Full name/ሙሉ ስም፡
            <input v-model="forms.individual.fullName" name="full_name" type="text" required />
          </label>

          <label>
            Subcity/ክፍለ ከተማ የምትኖሩበት፡
            <input v-model="forms.individual.subcity" name="subcity" type="text" required />
          </label>

          <label>
            Phone Number/ስልክ ቁጥር፡
            <input
              v-model="forms.individual.phoneNumber"
              name="phone_number"
              type="tel"
              inputmode="tel"
              required
            />
          </label>

          <label>
            Age/እድሜ፡
            <input
              v-model="forms.individual.age"
              name="age"
              type="number"
              min="1"
              inputmode="numeric"
              required
            />
          </label>

          <button class="registration-form__fallback" type="submit" :disabled="submitStates.individual === 'submitting'">
            Submit Individual Registration
          </button>

          <p v-if="submitMessages.individual" class="registration-form__message">
            {{ submitMessages.individual }}
          </p>
        </form>
      </article>

      <article class="card option-card">
        <div class="option-card__image">Team Image Placeholder</div>
        <div class="option-card__body">
          <h2>{{ getFormTitle('team') }}</h2>
          <button class="option-card__toggle" type="button" @click="openForm('team')">
            {{ activeForm === 'team' ? 'Close Form' : 'Open Form' }}
          </button>
        </div>

        <form
          v-if="activeForm === 'team'"
          class="registration-form"
          action="https://formspree.io/f/xgopdvog"
          method="POST"
          @submit.prevent="submitRegistration('team')"
        >
          <input type="hidden" name="registration_type" value="team" />

          <label>
            Full name/ሙሉ ስም፡
            <input v-model="forms.team.fullName" name="full_name" type="text" required />
          </label>

          <label>
            Subcity/ክፍለ ከተማ የምትኖሩበት፡
            <input v-model="forms.team.subcity" name="subcity" type="text" required />
          </label>

          <label>
            Phone Number/ስልክ ቁጥር፡
            <input
              v-model="forms.team.phoneNumber"
              name="phone_number"
              type="tel"
              inputmode="tel"
              required
            />
          </label>

          <label>
            Age/እድሜ፡
            <input
              v-model="forms.team.age"
              name="age"
              type="number"
              min="1"
              inputmode="numeric"
              required
            />
          </label>

          <button class="registration-form__fallback" type="submit" :disabled="submitStates.team === 'submitting'">
            Submit Team Application
          </button>

          <p v-if="submitMessages.team" class="registration-form__message">
            {{ submitMessages.team }}
          </p>
        </form>
      </article>
    </section>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: var(--tg-app-height, 100dvh);
  padding:
    calc(24px + var(--tg-safe-top, env(safe-area-inset-top, 0px)))
    calc(16px + var(--tg-safe-right, env(safe-area-inset-right, 0px)))
    calc(24px + var(--tg-safe-bottom, env(safe-area-inset-bottom, 0px)))
    calc(16px + var(--tg-safe-left, env(safe-area-inset-left, 0px)));
  background:
    radial-gradient(
      circle at 10% 0%,
      color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 14%, transparent) 0%,
      color-mix(in srgb, var(--tg-theme-secondary-bg-color, #f3f6fb) 65%, transparent) 38%,
      var(--tg-theme-bg-color, #eef3fb) 100%
    );
  color: var(--tg-theme-text-color, #11253b);
  display: grid;
  gap: 16px;
}

.hero {
  background: color-mix(in srgb, var(--tg-theme-section-bg-color, #ffffff) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 28%, transparent);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 14px 30px color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 22%, transparent);
}

.hero__logo {
  width: 78px;
  height: 78px;
  border-radius: 16px;
  border: 1px dashed color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 55%, var(--tg-theme-hint-color, #8ea0b5));
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--tg-theme-link-color, #4a688a);
  background: color-mix(in srgb, var(--tg-theme-secondary-bg-color, #f0f4fb) 82%, transparent);
  margin-bottom: 12px;
}

.hero__title {
  margin: 0;
  font-size: 30px;
  line-height: 1.1;
}

.hero__subtitle {
  margin: 8px 0 0;
  color: var(--tg-theme-subtitle-text-color, #31506f);
}

.card {
  border: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 30%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--tg-theme-secondary-bg-color, #ffffff) 90%, transparent);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 20%, transparent);
}

.card--primary {
  border: 0;
  width: 100%;
  background: linear-gradient(
    120deg,
    color-mix(in srgb, var(--tg-theme-button-color, #5288c1) 78%, black) 0%,
    var(--tg-theme-button-color, #5288c1) 100%
  );
  color: var(--tg-theme-button-text-color, #fff);
  font-size: 16px;
  font-weight: 700;
  padding: 18px;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.options {
  display: grid;
  gap: 14px;
}

.option-card {
  overflow: hidden;
}

.option-card__image {
  height: 128px;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 22%, var(--tg-theme-bg-color, #fff)) 0%,
    color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 40%, var(--tg-theme-secondary-bg-color, #f0f4fb)) 100%
  );
  border-bottom: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 32%, transparent);
  display: grid;
  place-items: center;
  color: color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 55%, var(--tg-theme-text-color, #11253b));
  font-size: 13px;
  font-weight: 700;
}

.option-card__body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.option-card__body h2 {
  margin: 0;
  font-size: 18px;
}

.option-card__toggle {
  border: 1px solid color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 65%, transparent);
  background: var(--tg-theme-bg-color, #fff);
  color: var(--tg-theme-link-color, #1f5d96);
  font-weight: 700;
  border-radius: 999px;
  padding: 8px 12px;
}

.registration-form {
  border-top: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 32%, transparent);
  padding: 14px;
  display: grid;
  gap: 10px;
}

.registration-form label {
  display: grid;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}

.registration-form input {
  height: 40px;
  border: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 48%, transparent);
  border-radius: 10px;
  padding: 0 10px;
  font-size: 15px;
  background: var(--tg-theme-bg-color, #fff);
  color: var(--tg-theme-text-color, #11253b);
}

.registration-form input:focus-visible {
  outline: 2px solid var(--tg-theme-link-color, #2f72ac);
  outline-offset: 1px;
}

.registration-form__fallback {
  border: 0;
  border-radius: 12px;
  padding: 12px;
  font-weight: 700;
  background: var(--tg-theme-button-color, #123f6a);
  color: var(--tg-theme-button-text-color, #fff);
  display: none;
}

.registration-form__fallback:disabled {
  opacity: 0.6;
}

.registration-form__message {
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 12%, var(--tg-theme-bg-color, #fff));
  color: var(--tg-theme-text-color, #1f4061);
  font-size: 14px;
}

@media (min-width: 720px) {
  .app-shell {
    max-width: 740px;
    margin: 0 auto;
  }
}

@media (hover: none) and (pointer: coarse) {
  .registration-form__fallback {
    display: none;
  }
}

:global(body:not(.is-telegram)) .registration-form__fallback {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
</style>
