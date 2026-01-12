import React, { useState } from 'react';

const Contact = () => {
    // STATE: Form data and submission status
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState(''); // '', 'submitting', 'success', 'error'

    // ACTION: Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ACTION: Handle form submission via Formspree
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        // TODO: REPLACE 'YOUR_FORM_ID' WITH THE USER'S ACTUAL FORMSPREE ID
        // The user can sign up at formspree.io to get this ID.
        // For now, I'll use a placeholder variable.
        const FORMSPREE_ID = 'xeeoyvyl';

        try {
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    _replyto: 'maxweb596@gmail.com' // Optional: sets reply-to field if supported
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="section" style={{ textAlign: 'center', marginBottom: '100px' }}>
            <p style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-md)' }}>03. What's Next?</p>
            <h2 style={{ fontSize: 'clamp(40px, 5vw, 60px)', color: 'var(--lightest-slate)', marginBottom: '20px' }}>Get In Touch</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 50px' }}>
                We are currently accepting new projects. If you have an idea in mind or want to collaborate, we'd love to hear from you!
            </p>

            {status === 'success' ? (
                <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(100, 255, 218, 0.1)',
                    color: 'var(--green)',
                    borderRadius: 'var(--border-radius)',
                    maxWidth: '500px',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0 0 20px 0' }}>Thanks for your message! We'll get back to you soon.</p>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={{
                            color: 'var(--green)',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--green)',
                            borderRadius: 'var(--border-radius)',
                            padding: '0.75rem 1rem',
                            fontSize: 'var(--fz-xs)',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: '1',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                        }}
                    >
                        Back to Top
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="name"
                            style={{ display: 'block', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-xs)', marginBottom: '10px' }}
                        >
                            Your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={status === 'submitting'}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'var(--light-navy)',
                                border: '1px solid var(--lightest-navy)',
                                borderRadius: 'var(--border-radius)',
                                color: 'var(--slate)',
                                marginBottom: '10px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="email"
                            style={{ display: 'block', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-xs)', marginBottom: '10px' }}
                        >
                            Your Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={status === 'submitting'}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'var(--light-navy)',
                                border: '1px solid var(--lightest-navy)',
                                borderRadius: 'var(--border-radius)',
                                color: 'var(--slate)',
                                marginBottom: '10px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label
                            htmlFor="message"
                            style={{ display: 'block', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-xs)', marginBottom: '10px' }}
                        >
                            Your Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            disabled={status === 'submitting'}
                            rows="5"
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'var(--light-navy)',
                                border: '1px solid var(--lightest-navy)',
                                borderRadius: 'var(--border-radius)',
                                color: 'var(--slate)',
                                resize: 'vertical'
                            }}
                        ></textarea>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            style={{
                                color: 'var(--green)',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--green)',
                                borderRadius: 'var(--border-radius)',
                                padding: '1.25rem 1.75rem',
                                fontSize: 'var(--fz-sm)',
                                fontFamily: 'var(--font-mono)',
                                lineHeight: '1',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                opacity: status === 'submitting' ? 0.7 : 1
                            }}
                        >
                            {status === 'submitting' ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                    {status === 'error' && (
                        <p style={{ color: 'tomato', marginTop: '20px', textAlign: 'center', fontSize: 'var(--fz-sm)' }}>
                            Oops! There was a problem submitting your form. Please try again or email us directly at <a href="mailto:maxweb596@gmail.com" style={{ color: 'var(--green)' }}>maxweb596@gmail.com</a>.
                        </p>
                    )}
                </form>
            )}
        </section>
    );
};

export default Contact;
