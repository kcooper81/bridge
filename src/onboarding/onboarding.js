// TeamPrompt Onboarding Script

import { markOnboardingComplete } from '../lib/storage.js';
import { initTheme } from '../lib/theme.js';

initTheme();

const steps = document.querySelectorAll('.step');
const dots = document.querySelectorAll('.dot');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const btnDone = document.getElementById('btn-done');

let currentStep = 0;
const totalSteps = steps.length;

function goToStep(index) {
  if (index < 0 || index >= totalSteps) return;

  steps.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  steps[index].classList.add('active');
  dots[index].classList.add('active');

  currentStep = index;

  // Update button visibility
  btnBack.classList.toggle('hidden', currentStep === 0);
  btnNext.classList.toggle('hidden', currentStep === totalSteps - 1);
  btnDone.classList.toggle('hidden', currentStep !== totalSteps - 1);
}

btnNext.addEventListener('click', () => goToStep(currentStep + 1));
btnBack.addEventListener('click', () => goToStep(currentStep - 1));

btnDone.addEventListener('click', async () => {
  await markOnboardingComplete();
  try {
    window.close();
  } catch (_) { /* no-op */ }
  // Fallback: if window.close() doesn't work (e.g. not opened by script)
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:var(--text-secondary);font-size:16px;">Setup complete! You can close this tab.</div>';
});

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const step = parseInt(dot.dataset.dot, 10);
    goToStep(step);
  });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  // Ignore Enter if a button already has focus (the button's native click handles it)
  if (e.key === 'Enter' && e.target.tagName === 'BUTTON') return;

  if (e.key === 'ArrowRight' || e.key === 'Enter') {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    } else {
      btnDone.click();
    }
  }
  if (e.key === 'ArrowLeft') {
    goToStep(currentStep - 1);
  }
});
