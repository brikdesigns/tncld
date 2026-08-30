'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import MuxPlayer from '@mux/mux-player-react';
import { Button } from '@brikdesigns/bds';
import type { StoryItem } from '@/lib/content';

/**
 * The animated poster the original puts at the top of each story card.
 *
 * Exactly the original's URL shape (`index.html` § patient stories):
 *   https://image.mux.com/<playback-id>/animated.gif?width=640&fps=5
 *
 * `unoptimized` because the optimizer would flatten an animated GIF to its
 * first frame. Derived from the playback id rather than stored three times in
 * `cms-data.json` — it is Mux's URL template, not content.
 */
function posterUrl(playbackId: string) {
  return `https://image.mux.com/${playbackId}/animated.gif?width=640&fps=5`;
}

/**
 * A patient-story card with its Mux video (tncld#97).
 *
 * The original renders each story as a card with an animated poster and a
 * "Watch Their Story" button that opens one of three modals (`modal-1..3`),
 * each holding a `<mux-player>` and a dismiss icon. The rebuild had these as
 * text-only cards with no link at all — recorded as a deliberate deviation
 * because `/patient-stories` was unbuilt, but the original never linked to that
 * route from here; it opened a modal in place.
 *
 * Native `<dialog>` rather than a hand-rolled overlay: focus trapping, Esc to
 * dismiss, and focus returning to the trigger on close are all spec behaviour,
 * which is most of what the WCAG 2.1 AA target needs from a modal.
 *
 * The player mounts only while the dialog is open, so nothing is fetched from
 * `stream.mux.com` until a visitor asks for it — the original's `preload=
 * "metadata"` intent, and it keeps three players off the initial page.
 */
export function StoryVideo({ story }: { story: StoryItem & { playbackId: string } }) {
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
      <Image
        className="section-testimonials__card-poster"
        src={posterUrl(story.playbackId)}
        alt=""
        width={640}
        height={360}
        unoptimized
      />
      <div className="section-testimonials__card-copy">
        <h3 className="section-testimonials__card-title">{story.title}</h3>
        <p className="section-testimonials__card-body">{story.body}</p>
      </div>
      {story.videoLabel ? (
        <Button
          onClick={() => setOpen(true)}
          // Same 64px CTA as every other band (tncld#104). This one is a raw
          // Button rather than ActionButton — that takes an `href` and this
          // opens a dialog — so it did not pick up `size="xl"` and rendered at
          // BDS's 40px default against the original's 64px, measured at all
          // four widths. page-sections.css lifts the remaining 8px.
          size="xl"
          aria-haspopup="dialog"
          // The label repeats across all three cards in the original, so the
          // accessible name has to say *which* story this opens.
          aria-label={`${story.videoLabel}: ${story.title}`}
        >
          {story.videoLabel}
        </Button>
      ) : null}

      <dialog
        ref={dialogRef}
        className="story-dialog"
        aria-label={story.title}
        // Fires for Esc and for `close()` alike, so React state cannot drift
        // out of sync with the element's own open state.
        onClose={() => setOpen(false)}
      >
        <div className="story-dialog__bar">
          <button
            type="button"
            className="story-dialog__dismiss"
            onClick={() => setOpen(false)}
          >
            {/* The original's dismiss affordance is an icon with no text; a
                visible label is not required, an accessible name is. */}
            <span className="story-dialog__dismiss-glyph" aria-hidden="true">
              ×
            </span>
            <span className="story-dialog__dismiss-label">
              Close video: {story.title}
            </span>
          </button>
        </div>
        {open ? (
          <MuxPlayer
            className="story-dialog__player"
            playbackId={story.playbackId}
            streamType="on-demand"
            preload="metadata"
            // --background-brand-primary, not --surface-brand-primary:
            // theme-tncld.css themes the former to TNCLD blue and leaves the
            // latter at the BDS default, which is Brik poppy.
            accentColor="var(--background-brand-primary)"
            metadata={{ video_title: story.title }}
          />
        ) : null}
      </dialog>
    </>
  );
}
