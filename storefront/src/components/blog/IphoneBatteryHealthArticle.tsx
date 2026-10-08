import Link from "next/link";

import styles from "./IphoneBatteryHealthArticle.module.css";

const compatibility = [
  { generation: "iPhone 12", official: "Yes", workshop: "Yes" },
  { generation: "iPhone 13", official: "Yes", workshop: "Yes" },
  { generation: "iPhone 14", official: "Yes", workshop: "Yes" },
  { generation: "iPhone 15", official: "Yes", workshop: "Yes" },
  { generation: "iPhone 16", official: "Yes", workshop: "Yes" },
  { generation: "iPhone 17", official: "Yes", workshop: "Yes" },
  { generation: "iPhone SE (3rd generation)", official: "Yes", workshop: "Not claimed" },
  { generation: "iPhone 11 and earlier / older SE", official: "No battery support listed", workshop: "Not claimed" },
  { generation: "iPhone 18 and later", official: "Yes (iPhone 16 and later)", workshop: "Not claimed" },
] as const;

export function IphoneBatteryHealthArticle() {
  return (
    <>
      <p>
        You do not need to wait for exactly 80% Battery Health to replace an iPhone battery. The better question is whether the phone still lasts long enough for you, whether it shuts down unexpectedly, and whether another fault could explain the drain. A swollen battery needs prompt professional assessment regardless of the percentage.
      </p>

      <h2>When is replacement worth considering?</h2>
      <p>
        <strong>80% is a useful benchmark, not an automatic on/off switch.</strong> An iPhone showing 84% Maximum Capacity but needing three charges a day may be a reasonable replacement candidate. Someone near 79–80% whose phone still comfortably meets their needs need not feel rushed by the number alone. Do take an Apple service recommendation seriously, and weigh it alongside real-world battery life, unexpected shutdowns, abnormal drain, heat and device condition.
      </p>

      <h2>What does Apple&apos;s 80% figure mean?</h2>
      <p>
        <a href="https://support.apple.com/en-au/106348">Apple describes batteries as consumable components</a>. Under ideal conditions, iPhone 14 and earlier batteries are designed to retain 80% of original capacity after 500 complete charge cycles; iPhone 15 and later batteries are designed to retain 80% after 1,000 complete cycles. Actual capacity depends on use and charging. These are design benchmarks, not an instruction that every phone must have its battery replaced at 80%. iPhone 15 and later can also display cycle count and additional battery information.
      </p>

      <h2>What can improve after a battery replacement?</h2>
      <p>
        <strong>The main expected improvement is battery runtime.</strong> Apple also documents that battery ageing can affect performance, so a phone with a severely degraded battery may feel more responsive after replacement. A new battery is not a general speed upgrade, and we cannot promise a performance gain for every phone.
      </p>

      <h2>What does Apple Repair Assistant actually do?</h2>
      <p>
        <a href="https://support.apple.com/en-au/120579">Apple says Repair Assistant</a> installs calibration data after a part replacement to finish the repair. On supported phones, the current process calls for the latest supported iOS, Wi-Fi, more than 20% charge, then Settings → General → About → Parts &amp; Service History → Restart &amp; Finish Repair. This is calibration/configuration, not a diagnosis of why the old battery drained or whether every other part in the phone works.
      </p>
      <p>
        <strong>Completing Apple Repair Assistant configuration does not mean Apple certified, approved or endorsed an aftermarket replacement battery.</strong> It reports a configuration outcome, not an Apple affiliation or a blanket quality verdict.
      </p>

      <h2>Which iPhones support battery Repair Assistant?</h2>
      <p>
        <strong>Apple&apos;s support list and our workshop experience answer different questions.</strong> The Apple column below follows its current <a href="https://support.apple.com/en-au/120579">Repair Assistant support page</a>; the other column covers only configurations Ali Mobile has completed with the specific replacement batteries we currently use. “Not claimed” does not mean a model cannot be repaired.
      </p>
      <div className={styles.tableScroll} tabIndex={0} aria-label="Battery Repair Assistant compatibility table">
        <table className={styles.table}>
          <caption>Battery Repair Assistant: Apple support versus Ali Mobile workshop-tested experience</caption>
          <thead>
            <tr>
              <th scope="col">iPhone generation</th>
              <th scope="col">Apple supports Battery Repair Assistant</th>
              <th scope="col">Ali Mobile workshop-tested with current replacement setup</th>
            </tr>
          </thead>
          <tbody>
            {compatibility.map(({ generation, official, workshop }) => (
              <tr key={generation}>
                <th scope="row">{generation}</th>
                <td>{official}</td>
                <td>{workshop}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Can an aftermarket battery complete Repair Assistant configuration?</h2>
      <p>
        <strong>Yes, with the specific replacement batteries we currently use, we have successfully completed Repair Assistant configuration on iPhone 12 through iPhone 17 repairs.</strong> This is Ali Mobile workshop experience, not an Apple claim about every aftermarket battery or a promise that configuration will succeed on every device.
      </p>

      <h2>What might Battery Health and Parts &amp; Service History show?</h2>
      <p>
        <strong>Look at the phone&apos;s actual display; do not treat one label as the whole diagnosis.</strong> In repairs we have completed with our current replacement setup, we have observed Battery Health displaying normally, including 100% Maximum Capacity in successful results. On tested iPhone 15-series and later devices, iOS has reported 100% Maximum Capacity and 0 cycles after successful configuration. These device-reported workshop observations are not a guarantee for every repair or future iOS version.
      </p>
      <p>
        <a href="https://support.apple.com/en-us/102658">Apple&apos;s Parts &amp; Service History guide</a> explains the system labels: <strong>Genuine</strong> means the repair was completed using genuine Apple parts and processes; <strong>Used</strong> means a part was already used or installed in another iPhone; <strong>Unknown</strong> can have several causes, including a nongenuine part, a part not working as expected, one not verified or linked, or a modified or unverifiable part; and <strong>Finish Repair</strong> means applicable repair configuration has not yet been completed. Apple also explains why <a href="https://support.apple.com/en-gb/103269">battery-health information for an unverified battery</a> may not be accurate.
      </p>
      <p>
        In repairs we have completed with our current replacement battery setup, iOS has displayed <strong>Used</strong> after successful Repair Assistant configuration. We report the status as shown by iOS, not as our own definition or proof of the replacement cell&apos;s origin, age or quality. Equally, Unknown alone does not establish why a part received that label.
      </p>

      <h2>Why can Repair Assistant configuration fail?</h2>
      <p>
        <strong>A failed configuration does not automatically prove the new battery is faulty.</strong> In our workshop testing, we have completed screen-and-battery repairs where both parts configured successfully. In another repair, the battery was normally capable of configuration, but the newly replaced screen could not complete it and both configurations then failed. In a separate case, a non-configurable third-party display had been fitted about a month earlier, yet a later compatible battery replacement did complete configuration.
      </p>
      <p>
        The configuration state and history of other repaired parts can be worth checking, but we do not yet have enough repeat cases to treat either outcome as a fixed rule or to claim a mechanism. It is one diagnostic consideration, not a reason to assume a particular screen always blocks a battery.
      </p>

      <h2>What do we check before replacing the battery?</h2>
      <p>
        <strong>We check the symptom before deciding the battery is the fault.</strong> Short runtime can also involve software or background activity, charging problems, unusual heat, liquid damage, board-level issues or another device fault. Battery Health, charge frequency, shutdown behaviour and the phone&apos;s condition help guide assessment; a replacement part is not the right answer to every drain complaint.
      </p>

      <h2>What if the battery is swollen?</h2>
      <p>
        <strong>Do not wait for a Battery Health threshold.</strong> Stop normal use, avoid charging or using the phone unnecessarily, and arrange professional assessment or replacement promptly. Swelling takes priority over the percentage shown in Settings.
      </p>

      <h2>Practical questions before a battery repair</h2>
      <h3>Will replacing the battery erase my data?</h3>
      <p>A normal battery replacement does not usually require the iPhone to be erased, but we still recommend having a current backup before any electronic-device repair.</p>

      <h3>Will the phone keep its factory water resistance?</h3>
      <p>We reinstall the appropriate adhesive as part of the repair, but an opened device cannot be promised to retain the same factory water-resistance rating.</p>

      <h3>How long does it take, and is there a warranty?</h3>
      <p>
        Standard iPhone battery replacement takes <strong>around 30 minutes</strong>, depending on the model, condition, parts and current workload. Ali Mobile&apos;s standard repair warranty for this service is <strong>6 months</strong>, subject to the applicable warranty terms. This is in addition to rights that may apply under the <a href="https://www.accc.gov.au/consumers/buying-products-and-services/warranties">Australian Consumer Law</a>.
      </p>

      <h2>Need advice about your iPhone?</h2>
      <p>
        If battery life has become disruptive, start with our <Link href="/repairs/battery-replacement">battery replacement service</Link> and choose your model for current repair information. Ali Mobile can assess your iPhone at our Ringwood workshop before you decide whether a battery replacement makes sense.
      </p>
      <p><small>Ali Mobile is an independent repair business and is not affiliated with or endorsed by Apple. Apple and iPhone are trademarks of Apple Inc.</small></p>
    </>
  );
}
