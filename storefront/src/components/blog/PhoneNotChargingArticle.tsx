import Link from "next/link";

import styles from "./PhoneNotChargingArticle.module.css";

const symptoms = [
  {
    symptom: "Cable will not plug in fully",
    causes: "Packed lint or debris, a damaged connector, or an obstruction in the port.",
  },
  {
    symptom: "Cable feels loose",
    causes: "Debris stopping a full connection, a worn cable, or wear inside the charging port.",
  },
  {
    symptom: "Charging only works at an angle",
    causes: "A damaged cable, worn contacts, debris, or physical damage to the port.",
  },
  {
    symptom: "Charging keeps disconnecting",
    causes: "An unstable cable or adapter, port contamination, worn contacts, moisture, or an internal fault.",
  },
  {
    symptom: "Charging is very slow",
    causes: "An unsuitable charger, a damaged cable, heat, background use, debris, battery wear, or a charging-circuit fault.",
  },
  {
    symptom: "Moisture warning appears",
    causes: "Moisture or residue in the port or cable, or a connection that still needs inspection after drying.",
  },
  {
    symptom: "Wireless charging works but wired charging does not",
    causes: "A cable, adapter or wired charging-path problem, including the port. Diagnosis is still needed.",
  },
  {
    symptom: "Phone does not respond to any charger",
    causes: "A deeply discharged or failed battery, display problem, charging circuit fault, port damage, or another internal issue.",
  },
] as const;

const faqs = [
  {
    question: "Can a dirty charging port stop my phone from charging?",
    answer:
      "Yes. Compacted dust or lint can stop the connector from seating fully or making a stable electrical connection. The port should be inspected before replacement is recommended.",
  },
  {
    question: "Can a charging port be cleaned instead of replaced?",
    answer:
      "Sometimes. If debris is the cause and the contacts are not damaged, professional cleaning and testing may restore a reliable connection without a replacement part.",
  },
  {
    question: "How long does charging port repair take?",
    answer:
      "A standard repair on a common model often takes about 30–60 minutes when the fault is confirmed and the correct part is available. Liquid damage, board faults and complex models can take longer.",
  },
  {
    question: "Does charging port repair come with a warranty?",
    answer:
      "Eligible completed standard charging port repairs include Ali Mobile's 6-month parts and labour warranty, subject to the warranty terms and exclusions. Cleaning by itself is not a replacement-part repair.",
  },
  {
    question: "Why does my phone only charge at an angle?",
    answer:
      "The cable may be damaged, debris may be stopping it from seating properly, or the port contacts may be worn or damaged. Avoid forcing the cable and have the connection checked.",
  },
  {
    question: "Can I clean my charging port myself?",
    answer:
      "Limit home checks to looking for obvious external debris with the phone disconnected. Do not insert pins, metal tools, cotton buds or other objects into the port because the contacts are easy to damage.",
  },
  {
    question: "Why will my phone not charge after getting wet?",
    answer:
      "Many phones pause wired charging when they detect moisture. Disconnect the cable, stop charging and let the device dry according to the manufacturer's guidance. Ongoing warnings, heat or corrosion need professional assessment.",
  },
  {
    question: "Will charging port repair erase my data?",
    answer:
      "A standard charging port repair does not normally require the phone to be erased. Back up important data before any electronic repair where possible, because a broader device fault can change the repair path.",
  },
  {
    question: "Does a loose cable always mean the charging port is broken?",
    answer:
      "No. A worn cable or compacted lint can create the same symptom. Testing with a known-working compatible cable and inspecting the port helps separate these causes.",
  },
  {
    question: "Do you repair iPhone, Samsung, Google Pixel and OPPO charging ports?",
    answer:
      "Ali Mobile assesses charging faults on supported iPhone, Samsung, Google Pixel, OPPO and other phone models. Part availability, repair method and timing depend on the exact model and fault.",
  },
] as const;

export function PhoneNotChargingArticle() {
  return (
    <div className={styles.article}>
      <section className={styles.quickAnswer} aria-labelledby="quick-answer-heading">
        <div>
          <p className={styles.sectionLabel}>Quick answer</p>
          <h2 id="quick-answer-heading">Why is my phone not charging?</h2>
          <p>
            The most common causes are <strong>dust or lint in the port, a faulty cable or adapter,
            a worn charging port, moisture, battery wear, or another internal charging fault</strong>.
            A phone that will not charge does not automatically need a charging port replacement.
          </p>
        </div>
        <dl className={styles.answerFacts}>
          <div>
            <dt>First step</dt>
            <dd>Check and clean if suitable</dd>
          </div>
          <div>
            <dt>Typical repair</dt>
            <dd>About 30–60 minutes*</dd>
          </div>
          <div>
            <dt>Standard repair warranty</dt>
            <dd>6 months*</dd>
          </div>
        </dl>
        <p className={styles.qualifier}>
          *For many common models when the fault is confirmed and the part is available. Complex,
          liquid-related or board-level faults can take longer. Warranty terms and exclusions apply.
        </p>
      </section>

      <section aria-labelledby="repair-process-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>How Ali Mobile helps</p>
          <h2 id="repair-process-heading">How we fix phone charging problems</h2>
          <p>
            We start with the connection and work inward. This avoids replacing a charging port when
            a cable, contamination, moisture, battery or another component is the real cause.
          </p>
        </div>

        <ol className={styles.processList}>
          <li>
            <div className={styles.stepNumber} aria-hidden="true">1</div>
            <div>
              <h3>Professional charging port deep cleaning</h3>
              <p>
                We inspect the port and charging connection first. If cleaning is suitable, we use
                appropriate tools to remove compacted lint, dust and other debris while protecting the
                internal contacts. We then test the cable fit and charging stability again.
              </p>
              <p>
                If debris was the only problem, a replacement part may not be needed. Moisture,
                corrosion or liquid residue needs a safety assessment first; cleaning cannot resolve
                every liquid-related fault.
              </p>
            </div>
          </li>
          <li>
            <div className={styles.stepNumber} aria-hidden="true">2</div>
            <div>
              <h3>Charging port repair or replacement</h3>
              <p>
                If cleaning does not restore a reliable connection, we diagnose the charging path and
                recommend repair only after confirming the fault. A standard repair on many common
                models takes about 30–60 minutes when the correct part is in stock. Liquid damage,
                battery faults and board-level problems may need more time.
              </p>
              <p>
                Eligible completed standard charging port repairs include a 6-month parts and labour
                warranty, subject to the applicable terms and exclusions. Deep cleaning alone is not a
                replacement-part repair and should not be read as carrying that same parts warranty.
              </p>
              <Link href="/repairs/charging-port-replacement">
                View charging port repair options
              </Link>
            </div>
          </li>
        </ol>

        <div className={styles.processSummary} aria-label="Ali Mobile charging repair approach">
          <strong>Clean first</strong>
          <span aria-hidden="true">→</span>
          <strong>Repair if needed</strong>
          <span aria-hidden="true">→</span>
          <strong>6-month standard repair warranty</strong>
        </div>
      </section>

      <section aria-labelledby="symptom-table-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>Symptom guide</p>
          <h2 id="symptom-table-heading">What your charging symptom may mean</h2>
          <p>
            These are possible causes, not a final diagnosis. More than one fault can produce the same
            symptom.
          </p>
        </div>
        <div className={styles.tableFrame}>
          <table className={styles.symptomTable}>
            <caption>Common phone charging symptoms and possible causes</caption>
            <thead>
              <tr>
                <th scope="col">What you notice</th>
                <th scope="col">Possible causes</th>
              </tr>
            </thead>
            <tbody>
              {symptoms.map(({ symptom, causes }) => (
                <tr key={symptom}>
                  <th scope="row">{symptom}</th>
                  <td>{causes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="safe-checks-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>Before you book</p>
          <h2 id="safe-checks-heading">Safe checks to try before repair</h2>
        </div>
        <ol className={styles.checkList}>
          <li>Try a known-working, compatible charging cable.</li>
          <li>Test another compatible adapter and wall outlet.</li>
          <li>Check whether the connector fits securely without forcing it.</li>
          <li>Restart the phone if it is safe and still responsive.</li>
          <li>Give a deeply discharged battery time to respond with a working charger.</li>
        </ol>

        <aside className={styles.warning} aria-labelledby="charging-warning-heading">
          <div className={styles.warningMark} aria-hidden="true">!</div>
          <div>
            <h3 id="charging-warning-heading">Stop if there is heat, liquid or battery swelling</h3>
            <p>
              Do not insert a pin, metal tool or other object into the charging port. Stop charging if
              you see a liquid warning, unusual heat, a burnt or melted area, corrosion, smoke, or a
              swollen battery. Arrange professional assessment instead.
            </p>
            <p>
              Apple, Samsung and Google all advise against charging a wet device or putting objects
              into a moisture-affected port. Follow the manufacturer guidance for your phone before
              reconnecting a cable.
            </p>
          </div>
        </aside>
      </section>

      <section aria-labelledby="prevention-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>Prevention</p>
          <h2 id="prevention-heading">How to reduce charging port problems</h2>
        </div>
        <div className={styles.tipGrid}>
          <article>
            <h3>Protect the port in dusty work environments</h3>
            <p>
              Construction, landscaping and warehouse work can expose a phone to fine dust and lint.
              Consider a suitable protective case with a charging port cover, and check the cover does
              not force or distort the connector.
            </p>
          </article>
          <article>
            <h3>Act when the cable starts feeling loose</h3>
            <p>
              Do not keep forcing a difficult connector or bending the cable until charging starts.
              Early inspection can prevent debris from being compacted further and reduce the chance of
              damage to the internal contacts.
            </p>
          </article>
          <article>
            <h3>Keep charging dry and low-stress</h3>
            <p>
              Avoid charging while the port is wet. Use compatible, reliable accessories, pull from the
              connector rather than the cable, and avoid sharply bending the cable near the plug.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="professional-repair-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>Professional assessment</p>
          <h2 id="professional-repair-heading">When should you bring the phone in?</h2>
        </div>
        <p>
          Book an assessment if more than one known-working charger fails, the cable will not sit
          securely, charging works only at an angle, the port looks damaged, a moisture warning remains,
          or the phone becomes unusually hot. A phone that does not react to any charger may also need
          battery, display or board-level diagnosis.
        </p>
        <p>
          If the phone charges but the battery drains or shuts down quickly, compare the symptoms with
          our <Link href="/repairs/battery-replacement">battery replacement guidance</Link>. Liquid
          exposure needs a different assessment path; see our <Link href="/repairs/water-damage">water
          damage advice</Link>. You can also <Link href="/repairs/phone">browse phone repair options</Link>{" "}
          or <Link href="/book-repair">book a repair assessment</Link> for your exact model.
        </p>
      </section>

      <section aria-labelledby="faq-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>Frequently asked questions</p>
          <h2 id="faq-heading">Phone charging questions</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <aside className={styles.sources} aria-labelledby="sources-heading">
        <h2 id="sources-heading">Safety and troubleshooting sources</h2>
        <p>
          Technical guidance was checked against official support information from{` `}
          <a href="https://support.apple.com/en-au/108805">Apple</a>,{` `}
          <a href="https://www.samsung.com/au/support/mobile-devices/what-to-do-if-your-samsung-galaxy-device-is-not-charging/">
            Samsung Australia
          </a>{` `}
          and <a href="https://support.google.com/pixelphone/answer/7167687?hl=en">Google Pixel Help</a>.
          Menus and charging behaviour vary by model and software version.
        </p>
        <p>
          Ali Mobile &amp; Repair is an independent repair business and is not affiliated with or
          endorsed by Apple, Samsung, Google or OPPO.
        </p>
      </aside>
    </div>
  );
}
