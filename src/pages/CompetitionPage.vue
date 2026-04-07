<script setup lang="ts">
import { onMounted, ref } from 'vue';

const individualSubmitted = ref(false);
const teamSubmitted = ref(false);

onMounted(() => {
  individualSubmitted.value = localStorage.getItem('ethchess_submitted_individual') === '1';
  teamSubmitted.value = localStorage.getItem('ethchess_submitted_team') === '1';
});
</script>

<template>
  <main class="app-shell">
    <section class="card form-card">
      <RouterLink class="inline-link" :to="{ name: 'home' }">Back</RouterLink>
      <h1 class="hero__title" style="margin-top: 8px;">Choose Registration Type</h1>
      <p class="hero__subtitle">Select one of the options below.</p>
    </section>

    <section class="options">
      <article class="card option-card">
        <div class="option-card__image">Individual Image Placeholder</div>
        <div class="option-card__body">
          <h2 class="option-card__title">Individual Registration</h2>
          <RouterLink
            v-if="!individualSubmitted"
            class="link-btn"
            :to="{ name: 'register', params: { type: 'individual' } }"
          >
            Open Individual Form
          </RouterLink>
          <button v-else class="submit-btn" type="button" disabled>Already submitted</button>
        </div>
      </article>

      <article class="card option-card">
        <div class="option-card__image option-card__image--team">Team Image Placeholder</div>
        <div class="option-card__body">
          <h2 class="option-card__title">Team Application</h2>
          <RouterLink
            v-if="!teamSubmitted"
            class="link-btn"
            :to="{ name: 'register', params: { type: 'team' } }"
          >
            Open Team Form
          </RouterLink>
          <button v-else class="submit-btn" type="button" disabled>Already submitted</button>
        </div>
      </article>
    </section>
  </main>
</template>
