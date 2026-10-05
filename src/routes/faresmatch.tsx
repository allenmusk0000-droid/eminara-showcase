import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/faresmatch")({
  head: () => ({
    meta: [
      { title: "FaresMatch — Compare Flight Fares & Book in Minutes" },
      {
        name: "description",
        content:
          "Search and compare airfares across airlines, see baggage and refund rules up front, and book your flight in a few clicks with FaresMatch.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: "FaresMatch — Compare Flight Fares & Book in Minutes" },
      {
        property: "og:description",
        content:
          "Compare airfares across airlines, check baggage and refund rules, and book your trip without leaving the page.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FaresMatch — Compare Flight Fares & Book in Minutes" },
      {
        name: "twitter:description",
        content: "Compare airfares, check fare rules, and book your flight in minutes.",
      },
    ],
  }),
  component: FaresMatchPage,
});

type Fare = {
  id: string;
  airline: string;
  code: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: string;
  price: number;
  baggage: string;
  refund: string;
};

const FARES: Fare[] = [
  {
    id: "f1",
    airline: "Skyline Air",
    code: "SK 412",
    from: "JFK",
    fromCity: "New York",
    to: "LHR",
    toCity: "London",
    depart: "18:40",
    arrive: "06:55",
    duration: "7h 15m",
    stops: "Non-stop",
    price: 389,
    baggage: "1 × 23 kg checked included",
    refund: "Refundable up to 24h before departure",
  },
  {
    id: "f2",
    airline: "Atlas Wings",
    code: "AW 208",
    from: "JFK",
    fromCity: "New York",
    to: "CDG",
    toCity: "Paris",
    depart: "20:10",
    arrive: "09:30",
    duration: "7h 20m",
    stops: "Non-stop",
    price: 412,
    baggage: "1 × 20 kg checked included",
    refund: "Changeable, fare difference applies",
  },
  {
    id: "f3",
    airline: "Meridian Jet",
    code: "MJ 771",
    from: "LAX",
    fromCity: "Los Angeles",
    to: "NRT",
    toCity: "Tokyo",
    depart: "11:25",
    arrive: "15:05",
    duration: "11h 40m",
    stops: "Non-stop",
    price: 648,
    baggage: "2 × 23 kg checked included",
    refund: "Partially refundable",
  },
  {
    id: "f4",
    airline: "Gulf Connect",
    code: "GC 130",
    from: "ORD",
    fromCity: "Chicago",
    to: "DXB",
    toCity: "Dubai",
    depart: "21:00",
    arrive: "19:45",
    duration: "13h 45m",
    stops: "1 stop · IST",
    price: 574,
    baggage: "1 × 30 kg checked included",
    refund: "Non-refundable, changes for a fee",
  },
  {
    id: "f5",
    airline: "Iberia Star",
    code: "IS 905",
    from: "MIA",
    fromCity: "Miami",
    to: "BCN",
    toCity: "Barcelona",
    depart: "17:55",
    arrive: "08:40",
    duration: "8h 45m",
    stops: "Non-stop",
    price: 436,
    baggage: "1 × 23 kg checked included",
    refund: "Refundable with 10% fee",
  },
  {
    id: "f6",
    airline: "Pacific Blue",
    code: "PB 322",
    from: "SFO",
    fromCity: "San Francisco",
    to: "SYD",
    toCity: "Sydney",
    depart: "22:15",
    arrive: "07:30",
    duration: "14h 55m",
    stops: "Non-stop",
    price: 812,
    baggage: "2 × 23 kg checked included",
    refund: "Refundable up to 48h before departure",
  },
];

const DESTINATIONS = [
  {
    city: "London",
    country: "United Kingdom",
    from: 389,
    image:
      "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
  },
  {
    city: "Paris",
    country: "France",
    from: 412,
    image:
      "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
  },
  {
    city: "Tokyo",
    country: "Japan",
    from: 648,
    image:
      "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
  },
  {
    city: "Dubai",
    country: "UAE",
    from: 574,
    image:
      "https://images.pexels.com/photos/162031/dubai-tower-arab-emirates-162031.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
  },
  {
    city: "Barcelona",
    country: "Spain",
    from: 436,
    image:
      "https://images.pexels.com/photos/819764/pexels-photo-819764.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
  },
  {
    city: "Sydney",
    country: "Australia",
    from: 812,
    image:
      "https://images.pexels.com/photos/995765/pexels-photo-995765.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
  },
];

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-faint focus:border-accent";
const label = "mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted";

function mins(d: string) {
  const m = d.match(/(\d+)h\s*(\d+)m/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function FaresMatchPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(todayPlus(21));
  const [passengers, setPassengers] = useState(1);
  const [sort, setSort] = useState<"price" | "duration">("price");
  const [selected, setSelected] = useState<Fare | null>(null);
  const [booked, setBooked] = useState<{ ref: string; fare: Fare; name: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const results = useMemo(() => {
    const q = (s: string) => s.trim().toLowerCase();
    let list = FARES.filter((f) => {
      const o = q(origin);
      const d = q(destination);
      const matchO =
        !o || f.from.toLowerCase().includes(o) || f.fromCity.toLowerCase().includes(o);
      const matchD = !d || f.to.toLowerCase().includes(d) || f.toCity.toLowerCase().includes(d);
      return matchO && matchD;
    });
    list = [...list].sort((a, b) =>
      sort === "price" ? a.price - b.price : mins(a.duration) - mins(b.duration)
    );
    return list;
  }, [origin, destination, sort]);

  const total = selected ? selected.price * passengers : 0;

  function confirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBooked({
      ref: "FM" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      fare: selected,
      name,
    });
    setSelected(null);
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-line bg-panel/80 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BA3F5] text-sm font-semibold text-white">
              F
            </span>
            <span className="text-base font-semibold tracking-tight">FaresMatch</span>
            <span className="hidden rounded-full border border-line px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-muted sm:inline">
              by EmiNara AI
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-muted transition-colors hover:text-cream">
              ← EmiNara
            </Link>
            <a
              href="#search"
              className="rounded-full bg-[#5BA3F5] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Book a flight
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* hero + search */}
        <section id="search" className="relative overflow-hidden border-b border-line py-16 sm:py-20">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.45]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--color-line-soft) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 25%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 60% at 50% 0%, black 25%, transparent 75%)",
            }}
          />
          <div className="container-x">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-1.5 text-xs text-cream-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5BA3F5]" aria-hidden="true" />
                Live fares from 400+ airlines
              </span>
              <h1 className="mt-6 text-balance text-4xl font-medium leading-[1.02] tracking-tight sm:text-6xl">
                Compare fares. Know the rules.{" "}
                <span className="font-serif-italic text-[#5BA3F5]">Book in minutes.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-dim sm:text-lg">
                FaresMatch searches airlines side by side and shows baggage and refund rules up
                front — so you book the right fare the first time.
              </p>
            </motion.div>

            {/* search panel */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 rounded-2xl border border-line bg-panel p-5 shadow-2xl shadow-black/10 sm:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={label} htmlFor="fm-from">From</label>
                  <input
                    id="fm-from"
                    className={field}
                    placeholder="New York or JFK"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="fm-to">To</label>
                  <input
                    id="fm-to"
                    className={field}
                    placeholder="London or LHR"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="fm-date">Departure</label>
                  <input
                    id="fm-date"
                    type="date"
                    className={field}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="fm-pax">Passengers</label>
                  <select
                    id="fm-pax"
                    className={field}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "passenger" : "passengers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                  Sort by
                  {(["price", "duration"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={
                        "rounded-full border px-3 py-1 transition-colors " +
                        (sort === s
                          ? "border-[#5BA3F5] bg-[#5BA3F5]/10 text-cream"
                          : "border-line text-muted hover:text-cream")
                      }
                    >
                      {s === "price" ? "Lowest price" : "Shortest trip"}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted">
                  {results.length} {results.length === 1 ? "fare" : "fares"} available
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* fares */}
        <section id="fares" className="py-16 sm:py-20">
          <div className="container-x">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Today&rsquo;s best fares</h2>
            <p className="mt-3 max-w-xl text-cream-dim">
              Every price includes taxes and fees. Baggage and refund rules are shown before you
              book.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {results.length === 0 && (
                <div className="rounded-2xl border border-dashed border-line bg-panel p-8 text-center text-sm text-muted">
                  No flights match that route yet. Try “New York”, “Los Angeles” or clear the
                  fields to see all fares.
                </div>
              )}
              {results.map((f) => (
                <div
                  key={f.id}
                  className="grid items-center gap-5 rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-[#5BA3F5]/60 lg:grid-cols-12"
                >
                  <div className="lg:col-span-3">
                    <p className="text-sm font-medium text-cream">{f.airline}</p>
                    <p className="text-xs text-muted">{f.code} · {f.stops}</p>
                  </div>
                  <div className="flex items-center gap-4 lg:col-span-4">
                    <div>
                      <p className="text-lg font-medium">{f.depart}</p>
                      <p className="text-xs text-muted">{f.from} · {f.fromCity}</p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="h-px w-full bg-line" />
                      <p className="mt-1 text-[0.65rem] text-muted">{f.duration}</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium">{f.arrive}</p>
                      <p className="text-xs text-muted">{f.to} · {f.toCity}</p>
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="text-xs text-cream-dim">{f.baggage}</p>
                    <p className="text-xs text-muted">{f.refund}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 lg:col-span-2 lg:justify-end">
                    <div className="text-right">
                      <p className="text-xl font-semibold">${f.price}</p>
                      <p className="text-[0.65rem] text-muted">per passenger</p>
                    </div>
                    <button
                      onClick={() => {
                        setBooked(null);
                        setSelected(f);
                      }}
                      className="rounded-full bg-[#5BA3F5] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* booking */}
            <div id="book" className="mt-10 scroll-mt-24">
              {booked && (
                <div className="rounded-2xl border border-[#5BA3F5]/50 bg-[#5BA3F5]/[0.07] p-6">
                  <h3 className="text-xl font-medium">Booking confirmed 🎉</h3>
                  <p className="mt-2 text-sm text-cream-dim">
                    Thanks {booked.name || "traveller"} — your {booked.fare.airline} flight{" "}
                    {booked.fare.from} → {booked.fare.to} on {date} is reserved. Booking reference{" "}
                    <span className="font-semibold text-cream">{booked.ref}</span>. A confirmation
                    email is on its way.
                  </p>
                  <button
                    onClick={() => setBooked(null)}
                    className="mt-4 rounded-full border border-line px-4 py-2 text-sm text-cream-dim transition-colors hover:text-cream"
                  >
                    Book another flight
                  </button>
                </div>
              )}

              {selected && (
                <form
                  onSubmit={confirmBooking}
                  className="rounded-2xl border border-line bg-panel p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-medium">Complete your booking</h3>
                      <p className="mt-1 text-sm text-muted">
                        {selected.airline} {selected.code} · {selected.fromCity} →{" "}
                        {selected.toCity} · {date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold">${total}</p>
                      <p className="text-xs text-muted">
                        {passengers} × ${selected.price} incl. taxes
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="fm-name">Full name</label>
                      <input
                        id="fm-name"
                        required
                        className={field}
                        placeholder="As shown on passport"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor="fm-email">Email</label>
                      <input
                        id="fm-email"
                        required
                        type="email"
                        className={field}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-line-soft bg-panel-2 p-4 text-xs text-cream-dim">
                    <p>{selected.baggage}</p>
                    <p className="text-muted">{selected.refund}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="rounded-full bg-[#5BA3F5] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Confirm booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="rounded-full border border-line px-6 py-3 text-sm text-cream-dim transition-colors hover:text-cream"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* destinations */}
        <section id="destinations" className="border-t border-line py-16 sm:py-20">
          <div className="container-x">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Popular destinations</h2>
            <p className="mt-3 max-w-xl text-cream-dim">
              Tap a city to load its fares in the search above.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {DESTINATIONS.map((d) => (
                <button
                  key={d.city}
                  onClick={() => {
                    setDestination(d.city);
                    document.getElementById("fares")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group overflow-hidden rounded-2xl border border-line bg-panel text-left transition-colors hover:border-[#5BA3F5]/60"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={d.image}
                      alt={`Flights to ${d.city}, ${d.country}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-medium">{d.city}</p>
                      <p className="text-xs text-muted">{d.country}</p>
                    </div>
                    <p className="text-sm text-cream-dim">
                      from <span className="font-semibold text-cream">${d.from}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* trust */}
        <section className="border-t border-line py-16">
          <div className="container-x grid gap-6 sm:grid-cols-3">
            {[
              ["Transparent fare rules", "Baggage, changes and refunds shown before checkout."],
              ["AI fare comparison", "We scan airlines side by side and surface the best value."],
              ["Support that answers", "An AI travel assistant is available 24/7 at every step."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-line bg-panel p-6">
                <h3 className="text-base font-medium">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-dim">{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-10">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <p>FaresMatch — a travel platform built by EmiNara AI.</p>
          <div className="flex items-center gap-5">
            <Link to="/" className="transition-colors hover:text-cream">
              EmiNara AI
            </Link>
            <a
              href="https://faresmatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cream"
            >
              faresmatch.com ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
