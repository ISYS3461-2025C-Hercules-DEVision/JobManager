import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getToken } from "../../utils/tokenStorage";

const words = ["TALENT.", "Engineers.", "Developers.", "Leader."];

function HomePage() {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentWord.substring(0, displayText.length + 1));

          if (displayText === currentWord) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          setDisplayText(currentWord.substring(0, displayText.length - 1));

          if (displayText === "") {
            setIsDeleting(false);
            setCurrentIndex((currentIndex + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 150
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-black text-black uppercase tracking-tight">
              DEVision.Manager
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#recruitment"
                className="text-black font-bold uppercase text-sm hover:bg-black hover:text-white px-3 py-2 transition-none"
              >
                Recruitment
              </a>
              <a
                href="#pricing"
                className="text-black font-bold uppercase text-sm hover:bg-black hover:text-white px-3 py-2 transition-none"
              >
                Pricing
              </a>
              <span className="text-sm font-bold uppercase">VN | EN</span>
            </nav>

            <div className="flex items-center space-x-4">
              {!getToken() && (
                <Link
                  to="/login"
                  className="text-black font-bold uppercase text-sm border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
                >
                  Get started!
                </Link>
              )}
              <Link
                to={getToken() ? "/dashboard" : "/register"}
                className="bg-primary text-white font-bold uppercase text-sm border-4 border-black px-6 py-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-none"
              >
                Hire Talent
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-light-gray border-b-4 border-black py-20 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-4 border-black bg-white p-6 mb-8 inline-block">
            <p className="text-sm font-black uppercase tracking-wider">
              For Recruiters & Companies
            </p>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black mb-6 leading-none uppercase">
            NO MIDDLEMAN.
            <br />
            <span className="text-primary">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-bold text-black mb-10 max-w-3xl border-l-8 border-black pl-6 leading-tight">
            Directly connect with top developers and tech companies. No fluff,
            just code and contracts.
          </p>

          <div className="flex flex-wrap gap-6">
            <Link
              to="/register"
              className="bg-primary text-white font-black uppercase text-lg border-4 border-black px-10 py-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-none"
            >
              Hire Talent →
            </Link>
            <a
              href="#pricing"
              className="bg-white text-black font-black uppercase text-lg border-4 border-black px-10 py-4 hover:bg-black hover:text-white transition-none"
            >
              View Plan
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border-4 border-black bg-white p-8 hover:translate-x-2 hover:translate-y-2 hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-none">
              <div className="w-20 h-20 mb-6 flex items-center justify-center border-4 border-black bg-light-gray">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-black mb-4 uppercase">
                Transparent Hiring
              </h3>
              <p className="text-black font-bold leading-relaxed">
                Salary and tech stack listed clearly. No guessing games.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border-4 border-black bg-white p-8 hover:translate-x-2 hover:translate-y-2 hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-none">
              <div className="w-20 h-20 mb-6 flex items-center justify-center border-4 border-black bg-light-gray">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-black mb-4 uppercase">
                Talent Search
              </h3>
              <p className="text-black font-bold leading-relaxed">
                Powerful AI to filter candidates by skills and experience.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border-4 border-black bg-white p-8 hover:translate-x-2 hover:translate-y-2 hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-none">
              <div className="w-20 h-20 mb-6 flex items-center justify-center border-4 border-black bg-light-gray">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-black mb-4 uppercase">
                Verified Talent
              </h3>
              <p className="text-black font-bold leading-relaxed">
                Candidate profiles verified based on actual code contributions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-light-gray border-b-4 border-black"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-black mb-4 uppercase">
              Talent Search
            </h2>
            <p className="text-xl font-bold text-black border-4 border-black bg-white inline-block px-8 py-4">
              Powerful AI to filter candidates by skills and experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white border-4 border-black p-8 hover:translate-x-2 hover:translate-y-2 hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-none">
              <div className="border-b-4 border-black pb-6 mb-6">
                <h3 className="text-2xl font-black text-black mb-2 uppercase">
                  Starter
                </h3>
                <div className="text-5xl font-black text-primary">$0</div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-primary font-black text-2xl mr-3">
                    ✓
                  </span>
                  <span className="text-black font-bold">
                    3 Job Postings Daily
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black text-2xl mr-3">
                    ✓
                  </span>
                  <span className="text-black font-bold">
                    Basic Candidate Search
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black text-2xl mr-3">
                    ✓
                  </span>
                  <span className="text-black font-bold">Email Support</span>
                </li>
              </ul>
            </div>

            {/* Growth Plan */}
            <div className="bg-primary border-4 border-black p-8 hover:translate-x-2 hover:translate-y-2 hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-none">
              <div className="border-b-4 border-black pb-6 mb-6">
                <h3 className="text-2xl font-black text-white mb-2 uppercase">
                  Growth
                </h3>
                <div className="text-5xl font-black text-white">$99</div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-white font-black text-2xl mr-3">✓</span>
                  <span className="text-white font-bold">
                    15 Job Postings Daily
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-white font-black text-2xl mr-3">✓</span>
                  <span className="text-white font-bold">Advanced Filters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white font-black text-2xl mr-3">✓</span>
                  <span className="text-white font-bold">
                    Candidate Contact
                  </span>
                </li>
              </ul>
            </div>

            {/* Scale Plan */}
            <div className="bg-white border-4 border-black p-8 hover:translate-x-2 hover:translate-y-2 hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-none">
              <div className="border-b-4 border-black pb-6 mb-6">
                <h3 className="text-2xl font-black text-black mb-2 uppercase">
                  Scale
                </h3>
                <div className="text-5xl font-black text-primary">$300</div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-primary font-black text-2xl mr-3">
                    ✓
                  </span>
                  <span className="text-black font-bold">
                    Unlimited Jobs Posting
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black text-2xl mr-3">
                    ✓
                  </span>
                  <span className="text-black font-bold">API Access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black text-2xl mr-3">
                    ✓
                  </span>
                  <span className="text-black font-bold">
                    Dedicated Account Manager
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-black mb-4 uppercase">
                DEVision.Manager
              </h3>
              <p className="text-white font-bold mb-6 leading-relaxed border-l-4 border-primary pl-4">
                The simplest applicant-tracking system for tech top talent
                without the noise.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-12 h-12 border-2 border-white flex items-center justify-center hover:bg-white hover:text-black transition-none"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 border-2 border-white flex items-center justify-center hover:bg-white hover:text-black transition-none"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 border-2 border-white flex items-center justify-center hover:bg-white hover:text-black transition-none"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-black mb-4 uppercase text-lg">Platform</h4>
              <ul className="space-y-3 font-bold">
                <li>
                  <a
                    href="#"
                    className="hover:underline underline-offset-4 decoration-4"
                  >
                    Find Talent
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline underline-offset-4 decoration-4"
                  >
                    Post A Job
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline underline-offset-4 decoration-4"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline underline-offset-4 decoration-4"
                  >
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black mb-4 uppercase text-lg">Company</h4>
              <ul className="space-y-3 font-bold">
                <li>
                  <a
                    href="#"
                    className="hover:underline underline-offset-4 decoration-4"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline underline-offset-4 decoration-4"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline underline-offset-4 decoration-4"
                  >
                    Legal
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline underline-offset-4 decoration-4"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t-4 border-white flex flex-col md:flex-row justify-between items-center font-bold uppercase text-sm">
            <p>© 2025 DEVision. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="hover:underline underline-offset-4 decoration-2"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:underline underline-offset-4 decoration-2"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:underline underline-offset-4 decoration-2"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
