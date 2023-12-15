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
  let nPoint = structuredClone(p);
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
    interpolationPoints = [p[0], peaks[0][0], peaks[0][0], p[p.length - 1]];
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
