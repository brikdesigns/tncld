'use client';

import { useEffect, useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';

/**
 * The homepage hero's background video (tncld#97, hero scope confirmed by
 * operator decision 2026-08-26 — markdown/fidelity-method.md § Step 4 assigned
 * it here, while #97's own ACs did not name it).
 *
 * The original runs it `autoplay muted loop` with no controls behind the hero
 * copy; #95 rendered the still poster instead. This layers the video *over* that
 * still, so the still stays the fallback for two cases at once: a visitor who
 * prefers reduced motion, and the interval before the stream is playable.
 *
 * The player chrome is suppressed with `--controls: none`, set on
 * `.section-hero__video` in page-sections.css — a custom property on the host
 * inherits into the shadow tree, which is where mux-player consumes it. That is
 * not a doc claim; the package maps it directly:
 *   node_modules/@mux/mux-player/dist/base.mjs:3
 *   `--media-control-display: var(--controls);`
 */
export function HeroVideo({ playbackId }: { playbackId: string }) {
  // Motion preference is a client-only read, and rendering the player on the
  // server would emit markup a reduced-motion visitor then has to unmount.
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setMotionOk(!query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  if (!motionOk) return null;

  return (
    <MuxPlayer
      className="section-hero__video"
      playbackId={playbackId}
      streamType="on-demand"
      autoPlay="muted"
      loop
      muted
      // Decorative: the hero's meaning is carried by the heading and lede
      // beside it, so it is hidden from assistive tech rather than described.
      // No `tabIndex` needed to keep it out of the tab order — `--controls:
      // none` display:none's the chrome, and a <video> without controls is not
      // focusable, so there is nothing to reach.
      aria-hidden="true"
      nohotkeys
    />
  );
}
