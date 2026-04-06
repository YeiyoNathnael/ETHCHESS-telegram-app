<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { mainButton, miniApp, themeParams, useSignal, viewport } from '@tma.js/sdk-vue';

type RegistrationType = 'individual' | 'team';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

type RegistrationForm = {
  fullName: string;
  subcity: string;
  phoneNumber: string;
  age: string;
};

const FORM_ENDPOINT = 'https://formspree.io/f/xgopdvog';
const logoSrc = `${import.meta.env.BASE_URL}ethchess-logo.png`;
const SUBMIT_TIMEOUT_MS = 15000;

const competitionOpen = ref(false);
const activeForm = ref<RegistrationType | null>(null);
const isDarkTheme = useSignal(themeParams.isDark);

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

let offMainButton: VoidFunction | null = null;

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
  syncMainButton(activeForm.value);
}

function openForm(type: RegistrationType): void {
  if (!competitionOpen.value) {
    competitionOpen.value = true;
  }
  const nextForm = activeForm.value === type ? null : type;
  activeForm.value = nextForm;
  queueMicrotask(() => syncMainButton(nextForm));
}

async function submitRegistration(type: RegistrationType): Promise<void> {
  if (!isFormValid(type) || submitStates[type] === 'submitting') {
    return;
  }

  submitStates[type] = 'submitting';
  submitMessages[type] = '';
  syncMainButton(type);

  const form = forms[type];
  const payload = new FormData();
  payload.set('registration_type', type);
  payload.set('full_name', form.fullName.trim());
  payload.set('subcity', form.subcity.trim());
  payload.set('phone_number', form.phoneNumber.trim());
  payload.set('age', form.age.trim());

  try {
    const response = await Promise.race<Response>([
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: payload,
      }),
      new Promise<Response>((_, reject) => {
        window.setTimeout(() => reject(new Error('timeout')), SUBMIT_TIMEOUT_MS);
      }),
    ]);

    if (!response.ok) {
      let formspreeError = '';
      try {
        const body = await response.json() as { errors?: { message?: string }[] };
        formspreeError = body.errors?.[0]?.message?.trim() || '';
      } catch {
        // no-op
      }
      throw new Error(formspreeError || `Form submission failed with status ${response.status}`);
    }

    submitStates[type] = 'success';
    submitMessages[type] = 'Registration submitted successfully.';
    resetForm(type);
  } catch (error) {
    submitStates[type] = 'error';
    submitMessages[type] = error instanceof Error && error.message
      ? error.message
      : 'Could not submit right now. Check your connection and try again.';
  } finally {
    syncMainButton(activeForm.value);
  }
}

function setMainButtonParams(params: {
  isVisible?: boolean;
  text?: string;
  isEnabled?: boolean;
  isLoaderVisible?: boolean;
}): void {
  mainButton.setParams.ifAvailable(params);
}

function syncMainButton(forcedType: RegistrationType | null = activeForm.value): void {
  if (!mainButton.isMounted()) {
    return;
  }

  const currentType = forcedType;
  if (!currentType) {
    setMainButtonParams({
      isVisible: false,
      isLoaderVisible: false,
    });
    return;
  }

  const isSubmitting = submitStates[currentType] === 'submitting';
  const isEnabled = isFormValid(currentType) && !isSubmitting;

  setMainButtonParams({
    isVisible: true,
    text: getMainButtonText(currentType),
    isEnabled,
    isLoaderVisible: isSubmitting,
  });
}

function onMainButtonPressed(): void {
  if (!activeForm.value) {
    return;
  }
  void submitRegistration(activeForm.value);
}

function getMessageClass(type: RegistrationType): string {
  return submitStates[type] === 'success'
    ? 'registration-form__message registration-form__message--success'
    : 'registration-form__message registration-form__message--error';
}

onMounted(() => {
  mainButton.mount.ifAvailable();
  const clickBinding = mainButton.onClick.ifAvailable(onMainButtonPressed);
  offMainButton = clickBinding.ok ? clickBinding.data : null;

  miniApp.setHeaderColor.ifAvailable('bg_color');
  miniApp.setBgColor.ifAvailable('bg_color');
  miniApp.setBottomBarColor.ifAvailable('secondary_bg_color');

  viewport.expand.ifAvailable();
  const requestFullscreen = viewport.requestFullscreen.ifAvailable();
  if (requestFullscreen.ok) {
    void requestFullscreen.data;
  }

  syncMainButton(activeForm.value);
});

onBeforeUnmount(() => {
  offMainButton?.();
  offMainButton = null;
  mainButton.offClick.ifAvailable(onMainButtonPressed);
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
    syncMainButton(activeForm.value);
  },
);

</script>

<template>
  <main class="app-shell" :class="{ 'app-shell--dark': isDarkTheme }">
    <section class="hero card">
      <div class="hero__topline">ETHCHESS CLUB</div>
      <div class="hero__row">
        <img class="hero__logo" :src="logoSrc" alt="ETHCHESS logo" />
        <div>
          <h1 class="hero__title">Welcome to ETHCHESS</h1>
          <p class="hero__subtitle">Register for the Under 20's Chess Competition</p>
        </div>
      </div>
    </section>

    <section class="entry-card card">
      <h2 class="entry-card__title">Register for the Under 20's Chess Competition</h2>
      <button class="entry-card__action-btn" type="button" @click="toggleCompetition">
        {{ competitionOpen ? 'Hide options' : 'Show options' }}
      </button>
    </section>

    <section v-if="competitionOpen" class="options">
      <article class="card option-card" :class="{ 'option-card--active': activeForm === 'individual' }">
        <div class="option-card__image">Individual Image Placeholder</div>
        <div class="option-card__header">
          <h2>{{ getFormTitle('individual') }}</h2>
          <button class="option-card__toggle" type="button" @click="openForm('individual')">
            {{ activeForm === 'individual' ? 'Close' : 'Open' }}
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
            <span>Full name/ሙሉ ስም፡</span>
            <input v-model="forms.individual.fullName" name="full_name" type="text" required />
          </label>

          <label>
            <span>Subcity/ክፍለ ከተማ የምትኖሩበት፡</span>
            <input v-model="forms.individual.subcity" name="subcity" type="text" required />
          </label>

          <label>
            <span>Phone Number/ስልክ ቁጥር፡</span>
            <input
              v-model="forms.individual.phoneNumber"
              name="phone_number"
              type="tel"
              inputmode="tel"
              required
            />
          </label>

          <label>
            <span>Age/እድሜ፡</span>
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
            {{ submitStates.individual === 'submitting' ? 'Submitting...' : 'Submit Individual Registration' }}
          </button>

          <p v-if="submitMessages.individual" :class="getMessageClass('individual')">
            {{ submitMessages.individual }}
          </p>
        </form>
      </article>

      <article class="card option-card" :class="{ 'option-card--active': activeForm === 'team' }">
        <div class="option-card__image option-card__image--team">Team Image Placeholder</div>
        <div class="option-card__header">
          <h2>{{ getFormTitle('team') }}</h2>
          <button class="option-card__toggle" type="button" @click="openForm('team')">
            {{ activeForm === 'team' ? 'Close' : 'Open' }}
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
            <span>Full name/ሙሉ ስም፡</span>
            <input v-model="forms.team.fullName" name="full_name" type="text" required />
          </label>

          <label>
            <span>Subcity/ክፍለ ከተማ የምትኖሩበት፡</span>
            <input v-model="forms.team.subcity" name="subcity" type="text" required />
          </label>

          <label>
            <span>Phone Number/ስልክ ቁጥር፡</span>
            <input
              v-model="forms.team.phoneNumber"
              name="phone_number"
              type="tel"
              inputmode="tel"
              required
            />
          </label>

          <label>
            <span>Age/እድሜ፡</span>
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
            {{ submitStates.team === 'submitting' ? 'Submitting...' : 'Submit Team Application' }}
          </button>

          <p v-if="submitMessages.team" :class="getMessageClass('team')">
            {{ submitMessages.team }}
          </p>
        </form>
      </article>
    </section>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: var(--tg-viewport-stable-height, 100dvh);
  padding:
    calc(18px + var(--tg-viewport-content-safe-area-inset-top, env(safe-area-inset-top, 0px)))
    calc(14px + var(--tg-viewport-content-safe-area-inset-right, env(safe-area-inset-right, 0px)))
    calc(24px + var(--tg-viewport-content-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))
    calc(14px + var(--tg-viewport-content-safe-area-inset-left, env(safe-area-inset-left, 0px)));
  background:
    radial-gradient(circle at 8% -12%, color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 20%, transparent) 0%, transparent 42%),
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--tg-theme-button-color, #5288c1) 15%, transparent) 0%, transparent 35%),
    var(--tg-theme-bg-color, #eef3fb);
  color: var(--tg-theme-text-color, #13253c);
  display: block;
}

.app-shell > * + * {
  margin-top: 14px;
}

.app-shell--dark {
  background:
    radial-gradient(circle at 8% -12%, color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 28%, transparent) 0%, transparent 42%),
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--tg-theme-button-color, #5288c1) 24%, transparent) 0%, transparent 36%),
    var(--tg-theme-bg-color, #111820);
}

.card {
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 30%, transparent);
  background: color-mix(in srgb, var(--tg-theme-section-bg-color, #fff) 90%, transparent);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 22%, transparent);
}

.hero {
  padding: 12px;
  display: block;
  height: auto;
}

.hero__topline {
  font-size: 11px;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--tg-theme-accent-text-color, var(--tg-theme-link-color, #6ab3f3));
}

.hero__row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.hero__logo {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 65%, transparent);
  object-fit: cover;
  display: block;
}

.hero__title {
  margin: 0;
  line-height: 1.05;
  font-size: clamp(24px, 7vw, 34px);
}

.hero__subtitle {
  margin: 4px 0 0;
  color: var(--tg-theme-subtitle-text-color, #4b627b);
  font-size: 13px;
}

.entry-card {
  padding: 12px;
  height: auto;
  min-height: 0;
}

.entry-card__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--tg-theme-text-color, #13253c);
}

.entry-card__action-btn {
  margin-top: 10px;
  border: 1px solid color-mix(in srgb, var(--tg-theme-button-color, #5288c1) 65%, black);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--tg-theme-button-color, #5288c1) 42%, black) 0%,
    color-mix(in srgb, var(--tg-theme-button-color, #5288c1) 70%, black) 100%
  );
  color: var(--tg-theme-button-text-color, #fff);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 6px 14px color-mix(in srgb, var(--tg-theme-button-color, #5288c1) 35%, black);
}

.options {
  display: block;
}

.options > * + * {
  margin-top: 14px;
}

.option-card {
  overflow: hidden;
  transition: transform 180ms ease, box-shadow 180ms ease;
  min-height: 0;
}

.option-card--active {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 24%, transparent);
}

.option-card__image {
  height: 74px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
  color: color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 55%, var(--tg-theme-text-color, #13253c));
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 30%, transparent) 0%,
      color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 10%, var(--tg-theme-secondary-bg-color, #f0f4fb)) 100%
    );
  border-bottom: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 32%, transparent);
}

.option-card__image--team {
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--tg-theme-accent-text-color, #6ab2f2) 26%, transparent) 0%,
      color-mix(in srgb, var(--tg-theme-accent-text-color, #6ab2f2) 12%, var(--tg-theme-secondary-bg-color, #f0f4fb)) 100%
    );
}

.option-card__header {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: auto;
}

.option-card__header h2 {
  margin: 0;
  font-size: 16px;
}

.option-card__toggle {
  border: 1px solid color-mix(in srgb, var(--tg-theme-link-color, #6ab3f3) 65%, transparent);
  background: var(--tg-theme-bg-color, #fff);
  color: var(--tg-theme-link-color, #2f72ac);
  font-size: 13px;
  font-weight: 700;
  border-radius: 999px;
  padding: 6px 10px;
}

.entry-card__action-btn:active,
.option-card__toggle:active {
  transform: translateY(1px);
}

.option-card--active .option-card__image {
  height: 108px;
}

.registration-form {
  border-top: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 28%, transparent);
  padding: 14px;
  display: grid;
  gap: 10px;
}

.registration-form label {
  display: grid;
  gap: 5px;
}

.registration-form label span {
  font-size: 13px;
  color: var(--tg-theme-subtitle-text-color, #4b627b);
}

.registration-form input {
  height: 41px;
  border: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 45%, transparent);
  border-radius: 11px;
  padding: 0 11px;
  font-size: 15px;
  background: var(--tg-theme-bg-color, #fff);
  color: var(--tg-theme-text-color, #13253c);
}

.registration-form input:focus-visible {
  outline: 2px solid var(--tg-theme-link-color, #2f72ac);
  outline-offset: 1px;
}

.registration-form__fallback {
  border: 0;
  border-radius: 12px;
  padding: 11px;
  font-weight: 700;
  background: var(--tg-theme-button-color, #123f6a);
  color: var(--tg-theme-button-text-color, #fff);
  display: none;
}

.registration-form__fallback:disabled {
  opacity: 0.6;
}

.registration-form__message {
  margin: 2px 0 0;
  border-radius: 12px;
  padding: 10px;
  font-size: 13px;
}

.registration-form__message--success {
  background: color-mix(in srgb, #1dbf73 16%, var(--tg-theme-bg-color, #fff));
  color: color-mix(in srgb, #1dbf73 68%, var(--tg-theme-text-color, #13253c));
}

.registration-form__message--error {
  background: color-mix(in srgb, var(--tg-theme-destructive-text-color, #ec3942) 14%, var(--tg-theme-bg-color, #fff));
  color: var(--tg-theme-destructive-text-color, #c9373f);
}

@media (min-width: 720px) {
  .app-shell {
    max-width: 760px;
    margin: 0 auto;
    padding-left: 20px;
    padding-right: 20px;
  }
}

</style>
