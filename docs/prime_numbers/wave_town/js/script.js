// script.js

// -- 1. データ構造と初期化
const maxPrecomputed = 10000;
let primes = [];
let primeSet = new Set();

function generatePrimes(limit = maxPrecomputed) {
    const isPrime = new Array(limit + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    for (let i = 2; i * i <= limit; i++) {
        if (isPrime[i]) {
            for (let j = i * i; j <= limit; j += i) {
                isPrime[j] = false;
            }
        }
    }

    for (let i = 2; i <= limit; i++) {
        if (isPrime[i]) {
            primes.push(i);
            primeSet.add(i);
        }
    }
}

// -- 2. 動的素数判定・追加（10,000以上）
function isPrimeDynamic(n) {
    if (n <= maxPrecomputed) return primeSet.has(n);

    const sqrt = Math.sqrt(n);
    for (let p of primes) {
        if (p > sqrt) break;
        if (n % p === 0) return false;
    }

    primes.push(n);
    primeSet.add(n);
    return true;
}

// -- 3. 剰余類に一致する素数だけ抽出
const mod30residues = [1, 7, 11, 13, 17, 19, 23, 29];

function isRelevantPrime(p) {
    return mod30residues.includes(p % 30);
}

// -- 4. 素数を表示に追加
let currentRow = 0;

const appendBatchSize = 30; // 先読み行数

function isMersennePrime(p) {
    // メルセンヌ素数は形 p = 2^n - 1 である
    if (p < 2) return false;
    // 全ビットが１であるかチェック
    if ((p + 1) & p) return false;
    // 原理：メルセンヌ素数はp+1で2^nになるので、元のpとの論理積ANDでゼロとなる。e.g. 0b01111 & 0b10000 = 0
    // 素数判定済みであるので、ここでは単純にビットチェックで判定でOK
    return true;
}

function appendBatch() {
    for (let i = 0; i < appendBatchSize; i++) {
        appendPrimeRow(currentRow++);
    }
    // 6桁以上の素数が現れたら幅広クラスを追加
    if (currentRow > 3000) {
        document.getElementById('prime-town').classList.add('wide-prime-town');
        document.getElementById('residue-row-grid').classList.add('header-row-wide');
    }
}

function appendPrimeRow(n) {
    const row = document.createElement('div');
    if (n > 3000) {
        row.className = 'prime-row prime-row-wide';
    } else {
        row.className = 'prime-row';
    }
    row.id = `prime-row-grid`;

    const label = document.createElement('div');
    label.className = 'label-cell';
    label.textContent = `n=${n}`;
    row.appendChild(label);

    for (let r of mod30residues) {
        const cell = document.createElement('div');
        cell.className = 'prime';
        const p = 30 * n + r;
        if (isPrimeDynamic(p)) {
            cell.textContent = p;
            // メルセンヌ素数のスタイルを適用
            if (isMersennePrime(p)) {
                cell.classList.add('prime-M');
            }
        } else {
            cell.classList.add('empty');
        }
        // 6桁以上なら幅広クラスを追加
        if (p >= 100000) {
            cell.classList.add('prime-wide');
        }
        row.appendChild(cell);

        if (r === 13) {
            const divider = document.createElement('div');
            divider.className = 'divider';
            row.appendChild(divider);
        }
    }

    document.getElementById('prime-town').appendChild(row);
}

// -- 5. スクロール検知で自動生成
function onScroll() {
    const scrollBottom = window.innerHeight + window.scrollY;
    const bodyHeight = document.body.offsetHeight;

    if (scrollBottom >= bodyHeight - 300) {
        appendBatch();
    }
}

// スクロールイベントリスナーの追加
window.addEventListener('scroll', onScroll);

// -- 6. 初期化呼び出し
window.addEventListener('DOMContentLoaded', () => {
    generatePrimes();

    // 画面超えるまで出す（最初）
    const minHeight = window.innerHeight + 100;
    while (document.body.offsetHeight < minHeight) {
        appendBatch();
    }

    // 足りない場合の保険（万一の環境差異用）
    setInterval(() => {
        if (document.body.offsetHeight <= window.innerHeight) {
            appendBatch();
        }
    }, 500);

    setTimeout(() => {
        windowResized();
    }, 500); // 素数リストが DOM に反映された後
});

// -- 7. p5.js のキャンバスサイズ変更
function windowResized() {
    const canvasWidth = Math.min(document.body.scrollWidth, 480); // ← 本当の横幅を見る
    resizeCanvas(canvasWidth, 200);
}

// -- A. p5.js
let waveCanvas;
let xOffset = 0;

function setup() {
    const canvasWidth = Math.min(document.body.scrollWidth, 480);
    waveCanvas = createCanvas(canvasWidth, 200);
    waveCanvas.parent('wave-graphic');
    waveCanvas.style('display', 'block');
    waveCanvas.style('margin', '0 auto');
    waveCanvas.style('position', 'static');
    noFill();
}

// -- B. アニメーション描画
function draw() {
    background(255);
    stroke(0, 50);
    strokeWeight(5);

    beginShape();
    for (let x = 0; x <= width; x++) {
        let t = (x + xOffset) * (30 / width); // x を 0～30 にマッピング
        let y = cos(TWO_PI * t / 2) +
            cos(TWO_PI * t / 3) +
            cos(TWO_PI * t / 5);
        let yMapped = map(y, -3, 3, height, 0);
        vertex(x, yMapped);
    }
    endShape();

    xOffset += 1; // 波を横に流すアニメーション
}
