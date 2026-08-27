'use client'

import { useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'

export type StarlightEntry = {
  videoUrl: string
  title: string
  poem: string
  audioUrl: string
}

export const starlightEntries: StarlightEntry[] = [
  {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Signal in the dark',
    poem: 'Between the quiet stars,\nI keep a light for you.\nA small and steady signal\nthat makes the dark feel new.',
    audioUrl: 'https://cdn.example.com/starlight-log/signal-in-the-dark.mp3',
  },
  {
    videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    title: 'Orbiting home',
    poem: 'I learned the shape of distance\nby tracing every blue.\nThe universe keeps turning,\nbut every road finds you.',
    audioUrl: 'https://cdn.example.com/starlight-log/orbiting-home.mp3',
  },
]

function Cover() {
  return <article className="book-page book-cover"><span className="book-kicker">ARIA / DIGITAL EDITION</span><h1>Starlight<br />Log</h1><p>A field recording of the spaces between signal and soul.</p><span className="book-cover-mark">AJNLIQ128</span></article>
}

function EntryPage({ entry, index }: { entry: StarlightEntry; index: number }) {
  return <article className="book-page book-entry"><div className="book-page-number">0{index + 1}</div><div className="book-video"><iframe src={entry.videoUrl} title={`Video: ${entry.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="book-copy"><p className="book-kicker">ST★RLIGHT LOG / ENTRY 0{index + 1}</p><h2>{entry.title}</h2><p className="poem">{entry.poem}</p><audio className="book-audio" controls preload="none" src={entry.audioUrl}><span>Your browser does not support audio playback.</span></audio><p className="book-note">Narrated audio · placeholder source</p></div></article>
}

export function StarlightBook() {
  const bookRef = useRef<unknown>(null)
  return <main className="book-shell"><header className="book-header"><a href="/aria" className="book-back">← ARIA</a><span>ST★RLIGHT LOG</span><span>01 / 06</span></header><section className="book-stage"><HTMLFlipBook ref={bookRef} width={430} height={600} size="stretch" minWidth={280} maxWidth={520} minHeight={420} maxHeight={700} showCover={true} mobileScrollSupport={true} useMouseEvents={true} className="starlight-flipbook" style={{ margin: '0 auto' }} startPage={0} drawShadow={true} flippingTime={800} usePortrait={true} startZIndex={0} autoSize={true} maxShadowOpacity={0.32} showPageCorners={true} disableFlipByClick={false}><Cover />{starlightEntries.map((entry, index) => <EntryPage key={entry.title} entry={entry} index={index} />)}</HTMLFlipBook></section><p className="book-instruction">Arrastra una esquina para pasar la página</p></main>
}
