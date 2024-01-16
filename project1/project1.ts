/* Copytight Ivan "ukrustacean" Dereviankin, 2023 */

type point = { x: number, y: number };

class Point {
    static add(p1: point, p2: point): point {
        return { x: p1.x + p2.x, y: p1.y + p2.y };
    }

    static neg(p: point): point {
        return { x: -p.x, y: -p.y };
    }

    static sub(p1: point, p2: point): point {
        return Point.add(p1, Point.neg(p2));
    }

    static withinRect(p: point, topLeft: point, bottomRight: point): boolean {
        return (topLeft.x <= p.x && p.x <= bottomRight.x) &&
            (topLeft.y <= p.y && p.y <= bottomRight.y);
    }
}

class ImageBuffer {
    data: ImageData;

    constructor(data: ImageData) {
        this.data = data;
    }

    get(x: point): Color {
        const w = this.data.width;
        const r = this.data.data[(x.y * w + x.x) * 4 + 0];
        const g = this.data.data[(x.y * w + x.x) * 4 + 1];
        const b = this.data.data[(x.y * w + x.x) * 4 + 2];
        const a = this.data.data[(x.y * w + x.x) * 4 + 3] / 255;
        return new Color(r, g, b, a);
    }

    set(x: point, c: Color = Color.BLACK): void {
        const w = this.data.width;
        this.data.data[(x.y * w + x.x) * 4 + 0] = c.r;
        this.data.data[(x.y * w + x.x) * 4 + 1] = c.g;
        this.data.data[(x.y * w + x.x) * 4 + 2] = c.b;
        this.data.data[(x.y * w + x.x) * 4 + 3] = c.a * 255;
    }
}

class Color {
    static BLACK = new Color(0, 0, 0, 1);

    r: number;
    g: number;
    b: number;
    a: number;

    constructor(
        r: number = 0,
        g: number = 0,
        b: number = 0,
        a: number = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = Math.max(0, Math.min(1, a));
    }
}

function composite(
    bg: ImageData,
    fg: ImageData,
    opacity: number,
    fgTopLeft: point) {
    const b = new ImageBuffer(bg);
    const f = new ImageBuffer(fg);

    const wb = b.data.width;
    const hb = b.data.height;
    const wf = f.data.width;
    const hf = f.data.height;

    const fgBotRight = Point.add(fgTopLeft, { x: wf, y: hf });

    for (let y = 0; y <= hb; y += 1)
        for (let x = 0; x <= wb; x += 1) {
            const bgPos = { x, y };

            if (Point.withinRect(bgPos, fgTopLeft, fgBotRight)) {
                const bc = b.get(bgPos);
                const fc = f.get(Point.sub(bgPos, fgTopLeft));
                const c = new Color();

                fc.a *= opacity;
                c.a = fc.a + (1 - fc.a) * bc.a;

                const keys: (keyof Color)[] = ['r', 'g', 'b'];
                for (const key of keys) {
                    c[key] = fc.a * fc[key] + (1 - fc.a) * bc.a * bc[key];
                    c[key] /= c.a;
                }


                b.set(bgPos, c);
            }
            else
                b.set(bgPos, b.get(bgPos));
        }
}