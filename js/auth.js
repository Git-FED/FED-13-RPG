(function () {
  'use strict';

  const SUPABASE_URL = 'https://qyuczfpgydgqywgthgrz.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_2NLEuDREplLS9DgUXeA8Tw_f8MJOhCq';

  const trigger = document.getElementById('joinEmailBtn');
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
  const loginView = document.getElementById('loginView');
  const loggedInView = document.getElementById('loggedInView');
  const loggedInAvatar = document.getElementById('loggedInAvatar');
  const loggedInName = document.getElementById('loggedInName');
  const loggedInEmail = document.getElementById('loggedInEmail');
  const logoutBtn = document.getElementById('logoutBtn');
  const buttonText = document.getElementById('joinEmailBtnText');
  const avatar = document.getElementById('userAvatar');
  const widgetInput = document.getElementById('emailWidgetInput');
  const statusDot = document.getElementById('emailStatusDot');
  let signUpMode = true;
  let currentUser = null;
  let client = null;

  const typePhrases = [
    'Type your email here…',
    'Join our newsletter…',
    'Get early access…',
    'Stay in the loop…'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let typingTimer = null;
  let typingActive = false;

  function showMessage(text, type) {
    message.textContent = text;
    message.className = 'auth-message ' + (type || 'error');
  }

  function clearMessage() {
    message.textContent = '';
    message.className = 'auth-message';
  }

  function runTypingStep() {
    if (!typingActive || !widgetInput) return;
    const phrase = typePhrases[phraseIndex];
    if (!deleting) {
      charIndex += 1;
      widgetInput.placeholder = phrase.slice(0, charIndex) + '|';
      if (charIndex >= phrase.length) {
        deleting = true;
        typingTimer = window.setTimeout(runTypingStep, 1600);
      } else {
        typingTimer = window.setTimeout(runTypingStep, 65);
      }
    } else {
      charIndex -= 1;
      widgetInput.placeholder = phrase.slice(0, charIndex) + '|';
      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % typePhrases.length;
        typingTimer = window.setTimeout(runTypingStep, 350);
      } else {
        typingTimer = window.setTimeout(runTypingStep, 30);
      }
    }
  }

  function startTyping() {
    if (typingActive || !widgetInput) return;
    typingActive = true;
    phraseIndex = 0;
    charIndex = 0;
    deleting = false;
    runTypingStep();
  }

  function stopTyping() {
    typingActive = false;
    if (typingTimer) window.clearTimeout(typingTimer);
    typingTimer = null;
  }

  function updateUser(user) {
    currentUser = user || null;
    if (currentUser) {
      stopTyping();
      const name = (currentUser.email || 'Warden').split('@')[0];
      trigger.classList.add('logged-in');
      trigger.title = 'View your email-list account';
      buttonText.textContent = 'Signed in';
      avatar.textContent = name.charAt(0).toUpperCase();
      widgetInput.placeholder = 'View your account…';
      statusDot.classList.add('online');
    } else {
      trigger.classList.remove('logged-in');
      trigger.title = 'Join the FEDPromptly email list';
      buttonText.textContent = 'Join now';
      avatar.textContent = '✦';
      statusDot.classList.remove('online');
      startTyping();
    }
  }

  function showLoggedInView(user) {
    loginView.hidden = true;
    loggedInView.hidden = false;
    const name = (user.email || 'Warden').split('@')[0];
    loggedInAvatar.textContent = name.charAt(0).toUpperCase();
    loggedInName.textContent = name;
    loggedInEmail.textContent = user.email || '';
  }

  function showLoginView() {
    loginView.hidden = false;
    loggedInView.hidden = true;
  }

  function setMode(isSignUp) {
    signUpMode = isSignUp;
    title.textContent = signUpMode ? 'Join Email List' : 'Sign In';
    sub.textContent = signUpMode ? 'Stay updated with FEDPromptly' : 'Enter your credentials to continue';
    submit.textContent = signUpMode ? 'Join Email List' : 'Sign In';
    toggleText.textContent = signUpMode ? 'Already joined?' : 'New here?';
    toggle.textContent = signUpMode ? 'Sign In' : 'Join Email List';
    password.autocomplete = signUpMode ? 'new-password' : 'current-password';
    clearMessage();
  }

  function openModal() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    clearMessage();
    if (currentUser) showLoggedInView(currentUser);
    else {
      showLoginView();
      setMode(true);
      form.reset();
      window.setTimeout(function () { email.focus(); }, 50);
    }
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    clearMessage();
  }

  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal();
    }
  });
  close.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (event) { if (event.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && overlay.classList.contains('active')) closeModal(); });
  toggle.addEventListener('click', function () { setMode(!signUpMode); form.reset(); });

  forgot.addEventListener('click', async function (event) {
    event.preventDefault();
    const address = email.value.trim();
    if (!address) { showMessage('Please enter your email address first.', 'error'); email.focus(); return; }
    if (!client) { showMessage('The email service is unavailable right now.', 'error'); return; }
    try {
      const result = await client.auth.resetPasswordForEmail(address, { redirectTo: window.location.href.split('#')[0] });
      if (result.error) throw result.error;
      showMessage('Password reset instructions are on their way.', 'info');
    } catch (error) { showMessage(error.message || 'Could not send password reset instructions.', 'error'); }
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const address = email.value.trim();
    const secret = password.value;
    if (!address || !secret) { showMessage('Please fill in all fields.', 'error'); return; }
    if (!client) { showMessage('The email service is unavailable right now.', 'error'); return; }
    submit.disabled = true;
    submit.textContent = signUpMode ? 'Joining…' : 'Signing in…';
    clearMessage();
    try {
      const result = signUpMode
        ? await client.auth.signUp({ email: address, password: secret, options: { emailRedirectTo: window.location.href.split('#')[0] } })
        : await client.auth.signInWithPassword({ email: address, password: secret });
      if (result.error) throw result.error;
      if (signUpMode && result.data.user && result.data.user.identities && result.data.user.identities.length === 0) {
        showMessage('This email is already registered. Please sign in.', 'error');
      } else if (signUpMode && !result.data.session) {
        showMessage('Please check your email to confirm your subscription.', 'info');
      } else {
        updateUser(result.data.user);
        showMessage('Welcome to the FEDPromptly email list.', 'success');
        window.setTimeout(function () { showLoggedInView(result.data.user); }, 700);
      }
    } catch (error) {
      let text = error.message || 'Authentication failed.';
      if (text.includes('Invalid login credentials')) text = 'Invalid email or password.';
      if (text.includes('Email not confirmed')) text = 'Please verify your email address first.';
      if (text.includes('User already registered')) text = 'This email is already registered. Please sign in.';
      showMessage(text, 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = signUpMode ? 'Join Email List' : 'Sign In';
    }
  });

  logoutBtn.addEventListener('click', async function () {
    if (client) await client.auth.signOut();
    updateUser(null);
    showLoginView();
    setMode(false);
    form.reset();
  });

  if (!window.supabase || !window.supabase.createClient) {
    updateUser(null);
    return;
  }

  client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  client.auth.onAuthStateChange(function (event, session) {
    if (event === 'SIGNED_OUT') {
      updateUser(null);
      showLoginView();
    } else if (session && session.user) {
      updateUser(session.user);
    }
  });
  client.auth.getSession().then(function (result) {
    updateUser(result.data && result.data.session ? result.data.session.user : null);
  });
})();
