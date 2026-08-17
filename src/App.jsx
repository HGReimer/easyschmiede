import { useState } from 'react'
import emailjs from "@emailjs/browser"
import './App.css'

function playForgeIntro() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audio = new AudioContext()
  const now = audio.currentTime

  const master = audio.createGain()
  master.gain.setValueAtTime(0.95, now)

  const compressor = audio.createDynamicsCompressor()
  compressor.threshold.value = -26
  compressor.knee.value = 8
  compressor.ratio.value = 14
  compressor.attack.value = 0.002
  compressor.release.value = 0.3

  compressor.connect(master)
  master.connect(audio.destination)

  const motor = (time, duration) => {
    const osc1 = audio.createOscillator()
    const osc2 = audio.createOscillator()
    const filter = audio.createBiquadFilter()
    const gain = audio.createGain()

    osc1.type = 'sawtooth'
    osc2.type = 'square'

    osc1.frequency.setValueAtTime(48, time)
    osc1.frequency.exponentialRampToValueAtTime(82, time + 2.5)

    osc2.frequency.setValueAtTime(72, time)
    osc2.frequency.exponentialRampToValueAtTime(123, time + 2.5)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(120, time)
    filter.frequency.exponentialRampToValueAtTime(300, time + 2.4)
    filter.Q.value = 5

    gain.gain.setValueAtTime(0.001, time)
    gain.gain.exponentialRampToValueAtTime(0.48, time + 1.4)
    gain.gain.setValueAtTime(0.48, time + duration - 0.6)
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(compressor)

    osc1.start(time)
    osc2.start(time)

    osc1.stop(time + duration)
    osc2.stop(time + duration)
  }

  const hydraulicHit = (time, volume = 1.0) => {
    const osc = audio.createOscillator()
    const gain = audio.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, time)
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.42)

    gain.gain.setValueAtTime(volume, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5)

    osc.connect(gain)
    gain.connect(compressor)

    osc.start(time)
    osc.stop(time + 0.55)
  }

  const anvil = (time, volume = 0.8) => {
    const freqs = [520, 780, 1160, 1580]

    freqs.forEach((freq, index) => {
      const osc = audio.createOscillator()
      const gain = audio.createGain()

      osc.type = index % 2 === 0 ? 'triangle' : 'square'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(volume / (index + 1), time)
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        time + 0.45 + index * 0.08
      )

      osc.connect(gain)
      gain.connect(compressor)

      osc.start(time)
      osc.stop(time + 0.9)
    })
  }

  const boom = (time) => {
    const osc1 = audio.createOscillator()
    const osc2 = audio.createOscillator()
    const gain = audio.createGain()

    osc1.type = 'sine'
    osc2.type = 'triangle'

    osc1.frequency.setValueAtTime(95, time)
    osc1.frequency.exponentialRampToValueAtTime(38, time + 1.5)

    osc2.frequency.setValueAtTime(145, time)
    osc2.frequency.exponentialRampToValueAtTime(55, time + 1.2)

    gain.gain.setValueAtTime(1.1, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(compressor)

    osc1.start(time)
    osc2.start(time)

    osc1.stop(time + 1.9)
    osc2.stop(time + 1.9)
  }

  // Motor läuft schwer an
  motor(now, 6.8)

  // Hydraulik / Presse
  hydraulicHit(now + 1.8, 0.75)
  hydraulicHit(now + 2.65, 0.9)

  // Schmiedeschläge
  anvil(now + 3.25, 0.65)
  hydraulicHit(now + 3.95, 1.0)
  anvil(now + 4.05, 0.85)

  hydraulicHit(now + 4.8, 1.1)
  anvil(now + 4.9, 1.0)

  // Finale
  hydraulicHit(now + 5.7, 1.3)
  anvil(now + 5.78, 1.2)
  boom(now + 5.82)

  master.gain.setValueAtTime(0.95, now + 6.2)
  master.gain.exponentialRampToValueAtTime(0.001, now + 7.6)

  setTimeout(() => audio.close(), 8200)
}

const products = [
  {
    name: 'Easy PDF',
    text: 'PDFs öffnen, bearbeiten, Seiten organisieren und Bilder in PDF umwandeln.',
    status: 'In Entwicklung',
  },
  {
    name: 'EasyVorrat',
    text: 'Vorräte, Lagerorte, Mengen, Haltbarkeit und Einkauf übersichtlich verwalten.',
    status: 'In Vorbereitung',
  },
  {
    name: 'EasyCryptoWatch',
    text: 'Kryptokurse einfach und übersichtlich beobachten.',
    status: 'In Entwicklung',
  },
  {
    name: 'EasyPathfinder',
    text: 'Digitale Orientierung mit Kompass, Zielkurs, Wegpunkten und Navigation für Outdoor und unterwegs.',
    status: 'In Entwicklung',
  },
  {
    name: 'EasyVerein',
    text: 'Modulare Vereinsplattform mit Spielplan, Liveticker, Kursen, News und mehr.',
    status: 'Pilotphase',
  },
]

function App() {
  const [started, setStarted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendMessage, setSendMessage] = useState("")

  const startForge = () => {
    setStarted(true)
    playForgeIntro()
  }

  const sendContactForm = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    setSending(true)
    setSendMessage("")

    try {
      await emailjs.sendForm(
        "service_3gponym",
        "template_48ld5j1",
        form,
        { publicKey: "G-ZQwtoRADyFvP_Zc" }
      )

      form.reset()
      setSendMessage("Danke! Deine Anfrage wurde erfolgreich gesendet.")
    } catch (error) {
      console.error("EmailJS Fehler:", error.status, error.text, error)
      setSendMessage("Die Anfrage konnte nicht gesendet werden. Bitte versuche es noch einmal.")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className={started ? 'site forge-active' : 'site'}>
      <section className="hero">
        <div className="brand">
          <span className="brand-easy">EASY</span>
          <span className="brand-schmiede">SCHMIEDE</span>
        </div>

        <div className="stamp">COMING SOON</div>

        <h1>Software, die das Leben einfacher macht.</h1>

        <p className="hero-text">
          Praktische Anwendungen für Alltag, Vereine und kleine Unternehmen.
          Einfach gedacht. Verständlich gebaut.
        </p>

        <button className="forge-button" onClick={startForge}>
          ⚒ Schmiede starten
        </button>

        {started && (
          <p className="forge-message">
            Das Feuer brennt. Die EasySchmiede nimmt ihre Arbeit auf.
          </p>
        )}
      </section>

      <section className="products">
        <div className="section-heading">
          <span>IN DER SCHMIEDE</span>
          <h2>Unsere Projekte</h2>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="status">{product.status}</div>
              <h3>{product.name}</h3>
              <p>{product.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="custom-software" id="kontakt">
        <div>
          <span className="eyebrow">DEINE IDEE · UNSERE SCHMIEDE</span>
          <h2>Du brauchst eine Software, die es noch nicht gibt?</h2>
          <p>
            Nicht jede Aufgabe passt in eine fertige Standardlösung.
            Die EasySchmiede entwickelt auch individuelle Anwendungen
            für Vereine, kleine Unternehmen und besondere Ideen.
          </p>
        </div>

        <a className="contact-button" href="#contact-info">
          Software anfragen
        </a>
      </section>

        <section className="contact-info" id="contact-info">
          <span className="eyebrow">KONTAKT</span>
          <h2>Sprich mit der EasySchmiede.</h2>
          <p>
            Du hast eine Idee oder möchtest eine eigene Lösung entwickeln lassen?
            Schreib uns kurz, worum es geht. Wir schauen gemeinsam, was sinnvoll umsetzbar ist.
          </p>

          <form className="contact-form" onSubmit={sendContactForm}>
            <div className="contact-form-row">
              <label>
                Name
                <input type="text" name="name" placeholder="Dein Name" required />
              </label>

              <label>
                E-Mail
                <input type="email" name="email" placeholder="name@beispiel.de" required />
              </label>
            </div>

            <label>
              Worum geht es?
              <input type="text" name="subject" placeholder="Zum Beispiel: Vereins-App" required />
            </label>

            <label>
              Deine Nachricht
              <textarea name="message" rows="6" placeholder="Erzähl uns kurz von deiner Idee ..." required />
            </label>

            <button className="contact-submit" type="submit" disabled={sending}>
              {sending ? "Wird gesendet ..." : "Anfrage senden"}
            </button>

            {sendMessage && (
              <p className="contact-result">{sendMessage}</p>
            )}
          </form>
        </section>

      <footer>
        <strong>EasySchmiede</strong>
        <span>Software mit Ideen aus der Praxis.</span>
      </footer>
    </main>
  )
}

export default App
