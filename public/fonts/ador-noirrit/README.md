# Ador Noirrit (আদর নোররিৎ)

The UI renders all Bangla text with the `font-bangla` Tailwind family, whose
first choice is **Ador Noirrit**. The font files are not committed to this
repository. Add them here under exactly these names:

```
public/fonts/ador-noirrit/AdorNoirrit-Regular.woff2   (weight 400)
public/fonts/ador-noirrit/AdorNoirrit-Bold.woff2      (weight 700)
```

If you only have `.ttf`/`.otf`, convert with `woff2_compress` or any webfont
generator. Check that your copy of the font's license allows web embedding.

Until the files exist, the browser falls back to **Hind Siliguri** (loaded via
`next/font/google` in `app/layout.tsx`), so the layout never breaks.
