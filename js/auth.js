(function () {
  'use strict';

  const SUPABASE_URL = 'https://qyuczfpgydgqywgthgrz.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_2NLEuDREplLS9DgUXeA8Tw_f8MJOhCq';
  const trigger = document.getElementById('loginBtn');
  const overlay = document.getElementById('loginModal');
  if (!trigger || !overlay) return;

  const close = document.getElementById('closeModal');
  const form = document.getElementById('loginForm');
  const email = document.getElementById('loginEmail');
  const password = document.getElementById('loginPassword');
  const submit = document.getElementById('authSubmitBtn');
  const message = document.getElementById('authMessage');
  const title = document.getElementById('modalTitle');
  const sub = document.getElementById('modalSub');
  const toggle = document.getElementById('toggleAuthMode');
  const toggleText = document.getElementById('toggleText');
  const forgot = document.getElementById('forgotPassword');
  const avatar = document.getElementById('userAvatar');
  const buttonText = document.getElementById('loginBtnText');
  let signUpMode = false;
  let currentUser = null;
  let client = null;

  function showMessage(text, type) {
    message.textContent = text;
    message.className = 'auth-message ' + (type || 'error');
  }
  function clearMessage() {
    message.textContent = '';
    message.className = 'auth-message';
  }
  function updateUser(user) {
    currentUser = user || null;
    if (currentUser) {
      const name = (currentUser.email || 'Warden').split('@')[0];
      trigger.classList.add('logged-in');
      trigger.title = 'Click to sign out';
      buttonText.textContent = name;
      avatar.textContent = name.charAt(0).toUpperCase();
    } else {
      trigger.classList.remove('logged-in');
      trigger.title = 'Sign in or create an account';
      buttonText.textContent = 'Login';
      avatar.textContent = '✦';
    }
  }
  function openModal() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    clearMessage();
    window.setTimeout(function () { email.focus(); }, 50);
  }
  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    clearMessage();
  }
  function setMode(isSignUp) {
    signUpMode = isSignUp;
    title.textContent = signUpMode ? 'Create your field pass' : 'Sign in to the field guide';
    sub.textContent = signUpMode ? 'Join the FED-13 warden community' : 'Continue your expedition';
    submit.textContent = signUpMode ? 'Create Account' : 'Sign In';
    toggleText.textContent = signUpMode ? 'Already have an account?' : 'New here?';
    toggle.textContent = signUpMode ? 'Sign In' : 'Sign Up';
    clearMessage();
  }

  trigger.addEventListener('click', function () {
    if (currentUser) {
      if (window.confirm('Sign out of the field guide?')) client.auth.signOut();
    } else openModal();
  });
  close.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (event) { if (event.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && overlay.classList.contains('active')) closeModal(); });
  toggle.addEventListener('click', function () { setMode(!signUpMode); form.reset(); });
  forgot.addEventListener('click', async function (event) {
    event.preventDefault();
    const address = email.value.trim();
    if (!address) { showMessage('Enter your email first, warden.', 'error'); email.focus(); return; }
    try {
      const result = await client.auth.resetPasswordForEmail(address, { redirectTo: window.location.href.split('#')[0] });
      if (result.error) throw result.error;
      showMessage('Reset instructions are on their way.', 'info');
    } catch (error) { showMessage(error.message || 'Could not send reset instructions.', 'error'); }
  });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const address = email.value.trim();
    const secret = password.value;
    if (!address || !secret) { showMessage('Fill in both fields to continue.', 'error'); return; }
    submit.disabled = true;
    submit.textContent = signUpMode ? 'Creating...' : 'Signing in...';
    clearMessage();
    try {
      const result = signUpMode
        ? await client.auth.signUp({ email: address, password: secret, options: { emailRedirectTo: window.location.href.split('#')[0] } })
        : await client.auth.signInWithPassword({ email: address, password: secret });
      if (result.error) throw result.error;
      if (signUpMode && !result.data.session) showMessage('Check your inbox to confirm your account.', 'info');
      else { updateUser(result.data.user); showMessage('Welcome back to the wilds.', 'success'); window.setTimeout(closeModal, 800); }
    } catch (error) {
      let text = error.message || 'Authentication failed.';
      if (text.includes('Invalid login credentials')) text = 'Invalid email or password.';
      if (text.includes('Email not confirmed')) text = 'Confirm your email before signing in.';
      if (text.includes('User already registered')) text = 'That email is already registered. Try signing in.';
      showMessage(text, 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = signUpMode ? 'Create Account' : 'Sign In';
    }
  });

  if (!window.supabase || !window.supabase.createClient) {
    trigger.addEventListener('click', function () { if (!currentUser) showMessage('Login service is unavailable right now.', 'error'); });
    return;
  }
  client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  client.auth.onAuthStateChange(function (event, session) {
    if (event === 'SIGNED_OUT') updateUser(null);
    else if (session && session.user) updateUser(session.user);
  });
  client.auth.getSession().then(function (result) { if (result.data && result.data.session) updateUser(result.data.session.user); });
})();
