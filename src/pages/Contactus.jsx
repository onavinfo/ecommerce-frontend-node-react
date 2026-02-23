import React, { useState } from "react";
import API from "../api"; // ✅ adjust if your api file path is different

const Contactus = () => {
  // ✅ added state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ added submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);

      const res = await API.post("/inquiries", { name, email, message });

      // ✅ alert like you want
      alert(
        res.data?.message ||
          "Request submitted. We will contact you shortly ✅",
      );

      // ✅ reset form
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] min-h-screen">
      {/* ✅ better responsive spacing */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-10">
        {/* Hero / About Intro */}
        <section className="mx-auto  mb-10 sm:mb-14 lg:mb-16">
          <div
            className="  relative overflow-hidden rounded-3xl shadow-2xl"
            style={{
              backgroundImage: "url('/contactus.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative p-4 sm:p-8 lg:p-14 bg-gradient-to-r from-[#050b2c]/75 via-[#0b1d4d]/35 to-[#1b3fa7]/20">
              <div className="max-w-4xl rounded-3xl bg-white/10 p-4 sm:p-8 lg:p-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                  Contact Us
                </h3>

                <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed mb-6">
                  Have questions, feedback, or need support? We’d love to hear
                  from you. Reach out and our team will get back to you as soon
                  as possible.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-white/90 text-sm sm:text-base">
                      <span className="text-indigo-300 font-semibold">
                        Fast Reply:
                      </span>{" "}
                      Usually within 24 hours.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-white/90 text-sm sm:text-base">
                      <span className="text-indigo-300 font-semibold">
                        Support:
                      </span>{" "}
                      Help with orders & products.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 sm:right-6 rounded-2xl bg-black/30 border border-white/20 backdrop-blur-md px-4 py-2">
              <p className="text-white text-xs sm:text-sm">
                Support • Feedback • Business
              </p>
            </div>
          </div>
        </section>

        <hr className="border-white/20 mb-10" />

        {/* Contact Form + Info */}
        <section className="mx-auto ">
          <h3 className="text-4xl font-bold text-white text-center mb-10">
            <span className="relative inline-block">
              Queries
              <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-24 sm:w-36 md:w-44 h-0.5 bg-indigo-400 rounded-full"></span>
            </span>
          </h3>
          {/* Contact Form */}
          <div className="py-6 sm:py-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="p-5 sm:p-6 lg:p-8 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.35)] bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-xl sm:text-2xl font-semibold text-indigo-400 mb-5 sm:mb-6">
                Send us a message
              </h3>

              {/* ✅ added onSubmit */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <textarea
                  rows="5"
                  placeholder="Your Message"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm sm:text-base"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>

                {/* ✅ small hint */}
                <p className="text-white/60 text-xs sm:text-sm text-center">
                  By submitting, you agree to be contacted regarding your
                  request.
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div className="p-5 sm:p-6 lg:p-8 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.35)] bg-white/10 backdrop-blur-xl border border-white/20 text-white">
              <h3 className="text-xl sm:text-2xl font-semibold text-indigo-400 mb-5 sm:mb-6">
                Get in touch
              </h3>

              {/* ✅ responsive info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-indigo-300">
                      Email:
                    </span>
                    <br />
                    support@myapp.com
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-indigo-300">
                      Phone:
                    </span>
                    <br />
                    +91 98765 43210
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:col-span-2">
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-indigo-300">
                      Address:
                    </span>
                    <br />
                    New Delhi, India
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 rounded-2xl bg-black/20 border border-white/10 p-4">
                <p className="text-white/85 text-sm sm:text-base">
                  We usually respond within{" "}
                  <span className="text-white font-semibold">24 hours</span>.
                  Your feedback helps us improve and grow 🚀
                </p>
              </div>

              {/* ✅ small CTA (enhancement only) */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:support@myapp.com"
                  className="w-full sm:w-auto text-center border border-indigo-300 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
                >
                  Email Us
                </a>
                <a
                  href="tel:+919876543210"
                  className="w-full sm:w-auto text-center bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ extra spacing bottom */}
        <div className="h-10 sm:h-14" />
      </div>
    </div>
  );
};

export default Contactus;
