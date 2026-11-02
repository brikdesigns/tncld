'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@brikdesigns/bds';
import type { TabsSection } from '@/lib/content';

/**
 * The original's `2-column-tabbed-stacked` treatments interaction (tncld#97).
 *
 * Webflow ships this as its own `w-tabs` widget: a right-aligned strip of three
 * tab buttons, each a title plus a one-line summary, over a single panel that
 * swaps. `data-current="Tab 3"` in the export means Invisalign — the *third*
 * item — is the tab open on load, which is why `defaultIndex` comes from the
 * content rather than defaulting to 0 here.
 *
 * Webflow's own widget is not accessible: it renders the tab buttons as
 * `<a href="#">` with no `role`, no `aria-selected`, and no arrow-key handling.
 * The repo's Compliance Profile requires WCAG 2.1 AA, so this follows the ARIA
 * Authoring Practices tabs pattern instead — real buttons, roving `tabindex`,
 * Left/Right/Home/End, and `aria-selected` tracking the open panel. Same
 * interaction, keyboard-operable.
 */
export function TreatmentTabs({ section }: { section: TabsSection }) {
  const [active, setActive] = useState(section.defaultIndex ?? 0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;

  /**
   * Arrow keys move the selection *and* the focus together, which is the
   * automatic-activation form of the pattern — correct here because switching
   * a panel costs nothing and matches what a pointer click does.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = section.items.length - 1;
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        next = active === last ? 0 : active + 1;
        break;
      case 'ArrowLeft':
        next = active === 0 ? last : active - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const openItem = section.items[active];

  return (
    <section className="section-tabs" aria-labelledby={`${baseId}-heading`}>
      <div className="section-tabs__intro">
        <div className="section-tabs__intro-copy">
          <h2 id={`${baseId}-heading`} className="section-tabs__title">
            {section.title}
          </h2>
          {section.body ? (
            <p className="section-tabs__body">{section.body}</p>
          ) : null}
        </div>
        {/* The original sets this beside the intro, right-aligned — it was
            dropped entirely when the section was flattened to a card grid. */}
        {section.action ? (
          <Button
            href={section.action.href}
            variant={section.action.variant ?? 'primary'}
          >
            {section.action.label}
          </Button>
        ) : null}
      </div>

      {/* Two columns, as `2-column-tabbed-stacked` says literally: the tab
          buttons are a 412px column beside the 868px panel, measured on the
          rendered export. Not a strip above the panel. */}
      <div className="section-tabs__layout">
        <div
          className="section-tabs__tablist"
          role="tablist"
          aria-orientation="vertical"
          aria-labelledby={`${baseId}-heading`}
        >
          {section.items.map((item, index) => (
            <button
              key={item.title}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={index === active}
              aria-controls={panelId(index)}
              // Roving tabindex: one stop for the whole strip, then arrow keys.
              tabIndex={index === active ? 0 : -1}
              className="section-tabs__tab"
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
            >
              <span className="section-tabs__tab-title">{item.title}</span>
              <span className="section-tabs__tab-summary">{item.summary}</span>
            </button>
          ))}
        </div>

        {/* One panel node rather than three with the inactive ones hidden. The
            original swaps content inside a single `.tab-content-wrapper`, and a
            single node keeps the closed panels' images from being fetched —
            which is also what made two of them measure 0x0 in the export
            (markdown/fidelity-method.md § Known limits). */}
        {openItem ? (
          <div
            className="section-tabs__panel"
            role="tabpanel"
            id={panelId(active)}
            aria-labelledby={tabId(active)}
            // The panel holds a link, so it is not itself a tab stop; focus
            // moves from the tab straight into the panel's own controls.
            tabIndex={-1}
          >
            {openItem.image ? (
              <Image
                className="section-tabs__panel-image"
                src={openItem.image}
                alt=""
                width={347}
                height={162}
              />
            ) : null}
            <div className="section-tabs__panel-copy">
              {openItem.body.map((line) => (
                <p key={line} className="section-tabs__panel-line">
                  {line}
                </p>
              ))}
            </div>
            {openItem.action ? (
              <Button
                href={openItem.action.href}
                variant={openItem.action.variant ?? 'primary'}
              >
                {openItem.action.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
