'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@brikdesigns/bds';
import type { CardItem } from '@/lib/content';

/**
 * A doctor card whose action opens the full biography (tncld#92).
 *
 * The original's `/about/meet-the-doctors` renders three portrait cards, each
 * with a "Read Bio" button, above three hidden `modal-1..3` sections carrying
 * the long-form bio. The buttons are `href="#"` and Webflow IX2 toggles the
 * matching modal — so the link goes nowhere without JS and the modal is in the
 * document either way.
 *
 * Native `<dialog>` for the same reasons StoryVideo uses one: focus trapping,
 * Esc to dismiss and focus returning to the trigger are spec behaviour, which
 * is most of what the WCAG 2.1 AA target wants from a modal. The bio text is
 * rendered up front rather than gated on `open` — it is static copy, so there
 * is nothing to defer, and it stays available to a find-in-page.
 */
export function BioCard({
  card,
  image,
}: {
  card: CardItem & { bio: NonNullable<CardItem['bio']> };
  image?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      {image ? (
        <span className="section-cards__media section-cards__media--portrait">
          <Image src={image} alt="" fill sizes="(max-width: 61.9375rem) 100vw, 21rem" style={{ objectFit: 'cover' }} />
        </span>
      ) : null}
      <div className="section-cards__copy">
        <h3 className="section-cards__card-title">{card.title}</h3>
        {card.body ? <p className="section-cards__card-body">{card.body}</p> : null}
      </div>
      {card.action ? (
        <Button
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          // "Read Bio" is repeated on all three cards in the original, so the
          // accessible name has to say whose bio it opens.
          aria-label={`${card.action.label}: ${card.title}`}
        >
          {card.action.label}
        </Button>
      ) : null}

      <dialog
        ref={dialogRef}
        className="story-dialog bio-dialog"
        aria-label={card.bio.title}
        onClose={() => setOpen(false)}
      >
        <div className="story-dialog__bar">
          <button
            type="button"
            className="story-dialog__dismiss"
            onClick={() => setOpen(false)}
          >
            <span className="story-dialog__dismiss-glyph" aria-hidden="true">
              ×
            </span>
            <span className="story-dialog__dismiss-label">
              Close biography: {card.bio.title}
            </span>
          </button>
        </div>
        <h2 className="bio-dialog__title">{card.bio.title}</h2>
        {card.bio.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="bio-dialog__body">
            {paragraph}
          </p>
        ))}
      </dialog>
    </>
  );
}
