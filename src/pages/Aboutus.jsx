import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        {/* Hero / About Intro */}
        <section className="mx-auto mb-10 sm:mb-14 lg:mb-16">
          <div
            className=" relative overflow-hidden rounded-3xl shadow-2xl "
            style={{
              backgroundImage: "url('/aboutus.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Content card */}
            <div className="relative p-6 sm:p-8 lg:p-14 bg-gradient-to-r from-[#050b2c]/75 via-[#0b1d4d]/35 to-[#1b3fa7]/20">
              <div className="max-w-4xl rounded-3xl bg-white/10  p-6 sm:p-8 lg:p-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                  About MyApp
                </h3>

                <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed mb-6">
                  To build reliable, scalable, and modern digital solutions that
                  simplify business operations and enhance user experiences. We
                  focus on performance, security, and usability to empower both
                  administrators and customers through intuitive technology.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-white/90 text-sm sm:text-base">
                      <span className="text-indigo-300 font-semibold">
                        Admin Panel:
                      </span>{" "}
                      Manage products, orders, and customers with full control.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-white/90 text-sm sm:text-base">
                      <span className="text-indigo-300 font-semibold">
                        Customer Side:
                      </span>{" "}
                      Smooth shopping, cart flow, and order tracking.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/products"
                    className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition w-full sm:w-auto text-center"
                  >
                    Explore Products
                  </Link>

                  <Link
                    to="/signup"
                    className="border border-indigo-300 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition w-full sm:w-auto text-center"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Tag */}
            <div className="absolute bottom-4 right-4 sm:right-6 rounded-2xl bg-black/30 border border-white/20 backdrop-blur-md px-4 py-2">
              <p className="text-white text-xs sm:text-sm">
                Fast • Secure • Responsive
              </p>
            </div>
          </div>
        </section>

        <hr className="border-white/20 mb-10" />

        {/* Mission / Vision / Values */}
        <section className="mx-auto">
          <h3 className="text-4xl font-bold text-white text-center">
            <span className="relative inline-block">
              Featured
              <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-24 sm:w-36 md:w-44 h-0.5 bg-indigo-400 rounded-full"></span>
            </span>
          </h3>

          <div className="py-6 sm:py-14 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Mission */}
            <div className="p-5 sm:p-6 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
              {/* image */}
              <div className="mb-4 rounded-2xl overflow-hidden border border-white/15">
                <img
                  src="Ourmission.jpg"
                  alt="Our Mission"
                  className="w-full h-50 object-cover"
                />
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-indigo-500 mb-3">
                Our Mission
              </h3>
              <p className="text-white text-sm sm:text-base">
                To build reliable, scalable, and modern digital solutions that
                simplify business operations and enhance user experiences. We
                focus on performance, security, and usability to empower both
                administrators and customers through intuitive technology.
              </p>
            </div>

            {/* Vision */}
            <div className="p-5 sm:p-6 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
              {/* image */}
              <div className="mb-4 rounded-2xl overflow-hidden border border-white/15">
                <img
                  src="/Ourvision.webp"
                  alt="Our Vision"
                  className="w-full h-50 object-cover"
                />
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-indigo-500 mb-3">
                Our Vision
              </h3>
              <p className="text-white text-sm sm:text-base">
                To become a trusted and innovative digital platform that helps
                businesses grow through smart product management, seamless sales
                workflows, and user-centric design. Our vision is to deliver
                technology that is fast, secure, and future-ready.
              </p>
            </div>

            {/* Values */}
            <div className="p-5 sm:p-6 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 sm:col-span-2 lg:col-span-1 overflow-hidden">
              {/* image */}
              <div className="mb-4 rounded-2xl overflow-hidden border border-white/15">
                <img
                  src="/Ourvalues.png"
                  alt="Our Values"
                  className="w-full h-50 object-cover"
                />
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-indigo-500 mb-3">
                Our Values
              </h3>
              <p className="text-white text-sm sm:text-base">
                We believe in transparency, security, and continuous
                improvement. User-first design, clean architecture, and
                performance-driven development guide everything we create. Our
                goal is to deliver quality solutions that are reliable,
                efficient, and easy to use.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-white/20 mb-10" />

        {/* CTA Section */}
        <section className="text-center py-5 sm:py-10 lg:py-12">
          <h3 className="text-4xl font-bold text-white text-center mb-6">
            <span className="relative inline-block ">
              Ready to get started?
              <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-24 sm:w-36 md:w-44 h-0.5 bg-indigo-400 rounded-full"></span>
            </span>
          </h3>
          <p className="text-white mb-6 text-sm sm:text-base lg:text-lg">
            Create an account and explore everything MyApp has to offer.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="border border-indigo-500 text-indigo-500 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition w-full sm:w-auto text-center"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition w-full sm:w-auto text-center"
            >
              Sign Up
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
