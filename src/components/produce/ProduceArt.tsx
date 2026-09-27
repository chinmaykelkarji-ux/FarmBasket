/**
 * Illustrated produce system.
 * Every product renders from vector art, so imagery never breaks and variant
 * choices (colour, ripeness, size) change the picture instantly. Replace with
 * real photography of graded stock via `imageUrl` on the product when ready.
 */
import { memo, useId, type ReactNode } from 'react'
import type { ArtKind } from '@/types'

interface ArtProps {
  kind: ArtKind
  tone?: string
  size?: string
  className?: string
  title?: string
}

type Pal = { fill: string; shade: string }

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** A filled shape with a soft rim shadow and optional highlight. */
function Shaded({ id, d, pal, hl, rim = [-5, -6] }: { id: string; d: string; pal: Pal; hl?: [number, number, number, number, number?]; rim?: [number, number] }) {
  return (
    <>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={pal.shade} />
      <g clipPath={`url(#${id})`}>
        <path d={d} fill={pal.fill} transform={`translate(${rim[0]} ${rim[1]})`} />
        {hl && (
          <ellipse cx={hl[0]} cy={hl[1]} rx={hl[2]} ry={hl[3]} fill="#fff" opacity={0.38} transform={`rotate(${hl[4] ?? -30} ${hl[0]} ${hl[1]})`} />
        )}
      </g>
    </>
  )
}

/** Leaf path pointing "up" from its base, then rotated. */
function Leaf({ x, y, len, w, angle, fill, rib }: { x: number; y: number; len: number; w: number; angle: number; fill: string; rib?: string }) {
  const d = `M0 0 C ${w / 2} ${-len * 0.2} ${w / 2} ${-len * 0.72} 0 ${-len} C ${-w / 2} ${-len * 0.72} ${-w / 2} ${-len * 0.2} 0 0 Z`
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={d} fill={fill} />
      {rib && <path d={`M0 -2 L0 ${-len * 0.88}`} stroke={rib} strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />}
    </g>
  )
}

const line = (d: string, stroke: string, width = 2, opacity = 1) => (
  <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
)

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------

const tomatoPal: Record<string, Pal> = {
  red: { fill: '#E1462F', shade: '#B2301E' },
  semi: { fill: '#EC8B37', shade: '#C4651F' },
  green: { fill: '#9DC357', shade: '#6E9937' },
}
const onionPal: Record<string, Pal & { vein: string }> = {
  red: { fill: '#A5405F', shade: '#6E2442', vein: '#CF7A96' },
  white: { fill: '#F3ECDE', shade: '#D5C4A6', vein: '#FFFFFF' },
}
const capsicumPal: Record<string, Pal> = {
  green: { fill: '#3F903B', shade: '#2A6A2A' },
  red: { fill: '#D9362B', shade: '#A5211A' },
  yellow: { fill: '#F1B62C', shade: '#C68A12' },
}
const bananaPal: Record<string, Pal> = {
  ripe: { fill: '#F3CB4E', shade: '#D4A22A' },
  semi: { fill: '#C8CF58', shade: '#98A636' },
}

// ---------------------------------------------------------------------------
// Artwork
// ---------------------------------------------------------------------------

function artFor(kind: ArtKind, tone: string | undefined, id: string): ReactNode {
  switch (kind) {
    case 'tomato': {
      const pal = tomatoPal[tone ?? 'red'] ?? tomatoPal.red
      const d = 'M80 52 C104 48 128 62 128 90 C128 116 106 130 80 130 C54 130 32 116 32 90 C32 62 56 48 80 52 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={pal} hl={[60, 74, 10, 6]} />
          {tone === 'semi' && (
            <g clipPath={`url(#${id})`}>
              <ellipse cx={80} cy={60} rx={34} ry={16} fill="#B5BE4B" opacity={0.75} />
            </g>
          )}
          {line('M66 58 C60 72 60 86 64 98', pal.shade, 2, 0.35)}
          {line('M94 58 C100 72 100 86 96 98', pal.shade, 2, 0.35)}
          <path d="M80 44 L86 53 L100 50 L90 58 L98 66 L84 60 L80 70 L76 60 L62 66 L70 58 L60 50 L74 53 Z" fill="#3F7A2E" />
          {line('M80 47 C80 41 82 37 87 35', '#3F7A2E', 4)}
        </>
      )
    }
    case 'onion': {
      const pal = onionPal[tone ?? 'red'] ?? onionPal.red
      const d = 'M80 40 C84 54 96 60 108 68 C126 80 128 110 110 124 C98 133 62 133 50 124 C32 110 34 80 52 68 C64 60 76 54 80 40 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={pal} hl={[62, 90, 6, 13, 12]} />
          <g clipPath={`url(#${id})`}>
            {line('M80 46 C70 70 64 100 70 130', pal.vein, 1.6, 0.6)}
            {line('M80 46 C90 70 96 100 90 130', pal.vein, 1.6, 0.6)}
            {line('M80 46 C58 70 46 100 54 126', pal.vein, 1.6, 0.5)}
            {line('M80 46 C102 70 114 100 106 126', pal.vein, 1.6, 0.5)}
          </g>
          {line('M80 43 C79 34 80 28 85 21', '#8A6A48', 3.2)}
          {line('M72 129 l-3 6 M78 131 l-1 7 M84 131 l1 7 M90 129 l3 6', '#B89A70', 1.6)}
        </>
      )
    }
    case 'potato': {
      const d = 'M40 84 C40 62 64 52 90 54 C116 56 132 72 128 96 C124 118 100 128 74 124 C52 121 40 104 40 84 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={{ fill: '#D2A86E', shade: '#A47A43' }} hl={[64, 70, 12, 6, -12]} />
          {[
            [64, 80],
            [98, 70],
            [110, 100],
            [78, 108],
            [90, 90],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={2.6} ry={1.6} fill="#8A6334" opacity={0.7} />
          ))}
          {[
            [56, 96],
            [84, 64],
            [118, 84],
            [100, 114],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.1} fill="#8A6334" opacity={0.45} />
          ))}
        </>
      )
    }
    case 'carrot': {
      const d = 'M98 42 C106 37 119 45 120 58 C106 80 72 110 46 126 C40 129 35 124 40 119 C58 94 80 62 98 42 Z'
      return (
        <>
          <Leaf x={110} y={46} len={34} w={10} angle={20} fill="#4F8C3A" />
          <Leaf x={112} y={48} len={30} w={9} angle={55} fill="#6BA650" />
          <Leaf x={106} y={44} len={30} w={9} angle={-8} fill="#5E9A45" />
          <Shaded id={id} d={d} pal={{ fill: '#F07D2E', shade: '#C65816' }} hl={[96, 58, 4, 12, 40]} rim={[-4, -4]} />
          {line('M92 64 l9 6 M79 81 l8 6 M67 97 l7 5 M56 110 l5 4', '#C65816', 2, 0.55)}
        </>
      )
    }
    case 'beans': {
      const pods = ['M32 110 C56 76 94 58 132 52', 'M28 94 C54 62 90 44 124 36', 'M40 124 C70 96 104 80 136 72']
      return (
        <>
          {pods.map((p, i) => (
            <g key={i}>
              {line(p, '#4C7C2A', 12)}
              <g transform="translate(-1 -1.5)">{line(p, '#72A640', 9)}</g>
              <g transform="translate(-2 -3)">{line(p, '#fff', 2, 0.3)}</g>
            </g>
          ))}
        </>
      )
    }
    case 'cucumber': {
      const d = 'M36 70 H124 A18 18 0 0 1 124 106 H36 A18 18 0 0 1 36 70 Z'
      return (
        <g transform="rotate(-24 80 88)">
          <Shaded id={id} d={d} pal={{ fill: '#437F3C', shade: '#2B5C29' }} hl={[64, 78, 26, 3.5, 0]} rim={[-2, -5]} />
          <g clipPath={`url(#${id})`}>
            {line('M28 84 H130', '#7DB163', 2.4, 0.4)}
            {line('M30 94 H132', '#7DB163', 2.4, 0.3)}
            {[40, 58, 76, 94, 112].map((x) => (
              <circle key={x} cx={x} cy={88 + (x % 3) * 3} r={1.2} fill="#CFE3B8" opacity={0.7} />
            ))}
          </g>
          <ellipse cx={19} cy={88} rx={3} ry={4} fill="#9DAA5E" />
        </g>
      )
    }
    case 'capsicum': {
      const pal = capsicumPal[tone ?? 'green'] ?? capsicumPal.green
      const d = 'M80 54 C94 44 120 46 125 66 C130 86 127 110 113 124 C104 132 94 129 88 122 C84 128 76 128 72 122 C66 129 56 132 47 124 C33 110 30 86 35 66 C40 46 66 44 80 54 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={pal} hl={[56, 80, 5, 14, 8]} />
          {line('M64 60 C58 80 60 104 70 120', pal.shade, 2.2, 0.45)}
          {line('M96 60 C102 80 100 104 90 120', pal.shade, 2.2, 0.45)}
          <ellipse cx={80} cy={55} rx={12} ry={5} fill="#4B6B2A" />
          {line('M80 55 C79 46 82 38 90 34', '#4B6B2A', 7)}
        </>
      )
    }
    case 'brinjal': {
      const pal = { fill: '#60306F', shade: '#3B1848' }
      if (tone === 'long') {
        const d = 'M104 44 C116 48 120 62 112 78 C98 108 76 130 54 132 C40 133 36 122 44 112 C62 94 80 70 90 52 C94 46 98 43 104 44 Z'
        return (
          <>
            <Shaded id={id} d={d} pal={pal} hl={[88, 76, 4, 16, 40]} />
            <path d="M86 52 C92 38 114 38 118 54 L110 54 L108 64 L102 56 L94 64 L92 54 Z" fill="#5E8C3C" />
            {line('M104 42 L112 28', '#5E8C3C', 6)}
          </>
        )
      }
      const d = 'M80 52 C108 52 126 74 124 98 C122 120 102 130 80 130 C58 130 38 120 36 98 C34 74 52 52 80 52 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={pal} hl={[58, 86, 7, 14, 20]} />
          <path d="M54 62 C60 48 100 48 106 62 L98 60 L94 74 L86 62 L80 76 L74 62 L66 74 L62 60 Z" fill="#5E8C3C" />
          {line('M80 52 L82 32', '#5E8C3C', 7)}
        </>
      )
    }
    case 'cabbage': {
      const d = 'M80 46 C106 46 126 66 126 90 C126 114 106 132 80 132 C54 132 34 114 34 90 C34 66 54 46 80 46 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={{ fill: '#B3D286', shade: '#84AC54' }} hl={[62, 66, 10, 5, -20]} />
          <g clipPath={`url(#${id})`}>
            <path d="M36 98 C42 70 64 54 92 56 C72 66 60 84 58 110 Z" fill="#C8E0A0" opacity={0.85} />
            <path d="M124 96 C120 72 102 58 80 60 C98 68 106 86 104 112 Z" fill="#9BC268" opacity={0.9} />
            {line('M80 134 C78 110 80 86 88 62', '#E6F1D0', 2.2)}
            {line('M78 118 C66 108 54 100 42 98', '#E6F1D0', 1.8)}
            {line('M82 110 C96 100 108 94 122 92', '#E6F1D0', 1.8)}
          </g>
          <path d="M32 112 C42 136 118 136 128 112 C116 126 44 126 32 112 Z" fill="#79A34A" />
        </>
      )
    }
    case 'cauliflower': {
      const florets: [number, number, number][] = [
        [80, 62, 18],
        [58, 72, 17],
        [102, 72, 17],
        [66, 90, 18],
        [94, 90, 18],
        [80, 80, 17],
      ]
      return (
        <>
          <path d="M26 104 C28 74 52 68 66 84 C58 102 44 118 26 104 Z" fill="#4E823A" />
          <path d="M134 104 C132 74 108 68 94 84 C102 102 116 118 134 104 Z" fill="#5E9444" />
          {florets.map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#E2D6B4" />
              <circle cx={x - 2} cy={y - 2.5} r={r - 2} fill="#F6F0DF" />
            </g>
          ))}
          {[
            [72, 58],
            [90, 60],
            [60, 80],
            [100, 78],
            [78, 94],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.6} fill="#D9CBA6" />
          ))}
          <path d="M36 108 C52 136 108 136 124 108 C110 122 50 122 36 108 Z" fill="#6FA350" />
          <path d="M50 104 C64 128 96 128 110 104 C98 116 62 116 50 104 Z" fill="#83B561" />
        </>
      )
    }
    case 'chilli': {
      const d = 'M44 50 C52 46 58 50 60 58 C66 84 90 110 124 120 C96 124 66 108 50 80 C44 70 40 58 44 50 Z'
      const pal = { fill: '#41A03C', shade: '#2A7228' }
      return (
        <>
          {[
            'translate(16 -14)',
            'translate(0 0)',
            'translate(-6 14) rotate(-6 80 90)',
          ].map((t, i) => (
            <g key={i} transform={t}>
              <Shaded id={`${id}-${i}`} d={d} pal={pal} hl={[56, 70, 3, 10, 30]} rim={[-3, -3]} />
              {line('M46 52 C40 46 38 40 41 34', '#6D8B3A', 4)}
            </g>
          ))}
        </>
      )
    }
    case 'ginger': {
      const d = 'M34 92 C30 80 40 72 52 76 C54 64 66 58 76 66 C82 56 96 54 102 64 C112 58 126 66 124 78 C134 84 132 100 120 102 C118 114 104 118 96 110 C88 118 74 118 70 108 C60 116 44 112 44 102 C36 102 32 98 34 92 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={{ fill: '#DEB77F', shade: '#B28650' }} hl={[74, 76, 10, 4, -8]} />
          {line('M56 80 C60 86 60 94 56 102', '#A57840', 1.6, 0.6)}
          {line('M80 70 C84 78 84 92 80 102', '#A57840', 1.6, 0.6)}
          {line('M104 70 C108 80 108 90 104 100', '#A57840', 1.6, 0.6)}
          <ellipse cx={124} cy={79} rx={5} ry={7} fill="#F2D9A6" />
        </>
      )
    }
    case 'garlic': {
      const d = 'M80 34 C84 48 94 54 106 60 C128 72 132 104 114 120 C102 131 58 131 46 120 C28 104 32 72 54 60 C66 54 76 48 80 34 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={{ fill: '#F6F0E5', shade: '#D6C8B2' }} hl={[62, 86, 6, 14, 14]} />
          <g clipPath={`url(#${id})`}>
            {line('M80 44 C66 64 62 100 70 130', '#CDBDA3', 1.8, 0.9)}
            {line('M80 44 C94 64 98 100 90 130', '#CDBDA3', 1.8, 0.9)}
            {line('M80 44 C56 66 44 98 52 124', '#CDBDA3', 1.6, 0.8)}
            {line('M80 44 C104 66 116 98 108 124', '#CDBDA3', 1.6, 0.8)}
            {line('M98 80 C100 92 100 104 96 114', '#C7A2B6', 2.4, 0.5)}
            {line('M62 84 C60 96 60 106 64 114', '#C7A2B6', 2.4, 0.4)}
          </g>
          {line('M80 38 C79 30 80 24 83 17', '#CDBFA6', 4)}
          {line('M70 128 l-2 6 M76 130 l-1 6 M84 130 l1 6 M90 128 l2 6', '#C2AE88', 1.5)}
        </>
      )
    }
    case 'coriander': {
      const tips: [number, number][] = [
        [46, 62],
        [62, 46],
        [80, 40],
        [98, 46],
        [114, 62],
        [56, 80],
        [104, 80],
      ]
      return (
        <>
          {tips.map(([x, y], i) => (
            <g key={i}>{line(`M80 132 Q${(80 + x) / 2} ${(132 + y) / 2 + 10} ${x} ${y}`, '#7BAA55', 2.2)}</g>
          ))}
          {tips.map(([x, y], i) => (
            <g key={`l${i}`}>
              <circle cx={x} cy={y} r={10} fill={i % 2 ? '#4E9A3F' : '#3F8434'} />
              <circle cx={x - 8} cy={y + 5} r={7} fill={i % 2 ? '#3F8434' : '#58A548'} />
              <circle cx={x + 8} cy={y + 5} r={7} fill="#4E9A3F" />
              <circle cx={x - 2} cy={y - 3} r={3} fill="#fff" opacity={0.18} />
            </g>
          ))}
          <rect x={70} y={108} width={20} height={7} rx={2} fill="#C9A36A" transform="rotate(-6 80 112)" />
        </>
      )
    }
    case 'mint': {
      const stems: { base: [number, number]; top: [number, number] }[] = [
        { base: [80, 132], top: [56, 44] },
        { base: [80, 132], top: [82, 34] },
        { base: [80, 132], top: [108, 46] },
      ]
      return (
        <>
          {stems.map((s, i) => (
            <g key={i}>{line(`M${s.base[0]} ${s.base[1]} L${s.top[0]} ${s.top[1]}`, '#6E9A4E', 2.4)}</g>
          ))}
          {stems.flatMap((s, i) =>
            [0.3, 0.55, 0.8, 1].map((t, j) => {
              const x = s.base[0] + (s.top[0] - s.base[0]) * t
              const y = s.base[1] + (s.top[1] - s.base[1]) * t
              const ang = (Math.atan2(s.top[1] - s.base[1], s.top[0] - s.base[0]) * 180) / Math.PI + 90
              const size = j === 3 ? 18 : 24 - j * 2
              return (
                <g key={`${i}-${j}`}>
                  {j < 3 && <Leaf x={x} y={y} len={size} w={size * 0.7} angle={ang - 62} fill={j % 2 ? '#3E8B52' : '#58A86A'} rib="#A7D3A6" />}
                  {j < 3 && <Leaf x={x} y={y} len={size} w={size * 0.7} angle={ang + 62} fill={j % 2 ? '#58A86A' : '#3E8B52'} rib="#A7D3A6" />}
                  {j === 3 && <Leaf x={x} y={y + 6} len={size} w={size * 0.66} angle={ang} fill="#4E9A60" rib="#A7D3A6" />}
                </g>
              )
            }),
          )}
        </>
      )
    }
    case 'spinach': {
      const leaves: [number, number, number, string][] = [
        [-56, 70, 40, '#276B32'],
        [56, 70, 40, '#2F7A3A'],
        [-28, 84, 46, '#3E8E46'],
        [28, 84, 46, '#2F7A3A'],
        [0, 92, 50, '#3A8742'],
      ]
      return (
        <>
          {leaves.map(([a, len, w, fill], i) => (
            <g key={i}>
              <Leaf x={80} y={132} len={len} w={w} angle={a} fill={fill} rib="#A9D09A" />
            </g>
          ))}
          {line('M80 132 L80 118', '#8DB86A', 4)}
        </>
      )
    }
    case 'methi': {
      const stems: [number, number][] = [
        [44, 54],
        [64, 40],
        [86, 36],
        [106, 44],
        [120, 62],
      ]
      return (
        <>
          {stems.map(([x, y], i) => (
            <g key={i}>{line(`M80 132 Q${(80 + x) / 2} ${(132 + y) / 2 + 8} ${x} ${y}`, '#86AF5A', 1.8)}</g>
          ))}
          {stems.flatMap(([x, y], i) =>
            [0.55, 1].map((t, j) => {
              const cx = 80 + (x - 80) * t
              const cy = 132 + (y - 132) * t + (j === 0 ? 6 : 0)
              return (
                <g key={`${i}-${j}`}>
                  <Leaf x={cx} y={cy} len={16} w={13} angle={-50} fill="#6AAE3E" />
                  <Leaf x={cx} y={cy} len={16} w={13} angle={50} fill="#5A9C34" />
                  <Leaf x={cx} y={cy} len={18} w={14} angle={0} fill="#72B646" />
                </g>
              )
            }),
          )}
        </>
      )
    }
    case 'curry-leaves': {
      const pts = [0.12, 0.26, 0.4, 0.54, 0.68, 0.82]
      const [x1, y1, x2, y2] = [40, 130, 122, 40]
      const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 90
      return (
        <>
          {line(`M${x1} ${y1} Q70 96 ${x2} ${y2}`, '#6B7F3A', 2.4)}
          {pts.map((t, i) => {
            const x = x1 + (x2 - x1) * t + 4
            const y = y1 + (y2 - y1) * t + 4
            return (
              <g key={i}>
                <Leaf x={x} y={y} len={28} w={12} angle={ang - 58} fill={i % 2 ? '#2F6B2E' : '#3A7B37'} rib="#8DB57A" />
                <Leaf x={x} y={y} len={28} w={12} angle={ang + 58} fill={i % 2 ? '#3A7B37' : '#2F6B2E'} rib="#8DB57A" />
              </g>
            )
          })}
          <Leaf x={x2} y={y2 + 6} len={24} w={11} angle={ang} fill="#3A7B37" rib="#8DB57A" />
        </>
      )
    }
    case 'okra': {
      const d = 'M46 48 C54 42 64 46 66 54 C76 82 96 108 122 126 C94 124 66 100 52 72 C48 64 44 56 46 48 Z'
      return (
        <>
          {['translate(14 -10)', 'translate(0 2)'].map((t, i) => (
            <g key={i} transform={t}>
              <Shaded id={`${id}-${i}`} d={d} pal={{ fill: '#7BB147', shade: '#568A30' }} hl={[60, 66, 3, 10, 30]} rim={[-3, -3]} />
              {line('M58 58 C70 86 92 110 118 124', '#568A30', 1.6, 0.6)}
              <path d="M43 50 C45 41 58 38 65 47 Z" fill="#94BC5E" />
              {line('M48 44 C44 38 44 32 48 28', '#7B9A48', 3.5)}
            </g>
          ))}
        </>
      )
    }
    case 'bottle-gourd': {
      const d = 'M108 30 C116 30 120 36 118 44 C116 56 110 64 112 78 C114 100 104 126 80 132 C56 138 36 124 38 102 C40 84 58 76 74 70 C88 64 96 56 98 42 C99 34 102 30 108 30 Z'
      return (
        <>
          <Shaded id={id} d={d} pal={{ fill: '#B6D38B', shade: '#8BB060' }} hl={[64, 94, 12, 7, -30]} />
          <g clipPath={`url(#${id})`}>
            {[
              [56, 110],
              [80, 116],
              [96, 96],
              [70, 90],
              [104, 60],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.6} fill="#E3EFCF" />
            ))}
          </g>
          {line('M110 32 C112 24 116 20 122 18', '#6E8B3A', 4)}
        </>
      )
    }
    case 'beetroot': {
      const d = 'M80 64 C104 64 120 80 118 100 C116 114 102 122 90 124 C86 130 83 136 80 142 C77 136 74 130 70 124 C58 122 44 114 42 100 C40 80 56 64 80 64 Z'
      return (
        <>
          {line('M80 66 C78 50 70 40 58 30', '#A8325E', 3)}
          {line('M80 66 C82 50 90 40 104 32', '#A8325E', 3)}
          {line('M80 66 C80 52 80 42 80 30', '#A8325E', 3)}
          <Leaf x={58} y={32} len={24} w={16} angle={-40} fill="#4E8A3E" rib="#A8325E" />
          <Leaf x={104} y={34} len={24} w={16} angle={40} fill="#5A9646" rib="#A8325E" />
          <Leaf x={80} y={32} len={26} w={17} angle={0} fill="#46803A" rib="#A8325E" />
          <Shaded id={id} d={d} pal={{ fill: '#932450', shade: '#5E1230' }} hl={[62, 86, 7, 11, 20]} />
        </>
      )
    }
    case 'banana': {
      const pal = bananaPal[tone ?? 'ripe'] ?? bananaPal.ripe
      const d = 'M34 72 C50 104 92 116 126 96 C129 94 128 89 124 90 C94 102 58 94 42 68 C40 63 33 65 34 72 Z'
      return (
        <>
          {['translate(4 -16) rotate(-4 80 90)', 'translate(0 0)', 'translate(-4 16) rotate(4 80 90)'].map((t, i) => (
            <g key={i} transform={t}>
              <Shaded id={`${id}-${i}`} d={d} pal={pal} hl={[70, 96, 16, 2.5, 18]} rim={[-2, -4]} />
              <circle cx={36} cy={70} r={2.4} fill="#5B4A2A" />
            </g>
          ))}
          {line('M122 92 C128 82 131 72 131 62', '#8A7A3A', 7)}
        </>
      )
    }
    case 'lemon': {
      const d = 'M36 88 C36 76 42 70 48 66 C64 54 96 54 112 66 C118 70 124 76 124 88 C124 100 118 106 112 110 C96 122 64 122 48 110 C42 106 36 100 36 88 Z'
      const pal = { fill: '#F6D740', shade: '#D6AC1D' }
      return (
        <>
          <g transform="translate(20 -18) translate(80 88) scale(0.82) translate(-80 -88)">
            <Shaded id={`${id}-b`} d={d} pal={pal} />
            <ellipse cx={126} cy={88} rx={4} ry={3} fill={pal.shade} />
          </g>
          <Shaded id={id} d={d} pal={pal} hl={[60, 76, 12, 5, -14]} />
          <ellipse cx={32} cy={88} rx={4} ry={3} fill={pal.shade} />
          <ellipse cx={128} cy={88} rx={4} ry={3} fill={pal.shade} />
          <Leaf x={70} y={60} len={30} w={14} angle={-50} fill="#4E8A3E" rib="#9BC48A" />
        </>
      )
    }
    case 'basket': {
      return (
        <>
          <circle cx={62} cy={70} r={20} fill="#E1462F" />
          <path d="M62 50 l4 6 8-2-6 6 4 6-8-4-2 8-2-8-8 4 4-6-6-6 8 2z" fill="#3F7A2E" />
          <Leaf x={96} y={78} len={46} w={26} angle={18} fill="#3E8E46" rib="#A9D09A" />
          <Leaf x={92} y={78} len={40} w={22} angle={-12} fill="#2F7A3A" rib="#A9D09A" />
          <path d="M104 40 C110 36 118 42 118 50 L96 84 L90 80 Z" fill="#F07D2E" />
          <path d="M28 76 H132 L120 128 C119 132 116 134 112 134 H48 C44 134 41 132 40 128 Z" fill="#C99A5B" />
          {line('M34 90 H126 M37 104 H123 M40 118 H120', '#A87A3F', 2.2, 0.8)}
          {line('M56 78 L60 132 M80 78 V132 M104 78 L100 132', '#A87A3F', 2, 0.6)}
          <rect x={24} y={72} width={112} height={10} rx={5} fill="#B8864A" />
        </>
      )
    }
  }
}

const SIZE_SCALE: Record<string, number> = { small: 0.8, medium: 0.92, large: 1.04 }

function ProduceArtBase({ kind, tone, size, className = '', title }: ArtProps) {
  const raw = useId()
  const id = `pa${raw.replace(/[^a-zA-Z0-9]/g, '')}`
  const scale = size ? (SIZE_SCALE[size] ?? 0.95) : 0.95
  return (
    <svg viewBox="0 0 160 160" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <ellipse cx={80} cy={138} rx={46 * scale} ry={6} fill="#1D231E" opacity={0.08} />
      <g transform={`translate(${80 - 80 * scale} ${136 - 136 * scale}) scale(${scale})`} style={{ transition: 'transform 300ms ease' }}>
        {artFor(kind, tone, id)}
      </g>
    </svg>
  )
}

export const ProduceArt = memo(ProduceArtBase)
