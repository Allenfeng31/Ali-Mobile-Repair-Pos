import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Battery,
  CheckCircle2,
  Clock3,
  Languages,
  MapPin,
  MessageCircle,
  Navigation,
  PhoneCall,
  PlugZap,
  ShieldCheck,
  Smartphone,
  TabletSmartphone,
  Wrench,
} from "lucide-react";

import styles from "./page.module.css";

const canonicalUrl = "https://www.alimobile.com.au/zh/phone-repair-melbourne-east";
const directionsHref =
  "https://www.google.com/maps/dir/?api=1&destination=Ringwood+Square+Shopping+Centre+Kiosk+C1,+Seymour+St,+Ringwood+VIC+3134";

export const metadata: Metadata = {
  title: "墨尔本东区中文手机维修服务 | Ringwood | Ali Mobile & Repair",
  description:
    "Ali Mobile & Repair 在 Ringwood Square Shopping Centre Kiosk C1 提供普通话及粤语沟通的手机、iPhone、三星、iPad、MacBook 和手表维修咨询。可先电话确认机型、零件和预计时间。",
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "墨尔本东区中文手机维修服务 | Ringwood | Ali Mobile & Repair",
    description:
      "在 Ringwood Square Shopping Centre Kiosk C1 使用普通话或粤语咨询手机、iPad、MacBook 和手表维修选项、零件和预计时间。",
    url: canonicalUrl,
    type: "website",
    locale: "zh_CN",
    siteName: "Ali Mobile & Repair",
  },
};

const serviceCards = [
  {
    title: "iPhone 换屏与显示问题",
    text: "针对屏幕破裂、显示线条、触控异常或黑屏等情况，先检查机型和屏幕状态，再说明可选方案。",
    href: "/repairs/phone/iphone/iphone-15-pro-max/screen-replacement",
    Icon: Smartphone,
  },
  {
    title: "iPhone 电池更换",
    text: "适合电池耗电快、自动关机、电池膨胀或健康度下降等情况，维修前会确认机型和电池选择。",
    href: "/repairs/phone/iphone/iphone-13/battery-replacement",
    Icon: Battery,
  },
  {
    title: "手机充电口检测与维修",
    text: "先检查是否为灰尘、线材、接口松动或零件损坏，避免在未确认原因前直接更换零件。",
    href: "/repairs/phone/samsung/galaxy-s22/charging-port-replacement",
    Icon: PlugZap,
  },
  {
    title: "iPhone 后盖玻璃维修",
    text: "检查后盖玻璃、边框、摄像头圈和无线充电相关区域，再确认维修范围和预计时间。",
    href: "/repairs/phone/iphone/iphone-15/back-glass-replacement",
    Icon: ShieldCheck,
  },
  {
    title: "三星手机维修",
    text: "可咨询三星 Galaxy 系列屏幕、电池、充电口和相机相关问题，具体支持情况以检测和零件为准。",
    href: "/repairs/phone/samsung",
    Icon: Smartphone,
  },
  {
    title: "iPad 与平板维修",
    text: "处理 iPad 和平板屏幕、触控、充电和电池问题，维修前会说明适合的零件路径。",
    href: "/repairs/tablet/ipad",
    Icon: TabletSmartphone,
  },
  {
    title: "MacBook 与笔记本电脑维修",
    text: "可咨询 MacBook 屏幕、电池、键盘、充电和基础检测。复杂问题需要现场检查后确认。",
    href: "/repairs/laptop/macbook",
    Icon: Wrench,
  },
  {
    title: "Apple Watch 与智能手表维修",
    text: "支持手表屏幕、电池和常见外观损坏咨询，具体维修方式取决于型号和零件状态。",
    href: "/repairs/watch/apple",
    Icon: Clock3,
  },
];

const processSteps = [
  {
    title: "说明设备型号和故障情况",
    text: "可使用普通话或粤语描述设备型号、摔落情况、进水历史、间歇性问题或之前维修记录。",
  },
  {
    title: "进行初步检测",
    text: "我们会先检查可见损坏、充电反应、屏幕触控、电池表现和其他与故障相关的功能。",
  },
  {
    title: "说明维修方案、零件和价格",
    text: "在开始维修前说明可能的维修路径、零件选择、价格范围、保修条件和预计时间。",
  },
  {
    title: "客户确认后开始维修",
    text: "维修工作只会在客户确认维修方案和价格后开始，不会在未说明清楚前直接处理。",
  },
  {
    title: "维修完成后进行功能测试",
    text: "交机前会根据维修项目检查主要功能，例如触控、显示、充电、相机或基础使用表现。",
  },
];

const communicationBenefits = [
  "更准确说明间歇性故障，例如偶尔不能充电、屏幕时好时坏或电池突然掉电。",
  "当面比较不同零件选择，理解价格、显示效果、保修条件和适用范围。",
  "维修前确认价格和预计时间，避免到店后才发现零件或时间不适合。",
  "取机时可以现场测试设备，并直接询问维修后的使用注意事项。",
];

const faqs = [
  {
    question: "是否提供普通话或粤语服务？",
    answer:
      "可以。客户可以使用普通话或粤语沟通设备故障、维修选择、零件、价格和预计时间。如希望确认当时的语言服务安排，建议来店前先致电咨询。",
  },
  {
    question: "门店在哪里？",
    answer:
      "Ali Mobile & Repair 位于 Ringwood Square Shopping Centre 内的 Kiosk C1，正对 Bunnings 入口。地址是 Kiosk C1, Ringwood Square Shopping Centre, Seymour Street, Ringwood VIC 3134。",
  },
  {
    question: "Box Hill、Glen Waverley 或 Doncaster 有分店吗？",
    answer:
      "没有。我们在 Box Hill、Glen Waverley、Doncaster、Burwood、Blackburn 或其他地区没有分店，所有到店维修均在 Ringwood Square 的 Kiosk C1 进行。",
  },
  {
    question: "维修需要预约吗？",
    answer:
      "通常可以直接到店咨询，但在线预约有助于我们提前查看机型、零件和时间安排。较远地区客户建议来店前先致电确认。",
  },
  {
    question: "可以先确认零件和维修时间吗？",
    answer:
      "可以。请准备好设备型号和故障情况，我们可以先帮你确认可能的零件库存、维修选择和预计时间，再决定是否到店。",
  },
  {
    question: "iPhone 换屏或换电池需要多久？",
    answer:
      "许多常见的手机换屏和电池更换，在正式开始维修后通常可能在约 15–45 分钟内完成。实际时间会根据设备型号、故障情况、零件库存和所需测试而不同，我们会在检查后说明预计时间。",
  },
  {
    question: "是否维修三星、iPad、MacBook 和手表？",
    answer:
      "可以咨询。我们处理手机、平板、MacBook、笔记本电脑和智能手表相关维修问题，但具体型号、故障和零件支持需要检查后确认。",
  },
  {
    question: "维修前会先报价吗？",
    answer:
      "会。我们会先说明检测结果、维修方案、零件选择、价格和预计时间，客户确认后才开始维修。",
  },
  {
    question: "维修会删除手机里的资料吗？",
    answer:
      "一般硬件维修不会主动清除设备资料，但任何维修都有风险，建议客户在维修前尽可能完成备份。涉及系统、主板、严重损坏或无法开机的设备时，情况可能不同。",
  },
  {
    question: "维修后可以恢复防水吗？",
    answer:
      "设备一旦打开或维修后，原厂防水能力不能保证恢复。我们会按维修项目进行必要检查，但不会承诺维修后恢复原厂防水状态。",
  },
  {
    question: "维修保修如何计算？",
    answer:
      "保修范围会根据维修项目和所选择的零件而不同，我们会在交机前说明适用的保修条件。",
  },
];

const internalLinks = [
  { label: "查看 iPhone 维修服务", href: "/repairs/phone/iphone" },
  { label: "查看三星手机维修", href: "/repairs/phone/samsung" },
  { label: "查看 iPad 维修", href: "/repairs/tablet/ipad" },
  { label: "查看 MacBook 维修", href: "/repairs/laptop/macbook" },
  { label: "在线预约维修", href: "/book-repair" },
  { label: "联系我们", href: "/about-us" },
];

export default function ChineseRepairHubPage() {
  return (
    <div className={styles.page} lang="zh-Hans">
      <nav className={styles.breadcrumb} aria-label="面包屑导航">
        <Link href="/">首页</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">中文手机维修</span>
      </nav>

      <section className={styles.hero} aria-labelledby="chinese-repair-heading">
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>
            <Languages size={16} strokeWidth={2.5} aria-hidden="true" />
            普通话及粤语沟通
          </span>
          <h1 id="chinese-repair-heading">墨尔本东区中文手机维修服务</h1>
          <p className={styles.heroIntro}>
            Ali Mobile & Repair 在 Ringwood Square Shopping Centre 提供普通话及粤语沟通的手机、平板、MacBook 和智能手表维修服务。我们会在维修前说明检测结果、维修选择、零件情况、价格和预计时间。
          </p>
          <div className={styles.heroActions} aria-label="主要操作">
            <Link href="/book-repair" className={styles.primaryAction}>
              预约维修
              <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
            </Link>
            <a href="tel:0481058514" className={styles.secondaryAction}>
              <PhoneCall size={17} strokeWidth={2.6} aria-hidden="true" />
              致电咨询
            </a>
            <a href={directionsHref} className={styles.secondaryAction} target="_blank" rel="noopener noreferrer">
              <Navigation size={17} strokeWidth={2.6} aria-hidden="true" />
              查看路线
            </a>
          </div>
        </div>

        <aside className={styles.heroPanel} aria-label="门店信息">
          <div className={styles.storeBadge}>Ringwood 实体门店</div>
          <h2>到店前可先确认机型、零件和时间</h2>
          <p>我们只有一个实体维修点：Ringwood Square Shopping Centre 内 Kiosk C1。</p>
          <div className={styles.storeDetails}>
            <MapPin size={20} strokeWidth={2.5} aria-hidden="true" />
            <address>
              Ali Mobile & Repair
              <br />
              Kiosk C1, Ringwood Square Shopping Centre
              <br />
              Seymour Street, Ringwood VIC 3134
            </address>
          </div>
        </aside>
      </section>

      <section className={styles.trustStrip} aria-label="中文沟通服务说明">
        <div>
          <strong>我们提供普通话及粤语沟通服务。</strong>
          <span>如需普通话或粤语服务，建议来店前先致电确认。</span>
        </div>
        <div>
          <strong>维修前先说明清楚。</strong>
          <span>检测结果、维修方案、零件选择、价格、保修条件和预计时间都会在开始前说明。</span>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="language-service-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>中文沟通</span>
          <h2 id="language-service-heading">维修问题，可以用中文说明</h2>
          <p>
            客户可以使用普通话或粤语说明设备故障，并了解检测结果、维修方案、零件选择、价格、保修条件和预计时间。
          </p>
        </div>
        <div className={styles.communicationGrid}>
          {[
            "设备症状和间歇性故障",
            "维修选项和替换零件选择",
            "价格、保修条件和预计时间",
            "维修完成后的功能测试",
          ].map((item) => (
            <div key={item} className={styles.miniPoint}>
              <CheckCircle2 size={18} strokeWidth={2.7} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="repair-services-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>维修服务</span>
          <h2 id="repair-services-heading">常见维修咨询</h2>
          <p>以下链接均指向现有维修页面。具体型号、零件、价格和维修时间以现场检测及库存确认为准。</p>
        </div>
        <div className={styles.serviceGrid}>
          {serviceCards.map(({ title, text, href, Icon }) => (
            <Link key={title} href={href} className={styles.serviceCard}>
              <Icon size={22} strokeWidth={2.5} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
              <span>
                查看相关服务
                <ArrowRight size={15} strokeWidth={2.7} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.processSection} aria-labelledby="repair-process-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>维修流程</span>
          <h2 id="repair-process-heading">维修流程</h2>
          <p>我们先确认问题和维修范围，再由客户决定是否开始。不是每个故障都能立即判断，也不是每台设备都一定可以修复。</p>
        </div>
        <div className={styles.steps}>
          {processSteps.map((step, index) => (
            <article key={step.title} className={styles.stepCard}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.splitSection} aria-labelledby="timing-parts-heading">
        <div className={styles.infoPanel}>
          <span className={styles.kicker}>时间与零件</span>
          <h2 id="timing-parts-heading">维修时间与零件确认</h2>
          <p>
            许多常见的手机换屏和电池更换，在正式开始维修后通常可能在约 15–45 分钟内完成。实际时间会根据设备型号、故障情况、零件库存和所需测试而不同，我们会在检查后说明预计时间。
          </p>
          <p>
            部分机型的零件需要提前确认或预订，较远地区的客户可以在出发前先致电查询。
          </p>
        </div>
        <div className={styles.notePanel}>
          <h3>以下情况不会套用 15–45 分钟估计</h3>
          <ul>
            <li>进水、主板或不开机问题</li>
            <li>数据恢复或复杂诊断</li>
            <li>MacBook 上盖及键盘总成等大型维修</li>
            <li>需要订购零件或进一步测试的维修</li>
          </ul>
        </div>
      </section>

      <section className={styles.locationSection} aria-labelledby="store-location-heading">
        <div>
          <span className={styles.kicker}>实体门店</span>
          <h2 id="store-location-heading">门店位置</h2>
          <p>门店位于 Ringwood Square Shopping Centre 内的 Kiosk C1，正对 Bunnings 入口。</p>
          <p>
            我们在 Box Hill、Glen Waverley、Doncaster、Burwood、Blackburn 或其他地区没有分店，所有到店维修均在 Ringwood Square 的 Kiosk C1 进行。
          </p>
        </div>
        <address className={styles.addressCard}>
          <strong>Ali Mobile & Repair</strong>
          <span>Kiosk C1, Ringwood Square Shopping Centre</span>
          <span>Seymour Street, Ringwood VIC 3134</span>
          <a href={directionsHref} target="_blank" rel="noopener noreferrer">
            查看 Google 路线
            <Navigation size={16} strokeWidth={2.7} aria-hidden="true" />
          </a>
        </address>
      </section>

      <section className={styles.section} aria-labelledby="face-to-face-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>面对面说明</span>
          <h2 id="face-to-face-heading">为什么选择面对面中文沟通</h2>
          <p>维修不只是更换零件。清楚说明故障、价格、零件和测试结果，可以帮助客户做出更安心的决定。</p>
        </div>
        <div className={styles.benefitList}>
          {communicationBenefits.map((benefit) => (
            <div key={benefit} className={styles.benefitItem}>
              <MessageCircle size={18} strokeWidth={2.5} aria-hidden="true" />
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="chinese-faq-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>常见问题</span>
          <h2 id="chinese-faq-heading">中文维修服务 FAQ</h2>
          <p>以下回答尽量保持实际、清楚。具体维修结果仍需要根据设备型号、故障和检测情况确认。</p>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.question} className={styles.faqItem}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-chinese-cta-heading">
        <div>
          <span className={styles.kicker}>来店前确认</span>
          <h2 id="final-chinese-cta-heading">先确认机型、零件和预计时间，再决定是否到店</h2>
          <p>
            如果你准备从其他区或郊区前来，建议先致电说明设备型号和故障情况。我们会尽量帮你确认维修选择、零件和预计时间。
          </p>
        </div>
        <div className={styles.finalActions}>
          <Link href="/book-repair" className={styles.primaryAction}>
            在线预约维修
          </Link>
          <a href="tel:0481058514" className={styles.secondaryAction}>
            电话咨询
          </a>
          <a href={directionsHref} className={styles.secondaryAction} target="_blank" rel="noopener noreferrer">
            查看路线
          </a>
        </div>
      </section>

      <section className={styles.internalLinks} aria-labelledby="related-links-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>相关链接</span>
          <h2 id="related-links-heading">继续查看维修服务</h2>
        </div>
        <div className={styles.linkGrid}>
          {internalLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
              <ArrowRight size={15} strokeWidth={2.7} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
