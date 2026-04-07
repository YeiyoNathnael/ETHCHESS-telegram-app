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
          <RouterLink class="link-btn" :to="{ name: 'register', params: { type: 'individual' } }">
            Open Individual Form
          </RouterLink>
        </div>
      </article>

      <article class="card option-card">
        <div class="option-card__image option-card__image--team">Team Image Placeholder</div>
        <div class="option-card__body">
          <h2 class="option-card__title">Team Application</h2>
          <RouterLink class="link-btn" :to="{ name: 'register', params: { type: 'team' } }">
            Open Team Form
          </RouterLink>
        </div>
      </article>
    </section>
  </main>
</template>
