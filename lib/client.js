window.__ModuleLoader__.load({
  id: '@ddtcorex/dsh-maestro-dashboard',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require("react");
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var React4 = __toESM(require("react"), 1);

// src/client/components/BrandMark.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function MaestroMark(props) {
  const s = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: s, height: s, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2 11 L5 4 L8 9 L11 4 L14 11", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function BrandBadge(props) {
  const outer = props.outer ?? 28;
  const size = props.size ?? 16;
  const radius = props.radius ?? 8;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      "data-maestro-logo": true,
      style: {
        width: outer,
        height: outer,
        borderRadius: radius,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        // Fixed brand blue — stays visible on both light (bg-base #fff) and dark (bg-base #121212)
        // var(--dsw-alias-brand-primary) can resolve to near-white on some dark tokens, so we pin a fallback
        background: "var(--dsw-alias-brand-primary, #0A84FF)",
        backgroundColor: "#0A84FF",
        color: "#fff",
        flex: "none",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 0 0 1px var(--dsw-alias-border-l1)",
        boxSizing: "border-box"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaestroMark, { size })
    }
  );
}

// src/client/trigger.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var dotColor = {
  ok: "var(--dsw-alias-state-success-primary)",
  warn: "var(--dsw-alias-state-warn-primary)",
  error: "var(--dsw-alias-state-error-primary)"
};
function MaestroTrigger(props) {
  const health = props.health ?? "ok";
  const collapsed = props.collapsed ?? props.wide === false;
  const isRail = collapsed;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "button",
    {
      type: "button",
      "data-maestro-trigger": "",
      onClick: props.onClick,
      style: {
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: isRail ? 0 : "8px",
        width: isRail ? "36px" : "calc(100% + 4px)",
        height: isRail ? "36px" : "42px",
        margin: isRail ? "8px 0 10px" : "4px -2px",
        padding: isRail ? 0 : "0 10px 0 8px",
        boxSizing: "border-box",
        border: "none",
        borderRadius: isRail ? "50%" : "12px",
        background: "transparent",
        cursor: "pointer",
        overflow: "hidden",
        color: "var(--dsw-alias-label-primary)",
        fontFamily: "inherit",
        fontSize: "14px",
        lineHeight: "22px",
        justifyContent: isRail ? "center" : "flex-start"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
      "aria-label": "Maestro Dashboard",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(BrandBadge, { outer: 20, size: 14, radius: 6 }),
        !isRail && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { flex: 1, textAlign: "left", overflow: "hidden", whiteSpace: "nowrap" }, children: "Maestro" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "span",
            {
              "data-testid": "health-dot",
              style: {
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: dotColor[health],
                flex: "none"
              }
            }
          )
        ] })
      ]
    }
  );
}

// src/client/overlay.tsx
var React3 = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");

// src/client/components/HeroKpi.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function StatusDot({ status }) {
  const bg = status === "ok" ? "var(--dsw-alias-state-success-primary)" : status === "warn" ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-state-error-primary)";
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": true, style: { width: 8, height: 8, borderRadius: 999, background: bg, flex: "none", display: "inline-block" } });
}
function KpiIcon({ id }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" };
  if (id === "tunnel") return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("svg", { ...common, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M2 8a6 6 0 0 1 12 0M5 8a3 3 0 0 1 6 0", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "1.5", fill: "currentColor" })
  ] });
  if (id === "review") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M3 3h10v8H6l-3 3V3z", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round" }) });
  if (id === "govard") return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("svg", { ...common, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("rect", { x: "3", y: "3", width: "10", height: "10", rx: "2", stroke: "currentColor", strokeWidth: "1.2" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M6 8h4M8 6v4", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 3l6 4-6 4-6-4 6-4zM2 11l6 3 6-3", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round" }) });
}
function HeroKpi(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      style: {
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))"
      },
      "data-kpi-grid": true,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("style", { children: `
        @media (max-width: 1024px) { [data-kpi-grid] { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 640px) { [data-kpi-grid] { grid-template-columns: 1fr !important; } }
      ` }),
        props.kpis.map((k) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            "data-testid": "kpi",
            style: {
              border: "1px solid var(--dsw-alias-border-l2)",
              borderRadius: 16,
              background: "var(--dsw-alias-bg-layer-1)",
              padding: "14px 14px 12px",
              display: "grid",
              gap: 8,
              minWidth: 0,
              transition: "background 200ms ease, border-color 200ms ease, transform 150ms ease",
              cursor: "default"
            },
            onMouseEnter: (e) => {
              const el = e.currentTarget;
              el.style.background = "var(--dsw-alias-bg-layer-2)";
              el.style.borderColor = "var(--dsw-alias-border-l3)";
            },
            onMouseLeave: (e) => {
              const el = e.currentTarget;
              el.style.background = "var(--dsw-alias-bg-layer-1)";
              el.style.borderColor = "var(--dsw-alias-border-l2)";
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "span",
                  {
                    style: {
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--dsw-alias-bg-base)",
                      border: "1px solid var(--dsw-alias-border-l1)",
                      color: "var(--dsw-alias-label-secondary)",
                      flex: "none"
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(KpiIcon, { id: k.id })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(StatusDot, { status: k.status })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", letterSpacing: ".02em" }, children: k.label }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { font: "var(--dsw-font-markdown-h3)", color: "var(--dsw-alias-label-primary)", lineHeight: "1.2", wordBreak: "break-word" }, children: k.value }),
              k.sub && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: k.sub })
            ]
          },
          k.id
        ))
      ]
    }
  );
}

// src/client/components/Heatmap.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function Heatmap(props) {
  const max = Math.max(1, ...props.data.map((d) => d.count));
  const weeks = 53;
  const days = 7;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      style: { display: "grid", gap: 8, minWidth: 0, width: "100%" },
      role: "img",
      "aria-label": `Activity heatmap, ${props.data.length} days`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("style", { children: `
        [data-heatmap] { gap: 3px; }
        @media (max-width: 640px) { [data-heatmap] { gap: 2px !important; } [data-heatmap] [data-heatmap-cell] { border-radius: 2px !important; } }
        @media (max-width: 390px) { [data-heatmap] { gap: 1.5px !important; } }
      ` }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "div",
          {
            "data-heatmap": true,
            style: {
              display: "grid",
              gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${days}, minmax(0, 1fr))`,
              gap: 3,
              gridAutoFlow: "column",
              width: "100%",
              maxWidth: "100%"
            },
            children: props.data.map((d) => {
              const level = d.count === 0 ? 0 : d.count / max;
              const opacity = level === 0 ? 0.06 : 0.18 + 0.82 * level;
              const bg = level === 0 ? "var(--dsw-alias-bg-layer-2)" : "var(--dsw-alias-state-success-primary)";
              return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                "span",
                {
                  role: "gridcell",
                  tabIndex: 0,
                  "aria-label": `${d.date}: ${d.count} sessions`,
                  title: `${d.date}: ${d.count}`,
                  "data-heatmap-cell": true,
                  style: {
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 3,
                    background: bg,
                    opacity: level === 0 ? 1 : opacity,
                    border: "1px solid var(--dsw-alias-border-l1)",
                    display: "block",
                    outline: "none",
                    minWidth: 0,
                    minHeight: 0
                  },
                  onFocus: (e) => e.currentTarget.style.boxShadow = "0 0 0 2px var(--dsw-alias-border-l3)",
                  onBlur: (e) => e.currentTarget.style.boxShadow = "none"
                },
                d.date
              );
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 6, font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "Less" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { display: "inline-flex", gap: 3 }, children: [0, 0.25, 0.5, 0.75, 1].map((o) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { width: 10, height: 10, borderRadius: 2, background: "var(--dsw-alias-state-success-primary)", opacity: o === 0 ? 0.08 : 0.18 + 0.82 * o, border: "1px solid var(--dsw-alias-border-l1)", display: "inline-block" } }, o)) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "More" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { marginLeft: "auto", opacity: 0.8 }, children: [
            props.data.filter((d) => d.count > 0).length,
            " active days"
          ] })
        ] })
      ]
    }
  );
}

// src/client/components/Sparkline.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function Sparkline(props) {
  if (!props.data.length) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: "No data" });
  const max = Math.max(...props.data);
  const min = Math.min(...props.data);
  const range = max - min || 1;
  const w = props.width ?? 280;
  const h = props.height ?? 48;
  const pad = 4;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const points = props.data.map((v, i) => {
    const x = pad + i / Math.max(1, props.data.length - 1) * innerW;
    const y = pad + innerH - (v - min) / range * innerH;
    return `${x},${y}`;
  }).join(" ");
  const area = `${pad},${pad + innerH} ${points} ${pad + innerW},${pad + innerH}`;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "svg",
    {
      role: "img",
      "aria-label": `Sparkline ${props.data.length} points`,
      width: "100%",
      height: h,
      viewBox: `0 0 ${w} ${h}`,
      style: { display: "block", maxWidth: "100%" },
      preserveAspectRatio: "none",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("polygon", { points: area, fill: "var(--dsw-alias-brand-primary)", opacity: 0.08 }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("polyline", { points, stroke: "var(--dsw-alias-brand-primary)", strokeWidth: "1.6", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
        props.data.map((_, i) => {
          if (props.data.length > 30 && i % Math.ceil(props.data.length / 8) !== 0) return null;
          const x = pad + i / Math.max(1, props.data.length - 1) * innerW;
          const val = props.data[i] ?? 0;
          return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: x, cy: pad + innerH - (val - min) / range * innerH, r: 2, fill: "var(--dsw-alias-bg-base)", stroke: "var(--dsw-alias-brand-primary)", strokeWidth: 1.2 }, i);
        })
      ]
    }
  );
}

// src/client/tabs/OverviewTab.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function formatTime(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}
function formatDuration(ms) {
  if (!ms || ms <= 0) return "-";
  const s = Math.round(ms / 1e3);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}
function OverviewTab(props) {
  const kpis = props.snapshot?.data?.kpis ?? [
    { id: "tunnel", label: "Tunnel", value: "ok", status: "ok" },
    { id: "review", label: "Review", value: "0 queued", status: "ok" },
    { id: "govard", label: "Govard", value: "ok", status: "ok" },
    { id: "notifier", label: "Notifier", value: "ok", status: "ok" }
  ];
  const heatmap = props.snapshot?.data?.heatmap ?? Array.from({ length: 53 * 7 }, (_, i) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - (53 * 7 - 1 - i));
    return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 3) };
  });
  const usageData = props.usage?.data;
  const totals = usageData?.totals ?? { cost: 0, tokens: 0, requests: 0 };
  const daily = usageData?.daily ?? [];
  const tunnel = props.snapshot?.data?.tunnel;
  const reviews = props.reviewsSnapshot?.data?.reviews ?? [];
  const gitlabBaseUrl = props.reviewsSnapshot?.data?.gitlabBaseUrl ?? "https://git.sutunam.com";
  const recentReviews = reviews.slice(0, 3);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "grid", gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(HeroKpi, { kpis: kpis.map((k) => ({ ...k, sub: k.id === "tunnel" ? tunnel?.hostname ?? k.value : void 0 })) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "grid", gap: 12, gridTemplateColumns: "1.2fr .8fr" }, "data-bento": "heatmap-trend", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("style", { children: `@media (max-width: 1024px) { [data-bento="heatmap-trend"] { grid-template-columns: 1fr !important; } }` }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 16, background: "var(--dsw-alias-bg-layer-1)", padding: 16, display: "grid", gap: 12, minWidth: 0 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)" }, children: "Activity" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", padding: "2px 8px", borderRadius: 999 }, children: "53 weeks" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { width: "100%", minWidth: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Heatmap, { data: heatmap }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 16, background: "var(--dsw-alias-bg-layer-1)", padding: 16, display: "grid", gap: 12, minWidth: 0 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)" }, children: "Cost trend" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: [
            "\xA5",
            Number(totals.cost ?? 0).toFixed(2),
            " \xB7 ",
            daily.length,
            "d"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Sparkline, { data: daily.map((d) => Number(d.cost ?? 0)), height: 64 }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
          { k: "Requests", v: String(totals.requests ?? 0) },
          { k: "Tokens", v: Number(totals.tokens ?? 0).toLocaleString() },
          { k: "Avg", v: `\xA5${(Number(totals.cost ?? 0) / Math.max(1, Number(totals.requests ?? 0))).toFixed(4)}` }
        ].map((s) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { flex: "1 1 auto", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 10, padding: "8px 10px", background: "var(--dsw-alias-bg-base)", display: "grid", gap: 2, minWidth: 90 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: s.k }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)" }, children: s.v })
        ] }, s.k)) })
      ] })
    ] }),
    tunnel && (tunnel.hostname || tunnel.mode || tunnel.id) && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
      "div",
      {
        "data-tunnel-card": true,
        style: {
          border: "1px solid var(--dsw-alias-border-l2)",
          borderRadius: 16,
          background: "var(--dsw-alias-bg-layer-1)",
          padding: 16,
          display: "grid",
          gap: 12,
          minWidth: 0
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("style", { children: `
            @media (max-width: 640px) {
              [data-tunnel-card] { padding: 14px !important; gap: 10px !important; }
              [data-tunnel-head] { gap: 10px !important; }
              [data-tunnel-urlbox] { padding: 10px 12px !important; }
            }
          ` }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { "data-tunnel-head": true, style: { display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { width: 36, height: 36, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", background: tunnel.hostname ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-bg-base)", color: tunnel.hostname ? "#fff" : "var(--dsw-alias-label-secondary)", border: `1px solid ${tunnel.hostname ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-border-l1)"}`, flex: "none", boxShadow: tunnel.hostname ? "0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)" : "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M2 8a6 6 0 0 1 12 0M4 8a3 3 0 0 1 8 0", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("circle", { cx: "8", cy: "8", r: "1.6", fill: "currentColor" })
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { minWidth: 0, flex: "1 1 auto", display: "grid", gap: 4 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-s-strong-14)", color: "var(--dsw-alias-label-primary)", lineHeight: 1 }, children: "Tunnel" }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", padding: "3px 8px", borderRadius: 999, background: tunnel.hostname ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-warn-primary)", color: "#fff", fontWeight: 700, letterSpacing: ".02em", flex: "none", marginLeft: "auto" }, children: tunnel.hostname ? "\u25CF active" : tunnel.mode ?? "configured" }),
                tunnel.hasCredentials === false && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-state-warn-primary)", background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", padding: "2px 8px", borderRadius: 999 }, children: "no credentials" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontFamily: "var(--ds-font-family-code)" }, children: [
                tunnel.mode && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", padding: "2px 8px", borderRadius: 999, color: "var(--dsw-alias-label-secondary)" }, children: tunnel.mode }),
                tunnel.id && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }, children: tunnel.id.slice(0, 16) }),
                !tunnel.hostname && !tunnel.mode && !tunnel.id && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { color: "var(--dsw-alias-label-tertiary)" }, children: "No tunnel configured" })
              ] })
            ] })
          ] }),
          tunnel.hostname ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { "data-tunnel-urlbox": true, style: { display: "flex", gap: 8, alignItems: "stretch", minWidth: 0, background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 12, padding: "8px 8px 8px 12px", minHeight: 44 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { flex: "1 1 auto", minWidth: 0, display: "grid", gap: 2, alignContent: "center" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", letterSpacing: ".04em", textTransform: "uppercase" }, children: "Public URL" }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("a", { href: `https://${tunnel.hostname}`, target: "_blank", rel: "noreferrer", style: { font: "var(--dsw-font-xs-13)", fontFamily: "var(--ds-font-family-code)", color: "var(--dsw-alias-brand-primary)", textDecoration: "none", wordBreak: "break-all", lineHeight: 1.4 }, children: [
                "https://",
                tunnel.hostname
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "button",
              {
                onClick: () => navigator.clipboard?.writeText(`https://${tunnel.hostname}`),
                "aria-label": "Copy tunnel URL",
                style: { flex: "none", alignSelf: "center", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
                title: "Copy",
                children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("rect", { x: "5", y: "5", width: "8", height: "8", rx: "1.5", stroke: "currentColor", strokeWidth: "1.2" }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M3 8.5V3.5A1.5 1.5 0 0 1 4.5 2H9", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
                ] })
              }
            )
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-tertiary)", background: "var(--dsw-alias-bg-base)", border: "1px dashed var(--dsw-alias-border-l1)", borderRadius: 12, padding: "10px 12px", lineHeight: 1.5 }, children: [
            "Tunnel not active \u2014 run ",
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("code", { style: { fontFamily: "var(--ds-font-family-code)", background: "var(--dsw-alias-bg-layer-2)", padding: "1px 6px", borderRadius: 6 }, children: "maestro tunnel" }),
            " or configure in Settings."
          ] }),
          tunnel.hostname && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { "data-tunnel-actions": true, style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
              "button",
              {
                onClick: () => navigator.clipboard?.writeText(`https://${tunnel.hostname}`),
                style: { height: 32, font: "var(--dsw-font-xs-13)", fontWeight: 500, padding: "0 12px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-base)", color: "var(--dsw-alias-label-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", flex: "0 0 auto" },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("rect", { x: "5", y: "5", width: "8", height: "8", rx: "1.5", stroke: "currentColor", strokeWidth: "1.2" }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M3 8.5V3.5A1.5 1.5 0 0 1 4.5 2H9", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
                  ] }),
                  "Copy"
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("a", { href: `https://${tunnel.hostname}`, target: "_blank", rel: "noreferrer", style: { height: 32, font: "var(--dsw-font-xs-13)", fontWeight: 500, padding: "0 12px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-base)", color: "var(--dsw-alias-brand-primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, flex: "0 0 auto" }, children: [
              "Open",
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { width: 12, height: 12, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M5 11L11 5M11 5H6M11 5V10", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" }) })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 16, background: "var(--dsw-alias-bg-layer-1)", padding: 16, display: "grid", gap: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)", display: "flex", gap: 8, alignItems: "center" }, children: [
          "Recent reviews ",
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--dsw-alias-label-secondary)" }, children: reviews.length })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: reviews.length ? `${recentReviews.length} shown` : "No reviews yet" })
      ] }),
      !reviews.length ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-tertiary)", padding: "8px 0" }, children: "No reviews yet \u2014 trigger a Maestro Review from the MR note." }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "grid", gap: 10 }, children: [
        recentReviews.map((r) => {
          const mrUrl = r.projectPath && r.mrIid ? `${gitlabBaseUrl}/${r.projectPath}/-/merge_requests/${r.mrIid}` : "";
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 12, padding: 12, display: "grid", gap: 8, background: "var(--dsw-alias-bg-base)" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
                r.projectPath,
                " !",
                r.mrIid
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", marginLeft: "auto", whiteSpace: "nowrap" }, children: [
                formatTime(r.startedAt),
                " \xB7 ",
                formatDuration(r.durationMs)
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", padding: "2px 8px", borderRadius: 999, background: r.status === "completed" ? "var(--dsw-alias-state-success-primary)" : r.status === "running" ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-bg-layer-2)", color: r.status === "completed" || r.status === "running" ? "#fff" : "var(--dsw-alias-label-secondary)", border: "1px solid var(--dsw-alias-border-l1)", fontWeight: 600, flex: "none", textTransform: "capitalize" }, children: r.status })
            ] }),
            r.summary && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-secondary)", whiteSpace: "pre-wrap", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }, children: r.summary.slice(0, 400) }),
            mrUrl && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("a", { href: mrUrl, target: "_blank", rel: "noreferrer", style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-brand-primary)", textDecoration: "none", wordBreak: "break-all" }, children: mrUrl }) })
          ] }, r.id);
        }),
        reviews.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", textAlign: "center" }, children: [
          "+ ",
          reviews.length - 3,
          " more \u2014 see Reviews tab"
        ] })
      ] })
    ] })
  ] });
}

// src/client/tabs/PluginsTab.tsx
var React = __toESM(require("react"), 1);

// src/client/components/PluginCard.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function StatusPill({ status }) {
  const map = {
    ok: { bg: "var(--dsw-alias-state-success-primary)", fg: "#fff", label: "ok" },
    warn: { bg: "var(--dsw-alias-state-warn-primary)", fg: "#fff", label: "warn" },
    error: { bg: "var(--dsw-alias-state-error-primary)", fg: "#fff", label: "error" }
  };
  const c = map[status] ?? map.ok;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "span",
    {
      style: {
        font: "var(--dsw-font-xxs-12)",
        padding: "2px 8px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        fontWeight: 600,
        letterSpacing: ".02em",
        flex: "none"
      },
      children: c.label
    }
  );
}
function PluginCard(props) {
  const p = props.plugin;
  const onCopy = props.onCopy;
  const copiedKey = props.copiedKey ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "div",
    {
      "data-plugin-card": true,
      style: {
        border: "1px solid var(--dsw-alias-border-l2)",
        borderRadius: 16,
        background: "var(--dsw-alias-bg-layer-1)",
        padding: 14,
        display: "grid",
        gap: 10,
        minWidth: 0,
        transition: "border-color 200ms, background 200ms"
      },
      onMouseEnter: (e) => e.currentTarget.style.borderColor = "var(--dsw-alias-border-l3)",
      onMouseLeave: (e) => e.currentTarget.style.borderColor = "var(--dsw-alias-border-l2)",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("style", { children: `
        @media (max-width: 640px) {
          [data-plugin-card] [data-card-actions] { flex-direction: column !important; align-items: stretch !important; }
          [data-plugin-card] [data-card-actions] button { width: 100% !important; justify-content: center !important; min-height: 32px !important; }
        }
      ` }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, minWidth: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { minWidth: 0, display: "grid", gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)", wordBreak: "break-all" }, children: p.name }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", fontFamily: "var(--ds-font-family-code)" }, children: [
              "v",
              p.version,
              p.latest && p.updateAvailable ? ` \u2192 ${p.latest}` : ""
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(StatusPill, { status: p.status })
        ] }),
        p.description && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-secondary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }, children: p.description }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 2 }, children: [
          p.updateAvailable && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "span",
            {
              style: {
                font: "var(--dsw-font-xxs-12)",
                color: "var(--dsw-alias-state-warn-primary)",
                background: "var(--dsw-alias-bg-base)",
                border: "1px solid var(--dsw-alias-border-l1)",
                padding: "4px 8px",
                borderRadius: 999,
                fontWeight: 600
              },
              children: "Update available"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", marginLeft: "auto" }, children: p.id })
        ] }),
        onCopy && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { "data-card-actions": true, style: { display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 6, borderTop: "1px solid var(--dsw-alias-border-l1)", marginTop: 2 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { onClick: () => onCopy(`dsh plugin add ${p.name}`, `add-${p.id}`), style: { font: "var(--dsw-font-xxs-12)", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-base)", cursor: "pointer", color: "var(--dsw-alias-label-primary)", flex: "none" }, children: copiedKey === `add-${p.id}` ? "Copied" : "Copy add" }),
          p.updateAvailable && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { onClick: () => onCopy(`dsh plugin update ${p.name}@${p.latest ?? "latest"}`, `upd-${p.id}`), style: { font: "var(--dsw-font-xxs-12)", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-state-warn-primary)", color: "#fff", cursor: "pointer", flex: "none" }, children: copiedKey === `upd-${p.id}` ? "Copied" : `Update \u2192 ${p.latest}` })
        ] })
      ]
    }
  );
}
function PluginGrid(props) {
  if (!props.plugins.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-tertiary)", padding: 16, border: "1px dashed var(--dsw-alias-border-l2)", borderRadius: 12, textAlign: "center" }, children: [
      "No plugins detected. Install with ",
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", { style: { fontFamily: "var(--ds-font-family-code)", background: "var(--dsw-alias-bg-layer-2)", padding: "1px 6px", borderRadius: 6 }, children: "dsh plugin add @ddtcorex/dsh-maestro-*" })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }, "data-plugin-grid": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("style", { children: `@media (max-width: 640px) { [data-plugin-grid] { grid-template-columns: 1fr !important; } }` }),
    props.plugins.map((pl) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(PluginCard, { plugin: pl, onCopy: props.onCopy, copiedKey: props.copiedKey }, pl.name))
  ] });
}

// src/client/tabs/PluginsTab.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var CURATED = [
  { id: "remote", name: "@ddtcorex/dsh-maestro-remote", description: "Remote tunnel & deploy \u2014 Cloudflare quick tunnel, loopback-safe" },
  { id: "review", name: "@ddtcorex/dsh-maestro-review", description: "Maestro Review \u2014 incremental sessions scan, MR note trigger" },
  { id: "govard", name: "@ddtcorex/dsh-maestro-govard", description: "Govard \u2014 Go orchestrator for Magento/Laravel/WordPress" },
  { id: "guard", name: "@ddtcorex/dsh-maestro-guard", description: "Guard \u2014 approval & sandbox policy for tools" },
  { id: "notifier", name: "@ddtcorex/dsh-maestro-notifier", description: "Notifier \u2014 Telegram/Slack/Discord hooks for Maestro" },
  { id: "observe", name: "@ddtcorex/dsh-maestro-observe", description: "Observe \u2014 trace/health/cost debug plugin for other plugins" },
  { id: "memory", name: "@ddtcorex/dsh-maestro-memory", description: "Memory \u2014 project & session memory with sync design" },
  { id: "mobile", name: "@ddtcorex/dsh-maestro-mobile", description: "Mobile \u2014 responsive shell, bottom nav, touch ergonomics" },
  { id: "config", name: "@ddtcorex/dsh-maestro-config", description: "Config \u2014 shared settings store UI (Settings card)" },
  { id: "diagram", name: "@ddtcorex/dsh-maestro-diagram", description: "Diagram Studio \u2014 Mermaid/HTML arch diagrams" },
  { id: "supervisor", name: "@ddtcorex/dsh-maestro-supervisor", description: "Supervisor \u2014 standalone daemon, not Cordis row" },
  { id: "dashboard", name: "@ddtcorex/dsh-maestro-dashboard", description: "Dashboard \u2014 this Control Center (Overview/Plugins/Usage/Reviews)" }
];
function PluginsTab(props) {
  const data = props.snapshot?.data;
  const installed = data?.installed ?? [];
  const health = data?.health ?? [];
  const hasWarn = health.some((h) => h.status !== "ok");
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const cards = installed.map((p) => ({
    id: p.id,
    name: p.name ?? `@ddtcorex/dsh-maestro-${p.id}`,
    version: p.version ?? "0.0.0",
    status: p.status ?? "ok",
    updateAvailable: !!p.updateAvailable,
    latest: p.latest,
    description: p.description ?? (p.updateAvailable ? `Latest ${p.latest} available` : void 0)
  }));
  const filtered = cards.filter((c) => {
    if (filter === "updates" && !c.updateAvailable) return false;
    if (filter === "ok" && c.status !== "ok") return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return `${c.id} ${c.name} ${c.version} ${c.latest ?? ""} ${c.description ?? ""}`.toLowerCase().includes(q);
    }
    return true;
  });
  const installedIds = new Set(installed.map((p) => p.id));
  const marketplace = CURATED.filter((c) => !installedIds.has(c.id));
  const [copied, setCopied] = React.useState(null);
  const copy = async (text, key) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "grid", gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("style", { children: `
        @media (max-width: 640px) {
          [data-plugins-health] { flex-direction: column !important; align-items: flex-start !important; padding: 12px !important; }
          [data-installed-toolbar] { grid-template-columns: 1fr !important; }
          [data-installed-toolbar] [data-search-wrap] { width: 100% !important; }
          [data-installed-toolbar] [data-count] { justify-self: start !important; }
        }
      ` }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
      "div",
      {
        "data-plugins-health": true,
        style: {
          border: "1px solid var(--dsw-alias-border-l2)",
          borderRadius: 16,
          background: hasWarn ? "var(--dsw-alias-bg-layer-2)" : "var(--dsw-alias-bg-layer-1)",
          padding: 14,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { width: 10, height: 10, borderRadius: 999, background: hasWarn ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-state-success-primary)", flex: "none" } }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)" }, children: [
            installed.length,
            " installed"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: [
            cards.filter((c) => c.updateAvailable).length,
            " updates"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }, children: health.map((h) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", padding: "4px 8px", borderRadius: 999, background: h.status === "ok" ? "var(--dsw-alias-bg-base)" : "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", color: "var(--dsw-alias-label-secondary)" }, children: [
            h.id,
            ": ",
            h.status
          ] }, h.id)) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { "data-installed-toolbar": true, style: { display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center", minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box", overflow: "hidden" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { display: "flex", gap: 6, padding: 3, borderRadius: 999, background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", flex: "none", minWidth: 0, maxWidth: "100%", overflow: "hidden" }, children: ["all", "updates", "ok"].map((f) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          onClick: () => setFilter(f),
          style: {
            height: 28,
            padding: "0 10px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            font: "var(--dsw-font-xxs-12)",
            fontWeight: filter === f ? 600 : 500,
            background: filter === f ? "var(--dsw-alias-bg-base)" : "transparent",
            color: filter === f ? "var(--dsw-alias-label-primary)" : "var(--dsw-alias-label-tertiary)",
            boxShadow: filter === f ? "0 1px 2px rgba(0,0,0,.08), 0 0 0 1px var(--dsw-alias-border-l1)" : "none",
            textTransform: "capitalize",
            whiteSpace: "nowrap"
          },
          children: f === "updates" ? "Updates" : f === "ok" ? "Healthy" : "All"
        },
        f
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { "data-search-wrap": true, style: { minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box", overflow: "hidden", display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 999, background: "var(--dsw-alias-bg-base)", padding: "0 10px", height: 32 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, style: { flex: "none", color: "var(--dsw-alias-label-tertiary)" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", { cx: "7", cy: "7", r: "5", stroke: "currentColor", strokeWidth: "1.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M11 11 L14 14", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "input",
          {
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Search plugins\u2026",
            style: { flex: "1 1 0", border: "none", outline: "none", background: "transparent", font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-primary)", minWidth: 0, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }
          }
        ),
        query && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { onClick: () => setQuery(""), style: { border: "none", background: "transparent", cursor: "pointer", color: "var(--dsw-alias-label-tertiary)", display: "inline-flex" }, "aria-label": "Clear", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("svg", { width: 12, height: 12, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M3 3 L13 13 M13 3 L3 13", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }) }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { "data-count": true, style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", whiteSpace: "nowrap", justifySelf: "end" }, children: [
        filtered.length,
        " / ",
        cards.length
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h2", { style: { font: "var(--dsw-font-s-strong-14)", color: "var(--dsw-alias-label-primary)", margin: 0 }, children: "Installed" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: [
        "Workspace: ",
        installed.length ? "maestro-harness" : "\u2014",
        " ",
        query || filter !== "all" ? `\xB7 ${filtered.length} shown` : ""
      ] })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-tertiary)", padding: 16, border: "1px dashed var(--dsw-alias-border-l2)", borderRadius: 12, textAlign: "center" }, children: [
      "No plugins match \u201C",
      query || filter,
      "\u201D \u2014 try All or clear search."
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(PluginGrid, { plugins: filtered, onCopy: copy, copiedKey: copied }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { border: "1px dashed var(--dsw-alias-border-l2)", borderRadius: 16, padding: 16, background: "var(--dsw-alias-bg-layer-1)", display: "grid", gap: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)" }, children: "Marketplace" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", padding: "2px 8px", borderRadius: 999, background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", color: "var(--dsw-alias-label-tertiary)" }, children: [
          marketplace.length,
          " available"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", marginLeft: "auto" }, children: "Curated maestro-*" })
      ] }),
      marketplace.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-tertiary)" }, children: "All curated plugins installed \u2713" }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }, children: marketplace.map((m) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 12, padding: 12, display: "grid", gap: 8, background: "var(--dsw-alias-bg-base)" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)", wordBreak: "break-all" }, children: m.name }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-secondary)", lineHeight: 1.5 }, children: m.description }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", marginTop: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { onClick: () => copy(`dsh plugin add ${m.name}`, `mkt-${m.id}`), style: { font: "var(--dsw-font-xs-13)", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)", cursor: "pointer", color: "var(--dsw-alias-label-primary)", flex: "none" }, children: copied === `mkt-${m.id}` ? "Copied" : "Copy add" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", marginLeft: "auto" }, children: m.id })
        ] })
      ] }, m.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("a", { href: "https://www.npmjs.com/search?q=dsh-plugin", target: "_blank", rel: "noreferrer", style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-brand-primary)", textDecoration: "none", border: "1px solid var(--dsw-alias-border-l2)", padding: "6px 12px", borderRadius: 999, background: "var(--dsw-alias-bg-base)", cursor: "pointer" }, children: "Open npm search" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: "500+ dsh-plugin packages via jsDelivr \u2014 zero GitHub API" })
      ] })
    ] })
  ] });
}

// src/client/components/PricingTable.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
function PricingTable(props) {
  if (!props.pricing.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-tertiary)", padding: "12px 0" }, children: "No pricing data for selected range" });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    "div",
    {
      style: {
        border: "1px solid var(--dsw-alias-border-l2)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--dsw-alias-bg-base)"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { overflowX: "auto", WebkitOverflowScrolling: "touch" }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 420 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("tr", { style: { background: "var(--dsw-alias-bg-layer-2)", borderBottom: "1px solid var(--dsw-alias-border-l2)" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { style: { textAlign: "left", padding: "10px 14px", font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", letterSpacing: ".04em", textTransform: "uppercase" }, children: "Model" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { style: { textAlign: "right", padding: "10px 14px", font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: "Input / 1K" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { style: { textAlign: "right", padding: "10px 14px", font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: "Output / 1K" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("tbody", { children: props.pricing.map((p) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("tr", { style: { borderBottom: "1px solid var(--dsw-alias-border-l1)" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { style: { padding: "10px 14px", font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-primary)", fontFamily: "var(--ds-font-family-code)", wordBreak: "break-all" }, children: p.model }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("td", { style: { padding: "10px 14px", font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-secondary)", textAlign: "right", whiteSpace: "nowrap" }, children: [
            "\xA5",
            Number(p.input).toFixed(4)
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("td", { style: { padding: "10px 14px", font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-secondary)", textAlign: "right", whiteSpace: "nowrap" }, children: [
            "\xA5",
            Number(p.output).toFixed(4)
          ] })
        ] }, p.model)) })
      ] }) })
    }
  );
}

// src/client/tabs/UsageTab.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
function UsageTab(props) {
  const data = props.snapshot?.data;
  const totals = data?.totals ?? { cost: 0, tokens: 0, requests: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
  const daily = data?.daily ?? [];
  const pricing = data?.pricing ?? [];
  const budget = data?.budget;
  const range = props.range ?? "7d";
  const budgetPct = budget ? Math.min(100, Math.round(budget.used / Math.max(1, budget.limit) * 100)) : 0;
  const budgetColor = budgetPct >= 100 ? "var(--dsw-alias-state-error-primary)" : budgetPct >= 80 ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-brand-primary)";
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "grid", gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { style: { font: "var(--dsw-font-s-strong-14)", color: "var(--dsw-alias-label-primary)", margin: 0 }, children: "Usage & Cost" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { display: "flex", gap: 6, padding: 3, borderRadius: 999, background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)" }, role: "tablist", "aria-label": "Range", children: ["7d", "30d"].map((r) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "button",
        {
          role: "tab",
          "aria-selected": range === r,
          onClick: () => props.onRangeChange?.(r),
          style: {
            height: 28,
            minWidth: 44,
            padding: "0 12px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            font: "var(--dsw-font-xxs-12)",
            fontWeight: 600,
            background: range === r ? "var(--dsw-alias-bg-base)" : "transparent",
            color: range === r ? "var(--dsw-alias-label-primary)" : "var(--dsw-alias-label-tertiary)",
            boxShadow: range === r ? "0 1px 2px rgba(0,0,0,.08), 0 0 0 1px var(--dsw-alias-border-l1)" : "none",
            transition: "all 200ms ease"
          },
          children: r
        },
        r
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(0,1fr))" }, "data-usage-kpi": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("style", { children: `
          @media (max-width: 768px) { [data-usage-kpi] { grid-template-columns: 1fr !important; } }
        ` }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 16, padding: "14px 16px", background: "var(--dsw-alias-bg-layer-1)" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", letterSpacing: ".04em", textTransform: "uppercase" }, children: "Cost" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { font: "var(--dsw-font-markdown-h3)", color: "var(--dsw-alias-label-primary)", marginTop: 6 }, children: [
          "\xA5",
          Number(totals.cost ?? 0).toFixed(2)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", marginTop: 4 }, children: [
          Number(totals.requests ?? 0),
          " requests \xB7 ",
          range
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 16, padding: "14px 16px", background: "var(--dsw-alias-bg-layer-1)" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", letterSpacing: ".04em", textTransform: "uppercase" }, children: "Tokens" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { font: "var(--dsw-font-markdown-h3)", color: "var(--dsw-alias-label-primary)", marginTop: 6 }, children: Number(totals.tokens ?? 0).toLocaleString() }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-secondary)", marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
            "In ",
            Number(totals.inputTokens ?? 0).toLocaleString()
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { "aria-hidden": true, children: "\xB7" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
            "Out ",
            Number(totals.outputTokens ?? 0).toLocaleString()
          ] }),
          totals.cacheReadTokens ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { "aria-hidden": true, children: "\xB7" }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
              "Cache ",
              Number(totals.cacheReadTokens).toLocaleString()
            ] })
          ] }) : null
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 16, padding: "14px 16px", background: "var(--dsw-alias-bg-layer-1)" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", letterSpacing: ".04em", textTransform: "uppercase" }, children: "Avg / request" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { font: "var(--dsw-font-markdown-h3)", color: "var(--dsw-alias-label-primary)", marginTop: 6 }, children: [
          "\xA5",
          (Number(totals.cost ?? 0) / Math.max(1, Number(totals.requests ?? 0))).toFixed(4)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", marginTop: 4 }, children: [
          daily.length,
          " days \xB7 ",
          Number(totals.requests ?? 0),
          " req"
        ] })
      ] })
    ] }),
    budget && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 16, background: "var(--dsw-alias-bg-layer-1)", padding: 16, display: "grid", gap: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", flexWrap: "wrap", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: { fontWeight: 600, color: "var(--dsw-alias-label-primary)" }, children: "Budget" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
          budget.used.toFixed(2),
          " / ",
          budget.limit.toFixed(2),
          " (",
          budgetPct,
          "%)"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { height: 10, borderRadius: 999, background: "var(--dsw-alias-bg-layer-2)", overflow: "hidden", border: "1px solid var(--dsw-alias-border-l1)" }, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { width: `${budgetPct}%`, height: "100%", background: budgetColor, borderRadius: 999, transition: "width 400ms ease" } }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 16, background: "var(--dsw-alias-bg-layer-1)", padding: 16, display: "grid", gap: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)" }, children: [
          "Daily cost \u2014 ",
          range
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: [
          daily.length,
          " days"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Sparkline, { data: daily.map((d) => Number(d.cost ?? 0)), height: 64 }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fill, minmax(110px,1fr))", font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: daily.slice(-7).map((d) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: { display: "flex", justifyContent: "space-between", gap: 8, border: "1px solid var(--dsw-alias-border-l1)", padding: "6px 8px", borderRadius: 8, background: "var(--dsw-alias-bg-base)" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: d.date.slice(5) }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: { color: "var(--dsw-alias-label-primary)", fontWeight: 600 }, children: [
          "\xA5",
          Number(d.cost).toFixed(2)
        ] })
      ] }, d.date)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "grid", gap: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)" }, children: "Pricing (used models only)" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PricingTable, { pricing }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: "Filtered to models with usage in selected range." })
    ] })
  ] });
}

// src/client/tabs/ReviewsTab.tsx
var React2 = __toESM(require("react"), 1);
var import_jsx_runtime11 = require("react/jsx-runtime");
function formatTime2(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}
function formatDuration2(ms) {
  if (!ms || ms <= 0) return "-";
  const s = Math.round(ms / 1e3);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}
function ReviewsTab(props) {
  const data = props.snapshot?.data;
  const reviews = data?.reviews ?? [];
  const gitlabBaseUrl = data?.gitlabBaseUrl ?? "https://git.sutunam.com";
  const [filter, setFilter] = React2.useState("all");
  const [query, setQuery] = React2.useState("");
  const filtered = reviews.filter((r) => {
    if (filter !== "all") {
      const s = (r.status ?? "").toLowerCase();
      if (filter === "completed" && s !== "completed") return false;
      if (filter === "running" && s !== "running") return false;
      if (filter === "failed" && !["failed", "error", "timeout"].includes(s)) return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      return `${r.projectPath} !${r.mrIid} ${r.headSha} ${r.summary ?? ""}`.toLowerCase().includes(q);
    }
    return true;
  });
  const statusColor = (s) => {
    const l = s.toLowerCase();
    if (l === "completed") return "var(--dsw-alias-state-success-primary)";
    if (l === "running") return "var(--dsw-alias-state-warn-primary)";
    if (["failed", "error", "timeout"].includes(l)) return "var(--dsw-alias-state-error-primary)";
    return "var(--dsw-alias-label-tertiary)";
  };
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "grid", gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { style: { font: "var(--dsw-font-s-strong-14)", color: "var(--dsw-alias-label-primary)", margin: 0 }, children: "Reviews" }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", minWidth: 22, height: 22, padding: "0 7px", borderRadius: 999, background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--dsw-alias-label-secondary)" }, children: reviews.length }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", display: "inline-flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { width: 8, height: 8, borderRadius: 999, background: "var(--dsw-alias-state-success-primary)", display: "inline-block" } }),
          " loopback-safe"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)" }, children: [
        filtered.length,
        " shown \xB7 ",
        reviews.length,
        " total"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { display: "flex", gap: 6, padding: 3, borderRadius: 999, background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", flex: "none" }, children: ["all", "completed", "running", "failed"].map((f) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "button",
        {
          onClick: () => setFilter(f),
          style: {
            height: 28,
            padding: "0 10px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            font: "var(--dsw-font-xxs-12)",
            fontWeight: filter === f ? 600 : 500,
            background: filter === f ? "var(--dsw-alias-bg-base)" : "transparent",
            color: filter === f ? "var(--dsw-alias-label-primary)" : "var(--dsw-alias-label-tertiary)",
            boxShadow: filter === f ? "0 1px 2px rgba(0,0,0,.08), 0 0 0 1px var(--dsw-alias-border-l1)" : "none",
            textTransform: "capitalize"
          },
          children: f
        },
        f
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { flex: "1 1 200px", minWidth: 180, display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 999, background: "var(--dsw-alias-bg-base)", padding: "0 10px", height: 32 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, style: { flex: "none", color: "var(--dsw-alias-label-tertiary)" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", { cx: "7", cy: "7", r: "5", stroke: "currentColor", strokeWidth: "1.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", { d: "M11 11 L14 14", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          "input",
          {
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Search project, MR, SHA\u2026",
            style: { flex: 1, border: "none", outline: "none", background: "transparent", font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-primary)", minWidth: 0 }
          }
        ),
        query && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { onClick: () => setQuery(""), style: { border: "none", background: "transparent", cursor: "pointer", color: "var(--dsw-alias-label-tertiary)", display: "inline-flex" }, "aria-label": "Clear", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("svg", { width: 12, height: 12, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", { d: "M3 3 L13 13 M13 3 L3 13", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }) }) })
      ] })
    ] }),
    !reviews.length ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { border: "1px dashed var(--dsw-alias-border-l2)", borderRadius: 16, padding: 24, textAlign: "center", background: "var(--dsw-alias-bg-layer-1)", display: "grid", gap: 8, placeItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { width: 32, height: 32, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", color: "var(--dsw-alias-label-tertiary)" }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", { d: "M3 3h10v8H6l-3 3V3z", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round" }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)" }, children: "No reviews yet" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-tertiary)", maxWidth: 420 }, children: "Trigger a Maestro Review from the MR note (mention + scope). Loopback-safe, incremental `reviews.json` scan." })
    ] }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-tertiary)", padding: "12px 0", textAlign: "center" }, children: [
      "No results for \u201C",
      query,
      "\u201D in ",
      filter
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { display: "grid", gap: 10 }, children: filtered.map((r) => {
      const mrUrl = r.projectPath && r.mrIid ? `${gitlabBaseUrl}/${r.projectPath}/-/merge_requests/${r.mrIid}` : "";
      const status = r.status ?? "unknown";
      return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
        "div",
        {
          style: {
            border: "1px solid var(--dsw-alias-border-l2)",
            borderRadius: 16,
            background: "var(--dsw-alias-bg-layer-1)",
            padding: 14,
            display: "grid",
            gap: 10
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { style: { font: "var(--dsw-font-xs-strong-13)", color: "var(--dsw-alias-label-primary)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
                r.projectPath,
                " !",
                r.mrIid
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", marginLeft: "auto", whiteSpace: "nowrap", display: "inline-flex", gap: 8, flexWrap: "wrap", alignItems: "center" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: formatTime2(r.startedAt) }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { "aria-hidden": true, children: "\xB7" }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: formatDuration2(r.durationMs) }),
                r.headSha && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { "aria-hidden": true, children: "\xB7" }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { fontFamily: "var(--ds-font-family-code)", color: "var(--dsw-alias-label-secondary)" }, children: r.headSha.slice(0, 7) })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", padding: "2px 8px", borderRadius: 999, background: statusColor(status), color: "#fff", fontWeight: 600, flex: "none", textTransform: "capitalize" }, children: status })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
              r.mode && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", padding: "3px 8px", borderRadius: 999, background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", color: "var(--dsw-alias-label-secondary)" }, children: r.mode }),
              r.scope && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", padding: "3px 8px", borderRadius: 999, background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", color: "var(--dsw-alias-label-secondary)" }, children: r.scope }),
              r.trigger && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { font: "var(--dsw-font-xxs-12)", padding: "3px 8px", borderRadius: 999, background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", color: "var(--dsw-alias-label-tertiary)" }, children: r.trigger }),
              r.projectId ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", alignSelf: "center" }, children: [
                "#",
                r.projectId
              ] }) : null
            ] }),
            r.error && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-state-error-primary)", background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 10, padding: "8px 10px", whiteSpace: "pre-wrap", wordBreak: "break-word" }, children: r.error.slice(0, 600) }),
            r.summary && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-label-secondary)", background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 12, padding: "10px 12px", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5, maxHeight: 240, overflow: "auto" }, children: r.summary.slice(0, 1200) }),
            mrUrl && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("a", { href: mrUrl, target: "_blank", rel: "noreferrer", style: { font: "var(--dsw-font-xs-13)", color: "var(--dsw-alias-brand-primary)", textDecoration: "none", wordBreak: "break-all", flex: "1 1 auto", minWidth: 0 }, children: mrUrl }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                "button",
                {
                  onClick: () => navigator.clipboard?.writeText(mrUrl),
                  style: { font: "var(--dsw-font-xxs-12)", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-base)", cursor: "pointer", color: "var(--dsw-alias-label-primary)", flex: "none" },
                  children: "Copy"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("a", { href: mrUrl, target: "_blank", rel: "noreferrer", style: { font: "var(--dsw-font-xxs-12)", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-base)", color: "var(--dsw-alias-label-primary)", textDecoration: "none", flex: "none" }, children: "Open" })
            ] })
          ]
        },
        r.id
      );
    }) })
  ] });
}

// src/client/overlay.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var TABS = [
  { id: "overview", label: "Overview", icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "2", y: "2", width: "5", height: "5", rx: "1", stroke: "currentColor", strokeWidth: "1.2" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "9", y: "2", width: "5", height: "5", rx: "1", stroke: "currentColor", strokeWidth: "1.2" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "2", y: "9", width: "5", height: "5", rx: "1", stroke: "currentColor", strokeWidth: "1.2" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "9", y: "9", width: "5", height: "5", rx: "1", stroke: "currentColor", strokeWidth: "1.2" })
  ] }) },
  { id: "plugins", label: "Plugins", icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M6 3a3 3 0 0 1 3 3v2h2a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1v-1h-2v4H6v-4H4v1a1 1 0 0 0 1 1h1v2H5a3 3 0 0 1-3-3v-1a1 1 0 0 1 1-1h2V6a3 3 0 0 1 3-3z", stroke: "currentColor", strokeWidth: "1", fill: "none" }) }) },
  { id: "usage", label: "Usage", icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M2 12l3-4 3 2 4-6", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M11 4h3v3", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round", strokeLinejoin: "round" })
  ] }) },
  { id: "reviews", label: "Reviews", icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M3 3h10v8H6l-3 3V3z", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M5 7h6M5 10h4", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
  ] }) }
];
function Overlay(props) {
  const [tab, setTab] = React3.useState(props.initialTab ?? "overview");
  const dialogRef = React3.useRef(null);
  React3.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") props.onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [props.onClose]);
  React3.useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);
  const overlayNode = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { ref: dialogRef, role: "dialog", "aria-modal": "true", "aria-label": "Maestro Dashboard", "data-maestro-overlay": true, style: { position: "fixed", inset: 0, zIndex: 2147483647, background: "var(--dsw-alias-bg-base)", display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("style", { children: `
        [data-maestro-overlay] * { scrollbar-width: thin; scrollbar-color: var(--dsw-alias-scrollbar-bg-l2) transparent; }
        [data-maestro-overlay] ::-webkit-scrollbar { width: 8px; height: 8px; }
        [data-maestro-overlay] ::-webkit-scrollbar-thumb { background: var(--dsw-alias-scrollbar-bg-l2); border-radius: 999px; }
        @media (prefers-reduced-motion: reduce) { [data-maestro-overlay] * { animation: none !important; transition: none !important; } }
        [data-maestro-tab]:focus-visible { outline: 2px solid var(--dsw-alias-border-l3); outline-offset: 2px; }
        [data-maestro-close]:focus-visible { outline: 2px solid var(--dsw-alias-border-l3); outline-offset: 2px; }
        /* BrandBadge uses fixed #0A84FF so it stays visible on both light and dark bg-base */
        [data-maestro-logo] { background: #0A84FF !important; background-color: #0A84FF !important; color: #fff !important; }
      ` }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("header", { style: { height: 56, minHeight: 56, flex: "none", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-base)", position: "sticky", top: 0, zIndex: 2 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: "1 1 auto" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(BrandBadge, { outer: 28, size: 16, radius: 8 }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { minWidth: 0, display: "grid", gap: 1 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { font: "var(--dsw-font-s-strong-14)", color: "var(--dsw-alias-label-primary)", letterSpacing: ".01em", whiteSpace: "nowrap" }, children: "Maestro Dashboard" }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", display: "none" }, "data-subtitle": true, children: "Control Center" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { display: "none", font: "var(--dsw-font-xxs-12)", padding: "2px 8px", borderRadius: 999, background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", color: "var(--dsw-alias-label-secondary)", marginLeft: 8 }, "data-version-badge": true, children: "v0.1" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, flex: "none" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, font: "var(--dsw-font-xxs-12)", color: "var(--dsw-alias-label-tertiary)", border: "1px solid var(--dsw-alias-border-l1)", padding: "4px 8px", borderRadius: 999, background: "var(--dsw-alias-bg-layer-1)" }, "data-kbd-hint": true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l1)", padding: "1px 5px", borderRadius: 6, fontFamily: "var(--ds-font-family-code)" }, children: "Esc" }),
          " close"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("button", { "data-maestro-close": true, onClick: props.onClose, "aria-label": "Close dashboard", style: { width: 32, height: 32, borderRadius: 10, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }, onMouseEnter: (e) => e.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover)", onMouseLeave: (e) => e.currentTarget.style.background = "var(--dsw-alias-bg-layer-1)", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M3 3 L13 13 M13 3 L3 13", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) }) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { flex: "none", borderBottom: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-base)", position: "sticky", top: 56, zIndex: 1 }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { "data-maestro-tabbar": true, style: { maxWidth: 1200, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { display: "flex", gap: 6, padding: 3, borderRadius: 999, background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", flex: "none" }, role: "tablist", "aria-label": "Dashboard sections", children: TABS.map((t) => {
      const active = tab === t.id;
      return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { "data-maestro-tab": true, role: "tab", "aria-selected": active, "aria-controls": `maestro-panel-${t.id}`, id: `maestro-tab-${t.id}`, onClick: () => setTab(t.id), style: { display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", font: "var(--dsw-font-xs-13)", fontWeight: active ? 600 : 500, background: active ? "var(--dsw-alias-bg-base)" : "transparent", color: active ? "var(--dsw-alias-label-primary)" : "var(--dsw-alias-label-secondary)", boxShadow: active ? "0 1px 2px rgba(0,0,0,.08), 0 0 0 1px var(--dsw-alias-border-l1)" : "none", transition: "all 200ms ease", whiteSpace: "nowrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { display: "inline-flex", opacity: active ? 1 : 0.8 }, children: t.icon }),
        t.label
      ] }, t.id);
    }) }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { flex: "1 1 auto", overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", background: "var(--dsw-alias-bg-base)", paddingBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("style", { children: `
          @media (max-width: 640px) {
            [data-kbd-hint] { display: none !important; }
            [data-subtitle] { display: block !important; }
            [data-version-badge] { display: none !important; }
          }
          @media (max-width: 390px) { [data-maestro-content] { padding: 12px !important; } }
        ` }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { "data-maestro-content": true, style: { maxWidth: 1200, margin: "0 auto", padding: "16px 16px", display: "grid", gap: 16, boxSizing: "border-box", width: "100%" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { id: "maestro-panel-overview", role: "tabpanel", "aria-labelledby": "maestro-tab-overview", hidden: tab !== "overview", style: { display: tab === "overview" ? "block" : "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(OverviewTab, { snapshot: props.overview, reviewsSnapshot: props.reviews, usage: props.usage, usageRange: props.usageRange, onUsageRangeChange: props.onUsageRangeChange }) }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { id: "maestro-panel-plugins", role: "tabpanel", "aria-labelledby": "maestro-tab-plugins", hidden: tab !== "plugins", style: { display: tab === "plugins" ? "block" : "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(PluginsTab, { snapshot: props.plugins }) }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { id: "maestro-panel-usage", role: "tabpanel", "aria-labelledby": "maestro-tab-usage", hidden: tab !== "usage", style: { display: tab === "usage" ? "block" : "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(UsageTab, { snapshot: props.usage, range: props.usageRange, onRangeChange: props.onUsageRangeChange }) }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { id: "maestro-panel-reviews", role: "tabpanel", "aria-labelledby": "maestro-tab-reviews", hidden: tab !== "reviews", style: { display: tab === "reviews" ? "block" : "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ReviewsTab, { snapshot: props.reviews }) }),
        props.children
      ] })
    ] })
  ] });
  if (typeof document !== "undefined" && document.body) {
    return (0, import_react_dom.createPortal)(overlayNode, document.body);
  }
  return overlayNode;
}

// src/client/index.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var DASHBOARD_CHANNEL = "/dsh-maestro-dashboard";
function DashboardApp({ ctx, wide }) {
  const [open, setOpen] = React4.useState(false);
  const [health, setHealth] = React4.useState("ok");
  const [overview, setOverview] = React4.useState(null);
  const [plugins, setPlugins] = React4.useState(null);
  const [usage, setUsage] = React4.useState(null);
  const [reviews, setReviews] = React4.useState(null);
  const [usageRange, setUsageRange] = React4.useState("7d");
  const fetchAll = React4.useCallback(async (range = usageRange) => {
    const conn = ctx?.connection ?? ctx?.get?.("connection");
    const doCall = async (payload) => {
      if (conn?.rpc?.call) {
        try {
          const r = await conn.rpc.call(DASHBOARD_CHANNEL, "", payload);
          return r?.ok ? r.value : r;
        } catch {
          try {
            const r2 = await conn.rpc.call(DASHBOARD_CHANNEL, payload.op, payload);
            return r2?.ok ? r2.value : r2;
          } catch {
          }
        }
      }
      const host = window.__dshHost ?? globalThis.host;
      if (host?.call) {
        const r = await host.call(DASHBOARD_CHANNEL, "", payload);
        return r?.ok ? r.value : r;
      }
      return null;
    };
    try {
      const [o, pl, u, r] = await Promise.all([doCall({ op: "getOverview" }), doCall({ op: "getPlugins" }), doCall({ op: "getUsage", range }), doCall({ op: "getReviews", limit: 20 })]);
      if (o) {
        setOverview(o);
        const healthList = o?.data?.health ?? o?.health ?? [];
        const hasWarn = Array.isArray(healthList) && healthList.some((h) => h.status !== "ok");
        setHealth(hasWarn ? "warn" : "ok");
      }
      if (pl) setPlugins(pl);
      if (u) setUsage(u);
      if (r) setReviews(r);
    } catch {
    }
  }, [ctx, usageRange]);
  React4.useEffect(() => {
    if (!open) return;
    fetchAll(usageRange);
    const timer = setInterval(() => fetchAll(usageRange), 3e4);
    return () => clearInterval(timer);
  }, [open, fetchAll, usageRange]);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(MaestroTrigger, { health, wide: wide ?? true, onClick: () => setOpen(true) }),
    open && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Overlay, { onClose: () => setOpen(false), overview, plugins, usage, reviews, usageRange, onUsageRangeChange: (r) => {
      setUsageRange(r);
      fetchAll(r);
    } })
  ] });
}
var index_default = {
  inject: ["slots", "connection"],
  apply(ctx) {
    ctx.effect(() => {
      const style = document.createElement("style");
      style.setAttribute("data-maestro-footer-fix", "");
      style.textContent = `
        [class*="_footerActions"] { flex-direction: column !important; align-items: stretch !important; gap: 2px !important; }
        [class*="_footerActions"] [data-slot="sidebar.footer.action"] { display: flex !important; flex-direction: column !important; gap: 2px !important; width: 100% !important; }
        @media (max-width: 1023px) {
          [data-maestro-trigger] {
            border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .14)) !important;
            background: var(--dsw-alias-button-elevated-fill, #ffffff) !important;
          }
        }
      `;
      document.head.appendChild(style);
      return () => style.remove();
    }, "maestro footer column fix");
    ctx.effect(
      () => ctx.slots.inject(
        "sidebar.footer.action",
        () => ctx.slots.register(
          {
            name: "sidebar.footer.action",
            id: "maestro-dashboard-trigger",
            order: 20
          },
          (props) => React4.createElement(DashboardApp, { ctx, wide: props.wide })
        )
      )
    );
  }
};

    return module.exports;
  }
});
