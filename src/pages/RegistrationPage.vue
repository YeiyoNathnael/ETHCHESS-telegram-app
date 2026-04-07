<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { isSubmissionLocked, setSubmissionLocked } from '@/utils/submissionLock';

const props = defineProps<{ type: 'individual' | 'team' }>();

const submitted = ref(false);
const submitting = ref(false);
const error = ref('');

const endpoint = computed(() => {
  return props.type === 'team'
    ? 'https://formspree.io/f/mvzvlzzy'
    : 'https://formspree.io/f/xgopdvog';
});

const title = computed(() => {
  return props.type === 'team' ? 'Team Application' : 'Individual Registration';
});

const submitLabel = computed(() => {
  return props.type === 'team' ? 'Submit Team Application' : 'Submit Individual Registration';
});

const buttonLabel = computed(() => {
  if (submitted.value) {
    return 'Already submitted';
  }
  if (submitting.value) {
    return 'Submitting...';
  }
  return submitLabel.value;
});

watch(() => props.type, () => {
  submitted.value = isSubmissionLocked(props.type);
  error.value = '';
}, { immediate: true });

watch(submitting, (isNowSubmitting) => {
  if (isNowSubmitting) {
    error.value = '';
  }
});

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  if (submitted.value || submitting.value) {
    return;
  }

  const form = event.currentTarget as HTMLFormElement | null;
  if (!form) {
    return;
  }

  submitting.value = true;
  error.value = '';

  try {
    const response = await fetch(endpoint.value, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: new FormData(form),
    });

    if (!response.ok) {
      throw new Error('Submission failed. Please try again.');
    }

    error.value = '';
    submitted.value = true;
    setSubmissionLocked(props.type);
  } catch {
    error.value = 'Could not submit right now. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="app-shell">
    <section class="card form-card">
      <RouterLink class="inline-link" :to="{ name: 'competition' }">Back to options</RouterLink>
      <h1 class="hero__title" style="margin-top: 8px;">{{ title }}</h1>
      <p class="hero__subtitle">Complete the form below.</p>
    </section>

    <section class="card form-card">
      <form
        class="form-grid"
        :action="endpoint"
        method="POST"
        @submit="handleSubmit"
      >
        <input type="hidden" name="registration_type" :value="type" />

        <label>
          <span>Full name/ሙሉ ስም፡</span>
          <input name="full_name" type="text" required :disabled="submitted || submitting" />
        </label>

        <label>
          <span>Subcity/ክፍለ ከተማ የምትኖሩበት፡</span>
          <input name="subcity" type="text" required :disabled="submitted || submitting" />
        </label>

        <label>
          <span>Phone Number/ስልክ ቁጥር፡</span>
          <input name="phone_number" type="tel" inputmode="tel" required :disabled="submitted || submitting" />
        </label>

        <label>
          <span>Age/እድሜ፡</span>
          <input name="age" type="number" min="1" inputmode="numeric" required :disabled="submitted || submitting" />
        </label>

        <button class="submit-btn" type="submit" :disabled="submitted || submitting">
          {{ buttonLabel }}
        </button>
      </form>

      <p v-if="error" class="form-note form-note--error">{{ error }}</p>
    </section>

  </main>
</template>
