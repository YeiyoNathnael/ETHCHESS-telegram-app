<script setup lang="ts">
const logoSrc = `${import.meta.env.BASE_URL}ethchess-logo.png`;
</script>

<template>
  <main class="app-shell">
    <section class="hero card">
      <div class="hero__topline">ETHCHESS CLUB</div>
      <div class="hero__row">
        <img class="hero__logo" :src="logoSrc" alt="ETHCHESS logo" />
        <div>
          <h1 class="hero__title">Welcome to ETHCHESS</h1>
          <p class="hero__subtitle">The Future of Chess in Addis Ababa</p>
        </div>
      </div>
    </section>

    <section class="card form-card">
      <h2 class="option-card__title">Register for the Under 20's Chess Competition</h2>
      <RouterLink class="link-btn" :to="{ name: 'competition' }">Open options</RouterLink>
    </section>
  </main>
</template>
