/**
 * Static Map Registry — high-fidelity, asset-based board backgrounds.
 *
 * Each realm/grade/stage can declare a premium background image plus a HARDCODED
 * list of node coordinates ({ x, y } as % of the board canvas) hand-tuned to sit
 * exactly on the trail painted into that artwork.
 *
 * boardGenerator.js consults this registry first; when an entry has coordinates it
 * bypasses the procedural snaking layout and uses them verbatim (mapped to the
 * { index, x, y } shape MapComponent expects). Entries with an EMPTY coordinates
 * array are "awaiting trace" — the MapCoordinatePicker shows them so you can click
 * the path, and the game engine safely falls back to the procedural layout until
 * they're filled in. So this is purely additive and breaks nothing.
 *
 * Assets are standardized as `g1-s{n}` per realm folder under src/assets/map/.
 */

// Vite resolves these to hashed asset URLs at build time.
// ── Science (g1-s3 = old space2 art, g1-s4 = old watermark art) ──
import scienceG1S1 from '../assets/map/science/g1-s1.jpg';
import scienceG1S2 from '../assets/map/science/g1-s2.jpg';
import scienceG1S3 from '../assets/map/science/g1-s3.jpg';
import scienceG1S4 from '../assets/map/science/g1-s4.jpeg';
import scienceG1S5 from '../assets/map/science/g1-s5.jpg';
import scienceG2S1 from '../assets/map/science/g2-s1.jpg';
import scienceG2S2 from '../assets/map/science/g2-s2.jpg';
import scienceG2S3 from '../assets/map/science/g2-s3.jpg';
// ── Reading ──
import readingG1S1 from '../assets/map/reading/g1-s1s.jpg';
import readingG1S2 from '../assets/map/reading/g1-s2.jpg';
import readingG1S3 from '../assets/map/reading/g1-s3.jpg';
import readingG1S4 from '../assets/map/reading/g1-s4.jpg';
import readingG1S5 from '../assets/map/reading/g1-s5.jpg';
import readingG2S1 from '../assets/map/reading/g2-s1.jpg';
import readingG2S2 from '../assets/map/reading/g2-s2.jpg';
import readingG2S3 from '../assets/map/reading/g2-s3.jpg';
import readingG2S4 from '../assets/map/reading/g2-s4.jpg';
import readingG2S5 from '../assets/map/reading/g2-s5.jpg';
// ── Math ──
import mathG1S1 from '../assets/map/math/g1-s1.jpg';
import mathG1S2 from '../assets/map/math/g1-s2.jpg';
import mathG1S3 from '../assets/map/math/g1-s3.jpg';
import mathG1S4 from '../assets/map/math/g1-s4.jpg';
import mathG1S5 from '../assets/map/math/g1-s5.jpg';
// ── History (g1-s3 = the old g1-s2 traced art, moved per rename) ──
import historyG1S1 from '../assets/map/history/g1-s1.jpg';
import historyG1S2 from '../assets/map/history/g1-s2.jpg';
import historyG1S3 from '../assets/map/history/g1-s3.jpg';
import historyG1S4 from '../assets/map/history/g1-s4.jpg';
import historyG1S5 from '../assets/map/history/g1-s5.jpg';
import historyG2S1 from '../assets/map/history/g2-s1.jpg';
import historyG2S2 from '../assets/map/history/g2-s2.jpg';
import historyG2S3 from '../assets/map/history/g2-s3.jpg';
import historyG2S4 from '../assets/map/history/g2-s4.jpg';
import historyG2S5 from '../assets/map/history/g2-s5.jpg';

export const STATIC_MAPS = {
  science: {
    1: {
      1: { image: scienceG1S1, aspect: '1062 / 751', coordinates: [] }, // new art — awaiting trace
      2: { image: scienceG1S2, aspect: '1093 / 728', coordinates: [] }, // new art — awaiting trace
      // g1-s3 is the old "space2" artwork — 33-node trace preserved.
      3: {
        image: scienceG1S3,
        aspect: '1061 / 752',
        coordinates: [
          { x: 16.6, y: 77.1 },
          { x: 23.7, y: 72.7 },
          { x: 31.2, y: 71.3 },
          { x: 39.6, y: 72.9 },
          { x: 46.6, y: 76.4 },
          { x: 53.8, y: 81 },
          { x: 61.6, y: 86 },
          { x: 69.3, y: 88.9 },
          { x: 77.2, y: 89.1 },
          { x: 84.5, y: 85.6 },
          { x: 89.8, y: 76.8 },
          { x: 91.3, y: 65.9 },
          { x: 88, y: 54 },
          { x: 80.9, y: 45.3 },
          { x: 72.5, y: 42.4 },
          { x: 63.5, y: 43.2 },
          { x: 55.3, y: 48 },
          { x: 46.9, y: 53.2 },
          { x: 38.1, y: 57.3 },
          { x: 29.2, y: 60 },
          { x: 20.3, y: 58.2 },
          { x: 12.1, y: 50.3 },
          { x: 8.3, y: 40.3 },
          { x: 9.5, y: 24.6 },
          { x: 16.8, y: 15 },
          { x: 26, y: 12.1 },
          { x: 36.1, y: 13.6 },
          { x: 43.2, y: 18.8 },
          { x: 50.8, y: 25.8 },
          { x: 60.4, y: 30.4 },
          { x: 70.6, y: 31.8 },
          { x: 78.1, y: 31.2 },
          { x: 83.5, y: 25.4 },
        ],
      },
      // g1-s4 is the old "watermark" artwork — 35-node trace preserved.
      4: {
        image: scienceG1S4,
        aspect: '1062 / 750',
        coordinates: [
          { x: 27.5, y: 84.3 },
          { x: 34.6, y: 82.8 },
          { x: 40.6, y: 76.5 },
          { x: 43.6, y: 66.5 },
          { x: 39.8, y: 56.8 },
          { x: 33, y: 50.8 },
          { x: 25.3, y: 46.1 },
          { x: 18.8, y: 43 },
          { x: 12.4, y: 35.9 },
          { x: 10.8, y: 25.6 },
          { x: 15, y: 17.1 },
          { x: 22.1, y: 13 },
          { x: 30.7, y: 12.8 },
          { x: 37.7, y: 13.4 },
          { x: 44.8, y: 18 },
          { x: 50.3, y: 27.7 },
          { x: 52.7, y: 37.2 },
          { x: 53.5, y: 48.1 },
          { x: 54.4, y: 58.9 },
          { x: 56.9, y: 68.8 },
          { x: 61.3, y: 80.4 },
          { x: 67, y: 85.7 },
          { x: 74.3, y: 88.6 },
          { x: 82, y: 88.4 },
          { x: 88.1, y: 82 },
          { x: 90.6, y: 72.1 },
          { x: 88.3, y: 61 },
          { x: 83.2, y: 52.7 },
          { x: 76.3, y: 47.1 },
          { x: 69.9, y: 41.1 },
          { x: 65.1, y: 32.9 },
          { x: 65.7, y: 23.1 },
          { x: 71, y: 15.1 },
          { x: 77.2, y: 10.7 },
          { x: 84.2, y: 10.7 },
        ],
      },
      5: { image: scienceG1S5, aspect: '1130 / 706', coordinates: [] }, // awaiting trace
    },
    2: {
      1: { image: scienceG2S1, aspect: '1198 / 666', coordinates: [] }, // awaiting trace
      2: { image: scienceG2S2, aspect: '1198 / 666', coordinates: [] }, // awaiting trace
      3: { image: scienceG2S3, aspect: '1191 / 670', coordinates: [] }, // awaiting trace
    },
  },
  reading: {
    1: {
      1: {
        image: readingG1S1,
        aspect: '1062 / 751',
        coordinates: [
          { x: 19.3, y: 23.9 },
          { x: 27.8, y: 20.2 },
          { x: 38.7, y: 18.7 },
          { x: 47.7, y: 23.5 },
          { x: 46.9, y: 35.5 },
          { x: 39.4, y: 43.3 },
          { x: 29.7, y: 49.8 },
          { x: 20.6, y: 58.2 },
          { x: 17.7, y: 70.5 },
          { x: 21.8, y: 81.8 },
          { x: 33.4, y: 81.6 },
          { x: 42.5, y: 72.7 },
          { x: 50, y: 61.1 },
          { x: 57.8, y: 49.6 },
          { x: 67.7, y: 41.3 },
          { x: 78.6, y: 38.6 },
          { x: 87.5, y: 45.8 },
          { x: 89.8, y: 60.9 },
          { x: 86.6, y: 73.8 },
          { x: 75.7, y: 81.6 },
        ],
      },
      2: {
        image: readingG1S2,
        aspect: '1094 / 730',
        coordinates: [
          { x: 13.5, y: 30.2 },
          { x: 10.8, y: 39.8 },
          { x: 8, y: 51.7 },
          { x: 11.6, y: 63.2 },
          { x: 18.8, y: 66.1 },
          { x: 26.8, y: 61 },
          { x: 29.6, y: 48.2 },
          { x: 27.4, y: 36.7 },
          { x: 28.3, y: 25.9 },
          { x: 34.9, y: 18.5 },
          { x: 42.5, y: 22.4 },
          { x: 45.6, y: 32.6 },
          { x: 48.8, y: 43.3 },
          { x: 56.4, y: 47 },
          { x: 64.6, y: 40.9 },
          { x: 71.7, y: 33.9 },
          { x: 79.6, y: 30.8 },
          { x: 88.4, y: 32.8 },
          { x: 92.2, y: 44.1 },
          { x: 89.8, y: 56.2 },
          { x: 82.4, y: 62.2 },
          { x: 75.1, y: 62.8 },
          { x: 66.9, y: 62.6 },
          { x: 57.6, y: 61 },
          { x: 48.4, y: 60.8 },
          { x: 39.9, y: 62.8 },
          { x: 34.9, y: 71.2 },
          { x: 36, y: 84.2 },
          { x: 42.9, y: 90.7 },
          { x: 51.6, y: 90.7 },
          { x: 61.4, y: 87.9 },
          { x: 70, y: 85.2 },
        ],
      },
      3: {
        image: readingG1S3,
        aspect: '1156 / 690',
        coordinates: [
          { x: 29.6, y: 90.6 },
          { x: 41.4, y: 87.4 },
          { x: 49.6, y: 83.7 },
          { x: 57.8, y: 80.5 },
          { x: 65.9, y: 82.8 },
          { x: 74.1, y: 86.2 },
          { x: 82.6, y: 89.7 },
          { x: 90.7, y: 87.4 },
          { x: 94.6, y: 76.1 },
          { x: 91.1, y: 64.2 },
          { x: 82.6, y: 64.4 },
          { x: 74.9, y: 69.7 },
          { x: 66.6, y: 64.6 },
          { x: 59.1, y: 58.9 },
          { x: 50.4, y: 59.8 },
          { x: 43.2, y: 68.1 },
          { x: 36.1, y: 73.8 },
          { x: 28.3, y: 70.1 },
          { x: 29.4, y: 57 },
          { x: 37.6, y: 51.3 },
          { x: 45.6, y: 46.4 },
          { x: 44, y: 33.1 },
          { x: 35.1, y: 32.9 },
          { x: 27.8, y: 40.5 },
          { x: 19.6, y: 43.9 },
          { x: 11.7, y: 43.2 },
          { x: 5.2, y: 34.7 },
          { x: 7.1, y: 20 },
          { x: 15.1, y: 22.1 },
          { x: 22.5, y: 28.1 },
          { x: 28.9, y: 19.1 },
          { x: 35.8, y: 9.9 },
          { x: 44, y: 9.2 },
          { x: 52.3, y: 14.7 },
          { x: 56.7, y: 26.9 },
          { x: 59.3, y: 41.6 },
          { x: 69.5, y: 47.6 },
        ],
      },
      4: {
        image: readingG1S4,
        aspect: '1054 / 758',
        coordinates: [
          { x: 27.7, y: 35.9 },
          { x: 34.1, y: 35.9 },
          { x: 40.7, y: 33.8 },
          { x: 47.3, y: 30.5 },
          { x: 53.1, y: 25.8 },
          { x: 58.9, y: 21 },
          { x: 64.2, y: 17.2 },
          { x: 70.2, y: 13.4 },
          { x: 76.6, y: 12.7 },
          { x: 83, y: 14.2 },
          { x: 88.3, y: 18 },
          { x: 92.2, y: 24.4 },
          { x: 93.5, y: 33.2 },
          { x: 92.4, y: 42 },
          { x: 89.8, y: 49.8 },
          { x: 85.1, y: 55.6 },
          { x: 79, y: 60.2 },
          { x: 72.6, y: 62.3 },
          { x: 66.1, y: 63.4 },
          { x: 59.3, y: 62.3 },
          { x: 53.1, y: 59.3 },
          { x: 46.9, y: 55.8 },
          { x: 41.7, y: 52.6 },
          { x: 36, y: 49.4 },
          { x: 30.4, y: 47.1 },
          { x: 24.3, y: 45.6 },
          { x: 18.4, y: 46.7 },
          { x: 12.5, y: 50.1 },
          { x: 8.3, y: 55.6 },
          { x: 5.4, y: 63.8 },
          { x: 5, y: 72.6 },
          { x: 6.5, y: 79.8 },
          { x: 10.2, y: 86.3 },
          { x: 15.3, y: 90.7 },
          { x: 21.9, y: 92.4 },
          { x: 28.7, y: 92 },
          { x: 34.5, y: 89.1 },
          { x: 41, y: 85.9 },
          { x: 46.7, y: 83.4 },
          { x: 52.5, y: 81.3 },
          { x: 58.6, y: 81 },
          { x: 64.3, y: 81.3 },
          { x: 70.4, y: 82.7 },
        ],
      },
      5: {
        image: readingG1S5,
        aspect: '1094 / 730',
        coordinates: [
          { x: 24.7, y: 45.2 },
          { x: 32.3, y: 38 },
          { x: 31.7, y: 26.5 },
          { x: 32.7, y: 18.1 },
          { x: 37.5, y: 9.9 },
          { x: 44.6, y: 8.4 },
          { x: 50.5, y: 12.1 },
          { x: 55.7, y: 20.1 },
          { x: 59.5, y: 27.9 },
          { x: 64.2, y: 34.3 },
          { x: 71.1, y: 37 },
          { x: 78.2, y: 34.1 },
          { x: 82, y: 26.5 },
          { x: 83.5, y: 14.2 },
          { x: 88.1, y: 8.4 },
          { x: 93.7, y: 10.3 },
          { x: 94.7, y: 20.3 },
          { x: 92.5, y: 30 },
          { x: 89.2, y: 38.6 },
          { x: 83, y: 46.2 },
          { x: 76, y: 49.1 },
          { x: 68.4, y: 48 },
          { x: 62, y: 45 },
          { x: 56.3, y: 39.4 },
          { x: 49.7, y: 35.1 },
          { x: 42.8, y: 38.4 },
          { x: 38.4, y: 46 },
          { x: 33.4, y: 53.2 },
          { x: 27.2, y: 58.3 },
          { x: 20.4, y: 59.5 },
          { x: 14, y: 60.8 },
          { x: 7.2, y: 64.5 },
          { x: 4.5, y: 73.7 },
          { x: 6.3, y: 82.9 },
          { x: 11.6, y: 87.9 },
          { x: 18.7, y: 89.3 },
          { x: 25.5, y: 89.5 },
          { x: 32.8, y: 87.2 },
          { x: 38.3, y: 82.1 },
          { x: 42.5, y: 75.1 },
          { x: 43.1, y: 66.3 },
          { x: 44.6, y: 58.3 },
          { x: 48.8, y: 52.6 },
          { x: 55.2, y: 52.6 },
          { x: 59.9, y: 58.1 },
          { x: 59.8, y: 66.3 },
          { x: 54.6, y: 72.7 },
          { x: 50.8, y: 80.3 },
          { x: 52.2, y: 89.3 },
          { x: 56.1, y: 94.2 },
          { x: 63.1, y: 94.4 },
          { x: 69.3, y: 93.2 },
          { x: 77.7, y: 90.5 },
        ],
      },
    },
    2: {
      1: { image: readingG2S1, aspect: '1048 / 761', coordinates: [] }, // awaiting trace
      2: { image: readingG2S2, aspect: '894 / 894', coordinates: [] }, // awaiting trace
      3: { image: readingG2S3, aspect: '898 / 887', coordinates: [] }, // awaiting trace
      4: { image: readingG2S4, aspect: '1009 / 790', coordinates: [] }, // awaiting trace
      5: { image: readingG2S5, aspect: '1009 / 790', coordinates: [] }, // awaiting trace
    },
  },
  math: {
    1: {
      1: {
        image: mathG1S1,
        aspect: '860 / 926',
        coordinates: [
          { x: 20.2, y: 75.8 },
          { x: 29.6, y: 75.9 },
          { x: 38.3, y: 77.3 },
          { x: 46.6, y: 80.6 },
          { x: 55.2, y: 84.1 },
          { x: 64.9, y: 85.3 },
          { x: 73.6, y: 82.2 },
          { x: 80, y: 71.6 },
          { x: 78.7, y: 58.9 },
          { x: 70.7, y: 50.6 },
          { x: 60.1, y: 48.5 },
          { x: 50.1, y: 50.3 },
          { x: 40.9, y: 53.9 },
          { x: 31.2, y: 57 },
          { x: 21.5, y: 55.3 },
          { x: 15.7, y: 46.1 },
          { x: 16.9, y: 33.3 },
          { x: 25.9, y: 24.9 },
          { x: 36.4, y: 23.3 },
          { x: 45.6, y: 25.9 },
          { x: 54.9, y: 30.7 },
          { x: 65.7, y: 32.7 },
          { x: 75.6, y: 29.8 },
        ],
      },
      2: {
        image: mathG1S2,
        aspect: '1177 / 678',
        coordinates: [
          { x: 10.6, y: 82.4 },
          { x: 17.8, y: 82.1 },
          { x: 23.3, y: 70.5 },
          { x: 22.9, y: 57.8 },
          { x: 21.3, y: 45.4 },
          { x: 21.3, y: 33.5 },
          { x: 23.6, y: 21.8 },
          { x: 28.5, y: 14.4 },
          { x: 36.2, y: 11.6 },
          { x: 42.4, y: 16.8 },
          { x: 46.9, y: 26.6 },
          { x: 47.4, y: 37.8 },
          { x: 46.5, y: 47.1 },
          { x: 45.9, y: 59.5 },
          { x: 46, y: 70.5 },
          { x: 49.7, y: 80.7 },
          { x: 56.5, y: 86 },
          { x: 63.9, y: 84 },
          { x: 70.3, y: 77.1 },
          { x: 73, y: 65.2 },
          { x: 72.6, y: 54 },
          { x: 71.3, y: 42.8 },
          { x: 70.3, y: 32.1 },
          { x: 71.8, y: 22.3 },
          { x: 77.2, y: 13.2 },
          { x: 84.2, y: 12.3 },
        ],
      },
      3: {
        image: mathG1S3,
        aspect: '1105 / 722',
        coordinates: [
          { x: 21.8, y: 27.4 },
          { x: 28.1, y: 27.4 },
          { x: 34.6, y: 29.5 },
          { x: 36.6, y: 38.5 },
          { x: 31.6, y: 46 },
          { x: 25.7, y: 50.4 },
          { x: 19.5, y: 55.3 },
          { x: 14.7, y: 61.3 },
          { x: 12, y: 70.6 },
          { x: 13.9, y: 79.2 },
          { x: 19.9, y: 84.6 },
          { x: 26.3, y: 83.2 },
          { x: 32.4, y: 77.5 },
          { x: 36.9, y: 69.9 },
          { x: 40.5, y: 61.1 },
          { x: 44.1, y: 52.5 },
          { x: 48, y: 43.7 },
          { x: 52, y: 35.3 },
          { x: 56.5, y: 27.8 },
          { x: 61.9, y: 21.7 },
          { x: 67.7, y: 18.1 },
          { x: 74.1, y: 18.4 },
          { x: 79.4, y: 22.8 },
          { x: 80.9, y: 30.9 },
          { x: 77.8, y: 38.7 },
          { x: 72.9, y: 44.4 },
          { x: 67.3, y: 49.2 },
          { x: 61.9, y: 53.4 },
          { x: 56.7, y: 58.4 },
          { x: 52, y: 65.3 },
          { x: 50, y: 73.9 },
          { x: 52.5, y: 82.3 },
          { x: 59, y: 86.1 },
          { x: 64.9, y: 86.1 },
          { x: 72.6, y: 84.4 },
          { x: 78.6, y: 83.2 },
          { x: 86, y: 82.5 },
        ],
      },
      4: {
        image: mathG1S4,
        aspect: '1024 / 778',
        coordinates: [
          { x: 26.4, y: 85.3 },
          { x: 30.8, y: 85.1 },
          { x: 38, y: 85.7 },
          { x: 42.9, y: 86.9 },
          { x: 49.9, y: 88.4 },
          { x: 55.2, y: 89.4 },
          { x: 61.7, y: 90.3 },
          { x: 67.4, y: 90.9 },
          { x: 74.1, y: 91.2 },
          { x: 79.6, y: 89.8 },
          { x: 85.4, y: 86.7 },
          { x: 90.3, y: 81.3 },
          { x: 93.5, y: 74.5 },
          { x: 94, y: 66.8 },
          { x: 91.4, y: 59.6 },
          { x: 86.5, y: 54.9 },
          { x: 80.5, y: 54 },
          { x: 74.7, y: 56.1 },
          { x: 69.1, y: 59.4 },
          { x: 63.8, y: 63.3 },
          { x: 58.3, y: 67.1 },
          { x: 52.6, y: 69.5 },
          { x: 46.7, y: 71.1 },
          { x: 40.7, y: 71.4 },
          { x: 34.5, y: 70.7 },
          { x: 28.3, y: 68.7 },
          { x: 22.6, y: 65.7 },
          { x: 17.6, y: 61.7 },
          { x: 12.8, y: 57 },
          { x: 8.7, y: 50.4 },
          { x: 6.1, y: 43 },
          { x: 5.4, y: 35.1 },
          { x: 6.7, y: 27.9 },
          { x: 9.4, y: 20.9 },
          { x: 13.4, y: 14.4 },
          { x: 18.5, y: 10.3 },
          { x: 24.1, y: 8.1 },
          { x: 30.4, y: 8.1 },
          { x: 35.8, y: 10.6 },
          { x: 39.6, y: 17.1 },
          { x: 41.7, y: 24.7 },
          { x: 42.8, y: 32.6 },
          { x: 45.2, y: 40.1 },
          { x: 49.5, y: 45.3 },
          { x: 55.3, y: 48.4 },
          { x: 61.2, y: 48.6 },
          { x: 67, y: 46.8 },
          { x: 72.5, y: 42.8 },
          { x: 77.2, y: 37.2 },
          { x: 80.1, y: 30.2 },
        ],
      },
      5: {
        image: mathG1S5,
        aspect: '1191 / 670',
        coordinates: [
          { x: 9.9, y: 78.9 },
          { x: 12, y: 71.6 },
          { x: 16.3, y: 66.7 },
          { x: 19.6, y: 61.1 },
          { x: 22.3, y: 54.7 },
          { x: 23.6, y: 46.4 },
          { x: 23.2, y: 38.8 },
          { x: 22.3, y: 31.3 },
          { x: 22.5, y: 24.2 },
          { x: 23.2, y: 17.8 },
          { x: 25.2, y: 12.9 },
          { x: 28.6, y: 9.5 },
          { x: 34.1, y: 11 },
          { x: 36.8, y: 15.6 },
          { x: 38.4, y: 22.5 },
          { x: 38.1, y: 29.1 },
          { x: 36.5, y: 35.4 },
          { x: 34.5, y: 41.8 },
          { x: 31.9, y: 48.9 },
          { x: 30.5, y: 56.4 },
          { x: 30.9, y: 63.5 },
          { x: 33, y: 70.6 },
          { x: 36.2, y: 75.5 },
          { x: 41.1, y: 76.9 },
          { x: 45.8, y: 74.3 },
          { x: 49.6, y: 68.4 },
          { x: 51.6, y: 61.3 },
          { x: 52.7, y: 52.3 },
          { x: 54.4, y: 45.2 },
          { x: 57.2, y: 39.6 },
          { x: 60.9, y: 35.4 },
          { x: 65.4, y: 34.4 },
          { x: 69.6, y: 37.6 },
          { x: 73.7, y: 40.3 },
          { x: 77.9, y: 44.5 },
          { x: 82.3, y: 45.9 },
          { x: 87.5, y: 46.2 },
          { x: 90.9, y: 39.1 },
          { x: 92.1, y: 31.5 },
          { x: 91.6, y: 23.7 },
          { x: 88.6, y: 15.9 },
          { x: 83.4, y: 13.4 },
          { x: 78.3, y: 15.4 },
          { x: 75.5, y: 21.7 },
          { x: 74.4, y: 31 },
          { x: 74.5, y: 54.7 },
          { x: 73.6, y: 62.5 },
          { x: 72.8, y: 69.9 },
          { x: 74, y: 77.7 },
          { x: 76.4, y: 84.5 },
          { x: 81.7, y: 90.1 },
        ],
      },
    },
  },
  history: {
    1: {
      1: {
        image: historyG1S1,
        aspect: '1020 / 784',
        coordinates: [
          { x: 27.2, y: 29.5 },
          { x: 35.3, y: 25.6 },
          { x: 43.6, y: 24.7 },
          { x: 51.9, y: 28.6 },
          { x: 51.4, y: 37.7 },
          { x: 44.7, y: 43.4 },
          { x: 36.9, y: 48.5 },
          { x: 29.3, y: 54.4 },
          { x: 26.3, y: 64.6 },
          { x: 30.8, y: 72.2 },
          { x: 40.5, y: 72.2 },
          { x: 48, y: 65.1 },
          { x: 53.1, y: 56.9 },
          { x: 59.7, y: 48 },
          { x: 68.3, y: 41.4 },
          { x: 77.4, y: 39.5 },
          { x: 85.3, y: 46.4 },
          { x: 87.2, y: 56.9 },
          { x: 84.1, y: 67 },
          { x: 75.5, y: 73.1 },
          { x: 65.8, y: 76.3 },
        ],
      },
      2: { image: historyG1S2, aspect: '1048 / 761', coordinates: [] }, // new art — awaiting trace
      // g1-s3 is the old g1-s2 artwork (renamed) — 28-node trace preserved.
      3: {
        image: historyG1S3,
        aspect: '1046 / 764',
        coordinates: [
          { x: 32.2, y: 88.3 },
          { x: 27, y: 82 },
          { x: 22.6, y: 72.9 },
          { x: 25.3, y: 63.7 },
          { x: 33.2, y: 60.3 },
          { x: 41.3, y: 65.5 },
          { x: 47.1, y: 72.1 },
          { x: 52.9, y: 80.3 },
          { x: 61.3, y: 84.5 },
          { x: 71.3, y: 82.4 },
          { x: 76.8, y: 72.1 },
          { x: 74.3, y: 60.7 },
          { x: 66.1, y: 54.3 },
          { x: 56.4, y: 54.9 },
          { x: 47.7, y: 53.4 },
          { x: 38.3, y: 50.8 },
          { x: 30.2, y: 44.4 },
          { x: 24, y: 36 },
          { x: 25.7, y: 23.4 },
          { x: 33.9, y: 18.5 },
          { x: 42.8, y: 19.3 },
          { x: 50.8, y: 24.9 },
          { x: 58.7, y: 33 },
          { x: 68.4, y: 39.3 },
          { x: 76.6, y: 31.7 },
          { x: 77.2, y: 20.6 },
          { x: 70.3, y: 12.7 },
          { x: 62.9, y: 10.8 },
        ],
      },
      4: { image: historyG1S4, aspect: '1048 / 761', coordinates: [] }, // awaiting trace
      5: { image: historyG1S5, aspect: '1029 / 774', coordinates: [] }, // awaiting trace
    },
    2: {
      1: { image: historyG2S1, aspect: '1191 / 670', coordinates: [] }, // awaiting trace
      2: { image: historyG2S2, aspect: '1191 / 670', coordinates: [] }, // awaiting trace
      3: { image: historyG2S3, aspect: '1191 / 670', coordinates: [] }, // awaiting trace
      4: { image: historyG2S4, aspect: '1882 / 1062', coordinates: [] }, // awaiting trace
      5: { image: historyG2S5, aspect: '1191 / 670', coordinates: [] }, // awaiting trace
    },
  },
};

/** Returns the static map config for a realm/grade/stage, or null if none. */
export function getStaticMap(realm, grade, stage) {
  return STATIC_MAPS?.[realm]?.[grade]?.[stage] ?? null;
}

/** True only when an entry exists AND has at least one traced coordinate. */
export function hasStaticTrack(realm, grade, stage) {
  const map = getStaticMap(realm, grade, stage);
  return !!(map && map.coordinates.length > 0);
}

/** Flat list of every registered static asset (handy for the picker dropdown). */
export function listStaticMaps() {
  const out = [];
  for (const [realm, grades] of Object.entries(STATIC_MAPS)) {
    for (const [grade, stages] of Object.entries(grades)) {
      for (const [stage, cfg] of Object.entries(stages)) {
        out.push({
          realm,
          grade: Number(grade),
          stage: Number(stage),
          image: cfg.image,
          aspect: cfg.aspect,
          count: cfg.coordinates.length,
          label: `${realm[0].toUpperCase()}${realm.slice(1)} G${grade} S${stage}`,
        });
      }
    }
  }
  return out;
}