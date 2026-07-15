/**
 * Renders the final scoreboard to an off-screen canvas as a shareable PNG.
 * Done by hand (no html-to-image dependency) so the output is consistent
 * regardless of the live DOM/theme.
 */

import type { RoomState } from '@doodle/shared';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
}

async function tryLoadImage(src: string | undefined): Promise<HTMLImageElement | null> {
  if (!src) return null;
  try {
    return await loadImage(src);
  } catch (err) {
    console.warn(`Failed to load image: ${src}`, err);
    return null;
  }
}

/** Build the scoreboard image. Returns the rendered canvas. */
export async function renderScoreboard(room: RoomState): Promise<HTMLCanvasElement> {
  // Await fonts loading to avoid default font fallback
  await document.fonts.ready;

  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const winner = ranked[0];

  const W = 1600;
  const H = 900;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Load static doodles and player avatars
  const [
    logoImg,
    crownImg,
    starImg,
    arrowImg,
    zigzagImg,
    underlineImg,
    ...avatarImgs
  ] = await Promise.all([
    tryLoadImage('/logo.png'),
    tryLoadImage('/assets/doodles/rough-crown.svg'),
    tryLoadImage('/assets/doodles/rough-star.svg'),
    tryLoadImage('/assets/doodles/rough-arrow.svg'),
    tryLoadImage('/assets/doodles/rough-zigzag.svg'),
    tryLoadImage('/assets/doodles/rough-underline-pink.svg'),
    ...ranked.map((p) => tryLoadImage(p.avatarUrl)),
  ]);

  // Background: #FFFCF7
  ctx.fillStyle = '#FFFCF7';
  ctx.fillRect(0, 0, W, H);

  // Dot texture grid (radial dots every 24px)
  ctx.fillStyle = 'rgba(38, 38, 38, 0.045)';
  for (let x = 12; x < W; x += 24) {
    for (let y = 12; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Left Page Edge Decoration: Zigzag
  if (zigzagImg) {
    ctx.save();
    ctx.translate(60, 225);
    ctx.rotate(Math.PI / 2);
    ctx.globalAlpha = 0.2;
    ctx.drawImage(zigzagImg, -120, -15, 240, 30);
    ctx.restore();
  }

  // Top Left Logo
  if (logoImg) {
    ctx.drawImage(logoImg, 80, 50, 150, 48);
  }

  // Top Right Room Code
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '800 24px Nunito, "Segoe UI", sans-serif';
  ctx.fillStyle = '#222222';
  ctx.fillText(`Room ${room.code}`, W - 80, 74);

  // Thin line below Room Code
  ctx.strokeStyle = '#DDD8D0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W - 250, 94);
  ctx.lineTo(W - 80, 94);
  ctx.stroke();

  // game over! text
  ctx.textAlign = 'center';
  ctx.font = '700 28px Kalam, cursive, sans-serif';
  ctx.fillStyle = '#6554D9';
  ctx.fillText('game over!', 800, 140);

  // Floating Star
  if (starImg) {
    ctx.drawImage(starImg, 800 + 85, 140 - 24, 24, 24);
  }

  if (winner) {
    // Winner name won this mess.
    ctx.font = '900 72px Nunito, "Segoe UI", sans-serif';
    const nameW = ctx.measureText(winner.name).width;
    const suffix = ' won this mess.';
    const suffixW = ctx.measureText(suffix).width;
    const totalW = nameW + suffixW;
    const startX = 800 - totalW / 2;

    // Draw Winner Name in purple
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6554D9';
    ctx.fillText(winner.name, startX, 220);

    // Draw rough underline
    if (underlineImg) {
      ctx.drawImage(underlineImg, startX - 4, 220 + 12, nameW + 8, 14);
    }

    // Draw suffix in black
    ctx.fillStyle = '#222222';
    ctx.fillText(suffix, startX + nameW, 220);

    // Game Meta below heading
    ctx.textAlign = 'center';
    ctx.font = '700 22px Nunito, "Segoe UI", sans-serif';
    ctx.fillStyle = '#68666D';
    ctx.fillText(
      `${room.totalRounds} round${room.totalRounds === 1 ? '' : 's'} · ${ranked.length} player${ranked.length === 1 ? '' : 's'}`,
      800,
      290,
    );

    // Winner Card
    const cardW = 960;
    const cardH = 160;
    const cardX = 800 - cardW / 2;
    const cardY = 340;

    // Card Shadow
    ctx.fillStyle = 'rgba(37, 37, 37, 0.08)';
    roundRect(ctx, cardX + 6, cardY + 7, cardW, cardH, 24);
    ctx.fill();

    // Card Background
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fill();

    // Card Border
    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Crown Float
    if (crownImg) {
      ctx.drawImage(crownImg, cardX + 24, cardY - 44, 54, 54);
    }

    // Arrow Float
    if (arrowImg) {
      ctx.drawImage(arrowImg, cardX + cardW + 12, cardY + 36, 48, 48);
    }

    // Winner Card Rank '01'
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '900 36px Nunito, "Segoe UI", sans-serif';
    ctx.fillStyle = '#6554D9';
    ctx.fillText('01', cardX + 40, cardY + cardH / 2);

    // Winner Avatar
    const avX = cardX + 140;
    const avY = cardY + cardH / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, 45, 0, Math.PI * 2);
    ctx.clip();

    const winnerAvatarImg = avatarImgs[0];
    if (winnerAvatarImg) {
      ctx.drawImage(winnerAvatarImg, avX - 45, avY - 45, 90, 90);
    } else {
      ctx.fillStyle = winner.avatarColor;
      ctx.fillRect(avX - 45, avY - 45, 90, 90);

      ctx.textAlign = 'center';
      ctx.font = '900 36px Nunito, "Segoe UI", sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText(winner.name.charAt(0).toUpperCase(), avX, avY);
    }
    ctx.restore();

    // Avatar Border
    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(avX, avY, 45, 0, Math.PI * 2);
    ctx.stroke();

    // Winner Name
    ctx.font = '900 32px Nunito, "Segoe UI", sans-serif';
    ctx.fillStyle = '#222222';
    ctx.fillText(winner.name, cardX + 210, cardY + cardH / 2 - 20);

    // WINNER Sticker Badge
    const badgeX = cardX + 210;
    const badgeY = cardY + cardH / 2 + 15;
    const badgeW = 90;
    const badgeH = 26;
    ctx.fillStyle = '#FFF1A8';
    roundRect(ctx, badgeX, badgeY - badgeH / 2, badgeW, badgeH, 13);
    ctx.fill();
    ctx.strokeStyle = 'rgba(37, 37, 37, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '900 12px Nunito, "Segoe UI", sans-serif';
    ctx.fillStyle = '#222222';
    ctx.fillText('WINNER', badgeX + badgeW / 2, badgeY);

    // Winner Score
    ctx.textAlign = 'right';
    ctx.font = '700 20px Nunito, "Segoe UI", sans-serif';
    const ptsW = ctx.measureText('pts').width;
    ctx.fillStyle = '#68666D';
    ctx.fillText('pts', cardX + cardW - 40, cardY + cardH / 2 + 8);

    ctx.font = '900 64px Nunito, "Segoe UI", sans-serif';
    ctx.fillStyle = '#6554D9';
    ctx.fillText(String(winner.score), cardX + cardW - 40 - ptsW - 10, cardY + cardH / 2);

    // Remaining rankings
    let rowY = 530;
    const rowX = 800 - 900 / 2;
    const rowW = 900;
    const rowH = 80;
    const maxOtherPlayers = 3;

    ranked.slice(1, 1 + maxOtherPlayers).forEach((p, i) => {
      const rank = i + 2;
      const rankStr = rank < 10 ? `0${rank}` : `${rank}`;

      // Divider line
      ctx.strokeStyle = '#DDD8D0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rowX, rowY + rowH);
      ctx.lineTo(rowX + rowW, rowY + rowH);
      ctx.stroke();

      // Rank
      ctx.textAlign = 'left';
      ctx.font = '900 32px Nunito, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(101, 84, 217, 0.25)';
      ctx.fillText(rankStr, rowX + 10, rowY + rowH / 2);

      // Avatar
      const pAvX = rowX + 100;
      const pAvY = rowY + rowH / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(pAvX, pAvY, 24, 0, Math.PI * 2);
      ctx.clip();

      const pImg = avatarImgs[i + 1];
      if (pImg) {
        ctx.drawImage(pImg, pAvX - 24, pAvY - 24, 48, 48);
      } else {
        ctx.fillStyle = p.avatarColor;
        ctx.fillRect(pAvX - 24, pAvY - 24, 48, 48);

        ctx.textAlign = 'center';
        ctx.font = '900 20px Nunito, "Segoe UI", sans-serif';
        ctx.fillStyle = '#000000';
        ctx.fillText(p.name.charAt(0).toUpperCase(), pAvX, pAvY);
      }
      ctx.restore();

      // Avatar border
      ctx.strokeStyle = '#252525';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pAvX, pAvY, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Name
      ctx.textAlign = 'left';
      ctx.font = '700 24px Nunito, "Segoe UI", sans-serif';
      ctx.fillStyle = '#222222';
      ctx.fillText(p.name, rowX + 150, rowY + rowH / 2);

      // Score
      ctx.textAlign = 'right';
      ctx.font = '700 16px Nunito, "Segoe UI", sans-serif';
      const rPtsW = ctx.measureText('pts').width;
      ctx.fillStyle = '#68666D';
      ctx.fillText('pts', rowX + rowW - 10, rowY + rowH / 2 + 4);

      ctx.font = '900 28px Nunito, "Segoe UI", sans-serif';
      ctx.fillStyle = '#222222';
      ctx.fillText(String(p.score), rowX + rowW - 10 - rPtsW - 6, rowY + rowH / 2);

      rowY += rowH;
    });

    if (ranked.length > 1 + maxOtherPlayers) {
      ctx.textAlign = 'center';
      ctx.font = '700 18px Nunito, "Segoe UI", sans-serif';
      ctx.fillStyle = '#68666D';
      ctx.fillText(`+ ${ranked.length - 1 - maxOtherPlayers} more players`, 800, rowY + 30);
    }
  }

  // Kalam microcopy
  ctx.textAlign = 'center';
  ctx.font = '700 24px Kalam, cursive, sans-serif';
  ctx.fillStyle = '#68666D';
  ctx.fillText('gg. that was questionable.', 800, 830);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  );
}

/** Trigger a PNG download of the scoreboard. */
export async function downloadScoreboard(room: RoomState): Promise<void> {
  const canvas = await renderScoreboard(room);
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `doodledash-${room.code}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Share the scoreboard via the Web Share API when available (mobile), falling
 * back to a download. Returns 'shared' | 'downloaded'.
 */
export async function shareScoreboard(room: RoomState, shareText: string): Promise<'shared' | 'downloaded'> {
  const canvas = await renderScoreboard(room);
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], `doodledash-${room.code}.png`, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };

  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({
      files: [file],
      title: 'DoodleDash results',
      text: shareText,
    });
    return 'shared';
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
