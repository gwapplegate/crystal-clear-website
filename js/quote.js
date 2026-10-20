/* Estimate request form — submits via Web3Forms, falls back to a prefilled email until an access key is set */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quote-form');
  if (!form) return;

  const BUSINESS_EMAIL = 'scrystalclear@aol.com';
  const ENDPOINT = 'https://api.web3forms.com/submit';
  const successBox = document.getElementById('quote-success');
  const errorBox = document.getElementById('form-error');
  const servicesErr = document.getElementById('err-services');
  const submitBtn = document.getElementById('quote-submit');

  const val = (name) => (form.elements[name] && form.elements[name].value || '').trim();

  const showError = (msg) => {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  };

  const showSuccess = () => {
    if (typeof fbq === 'function') fbq('track', 'Lead');
    form.hidden = true;
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const services = Array.from(form.querySelectorAll('input[name="services[]"]:checked')).map((c) => c.value);
    servicesErr.hidden = services.length > 0;

    const missing = ['name', 'phone', 'email', 'street', 'city', 'zip'].filter((n) => !val(n));
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'));
    if (services.length === 0 || missing.length || !emailOk) {
      if (missing.length) form.elements[missing[0]].focus();
      else if (!emailOk) form.elements.email.focus();
      showError(!emailOk && !missing.includes('email')
        ? 'Please enter a valid email address.'
        : 'Please fill in the required fields and choose at least one service.');
      return;
    }

    if (val('botcheck')) return; // honeypot tripped

    const address = `${val('street')}, ${val('city')}, ${val('state') || 'NC'} ${val('zip')}`;
    const details = {
      'Services requested': services.join(', '),
      'Service address': address,
      'Name': val('name'),
      'Phone': val('phone'),
      'Email': val('email'),
      'Best way to reach': val('contact_method'),
      'Notes': val('message') || '—',
    };

    const accessKey = val('access_key');

    /* No access key configured yet: open a prefilled email instead of failing silently */
    if (!accessKey || accessKey.startsWith('YOUR_')) {
      const body = Object.entries(details).map(([k, v]) => `${k}: ${v}`).join('\n');
      window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent('Estimate Request — ' + val('name'))}&body=${encodeURIComponent(body)}`;
      showSuccess();
      return;
    }

    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: val('subject') || 'New Estimate Request',
          from_name: val('from_name') || 'Crystal Clear Website',
          replyto: val('email'),
          name: val('name'),
          email: val('email'),
          phone: val('phone'),
          ...details,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
      showSuccess();
    } catch (err) {
      showError('Sorry, something went wrong sending your request. Please call or text (336) 595-2873 or email ' + BUSINESS_EMAIL + '.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});
