import { CurvePathData } from '@elfalem/leaflet-curve';

export interface IPoint {
  x: number;
  y: number;
}

export function addPoints(...points: IPoint[]): IPoint {
  return {
    x: points.reduce((prev, curr) => prev + curr.x, 0),
    y: points.reduce((prev, curr) => prev + curr.y, 0),
  };
}

export function scalePoint(p: IPoint, factor: number): IPoint {
  let nPoint: IPoint = {
    x: p.x,
    y: p.y,
  };

  nPoint.x *= factor;
  nPoint.y *= factor;
  return nPoint;
}

export function pointDistance(p1: IPoint, p2: IPoint): number {
  let dx = p1.x - p2.x;
  let dy = p1.y - p2.y;
  return Math.sqrt(dy * dy + dx * dx);
}

export function projectOnto(v: IPoint, u: IPoint): IPoint {
  let dotProd = v.x * u.x + v.y * u.y;
  let mag2 = pointDistance(v, zero);
  mag2 *= mag2;
  return scalePoint(v, dotProd / mag2);
}

export const zero: IPoint = {
  x: 0,
  y: 0,
};

export const eps: IPoint = {
  x: 0.0000001,
  y: 0.0000001,
};

// THE FOLLOWING FUNCTINOS ASSUME THAT THERE ARE AT LEAST 2 POINTS
function findPeaks(p: Array<IPoint>): Array<[IPoint, number]> {
  let first = p[0];
  let last = p[p.length - 1];
  let m = (last.y - first.y) / (last.x - first.x);
  let aux: Array<[IPoint, number]> = [];
  if (m === Infinity || m === -Infinity) {
    let x = first.x;
    let temp = [...p];
    aux = temp.map(a => {
      return [a, a.x - x];
    });
  } else if (m === 0) {
    let y = first.y;
    let temp = [...p];
    aux = temp.map(a => {
      return [a, a.y - y];
    });
  } else {
    let d = (point: IPoint) =>
      (-1 * m * point.x + point.y - first.y + m * first.x) / m;
    let temp = [...p];
    aux = temp.map(a => {
      return [a, d(a)];
    });
  }

  console.log(aux);

  let peakCandidates: Array<[IPoint, number]> = [];
  for (let i = 1; i < aux.length - 1; i++) {
    if (
      aux[i][1] > 0 &&
      aux[i - 1][1] < aux[i][1] &&
      aux[i + 1][1] < aux[i][1]
    ) {
      // aux[i] is a local maximum
      if (
        peakCandidates.length === 0 ||
        peakCandidates[peakCandidates.length - 1][1] < 0
      ) {
        peakCandidates.push(aux[i]);
      } else if (
        peakCandidates[peakCandidates.length - 1][1] < aux[i][1] &&
        peakCandidates[peakCandidates.length - 1][1] > 0
      ) {
        peakCandidates[peakCandidates.length - 1] = aux[i];
      }
    } else if (
      aux[i][1] < 0 &&
      aux[i - 1][1] > aux[i][1] &&
      aux[i + 1][1] > aux[i][1]
    ) {
      // aux[i] is a local minimum
      if (
        peakCandidates.length === 0 ||
        peakCandidates[peakCandidates.length - 1][1] > 0
      ) {
        peakCandidates.push(aux[i]);
      } else if (
        peakCandidates[peakCandidates.length - 1][1] > aux[i][1] &&
        peakCandidates[peakCandidates.length - 1][1] < 0
      ) {
        peakCandidates[peakCandidates.length - 1] = aux[i];
      }
    }
  }

  return peakCandidates;
}

export function getInterpolationPoints(
  p: Array<IPoint>,
): [IPoint, IPoint, IPoint, IPoint] {
  let peaks = findPeaks(p);

  let interpolationPoints: [IPoint, IPoint, IPoint, IPoint] = [
    zero,
    zero,
    zero,
    zero,
  ];
  if (peaks.length === 0) {
    let dy = p[p.length - 1].y - p[0].y;
    let dx = p[p.length - 1].x - p[0].x;
    interpolationPoints = [
      p[0],
      addPoints(p[0], {
        x: dx / 3,
        y: dy / 3,
      }),
      addPoints(p[0], {
        x: (2 * dx) / 3,
        y: (2 * dy) / 3,
      }),
      p[p.length - 1],
    ];
  } else if (peaks.length === 1) {
    interpolationPoints = [
      p[0],
      peaks[0][0],
      addPoints(peaks[0][0], eps),
      p[p.length - 1],
    ];
  } else {
    let aux: Array<[IPoint, number, number]> = peaks.map((x, i) => {
      let t: [IPoint, number, number] = [...x, i];
      return t;
    });

    aux.sort((a, b) => b[1] - a[1]);
    let low: [IPoint, number, number] = aux[aux.length - 1];
    let high: [IPoint, number, number] = aux[0];
    if (low[2] > high[2]) {
      let t = low;
      low = high;
      high = t;
    }
    interpolationPoints = [p[0], low[0], high[0], p[p.length - 1]];
  }

  return interpolationPoints;
}

// to bezier functions

const SMOOTH = 0.7;

export function findControls(
  p0: IPoint,
  p1: IPoint,
  p2: IPoint,
  p3: IPoint,
): [IPoint, IPoint, IPoint, IPoint, IPoint, IPoint] {
  let c1 = scalePoint(addPoints(p0, p1), 0.5);
  let c2 = scalePoint(addPoints(p1, p2), 0.5);
  let c3 = scalePoint(addPoints(p2, p3), 0.5);

  let len1 = pointDistance(p0, p1);
  let len2 = pointDistance(p1, p2);
  let len3 = pointDistance(p2, p3);

  let k1 = len1 / (len1 + len2);
  let k2 = len2 / (len2 + len3);

  let m1 = addPoints(c1, scalePoint(addPoints(c2, scalePoint(c1, -1)), k1));
  let m2 = addPoints(c2, scalePoint(addPoints(c3, scalePoint(c2, -1)), k2));

  let ctrl1 = addPoints(
    m1,
    p1,
    scalePoint(m1, -1),
    scalePoint(addPoints(c2, scalePoint(m1, -1)), SMOOTH),
  );
  let ctrl2 = addPoints(
    m2,
    p2,
    scalePoint(m2, -1),
    scalePoint(addPoints(c2, scalePoint(m2, -1)), SMOOTH),
  );

  let ctrl0 = addPoints(scalePoint(ctrl1, -1), scalePoint(p1, 2));
  let ctrl3 = addPoints(scalePoint(ctrl2, -1), scalePoint(p2, 2));

  let line1 = addPoints(p1, scalePoint(p0, -1));
  let proj0 = projectOnto(line1, addPoints(ctrl0, scalePoint(p1, -1)));
  let perp0 = addPoints(ctrl0, scalePoint(addPoints(proj0, p1), -1));
  let firstCtrl = addPoints(p0, perp0, proj0);

  let line3 = addPoints(p2, scalePoint(p3, -1));
  let proj3 = projectOnto(line3, addPoints(ctrl3, scalePoint(p2, -1)));
  let perp3 = addPoints(ctrl3, scalePoint(addPoints(proj3, p3), -1));
  let lastCtrl = addPoints(p3, perp3, proj3);

  return [firstCtrl, ctrl0, ctrl1, ctrl2, ctrl3, lastCtrl];
}

export function producePath(
  p0: IPoint,
  p1: IPoint,
  p2: IPoint,
  p3: IPoint,
): [CurvePathData, [IPoint, IPoint]] {
  let controls = findControls(p0, p1, p2, p3);
  let ans = [
    p0,
    controls[0],
    controls[1],
    p1,
    controls[2],
    controls[3],
    p2,
    controls[4],
    controls[5],
    p3,
  ].map(p => [p.y, p.x]);
  // let path = `M ${strOf(ans[0])} C ${strOf(ans[1])}, ${strOf(ans[2])}, ${strOf(
  //   ans[3],
  // )} S ${strOf(ans[5])}, ${strOf(ans[6])} S ${strOf(ans[8])}, ${strOf(
  //   ans[9],
  // )} `;
  let path = [
    'M',
    ans[0],
    'C',
    ans[1],
    ans[2],
    ans[3],
    'S',
    ans[5],
    ans[6],
    'S',
    ans[8],
    ans[9],
  ] as CurvePathData;

  return [path, [controls[5], p3]];
}

export function getArrowhead(
  p0: IPoint,
  p1: IPoint,
  sz: number,
): [IPoint, IPoint, IPoint] {
  let ans: [IPoint, IPoint, IPoint] = [zero, zero, zero];
  let dist = pointDistance(p0, p1);
  let dx = (p1.x - p0.x) / dist;
  let dy = (p1.y - p0.y) / dist;
  ans[0] = {
    x: p1.x + sz * dx,
    y: p1.y + sz * dy,
  };
  ans[1] = {
    x: p1.x - sz * dy,
    y: p1.y + sz * dx,
  };
  ans[2] = {
    x: p1.x + sz * dy,
    y: p1.y - sz * dx,
  };

  return ans;
}
