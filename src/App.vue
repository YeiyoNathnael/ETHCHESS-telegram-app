<script setup lang="ts">
import { onMounted } from 'vue';
import { miniApp, viewport } from '@tma.js/sdk-vue';

onMounted(() => {
  miniApp.setHeaderColor.ifAvailable('bg_color');
  miniApp.setBgColor.ifAvailable('bg_color');
  miniApp.setBottomBarColor.ifAvailable('secondary_bg_color');

  viewport.expand.ifAvailable();
  const requestFullscreen = viewport.requestFullscreen.ifAvailable();
  if (requestFullscreen.ok) {
    void requestFullscreen.data;
  }

  miniApp.ready.ifAvailable();
});
</script>

<template>
  <RouterView />
</template>

<style>
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

.card {
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 30%, transparent);
  background: color-mix(in srgb, var(--tg-theme-section-bg-color, #fff) 90%, transparent);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 22%, transparent);
}

.hero {
  padding: 12px;
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

.primary-btn,
.link-btn,
.submit-btn {
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
  text-decoration: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.link-btn {
  margin-top: 10px;
}

.options {
  display: block;
}

.options > * + * {
  margin-top: 14px;
}

.option-card {
  overflow: hidden;
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

.option-card__body {
  padding: 12px;
}

.option-card__title {
  margin: 0;
  font-size: 18px;
}

.form-card {
  padding: 12px;
}

.form-grid {
  display: grid;
  gap: 10px;
}

.form-grid label {
  display: grid;
  gap: 5px;
}

.form-grid label span {
  font-size: 13px;
  color: var(--tg-theme-subtitle-text-color, #4b627b);
}

.form-grid input {
  height: 41px;
  border: 1px solid color-mix(in srgb, var(--tg-theme-hint-color, #8ea0b5) 45%, transparent);
  border-radius: 11px;
  padding: 0 11px;
  font-size: 15px;
  background: var(--tg-theme-bg-color, #fff);
  color: var(--tg-theme-text-color, #13253c);
}

.form-grid input:focus-visible {
  outline: 2px solid var(--tg-theme-link-color, #2f72ac);
  outline-offset: 1px;
}

.form-note {
  margin: 10px 0 0;
  border-radius: 12px;
  padding: 10px;
  font-size: 13px;
}

.form-note--success {
  background: color-mix(in srgb, #1dbf73 16%, var(--tg-theme-bg-color, #fff));
  color: color-mix(in srgb, #1dbf73 68%, var(--tg-theme-text-color, #13253c));
}

.form-note--error {
  background: color-mix(in srgb, var(--tg-theme-destructive-text-color, #ec3942) 14%, var(--tg-theme-bg-color, #fff));
  color: var(--tg-theme-destructive-text-color, #c9373f);
}

.inline-link {
  color: var(--tg-theme-link-color, #2f72ac);
  font-weight: 700;
  text-decoration: none;
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
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
