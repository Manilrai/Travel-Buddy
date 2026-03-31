/**
 * About & Contact Page
 * Combined About Us section + Contact form with front-end validation
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    HiUsers,
    HiCurrencyDollar,
    HiChat,
    HiTruck,
    HiShieldCheck,
    HiHeart,
    HiUserGroup,
    HiMail,
    HiPhone,
    HiLocationMarker,
    HiCheckCircle,
} from 'react-icons/hi';
import FormInput from '../components/form/FormInput';
import FormTextArea from '../components/form/FormTextArea';
import { validateField, validateContactForm } from '../utils/validation';
import { contactAPI } from '../services/api';

const INITIAL_FORM = {
    fullName: '',
    email: '',
    subject: '',
    phone: '',
    message: '',
};

const features = [
    {
        icon: HiUsers,
        title: 'Find Buddies',
        desc: 'Connect with like-minded solo trekkers heading to the same destinations.',
    },
    {
        icon: HiCurrencyDollar,
        title: 'Trek Budget Planning',
        desc: 'Plan and split costs for gear, permits, guides, and accommodation.',
    },
    {
        icon: HiChat,
        title: 'Real-time Chat',
        desc: 'Coordinate plans instantly through our secure messaging system.',
    },
    {
        icon: HiTruck,
        title: 'Services',
        desc: 'Book buses, hotels, and guided treks — all in one place.',
    },
];

const whyChooseUs = [
    {
        icon: HiShieldCheck,
        title: 'Trust & Safety',
        desc: 'Verified profiles and community reviews keep you safe.',
    },
    {
        icon: HiHeart,
        title: 'Safety Tips',
        desc: 'Expert guidance on altitude, gear, and route conditions.',
    },
    {
        icon: HiUserGroup,
        title: 'Community',
        desc: 'Join a growing family of passionate adventurers.',
    },
];

const AboutContactPage = () => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const formRef = useRef(null);

    /* ── Handlers ──────────────────────────────────────── */

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for the field being typed in
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }

        // Clear success when user starts editing again
        if (successMessage) setSuccessMessage('');
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const focusFirstError = (validationErrors) => {
        const firstErrorField = Object.keys(validationErrors).find(
            (key) => validationErrors[key]
        );
        if (firstErrorField) {
            const el = document.getElementById(`contact-${firstErrorField}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => el.focus(), 300);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateContactForm(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            focusFirstError(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await contactAPI.submitContact(formData);
            setFormData(INITIAL_FORM);
            setErrors({});
            setSuccessMessage(
                "Thanks for reaching out! We'll get back to you within 24–48 hours."
            );
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setErrors({ submit: 'Failed to send message. Please try again later.' });
        } finally {
            setIsSubmitting(false);
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    /* ── Render ─────────────────────────────────────────── */

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ─── A) Hero / Intro ─────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-dark py-20 lg:py-28">
                {/* Decorative blobs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />

                <div className="container-custom relative z-10 text-center">
                    <p className="inline-block text-sm font-semibold tracking-wider text-primary-200 uppercase mb-4 bg-white/10 px-4 py-1.5 rounded-full">
                        Get to know us
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                        About Travel Buddy
                    </h1>
                    <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
                        Connecting solo trekkers with trusted companions so no one has to
                        explore the trails alone.
                    </p>
                </div>
            </section>

            {/* ─── B) About Us ─────────────────────────────── */}
            <section className="py-16 lg:py-24">
                <div className="container-custom">
                    {/* Mission & Problem */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
                        {/* Left Column */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Our Mission
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Travel Buddy was born from a simple idea: trekking is better
                                with the right people. Whether you're a seasoned mountaineer or
                                a first-time hiker, finding a compatible travel partner can be
                                the difference between a good trip and an unforgettable one.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                We solve the problem that thousands of solo trekkers face every
                                year — the challenge of finding trustworthy companions who share
                                the same schedule, budget, and sense of adventure. Our platform
                                matches you with fellow travelers heading to the same
                                destinations, and gives you the tools to plan every detail
                                together.
                            </p>

                            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                    <HiUsers className="w-6 h-6 text-primary-600" />
                                </div>
                                <p className="text-gray-700 font-medium">
                                    Built for solo trekkers, budget travelers, and adventure
                                    seekers across Nepal and beyond.
                                </p>
                            </div>
                        </div>

                        {/* Right Column — Key Features */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Key Features
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {features.map((f, i) => (
                                    <div
                                        key={i}
                                        className="group p-5 bg-white rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all"
                                    >
                                        <div className="w-11 h-11 rounded-lg bg-primary-100 flex items-center justify-center mb-3 group-hover:bg-primary-600 transition-colors">
                                            <f.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-1">
                                            {f.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {f.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Why Choose Us panel */}
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                            Why Choose Us
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            {whyChooseUs.map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                                        <item.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h4 className="text-lg font-semibold mb-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-primary-100 text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── B2) Our Members ───────────────────────────── */}
            <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px]" />

                <div className="container-custom relative z-10">
                    <div className="text-center mb-16">
                        <p className="inline-block text-sm font-semibold tracking-widest text-primary-300 uppercase mb-4 bg-white/5 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10">
                            ✦ The Team Behind It All
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
                            Our Members
                        </h2>
                        <p className="text-gray-400 max-w-lg mx-auto text-lg leading-relaxed">
                            The passionate minds building the future of trekking — one connection at a time.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-end">

                        {/* ── Sumit Khadka (Left) ── */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                                <div className="relative w-28 h-28 mx-auto mb-6">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 p-[3px]">
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                            <span className="text-3xl font-bold bg-gradient-to-br from-amber-300 to-white bg-clip-text text-transparent">SK</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Sumit Khadka</h3>
                                <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-4">Head of Operations</p>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Ensures seamless service delivery and an exceptional experience for every trekker on the platform.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </span>
                                    <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                                        <HiMail className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Manil Rai (Center — elevated) ── */}
                        <div className="group relative lg:-translate-y-8 sm:col-span-2 lg:col-span-1 sm:max-w-sm sm:mx-auto lg:max-w-none w-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-white/[0.08] backdrop-blur-md rounded-2xl border border-primary-500/30 p-8 text-center hover:bg-white/[0.12] hover:border-primary-400/50 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-primary-900/20">
                                {/* Avatar with ring — slightly larger for CEO */}
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 p-[3px] shadow-lg shadow-primary-500/30">
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                            <span className="text-4xl font-bold bg-gradient-to-br from-primary-300 to-white bg-clip-text text-transparent">MR</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-primary-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">Manil Rai</h3>
                                <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-4">Founder & CEO</p>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Visionary leader driving Travel Buddy's mission to connect solo trekkers across Nepal and beyond.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </span>
                                    <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                                        <HiMail className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Nipekshya Shakya (Right) ── */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                                <div className="relative w-28 h-28 mx-auto mb-6">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-700 p-[3px]">
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                            <span className="text-3xl font-bold bg-gradient-to-br from-emerald-300 to-white bg-clip-text text-transparent">NS</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Nipekshya Shakya</h3>
                                <p className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-4">Head of Finance</p>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Manages financial strategy and budget planning to keep Travel Buddy sustainable and growing.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </span>
                                    <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                                        <HiMail className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </section>

            {/* ─── C) Contact Us ────────────────────────────── */}
            <section className="py-16 lg:py-24 bg-gray-100">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Contact Us
                        </h2>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            Have a question, suggestion, or just want to say hello? We'd love
                            to hear from you.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
                        {/* Contact Info Sidebar */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-card p-6">
                                <h3 className="font-semibold text-gray-900 mb-5 text-lg">
                                    Get In Touch
                                </h3>
                                <ul className="space-y-5">
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <HiMail className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">
                                                ksnsay64@gmail.com
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <HiPhone className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-800">
                                                (+977) 9807314103
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <HiLocationMarker className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium text-gray-800">
                                                Dharan-18, Sunsari, Nepal
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-primary-50 rounded-xl border border-primary-100 p-6">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Response Time
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    We typically respond within 24–48 hours during business
                                    days. For urgent matters, please call us directly.
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3" ref={formRef}>
                            {successMessage && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in" role="alert">
                                    <HiCheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-green-800">
                                            Message Sent!
                                        </p>
                                        <p className="text-sm text-green-700 mt-0.5">
                                            {successMessage}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {errors.submit && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in" role="alert">
                                    <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <div>
                                        <p className="font-semibold text-red-800">
                                            Error
                                        </p>
                                        <p className="text-sm text-red-700 mt-0.5">
                                            {errors.submit}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                noValidate
                                className="bg-white rounded-xl shadow-card p-6 md:p-8"
                            >
                                <div className="grid md:grid-cols-2 gap-x-6">
                                    <FormInput
                                        id="contact-fullName"
                                        label="Full Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.fullName}
                                        required
                                        placeholder="John Doe"
                                        disabled={isSubmitting}
                                        autoComplete="name"
                                    />
                                    <FormInput
                                        id="contact-email"
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.email}
                                        required
                                        placeholder="you@example.com"
                                        disabled={isSubmitting}
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-x-6">
                                    <FormInput
                                        id="contact-subject"
                                        label="Subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.subject}
                                        required
                                        placeholder="How can we help?"
                                        disabled={isSubmitting}
                                    />
                                    <FormInput
                                        id="contact-phone"
                                        label="Phone Number"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.phone}
                                        placeholder="+977 98XXXXXXXX (optional)"
                                        disabled={isSubmitting}
                                        autoComplete="tel"
                                    />
                                </div>

                                <FormTextArea
                                    id="contact-message"
                                    label="Message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.message}
                                    required
                                    placeholder="Tell us about your question, suggestion, or feedback..."
                                    disabled={isSubmitting}
                                    rows={6}
                                    maxLength={1000}
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary w-full md:w-auto px-10 py-3 text-base flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="animate-spin h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                />
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <HiMail className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Bottom CTA ──────────────────────────────── */}
            <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Start Your Adventure?
                    </h2>
                    <p className="text-primary-100 max-w-xl mx-auto mb-8">
                        Join thousands of travelers who have already found their perfect
                        trekking companions.
                    </p>
                    <Link
                        to="/register"
                        className="btn bg-white text-primary-600 hover:bg-gray-100 px-10 py-3.5 text-lg font-semibold shadow-lg inline-block"
                    >
                        Join Travel Buddy — It's Free
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AboutContactPage;
