import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import Hero from "../components/Hero";
import VehicleCard from "../components/VehicleCard";
import {
  ShieldCheck,
  HeartHandshake,
  Clock,
  Car,
  Truck,
  Zap,
  Star,
  Quote,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const categories = [
  {
    id: "suv",
    label: "SUV",
    icon: Truck,
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "sedan",
    label: "Sedan",
    icon: Car,
    image:
      "https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "luxury",
    label: "Luxury",
    icon: Star,
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "electric",
    label: "Electric",
    icon: Zap,
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938bc?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "van",
    label: "Van",
    icon: Truck,
    image:
      "https://images.unsplash.com/photo-1527786356703-4b100916cd20?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "coupe",
    label: "Coupe",
    icon: Car,
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400",
  },
];

const testimonials = [
  {
    name: "Nimal Perera",
    location: "Colombo",
    rating: 5,
    text: "Booked a Toyota Fortuner for our family trip to Ella. Smooth process, verified host, and the car was spotless. Will definitely use again!",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Sarah Mitchell",
    location: "Kandy",
    rating: 5,
    text: "As a tourist, CarRents.lk made renting so easy. Transparent pricing, no hidden fees, and 24/7 support when I had a question.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Kasun Silva",
    location: "Galle",
    rating: 5,
    text: "I listed my car and started earning within a week. The platform handles everything — verification, bookings, payments. Highly recommend!",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
  },
];

const steps = [
  {
    num: "01",
    title: "Browse & Select",
    desc: "Explore verified vehicles across Sri Lanka with smart filters.",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=300",
  },
  {
    num: "02",
    title: "Book Instantly",
    desc: "Pick your dates and confirm your booking in seconds.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=300",
  },
  {
    num: "03",
    title: "Pick Up & Drive",
    desc: "Meet your host, grab the keys, and hit the road.",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=300",
  },
  {
    num: "04",
    title: "Return & Rate",
    desc: "Return the car and share your experience with the community.",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300",
  },
];

const LandingPage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/vehicles`);
        setFeaturedCars(response.data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="landing-page">
      <Hero />

      {/* Featured Listings */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-badge">Popular Rentals</span>
              <h2 className="section-title">
                Featured <span className="text-gradient">Listings</span>
              </h2>
              <p className="section-subtitle">
                Hand-picked verified vehicles from our top-rated hosts
              </p>
            </div>
            <Link to="/vehicles" className="view-all-link">
              View All Vehicles <ArrowRight size={18} />
            </Link>
          </div>

          <div className="vehicle-grid">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading vehicles...</p>
              </div>
            ) : featuredCars.length > 0 ? (
              featuredCars.map((car, i) => (
                <VehicleCard key={car._id} vehicle={car} index={i} />
              ))
            ) : (
              <div className="empty-state">
                <Car size={40} />
                <h3>No vehicles yet</h3>
                <p>Be the first to list your car!</p>
                <Link to="/list-my-car" className="btn btn-primary">
                  List Your Vehicle
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="section category-section">
        <div className="container">
          <div className="category-layout">
            <div className="category-info">
              <span className="section-badge light">Browse by Category</span>
              <h2 className="section-title light">
                Find the perfect ride for every journey
              </h2>
              <p className="category-desc">
                From city sedans to rugged SUVs and luxury coupes — filter by
                body type and find exactly what you need.
              </p>
              <Link to="/vehicles" className="category-cta">
                View All Categories <ChevronRight size={18} />
              </Link>
            </div>
            <div className="category-grid">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  className="category-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link to="/vehicles">
                    <div className="category-img-wrap">
                      <img src={cat.image} alt={cat.label} />
                      <div className="category-overlay" />
                    </div>
                    <div className="category-label">
                      <cat.icon size={20} />
                      <span>{cat.label}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="section steps-section">
        <div className="container">
          <div className="section-header center">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">
              Rent in <span className="text-gradient">4 simple steps</span>
            </h2>
          </div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="step-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="step-num">{step.num}</span>
                <div className="step-img-wrap">
                  <img src={step.image} alt={step.title} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="why-us" className="section why-section">
        <div className="container">
          <div className="why-layout">
            <motion.div
              className="why-text"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-badge">Why CarRents.lk?</span>
              <h2 className="section-title">
                The most trusted car sharing marketplace in{" "}
                <span className="text-gradient">Sri Lanka</span>
              </h2>

              <ul className="benefits-list">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Fully Insured",
                    desc: "Every trip covered by comprehensive insurance.",
                  },
                  {
                    icon: HeartHandshake,
                    title: "Verified Hosts",
                    desc: "Every host and vehicle manually verified.",
                  },
                  {
                    icon: Clock,
                    title: "24/7 Support",
                    desc: "Dedicated support team always here to help.",
                  },
                ].map((b, i) => (
                  <li key={i}>
                    <div className="benefit-icon">
                      <b.icon size={22} />
                    </div>
                    <div>
                      <h4>{b.title}</h4>
                      <p>{b.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link to="/why-us" className="why-link">
                Learn more about us <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              className="why-visual"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800"
                alt="Happy travelers with rental car"
                className="why-img"
              />
              <div className="trust-card">
                <div className="trust-stat">
                  <span className="stat-number">5,000+</span>
                  <span className="stat-label">Happy Renters</span>
                </div>
                <div className="trust-divider" />
                <div className="trust-stat">
                  <span className="stat-number">4.9/5</span>
                  <span className="stat-label">Avg. Rating</span>
                </div>
                <div className="trust-divider" />
                <div className="trust-stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Verified Hosts</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header center">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">
              What our <span className="text-gradient">customers say</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Quote size={28} className="quote-icon" />
                <div className="stars">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="#f97316" color="#f97316" />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <img src={t.avatar} alt={t.name} />
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Banner */}
      <section className="section deals-section">
        <div className="container">
          <div className="deals-grid">
            <div className="deal-card deal-weekly">
              <div className="deal-content">
                <span className="deal-tag">Weekly Special</span>
                <h3>Save 20% on weekly rentals</h3>
                <p>
                  Book any vehicle for 7+ days and unlock exclusive savings.
                </p>
                <Link to="/vehicles" className="deal-btn">
                  Grab Deal
                </Link>
              </div>
              <img
                src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=400"
                alt="Weekly deal"
              />
            </div>
            <div className="deal-card deal-weekend">
              <div className="deal-content">
                <span className="deal-tag">Weekend Discount</span>
                <h3>Weekend getaways from LKR 3,500/day</h3>
                <p>Perfect for short trips — explore the island affordably.</p>
                <Link to="/vehicles" className="deal-btn">
                  Grab Deal
                </Link>
              </div>
              <img
                src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400"
                alt="Weekend deal"
              />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          position: relative;
          background: linear-gradient(180deg, #fffcf7 0%, #fff7ec 60%, #fff4e0 100%);
        }

        .section {
          padding: 5.5rem 0;
          position: relative;
        }

        #how-it-works {
          scroll-margin-top: 100px;
        }

        .section-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .section-header.center {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 3.5vw, 2.75rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 0.75rem;
        }

        .section-subtitle {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 520px;
          line-height: 1.8;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.95rem;
          white-space: nowrap;
          transition: gap 0.25s ease, opacity 0.25s ease;
        }

        .view-all-link:hover {
          gap: 0.65rem;
          opacity: 0.95;
        }

        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.75rem;
        }

        .loading-state,
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
          color: var(--text-muted);
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-card);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(249, 115, 22, 0.15);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .empty-state h3 {
          color: var(--text);
        }

        .empty-state .btn {
          width: auto;
          margin-top: 0.5rem;
        }

        /* Category Section */
        .category-section {
          background: var(--grad-dark);
          padding: 5rem 0;
        }

        .category-layout {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 3rem;
          align-items: center;
        }

        .section-badge.light {
          background: rgba(249, 115, 22, 0.15);
          color: var(--primary-light);
          border-color: rgba(249, 115, 22, 0.25);
        }

        .section-title.light {
          color: white;
        }

        .category-desc {
          color: #a8a29e;
          font-size: 1.05rem;
          line-height: 1.7;
          margin: 1rem 0 2rem;
        }

        .category-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--primary-light);
          font-weight: 700;
          padding: 0.75rem 1.5rem;
          border: 2px solid rgba(249, 115, 22, 0.4);
          border-radius: var(--radius-pill);
          transition: all 0.3s ease;
        }

        .category-cta:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .category-card a {
          display: block;
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          aspect-ratio: 1;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .category-card a:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
        }

        .category-img-wrap {
          position: absolute;
          inset: 0;
        }

        .category-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .category-card:hover img {
          transform: scale(1.08);
        }

        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.72) 0%,
            rgba(0, 0, 0, 0.24) 55%,
            transparent 100%
          );
        }

        .category-label {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          z-index: 2;
        }

        /* Steps */
        .steps-section {
          background: var(--bg-warm);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .step-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-card);
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
        }

        .step-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-card-hover);
          border-color: rgba(249, 115, 22, 0.2);
        }

        .step-num {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary-soft);
          line-height: 1;
          display: block;
          margin-bottom: 1rem;
        }

        .step-img-wrap {
          height: 120px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: 1.25rem;
        }

        .step-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .step-card h3 {
          font-family: var(--font-body);
          font-size: 1.05rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .step-card p {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--text-muted);
        }

        /* Why Us */
        .why-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .benefits-list {
          list-style: none;
          margin: 2rem 0;
        }

        .benefits-list li {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 1.75rem;
        }

        .benefit-icon {
          width: 52px;
          height: 52px;
          background: var(--primary-soft);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary);
          border: 1px solid rgba(249, 115, 22, 0.15);
          transition: all 0.3s ease;
        }

        .benefits-list li:hover .benefit-icon {
          background: var(--primary);
          color: white;
          transform: scale(1.08);
        }

        .benefits-list h4 {
          font-family: var(--font-body);
          font-size: 1.05rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .benefits-list p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .why-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--primary);
          font-weight: 700;
          transition: gap 0.25s ease;
        }

        .why-link:hover {
          gap: 0.65rem;
        }

        .why-visual {
          position: relative;
        }

        .why-img {
          width: 100%;
          height: 420px;
          object-fit: cover;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-card);
        }

        .trust-card {
          position: absolute;
          bottom: -2rem;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: var(--radius-lg);
          padding: 1.5rem 2rem;
          display: flex;
          gap: 2rem;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
          border: 1px solid var(--border);
          white-space: nowrap;
        }

        .trust-stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .trust-divider {
          width: 1px;
          background: var(--border);
        }

        /* Testimonials */
        .testimonials-section {
          background: white;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .testimonial-card {
          background: var(--bg);
          border-radius: var(--radius-lg);
          padding: 2rem;
          border: 1px solid var(--border);
          transition: all 0.35s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
          border-color: rgba(249, 115, 22, 0.15);
        }

        .quote-icon {
          color: var(--primary);
          opacity: 0.4;
          margin-bottom: 0.75rem;
        }

        .stars {
          display: flex;
          gap: 2px;
          margin-bottom: 1rem;
        }

        .testimonial-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .testimonial-author img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary-soft);
        }

        .testimonial-author strong {
          display: block;
          font-size: 0.9rem;
          color: var(--text);
        }

        .testimonial-author span {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* Deals */
        .deals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .deal-card {
          display: flex;
          align-items: center;
          border-radius: var(--radius-xl);
          overflow: hidden;
          min-height: 220px;
          position: relative;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }

        .deal-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
        }

        .deal-weekly {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          border: 1px solid rgba(249, 115, 22, 0.15);
        }

        .deal-weekend {
          background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
        }

        .deal-content {
          flex: 1;
          padding: 2rem;
          z-index: 2;
        }

        .deal-tag {
          display: inline-block;
          background: var(--primary);
          color: white;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-pill);
          margin-bottom: 0.75rem;
        }

        .deal-weekend .deal-tag {
          background: rgba(249, 115, 22, 0.2);
          color: var(--primary-light);
        }

        .deal-content h3 {
          font-family: var(--font-display);
          font-size: 1.45rem;
          margin-bottom: 0.75rem;
          line-height: 1.15;
        }

        .deal-weekend h3 {
          color: white;
        }

        .deal-content p {
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          line-height: 1.7;
          color: var(--text-muted);
        }

        .deal-weekend p {
          color: #c7c1b4;
        }

        .deal-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.75rem 1.35rem;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.92rem;
          transition: all 0.25s ease;
        }

        .deal-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .deal-card img {
          width: 45%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          mask-image: linear-gradient(to right, transparent, black 30%);
          -webkit-mask-image: linear-gradient(to right, transparent, black 30%);
        }

        @media (max-width: 1024px) {
          .category-layout,
          .why-layout {
            grid-template-columns: 1fr;
          }
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .section {
            padding: 3.5rem 0;
          }
          .section-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
          .deals-grid {
            grid-template-columns: 1fr;
          }
          .trust-card {
            position: relative;
            bottom: auto;
            left: auto;
            transform: none;
            margin-top: -2rem;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }
        }

        @media (max-width: 640px) {
          .category-grid {
            grid-template-columns: 1fr;
          }
          .deal-card {
            flex-direction: column;
            min-height: auto;
          }
          .deal-card img {
            position: relative;
            width: 100%;
            height: 220px;
            mask-image: none;
            -webkit-mask-image: none;
          }
          .deal-content {
            padding: 1.5rem;
          }
          .section-header-row {
            align-items: flex-start;
          }
          .section-title {
            font-size: clamp(1.7rem, 6vw, 2.25rem);
          }
        }

        .benefits-list h4 {
          font-family: var(--font-body);
          font-size: 1.05rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .benefits-list p {
          font-size: 0.9rem;
        }

        .why-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--primary);
          font-weight: 700;
          transition: gap 0.25s ease;
        }

        .why-link:hover {
          gap: 0.65rem;
        }

        .why-visual {
          position: relative;
        }

        .why-img {
          width: 100%;
          height: 420px;
          object-fit: cover;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-card);
        }

        .trust-card {
          position: absolute;
          bottom: -2rem;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: var(--radius-lg);
          padding: 1.5rem 2rem;
          display: flex;
          gap: 2rem;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
          border: 1px solid var(--border);
          white-space: nowrap;
        }

        .trust-stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .trust-divider {
          width: 1px;
          background: var(--border);
        }

        /* Testimonials */
        .testimonials-section {
          background: white;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .testimonial-card {
          background: var(--bg);
          border-radius: var(--radius-lg);
          padding: 2rem;
          border: 1px solid var(--border);
          transition: all 0.35s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
          border-color: rgba(249, 115, 22, 0.15);
        }

        .quote-icon {
          color: var(--primary);
          opacity: 0.4;
          margin-bottom: 0.75rem;
        }

        .stars {
          display: flex;
          gap: 2px;
          margin-bottom: 1rem;
        }

        .testimonial-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .testimonial-author img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary-soft);
        }

        .testimonial-author strong {
          display: block;
          font-size: 0.9rem;
          color: var(--text);
        }

        .testimonial-author span {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* Deals */
        .deals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .deal-card {
          display: flex;
          align-items: center;
          border-radius: var(--radius-xl);
          overflow: hidden;
          min-height: 220px;
          position: relative;
        }

        .deal-weekly {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          border: 1px solid rgba(249, 115, 22, 0.15);
        }

        .deal-weekend {
          background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
        }

        .deal-content {
          flex: 1;
          padding: 2rem;
          z-index: 2;
        }

        .deal-tag {
          display: inline-block;
          background: var(--primary);
          color: white;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-pill);
          margin-bottom: 0.75rem;
        }

        .deal-weekend .deal-tag {
          background: rgba(249, 115, 22, 0.2);
          color: var(--primary-light);
        }

        .deal-content h3 {
          font-family: var(--font-display);
          font-size: 1.35rem;
          margin-bottom: 0.5rem;
        }

        .deal-weekend h3 {
          color: white;
        }

        .deal-content p {
          font-size: 0.88rem;
          margin-bottom: 1.25rem;
        }

        .deal-weekend p {
          color: #a8a29e;
        }

        .deal-btn {
          display: inline-flex;
          padding: 0.6rem 1.25rem;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.25s ease;
        }

        .deal-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .deal-card img {
          width: 45%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          mask-image: linear-gradient(to right, transparent, black 30%);
          -webkit-mask-image: linear-gradient(to right, transparent, black 30%);
        }

        @media (max-width: 1024px) {
          .category-layout,
          .why-layout {
            grid-template-columns: 1fr;
          }
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .section {
            padding: 3.5rem 0;
          }
          .section-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
          .deals-grid {
            grid-template-columns: 1fr;
          }
          .trust-card {
            position: relative;
            bottom: auto;
            left: auto;
            transform: none;
            margin-top: -2rem;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
