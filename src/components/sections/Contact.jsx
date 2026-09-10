import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import SplitText from '../motion/SplitText';
import Reveal from '../motion/Reveal';
import Magnetic from '../motion/Magnetic';

const ENDPOINT = 'https://formspree.io/f/xeeoyvyl';
const EMAIL = 'maxweb596@gmail.com';

// Deliberately loose: catches typos and pasted junk without rejecting valid addresses.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const EMPTY = { name: '', email: '', message: '' };

const DETAILS = [
  { label: 'Availability', value: 'Taking on work for Q2 2026' },
  { label: 'Location', value: 'Silchar, India — working worldwide' },
  { label: 'Response', value: 'Within two working days' },
];

export default function Contact() {
  const rootRef = useRef(null);
  const driftRef = useRef(null);
  const arrowRef = useRef(null);

  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      // The statement drifts against the page as the block passes through.
      if (driftRef.current) {
        gsap.fromTo(
          driftRef.current,
          { yPercent: 7 },
          {
            yPercent: -7,
            ease: 'none',
            scrollTrigger: {
              trigger: driftRef.current.closest('.next'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          }
        );
      }

      if (arrowRef.current) {
        gsap.to(arrowRef.current, {
          y: 7,
          duration: 0.9,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  // Swapping the form for the confirmation changes the page height, and the
  // focused submit button has just been unmounted — move focus somewhere real.
  useEffect(() => {
    if (status !== 'success') return undefined;
    rootRef.current
      ?.querySelector('.contact__done')
      ?.focus({ preventScroll: true });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 260);
    return () => window.clearTimeout(id);
  }, [status]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (status === 'submitting') return;

      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      };

      if (!payload.name || !payload.message) {
        setStatus('error');
        setError('Please add your name and a short note about the project.');
        return;
      }

      if (!EMAIL_SHAPE.test(payload.email)) {
        setStatus('error');
        setError('That email address looks incomplete — check it and try again.');
        return;
      }

      setStatus('submitting');
      setError('');

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setValues(EMPTY);
          setStatus('success');
        } else {
          setStatus('error');
          setError('The message did not go through.');
        }
      } catch {
        setStatus('error');
        setError('The message could not be sent — you may be offline.');
      }
    },
    [status, values]
  );

  const submitting = status === 'submitting';

  return (
    <div ref={rootRef}>
      {/* ---------- beat 1 — the transitional statement ---------- */}
      <section className="next" aria-labelledby="next-title">
        <div className="next__inner u-shell">
          <p className="u-micro next__kicker">One Last Thing</p>

          <h2 className="next__title" id="next-title" ref={driftRef}>
            <SplitText as="span" className="next__line" start="top 90%">
              TELL US
            </SplitText>
            <SplitText as="span" className="next__line" start="top 90%" delay={0.09}>
              {"WHAT'S NEXT."}
            </SplitText>
          </h2>

          <p className="u-micro next__prompt">
            Continue Scrolling{' '}
            <span className="next__arrow" ref={arrowRef} aria-hidden="true">
              ↓
            </span>
          </p>
        </div>
      </section>

      {/* ---------- beat 2 — the contact block ---------- */}
      <section id="contact" className="section contact">
        <div className="u-shell">
          <header className="section-head">
            <SplitText as="h2" className="u-display">
              GET IN TOUCH
            </SplitText>
            <p className="u-micro">03 / Contact</p>
          </header>

          <div className="contact__lead">
            <p className="u-micro">Have a project in mind?</p>
            <p className="contact__statement">
              <SplitText as="span" className="contact__statement-line">
                {"Let's build something worth"}
              </SplitText>
              <SplitText as="span" className="contact__statement-line" delay={0.07}>
                coming back to.
              </SplitText>
            </p>
          </div>

          <div className="contact__grid">
            {/* ---- left: the form ---- */}
            <div className="contact__col contact__col--form">
              <p className="u-micro contact__col-label">Send a brief</p>

              {status === 'success' ? (
                <Reveal
                  className="contact__done"
                  start="top bottom"
                  role="status"
                  aria-live="polite"
                  tabIndex={-1}
                >
                  <p className="contact__done-title">THANK YOU.</p>
                  <p className="contact__done-copy">
                    Your message is in. We reply to everything within two working days —
                    usually sooner.
                  </p>
                  <a className="contact__done-link u-micro" href="#top">
                    Back to top
                  </a>
                </Reveal>
              ) : (
                <form
                  className="contact__form"
                  onSubmit={handleSubmit}
                  noValidate
                  aria-describedby={status === 'error' ? 'contact-error' : undefined}
                >
                  <div className="field">
                    <label className="u-micro field__label" htmlFor="contact-name">
                      Your name
                    </label>
                    <input
                      className="field__input"
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={handleChange}
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="field">
                    <label className="u-micro field__label" htmlFor="contact-email">
                      Email
                    </label>
                    <input
                      className="field__input"
                      id="contact-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="field">
                    <label className="u-micro field__label" htmlFor="contact-message">
                      What are you building?
                    </label>
                    <textarea
                      className="field__input field__input--area"
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={values.message}
                      onChange={handleChange}
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="contact__actions">
                    <Magnetic strength={0.28}>
                      <button
                        className="contact__submit"
                        type="submit"
                        disabled={submitting}
                      >
                        <span>{submitting ? 'Sending…' : 'Send message'}</span>
                      </button>
                    </Magnetic>
                  </div>

                  <div
                    className="contact__status"
                    id="contact-error"
                    role="status"
                    aria-live="polite"
                  >
                    {status === 'error' ? (
                      <p className="contact__error">
                        {error} Email us directly at{' '}
                        <a className="contact__error-link" href={`mailto:${EMAIL}`}>
                          {EMAIL}
                        </a>
                        .
                      </p>
                    ) : null}
                  </div>
                </form>
              )}
            </div>

            {/* ---- right: the direct details ---- */}
            <aside className="contact__col contact__col--details">
              <p className="u-micro contact__col-label">Direct</p>

              <Reveal as="dl" className="contact__details" selector=".detail" stagger={0.07}>
                <div className="detail">
                  <dt className="u-micro detail__label">Email</dt>
                  <dd className="detail__value">
                    <a
                      className="swap"
                      href={`mailto:${EMAIL}`}
                      aria-label={`Email ${EMAIL}`}
                    >
                      <span className="swap__stack">
                        <span className="swap__line">{EMAIL}</span>
                        <span className="swap__line" aria-hidden="true">
                          {EMAIL}
                        </span>
                      </span>
                    </a>
                  </dd>
                </div>

                {DETAILS.map((row) => (
                  <div className="detail" key={row.label}>
                    <dt className="u-micro detail__label">{row.label}</dt>
                    <dd className="detail__value">{row.value}</dd>
                  </div>
                ))}
              </Reveal>

              <div className="contact__cta">
                <p className="u-micro">Start a conversation</p>
                <Magnetic strength={0.22}>
                  <a
                    className="contact__cta-link"
                    href={`mailto:${EMAIL}`}
                    aria-label={`Start a conversation — email ${EMAIL}`}
                  >
                    {EMAIL}
                  </a>
                </Magnetic>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
